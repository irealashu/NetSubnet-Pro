// Preloaded PCAP Samples and Dissector for PCAP Viewer

export interface PcapPacketItem {
  id: number;
  timeOffsetMs: number;
  src: string;
  dst: string;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'DNS' | 'HTTP' | 'TLS' | 'ARP';
  length: number;
  info: string;
  rawHex: string;
}

export interface PcapCaptureSession {
  name: string;
  description: string;
  linkType: string;
  packets: PcapPacketItem[];
}

export const SAMPLE_PCAP_SESSIONS: PcapCaptureSession[] = [
  {
    name: 'HTTPS TLS 1.3 Web Handshake',
    description: 'Full TCP 3-way handshake followed by TLS 1.3 Client Hello and Server Hello negotiation.',
    linkType: 'Ethernet (10/100/1000)',
    packets: [
      {
        id: 1,
        timeOffsetMs: 0.0,
        src: '192.168.1.105',
        dst: '104.21.58.210',
        protocol: 'TCP',
        length: 74,
        info: '52344 → 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM=1',
        rawHex: '001a2b3c4d5e005056c0000808004500003c1a2b40004006e232c0a8016968153ad2cc7801bb0000000000000000a002faf05bc00000020405b40402080a012345670000000001030307'
      },
      {
        id: 2,
        timeOffsetMs: 14.2,
        src: '104.21.58.210',
        dst: '192.168.1.105',
        protocol: 'TCP',
        length: 74,
        info: '443 → 52344 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0 MSS=1460',
        rawHex: '005056c00008001a2b3c4d5e08004500003c2b3c40003506d12168153ad2c0a8016901bbcc781234567800000001a012ffff4a2b0000020405b40101040201030307'
      },
      {
        id: 3,
        timeOffsetMs: 14.8,
        src: '192.168.1.105',
        dst: '104.21.58.210',
        protocol: 'TCP',
        length: 66,
        info: '52344 → 443 [ACK] Seq=1 Ack=1 Win=64240 Len=0',
        rawHex: '001a2b3c4d5e005056c000080800450000341a2c40004006e239c0a8016968153ad2cc7801bb00000001123456798010faf0112200000101080a0123457500000000'
      },
      {
        id: 4,
        timeOffsetMs: 16.1,
        src: '192.168.1.105',
        dst: '104.21.58.210',
        protocol: 'TLS',
        length: 517,
        info: 'Client Hello (TLS 1.3), SNI=api.netsubnet.pro, CipherSuites=17',
        rawHex: '001a2b3c4d5e005056c000080800450002051a2d40004006e067c0a8016968153ad2cc7801bb00000001123456798018faf099a1000016030101d0010001cc0303a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff000020130113021303c02bc02f'
      },
      {
        id: 5,
        timeOffsetMs: 31.4,
        src: '104.21.58.210',
        dst: '192.168.1.105',
        protocol: 'TLS',
        length: 1420,
        info: 'Server Hello, Change Cipher Spec, Application Data',
        rawHex: '005056c00008001a2b3c4d5e08004500058c2b3d40003506cbd068153ad2c0a8016901bbcc7812345679000001d18018ffff12340000160303007a02000076030333445566778899aabbccddeeff00112233445566778899aabbccddeeff00130100004e00330024001d0020'
      }
    ]
  },
  {
    name: 'DNS Query & Response Resolution',
    description: 'Standard DNS lookup for domain A record query to 8.8.8.8 and authoritative IP resolution response.',
    linkType: 'Ethernet',
    packets: [
      {
        id: 1,
        timeOffsetMs: 0.0,
        src: '192.168.1.45',
        dst: '8.8.8.8',
        protocol: 'DNS',
        length: 75,
        info: 'Standard query 0x4a21 A api.cloudflare.com',
        rawHex: '001a2b3c4d5e005056c0000808004500003d100140004011ec54c0a8012d08080808d4310035002900004a2101000001000000000000036170690a636c6f7564666c61726503636f6d0000010001'
      },
      {
        id: 2,
        timeOffsetMs: 18.5,
        src: '8.8.8.8',
        dst: '192.168.1.45',
        protocol: 'DNS',
        length: 91,
        info: 'Standard query response 0x4a21 A api.cloudflare.com A 104.16.132.229 A 104.16.133.229',
        rawHex: '005056c00008001a2b3c4d5e08004500004d300240003811cc5308080808c0a8012d0035d43100397b214a2181800001000200000000036170690a636c6f7564666c61726503636f6d0000010001c00c000100010000012c0004681084e5c00c000100010000012c0004681085e5'
      }
    ]
  },
  {
    name: 'ICMP Ping Echo Round-Trip',
    description: 'ICMP Type 8 Echo Request and Type 0 Echo Reply sequence with latency metrics.',
    linkType: 'Ethernet',
    packets: [
      {
        id: 1,
        timeOffsetMs: 0.0,
        src: '10.10.10.2',
        dst: '10.10.10.1',
        protocol: 'ICMP',
        length: 98,
        info: 'Echo (ping) request  id=0x1a2b, seq=1/256, ttl=64',
        rawHex: '000c294f8e12000c294f8e08080045000054a1b240004001d2480a0a0a020a0a0a0108004d5e1a2b00016162636465666768696a6b6c6d6e6f7071727374757677616263646566676869'
      },
      {
        id: 2,
        timeOffsetMs: 1.2,
        src: '10.10.10.1',
        dst: '10.10.10.2',
        protocol: 'ICMP',
        length: 98,
        info: 'Echo (ping) reply    id=0x1a2b, seq=1/256, ttl=64 (reply in 1.2ms)',
        rawHex: '000c294f8e08000c294f8e12080045000054a1b340004001d2470a0a0a010a0a0a020000555e1a2b00016162636465666768696a6b6c6d6e6f7071727374757677616263646566676869'
      }
    ]
  }
];
