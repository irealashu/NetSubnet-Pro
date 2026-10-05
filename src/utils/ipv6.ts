// IPv6 Subnetting, Formatting, EUI-64, and Analysis Utilities

export interface IPv6Result {
  fullAddress: string;
  compressedAddress: string;
  prefixLength: number;
  prefix: string;
  networkAddress: string;
  totalSubnets64: string;
  totalAddresses: string;
  addressType: {
    type: string;
    description: string;
    scope: string;
    rfc: string;
  };
  solicitedNodeMulticast: string;
  reverseDnsPtr: string;
  binaryRepresentation: string;
  hextets: string[];
}

export function expandIPv6(ip: string): string {
  ip = ip.trim().toLowerCase();
  
  // Handle double colon :: expansion
  if (ip.includes('::')) {
    const parts = ip.split('::');
    const leftHextets = parts[0] ? parts[0].split(':') : [];
    const rightHextets = parts[1] ? parts[1].split(':') : [];
    const missingCount = 8 - (leftHextets.length + rightHextets.length);
    const middleHextets = Array(Math.max(0, missingCount)).fill('0000');
    const allHextets = [...leftHextets, ...middleHextets, ...rightHextets];
    return allHextets.map(h => h.padStart(4, '0')).join(':');
  }

  const hextets = ip.split(':');
  if (hextets.length === 8) {
    return hextets.map(h => h.padStart(4, '0')).join(':');
  }

  // Fallback default
  return '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
}

export function compressIPv6(fullIp: string): string {
  const hextets = fullIp.split(':').map(h => h.replace(/^0+/, '') || '0');
  
  // Find longest run of consecutive '0'
  let bestStart = -1;
  let bestLen = 0;
  let currStart = -1;
  let currLen = 0;

  for (let i = 0; i < hextets.length; i++) {
    if (hextets[i] === '0') {
      if (currStart === -1) {
        currStart = i;
        currLen = 1;
      } else {
        currLen++;
      }
      if (currLen > bestLen) {
        bestStart = currStart;
        bestLen = currLen;
      }
    } else {
      currStart = -1;
      currLen = 0;
    }
  }

  if (bestLen > 1) {
    const left = hextets.slice(0, bestStart).join(':');
    const right = hextets.slice(bestStart + bestLen).join(':');
    return `${left}::${right}`.replace(/^:::/, '::').replace(/:::$/, '::');
  }

  return hextets.join(':');
}

