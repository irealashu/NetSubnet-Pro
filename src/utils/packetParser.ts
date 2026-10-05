// Packet Parser, Dissector, and Packet Builder Utilities

export interface DecodedField {
  name: string;
  value: string | number;
  description: string;
  byteStart: number;
  byteLength: number;
  bitStart?: number;
  bitLength?: number;
  hexValue: string;
}

export interface DecodedLayer {
  name: string;
  protocol: string;
  summary: string;
  fields: DecodedField[];
  startOffset: number;
  length: number;
}

export interface DecodedPacket {
  rawBytes: Uint8Array;
  hexDump: string[];
  asciiDump: string[];
  layers: DecodedLayer[];
  summary: string;
  timestamp: string;
  length: number;
}

export function parseHexOrBase64ToBytes(input: string): Uint8Array {
  const clean = input.trim();
  
  // Test if it's hex (ignoring spaces, colons, 0x, commas)
  const hexClean = clean.replace(/0x|[\s,:\-_]/g, '');
  if (/^[0-9a-fA-F]+$/.test(hexClean) && hexClean.length % 2 === 0) {
    const bytes = new Uint8Array(hexClean.length / 2);
    for (let i = 0; i < hexClean.length; i += 2) {
      bytes[i / 2] = parseInt(hexClean.substring(i, i + 2), 16);
    }
    return bytes;
  }

  // Otherwise try Base64
  try {
    const binStr = atob(clean);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    return bytes;
  } catch {
    throw new Error('Input is neither valid hex nor base64');
  }
}