export function calculateIPv6(ipInput: string, prefixLength: number): IPv6Result {
  const cleanIp = ipInput.split('/')[0].trim();
  const validPrefix = Math.min(128, Math.max(1, prefixLength || 64));
  const full = expandIPv6(cleanIp);
  const compressed = compressIPv6(full);
  const hextets = full.split(':');

  // Binary string of 128 bits
  const binary = hextets.map(h => parseInt(h, 16).toString(2).padStart(16, '0')).join('');
  const netBinary = binary.substring(0, validPrefix).padEnd(128, '0');
  
  // Network address from netBinary
  const netHextets: string[] = [];
  for (let i = 0; i < 128; i += 16) {
    const chunk = netBinary.substring(i, i + 16);
    netHextets.push(parseInt(chunk, 2).toString(16).padStart(4, '0'));
  }
  const networkAddress = compressIPv6(netHextets.join(':'));

  // Address classification
  let addressType = {
    type: 'Global Unicast (GUA)',
    description: 'Publicly routable Internet IPv6 address',
    scope: 'Global',
    rfc: 'RFC 4291 / RFC 3587'
  };

  if (full === '0000:0000:0000:0000:0000:0000:0000:0001') {
    addressType = {
      type: 'Loopback Address (::1/128)',
      description: 'Host internal loopback equivalent to 127.0.0.1 in IPv4',
      scope: 'Node-Local',
      rfc: 'RFC 4291'
    };
  } else if (full === '0000:0000:0000:0000:0000:0000:0000:0000') {
    addressType = {
      type: 'Unspecified Address (::/128)',
      description: 'Absence of an address (used during initialization / DAD)',
      scope: 'Node-Local',
      rfc: 'RFC 4291'
    };
  } else if (full.startsWith('fe80:')) {
    addressType = {
      type: 'Link-Local Address (fe80::/10)',
      description: 'Non-routable, used for neighbor discovery and link communication',
      scope: 'Link-Local',
      rfc: 'RFC 4291'
    };
  } else if (full.startsWith('fc00:') || full.startsWith('fd')) {
    addressType = {
      type: 'Unique Local Address (ULA - fc00::/7)',
      description: 'Private routable address within an enterprise (similar to RFC 1918)',
      scope: 'Organization / Local',
      rfc: 'RFC 4193'
    };
  } else if (full.startsWith('ff')) {
    addressType = {
      type: 'Multicast Address (ff00::/8)',
      description: 'One-to-many communication channel',
      scope: 'Variable Multicast Scope',
      rfc: 'RFC 4291'
    };
  } else if (full.startsWith('2001:0db8:')) {
    addressType = {
      type: 'Documentation Prefix (2001:db8::/32)',
      description: 'Reserved for use in examples, documentation, and tutorials',
      scope: 'Global Non-Routable',
      rfc: 'RFC 3849'
    };
  }

  // Solicited-Node Multicast: ff02::1:ffXX:XXXX (last 24 bits / 6 hex chars of full address)
  const last24bits = full.replace(/:/g, '').slice(-6);
  const solicitedNodeMulticast = compressIPv6(`ff02:0000:0000:0000:0000:0001:ff${last24bits.substring(0, 2)}:${last24bits.substring(2)}`);

  // Reverse DNS PTR string
  const rawHex = full.replace(/:/g, '');
  const reverseDnsPtr = rawHex.split('').reverse().join('.') + '.ip6.arpa';

  // Subnets /64 count
  let totalSubnets64 = '1';
  if (validPrefix < 64) {
    const diff = 64 - validPrefix;
    if (diff <= 50) {
      totalSubnets64 = (BigInt(2) ** BigInt(diff)).toLocaleString();
    } else {
      totalSubnets64 = `2^${diff} (~${Math.pow(2, diff).toExponential(2)})`;
    }
  }

  const hostBits = 128 - validPrefix;
  let totalAddresses = '1';
  if (hostBits <= 60) {
    totalAddresses = (BigInt(2) ** BigInt(hostBits)).toLocaleString();
  } else {
    totalAddresses = `2^${hostBits} (${Math.pow(2, hostBits).toExponential(3)})`;
  }

  return {
    fullAddress: full,
    compressedAddress: compressed,
    prefixLength: validPrefix,
    prefix: `${compressed}/${validPrefix}`,
    networkAddress,
    totalSubnets64,
    totalAddresses,
    addressType,
    solicitedNodeMulticast,
    reverseDnsPtr,
    binaryRepresentation: binary,
    hextets
  };
}

export function generateEui64(macAddress: string, prefix = 'fe80::'): string {
  // Clean MAC address
  const cleanMac = macAddress.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
  if (cleanMac.length !== 12) {
    throw new Error('MAC address must contain 12 hexadecimal characters');
  }

  // Split MAC into two 6-character halves and insert fffe
  const firstHalf = cleanMac.substring(0, 6);
  const secondHalf = cleanMac.substring(6, 12);
  const modified = firstHalf + 'fffe' + secondHalf;

  // Invert 7th bit (Universal/Local bit) in the first byte
  let firstByte = parseInt(modified.substring(0, 2), 16);
  firstByte ^= 0x02; // Invert bit 7
  const firstByteHex = firstByte.toString(16).padStart(2, '0');

  const interfaceId = [
    firstByteHex + modified.substring(2, 4),
    modified.substring(4, 8),
    modified.substring(8, 12),
    modified.substring(12, 16)
  ].join(':');

  const cleanPrefix = prefix.replace(/\/.*$/, '').replace(/::.*$/, '').trim();
  const rawIpv6 = `${cleanPrefix}::${interfaceId}`;
  return compressIPv6(expandIPv6(rawIpv6));
}