export function decodePacketBytes(bytes: Uint8Array): DecodedPacket {
  const layers: DecodedLayer[] = [];
  let offset = 0;

  // Format hex & ascii dump lines (16 bytes per line)
  const hexDump: string[] = [];
  const asciiDump: string[] = [];
  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16);
    const hexParts = Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join(' ');
    hexDump.push(hexParts.padEnd(48, ' '));

    const asciiParts = Array.from(chunk).map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
    asciiDump.push(asciiParts);
  }

  // 1. Layer 2: Ethernet II (if at least 14 bytes)
  let etherType = 0x0800;
  if (bytes.length >= 14) {
    const dstMac = Array.from(bytes.slice(0, 6)).map(b => b.toString(16).padStart(2, '0')).join(':');
    const srcMac = Array.from(bytes.slice(6, 12)).map(b => b.toString(16).padStart(2, '0')).join(':');
    etherType = (bytes[12] << 8) | bytes[13];

    let ethLen = 14;
    const ethFields: DecodedField[] = [
      { name: 'Destination MAC', value: dstMac, description: 'Destination hardware address', byteStart: 0, byteLength: 6, hexValue: dstMac.replace(/:/g, '') },
      { name: 'Source MAC', value: srcMac, description: 'Source hardware address', byteStart: 6, byteLength: 6, hexValue: srcMac.replace(/:/g, '') }
    ];

    // Check for 802.1Q VLAN Tag
    if (etherType === 0x8100 && bytes.length >= 18) {
      const tci = (bytes[14] << 8) | bytes[15];
      const pcp = (tci >> 13) & 0x07;
      const dei = (tci >> 12) & 0x01;
      const vlanId = tci & 0x0fff;
      etherType = (bytes[16] << 8) | bytes[17];
      ethLen = 18;

      ethFields.push({ name: '802.1Q Tag Type', value: '0x8100', description: 'VLAN-tagged frame', byteStart: 12, byteLength: 2, hexValue: '8100' });
      ethFields.push({ name: 'VLAN ID', value: vlanId, description: `802.1Q Virtual LAN ID (${vlanId})`, byteStart: 14, byteLength: 2, hexValue: tci.toString(16).padStart(4, '0') });
      ethFields.push({ name: 'EtherType', value: `0x${etherType.toString(16).padStart(4, '0')}`, description: etherType === 0x0800 ? 'IPv4 (Internet Protocol v4)' : etherType === 0x86dd ? 'IPv6' : 'ARP / Other', byteStart: 16, byteLength: 2, hexValue: etherType.toString(16).padStart(4, '0') });
    } else {
      ethFields.push({
        name: 'EtherType',
        value: `0x${etherType.toString(16).padStart(4, '0')}`,
        description: etherType === 0x0800 ? 'IPv4 (0x0800)' : etherType === 0x86dd ? 'IPv6 (0x86DD)' : etherType === 0x0806 ? 'ARP (0x0806)' : 'Unknown Protocol',
        byteStart: 12,
        byteLength: 2,
        hexValue: etherType.toString(16).padStart(4, '0')
      });
    }

    layers.push({
      name: 'Ethernet II',
      protocol: 'Ethernet',
      summary: `Src: ${srcMac} → Dst: ${dstMac}`,
      fields: ethFields,
      startOffset: 0,
      length: ethLen
    });

    offset = ethLen;
  }

  // 2. Layer 3: IPv4 / IPv6 / ARP
  let nextProtocol = 0;
  if (etherType === 0x0800 && bytes.length >= offset + 20) {
    // IPv4 Header
    const ipStart = offset;
    const versionIhl = bytes[ipStart];
    const version = (versionIhl >> 4) & 0x0f;
    const ihl = (versionIhl & 0x0f) * 4;
    const dscpEcn = bytes[ipStart + 1];
    const totalLength = (bytes[ipStart + 2] << 8) | bytes[ipStart + 3];
    const identification = (bytes[ipStart + 4] << 8) | bytes[ipStart + 5];
    const flagsOffset = (bytes[ipStart + 6] << 8) | bytes[ipStart + 7];
    const flags = (flagsOffset >> 13) & 0x07;
    const df = Boolean(flags & 0x02);
    const mf = Boolean(flags & 0x01);
    const fragOffset = (flagsOffset & 0x1fff) * 8;
    const ttl = bytes[ipStart + 8];
    const protocol = bytes[ipStart + 9];
    nextProtocol = protocol;
    const checksum = (bytes[ipStart + 10] << 8) | bytes[ipStart + 11];
    const srcIp = Array.from(bytes.slice(ipStart + 12, ipStart + 16)).join('.');
    const dstIp = Array.from(bytes.slice(ipStart + 16, ipStart + 20)).join('.');

    const protocolName = protocol === 6 ? 'TCP' : protocol === 17 ? 'UDP' : protocol === 1 ? 'ICMP' : `Proto ${protocol}`;

    layers.push({
      name: 'Internet Protocol Version 4',
      protocol: 'IPv4',
      summary: `Src: ${srcIp} → Dst: ${dstIp}, Proto: ${protocolName}, TTL: ${ttl}`,
      fields: [
        { name: 'Version', value: version, description: 'IPv4 Header Version', byteStart: ipStart, byteLength: 1, hexValue: version.toString(16) },
        { name: 'Header Length (IHL)', value: `${ihl} bytes`, description: `Header length in 32-bit words (${ihl / 4})`, byteStart: ipStart, byteLength: 1, hexValue: (ihl / 4).toString(16) },
        { name: 'Differentiated Services', value: `0x${dscpEcn.toString(16).padStart(2, '0')}`, description: 'DSCP & ECN QoS flags', byteStart: ipStart + 1, byteLength: 1, hexValue: dscpEcn.toString(16).padStart(2, '0') },
        { name: 'Total Length', value: `${totalLength} bytes`, description: 'Entire IP packet size including payload', byteStart: ipStart + 2, byteLength: 2, hexValue: totalLength.toString(16).padStart(4, '0') },
        { name: 'Identification', value: `0x${identification.toString(16).padStart(4, '0')} (${identification})`, description: 'Packet fragment grouping ID', byteStart: ipStart + 4, byteLength: 2, hexValue: identification.toString(16).padStart(4, '0') },
        { name: 'Flags & Fragment Offset', value: `DF=${df}, MF=${mf}, Offset=${fragOffset}`, description: 'Fragmentation controls', byteStart: ipStart + 6, byteLength: 2, hexValue: flagsOffset.toString(16).padStart(4, '0') },
        { name: 'Time to Live (TTL)', value: ttl, description: 'Hop limit to prevent routing loops', byteStart: ipStart + 8, byteLength: 1, hexValue: ttl.toString(16).padStart(2, '0') },
        { name: 'Protocol', value: `${protocolName} (${protocol})`, description: 'Next level transport protocol', byteStart: ipStart + 9, byteLength: 1, hexValue: protocol.toString(16).padStart(2, '0') },
        { name: 'Header Checksum', value: `0x${checksum.toString(16).padStart(4, '0')}`, description: '16-bit one\'s complement checksum', byteStart: ipStart + 10, byteLength: 2, hexValue: checksum.toString(16).padStart(4, '0') },
        { name: 'Source IP Address', value: srcIp, description: 'Sender IPv4 address', byteStart: ipStart + 12, byteLength: 4, hexValue: Array.from(bytes.slice(ipStart + 12, ipStart + 16)).map(b => b.toString(16).padStart(2, '0')).join('') },
        { name: 'Destination IP Address', value: dstIp, description: 'Receiver IPv4 address', byteStart: ipStart + 16, byteLength: 4, hexValue: Array.from(bytes.slice(ipStart + 16, ipStart + 20)).map(b => b.toString(16).padStart(2, '0')).join('') },
      ],
      startOffset: ipStart,
      length: ihl
    });

    offset = ipStart + ihl;
  }

  // 3. Layer 4: TCP / UDP / ICMP
  if (nextProtocol === 6 && bytes.length >= offset + 20) {
    // TCP
    const tcpStart = offset;
    const srcPort = (bytes[tcpStart] << 8) | bytes[tcpStart + 1];
    const dstPort = (bytes[tcpStart + 2] << 8) | bytes[tcpStart + 3];
    const seqNum = (bytes[tcpStart + 4] << 24) | (bytes[tcpStart + 5] << 16) | (bytes[tcpStart + 6] << 8) | bytes[tcpStart + 7];
    const ackNum = (bytes[tcpStart + 8] << 24) | (bytes[tcpStart + 9] << 16) | (bytes[tcpStart + 10] << 8) | bytes[tcpStart + 11];
    const dataOffsetVal = (bytes[tcpStart + 12] >> 4) * 4;
    const flagsByte = bytes[tcpStart + 13];
    const syn = Boolean(flagsByte & 0x02);
    const ack = Boolean(flagsByte & 0x10);
    const fin = Boolean(flagsByte & 0x01);
    const rst = Boolean(flagsByte & 0x04);
    const psh = Boolean(flagsByte & 0x08);
    const urg = Boolean(flagsByte & 0x20);

    const activeFlags = [syn && 'SYN', ack && 'ACK', fin && 'FIN', rst && 'RST', psh && 'PSH', urg && 'URG'].filter(Boolean).join(', ');
    const windowSize = (bytes[tcpStart + 14] << 8) | bytes[tcpStart + 15];
    const checksum = (bytes[tcpStart + 16] << 8) | bytes[tcpStart + 17];
    const urgPointer = (bytes[tcpStart + 18] << 8) | bytes[tcpStart + 19];

    layers.push({
      name: 'Transmission Control Protocol (TCP)',
      protocol: 'TCP',
      summary: `Port: ${srcPort} → ${dstPort} [${activeFlags || 'None'}] Seq=${seqNum >>> 0} Ack=${ackNum >>> 0} Win=${windowSize}`,
      fields: [
        { name: 'Source Port', value: srcPort, description: 'Client source port', byteStart: tcpStart, byteLength: 2, hexValue: srcPort.toString(16).padStart(4, '0') },
        { name: 'Destination Port', value: dstPort, description: 'Destination service port', byteStart: tcpStart + 2, byteLength: 2, hexValue: dstPort.toString(16).padStart(4, '0') },
        { name: 'Sequence Number', value: seqNum >>> 0, description: 'Data byte stream sequence index', byteStart: tcpStart + 4, byteLength: 4, hexValue: (seqNum >>> 0).toString(16).padStart(8, '0') },
        { name: 'Acknowledgment Number', value: ackNum >>> 0, description: 'Next expected byte number', byteStart: tcpStart + 8, byteLength: 4, hexValue: (ackNum >>> 0).toString(16).padStart(8, '0') },
        { name: 'Header Length', value: `${dataOffsetVal} bytes`, description: 'TCP Data offset size', byteStart: tcpStart + 12, byteLength: 1, hexValue: (dataOffsetVal / 4).toString(16) },
        { name: 'TCP Flags', value: `[${activeFlags}] (0x${flagsByte.toString(16).padStart(2, '0')})`, description: 'Connection control bits', byteStart: tcpStart + 13, byteLength: 1, hexValue: flagsByte.toString(16).padStart(2, '0') },
        { name: 'Window Size', value: windowSize, description: 'Flow control receive buffer window', byteStart: tcpStart + 14, byteLength: 2, hexValue: windowSize.toString(16).padStart(4, '0') },
        { name: 'Checksum', value: `0x${checksum.toString(16).padStart(4, '0')}`, description: 'TCP Segment and pseudo-header checksum', byteStart: tcpStart + 16, byteLength: 2, hexValue: checksum.toString(16).padStart(4, '0') },
        { name: 'Urgent Pointer', value: urgPointer, description: 'Offset to urgent out-of-band data', byteStart: tcpStart + 18, byteLength: 2, hexValue: urgPointer.toString(16).padStart(4, '0') },
      ],
      startOffset: tcpStart,
      length: dataOffsetVal
    });

    offset = tcpStart + dataOffsetVal;
  } else if (nextProtocol === 17 && bytes.length >= offset + 8) {
    // UDP
    const udpStart = offset;
    const srcPort = (bytes[udpStart] << 8) | bytes[udpStart + 1];
    const dstPort = (bytes[udpStart + 2] << 8) | bytes[udpStart + 3];
    const udpLen = (bytes[udpStart + 4] << 8) | bytes[udpStart + 5];
    const checksum = (bytes[udpStart + 6] << 8) | bytes[udpStart + 7];

    layers.push({
      name: 'User Datagram Protocol (UDP)',
      protocol: 'UDP',
      summary: `Port: ${srcPort} → ${dstPort}, Length: ${udpLen} bytes`,
      fields: [
        { name: 'Source Port', value: srcPort, description: 'Source UDP Port', byteStart: udpStart, byteLength: 2, hexValue: srcPort.toString(16).padStart(4, '0') },
        { name: 'Destination Port', value: dstPort, description: 'Destination UDP Port', byteStart: udpStart + 2, byteLength: 2, hexValue: dstPort.toString(16).padStart(4, '0') },
        { name: 'Length', value: `${udpLen} bytes`, description: 'Length of UDP header + payload', byteStart: udpStart + 4, byteLength: 2, hexValue: udpLen.toString(16).padStart(4, '0') },
        { name: 'Checksum', value: `0x${checksum.toString(16).padStart(4, '0')}`, description: 'UDP Checksum', byteStart: udpStart + 6, byteLength: 2, hexValue: checksum.toString(16).padStart(4, '0') },
      ],
      startOffset: udpStart,
      length: 8
    });

    offset = udpStart + 8;
  } else if (nextProtocol === 1 && bytes.length >= offset + 8) {
    // ICMP
    const icmpStart = offset;
    const icmpType = bytes[icmpStart];
    const icmpCode = bytes[icmpStart + 1];
    const checksum = (bytes[icmpStart + 2] << 8) | bytes[icmpStart + 3];
    const typeName = icmpType === 8 ? 'Echo Request (Ping)' : icmpType === 0 ? 'Echo Reply (Ping)' : icmpType === 3 ? 'Destination Unreachable' : `Type ${icmpType}`;

    layers.push({
      name: 'Internet Control Message Protocol (ICMP)',
      protocol: 'ICMP',
      summary: `${typeName}, Code: ${icmpCode}`,
      fields: [
        { name: 'Type', value: `${typeName} (${icmpType})`, description: 'ICMP Message Type', byteStart: icmpStart, byteLength: 1, hexValue: icmpType.toString(16).padStart(2, '0') },
        { name: 'Code', value: icmpCode, description: 'ICMP Sub-type Code', byteStart: icmpStart + 1, byteLength: 1, hexValue: icmpCode.toString(16).padStart(2, '0') },
        { name: 'Checksum', value: `0x${checksum.toString(16).padStart(4, '0')}`, description: 'ICMP Checksum', byteStart: icmpStart + 2, byteLength: 2, hexValue: checksum.toString(16).padStart(4, '0') },
      ],
      startOffset: icmpStart,
      length: 8
    });

    offset = icmpStart + 8;
  }

  // 4. Payload / Application Layer
  if (offset < bytes.length) {
    const payloadBytes = bytes.slice(offset);
    const ascii = Array.from(payloadBytes).map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
    layers.push({
      name: 'Payload / Application Data',
      protocol: 'Data',
      summary: `${payloadBytes.length} bytes of application payload`,
      fields: [
        { name: 'Length', value: `${payloadBytes.length} bytes`, description: 'Raw payload byte size', byteStart: offset, byteLength: payloadBytes.length, hexValue: '' },
        { name: 'ASCII Preview', value: ascii.substring(0, 64) + (ascii.length > 64 ? '...' : ''), description: 'Printable text representation', byteStart: offset, byteLength: payloadBytes.length, hexValue: '' }
      ],
      startOffset: offset,
      length: payloadBytes.length
    });
  }

  const topLayer = layers[layers.length - 1] || { summary: 'Raw Packet' };

  return {
    rawBytes: bytes,
    hexDump,
    asciiDump,
    layers,
    summary: topLayer.summary,
    timestamp: new Date().toISOString(),
    length: bytes.length
  };
}

// Calculate 16-bit One's Complement Internet Checksum
export function calculateInternetChecksum(buffer: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length - 1; i += 2) {
    sum += (buffer[i] << 8) | buffer[i + 1];
  }
  if (buffer.length % 2 === 1) {
    sum += buffer[buffer.length - 1] << 8;
  }
  while (sum >> 16) {
    sum = (sum & 0xffff) + (sum >> 16);
  }
  return (~sum) & 0xffff;
}

// Packet Builder Helper
export interface PacketBuilderConfig {
  srcMac: string;
  dstMac: string;
  vlanTag?: number;
  srcIp: string;
  dstIp: string;
  ttl: number;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  srcPort: number;
  dstPort: number;
  tcpFlags: { syn: boolean; ack: boolean; fin: boolean; rst: boolean; psh: boolean };
  seqNum: number;
  ackNum: number;
  payloadText: string;
}

export function buildCustomPacket(cfg: PacketBuilderConfig): { rawBytes: Uint8Array; hexString: string; scapyCode: string } {
  const parseMac = (mac: string) => {
    const hex = mac.replace(/[^0-9a-fA-F]/g, '').padEnd(12, '0');
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
      parseInt(hex.slice(6, 8), 16),
      parseInt(hex.slice(8, 10), 16),
      parseInt(hex.slice(10, 12), 16),
    ];
  };

  const parseIp = (ip: string) => {
    const parts = ip.split('.').map(p => Math.min(255, Math.max(0, parseInt(p, 10) || 0)));
    while (parts.length < 4) parts.push(0);
    return parts.slice(0, 4);
  };

  const payload = new TextEncoder().encode(cfg.payloadText || 'NetSubnet-Pro-Crafted-Packet');
  const bufferList: number[] = [];

  // 1. Ethernet Header (14 bytes)
  const dstMacBytes = parseMac(cfg.dstMac);
  const srcMacBytes = parseMac(cfg.srcMac);
  bufferList.push(...dstMacBytes);
  bufferList.push(...srcMacBytes);

  if (cfg.vlanTag) {
    bufferList.push(0x81, 0x00);
    const tci = cfg.vlanTag & 0x0fff;
    bufferList.push((tci >> 8) & 0xff, tci & 0xff);
  }

  bufferList.push(0x08, 0x00); // EtherType IPv4

  // 2. IPv4 Header (20 bytes)
  const ipProto = cfg.protocol === 'TCP' ? 6 : cfg.protocol === 'UDP' ? 17 : 1;
  const l4Len = cfg.protocol === 'TCP' ? 20 : cfg.protocol === 'UDP' ? 8 : 8;
  const ipTotalLen = 20 + l4Len + payload.length;

  const srcIpBytes = parseIp(cfg.srcIp);
  const dstIpBytes = parseIp(cfg.dstIp);

  const ipHeaderRaw = new Uint8Array([
    0x45, // Version 4, IHL 5 (20 bytes)
    0x00, // DSCP/ECN
    (ipTotalLen >> 8) & 0xff, ipTotalLen & 0xff,
    0x13, 0x37, // Identification
    0x40, 0x00, // Flags (DF)
    cfg.ttl & 0xff,
    ipProto,
    0x00, 0x00, // Checksum placeholder
    ...srcIpBytes,
    ...dstIpBytes
  ]);

  const ipChecksum = calculateInternetChecksum(ipHeaderRaw);
  ipHeaderRaw[10] = (ipChecksum >> 8) & 0xff;
  ipHeaderRaw[11] = ipChecksum & 0xff;

  bufferList.push(...Array.from(ipHeaderRaw));

  // 3. Layer 4
  if (cfg.protocol === 'TCP') {
    let flagsVal = 0;
    if (cfg.tcpFlags.fin) flagsVal |= 0x01;
    if (cfg.tcpFlags.syn) flagsVal |= 0x02;
    if (cfg.tcpFlags.rst) flagsVal |= 0x04;
    if (cfg.tcpFlags.psh) flagsVal |= 0x08;
    if (cfg.tcpFlags.ack) flagsVal |= 0x10;

    const tcpHeader = [
      (cfg.srcPort >> 8) & 0xff, cfg.srcPort & 0xff,
      (cfg.dstPort >> 8) & 0xff, cfg.dstPort & 0xff,
      (cfg.seqNum >> 24) & 0xff, (cfg.seqNum >> 16) & 0xff, (cfg.seqNum >> 8) & 0xff, cfg.seqNum & 0xff,
      (cfg.ackNum >> 24) & 0xff, (cfg.ackNum >> 16) & 0xff, (cfg.ackNum >> 8) & 0xff, cfg.ackNum & 0xff,
      0x50, // Data Offset (5 * 4 = 20 bytes)
      flagsVal,
      0xff, 0xff, // Window size 65535
      0x00, 0x00, // Checksum placeholder
      0x00, 0x00  // Urgent ptr
    ];
    bufferList.push(...tcpHeader);
  } else if (cfg.protocol === 'UDP') {
    const udpLen = 8 + payload.length;
    const udpHeader = [
      (cfg.srcPort >> 8) & 0xff, cfg.srcPort & 0xff,
      (cfg.dstPort >> 8) & 0xff, cfg.dstPort & 0xff,
      (udpLen >> 8) & 0xff, udpLen & 0xff,
      0x00, 0x00 // Checksum
    ];
    bufferList.push(...udpHeader);
  } else {
    // ICMP Echo
    const icmpHeader = [
      0x08, 0x00, // Echo request
      0x00, 0x00, // Checksum placeholder
      0x00, 0x01, // Ident
      0x00, 0x01  // Seq
    ];
    bufferList.push(...icmpHeader);
  }

  // 4. Payload
  bufferList.push(...Array.from(payload));

  const rawBytes = new Uint8Array(bufferList);
  const hexString = Array.from(rawBytes).map(b => b.toString(16).padStart(2, '0')).join(' ');

  // Generate Python Scapy script
  const scapyFlags = [];
  if (cfg.tcpFlags.syn) scapyFlags.push("'S'");
  if (cfg.tcpFlags.ack) scapyFlags.push("'A'");
  if (cfg.tcpFlags.fin) scapyFlags.push("'F'");
  if (cfg.tcpFlags.rst) scapyFlags.push("'R'");
  if (cfg.tcpFlags.psh) scapyFlags.push("'P'");

  let scapyCode = `#!/usr/bin/env python3\nfrom scapy.all import Ether, IP, TCP, UDP, ICMP, Raw, sendp\n\n`;
  scapyCode += `pkt = Ether(src="${cfg.srcMac}", dst="${cfg.dstMac}")`;
  if (cfg.vlanTag) scapyCode += ` / Dot1Q(vlan=${cfg.vlanTag})`;
  scapyCode += ` / IP(src="${cfg.srcIp}", dst="${cfg.dstIp}", ttl=${cfg.ttl})`;

  if (cfg.protocol === 'TCP') {
    scapyCode += ` / TCP(sport=${cfg.srcPort}, dport=${cfg.dstPort}, flags=[${scapyFlags.join(',')}], seq=${cfg.seqNum}, ack=${cfg.ackNum})`;
  } else if (cfg.protocol === 'UDP') {
    scapyCode += ` / UDP(sport=${cfg.srcPort}, dport=${cfg.dstPort})`;
  } else {
    scapyCode += ` / ICMP(type=8, code=0)`;
  }

  if (cfg.payloadText) {
    scapyCode += ` / Raw(load="${cfg.payloadText.replace(/"/g, '\\"')}")`;
  }

  scapyCode += `\n\n# Send crafted packet on default interface\nsendp(pkt, iface="eth0")\nprint("Packet transmitted successfully!")`;

  return { rawBytes, hexString, scapyCode };
}
