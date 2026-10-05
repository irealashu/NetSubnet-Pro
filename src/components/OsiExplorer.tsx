import React, { useState } from 'react';
import { Layers, Shield, Cpu, Network, Laptop, Globe, ArrowDown, ArrowUp, Activity, Terminal } from 'lucide-react';

export interface OsiLayer {
  number: number;
  name: string;
  pdu: string;
  protocols: string[];
  devices: string[];
  description: string;
  encapsulationDetail: string;
  headerFields: string[];
  color: string;
}

export const OsiExplorer: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<number>(7);
  const [encapDirection, setEncapDirection] = useState<'encapsulate' | 'decapsulate'>('encapsulate');

  const osiLayers: OsiLayer[] = [
    {
      number: 7,
      name: 'Application Layer',
      pdu: 'Data',
      protocols: ['HTTP/HTTPS', 'DNS', 'BGP', 'SSH', 'SNMP', 'DHCP', 'NTP'],
      devices: ['Web Browsers', 'REST APIs', 'Application Gateways'],
      description: 'Provides network services directly to end-user applications and software processes.',
      encapsulationDetail: 'Originates application payload (e.g. HTTP GET /index.html).',
      headerFields: ['HTTP Request Headers', 'Content-Type', 'Payload Body'],
      color: 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30'
    },
    {
      number: 6,
      name: 'Presentation Layer',
      pdu: 'Data',
      protocols: ['TLS/SSL', 'ASCII', 'UTF-8', 'JPEG', 'JSON', 'Gzip/Brotli'],
      devices: ['Operating System Libraries', 'Crypto Accelerators'],
      description: 'Translates data between the application and network format, handling encryption, compression, and serialization.',
      encapsulationDetail: 'Encrypts payload with AES-GCM / ChaCha20 and compresses data streams.',
      headerFields: ['TLS Record Header', 'Ciphertext', 'Auth Tag (MAC)'],
      color: 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30'
    },
    {
      number: 5,
      name: 'Session Layer',
      pdu: 'Data',
      protocols: ['RPC', 'NetBIOS', 'PPTP', 'SOCKS5', 'gRPC Sessions'],
      devices: ['OS Socket APIs', 'Session Border Controllers'],
      description: 'Establishes, manages, and terminates multi-turn communication sessions and dialogues between applications.',
      encapsulationDetail: 'Manages duplex dialogue, session tokens, and connection checkpoints.',
      headerFields: ['Session ID', 'Sync Points', 'Keep-Alive Tokens'],
      color: 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
    },
    {
      number: 4,
      name: 'Transport Layer',
      pdu: 'Segment (TCP) / Datagram (UDP)',
      protocols: ['TCP', 'UDP', 'QUIC', 'SCTP', 'ICMP (Transport semantics)'],
      devices: ['Firewalls', 'L4 Load Balancers', 'Proxy Servers'],
      description: 'Provides end-to-end host-to-host delivery, port multiplexing, error recovery, flow control, and sliding windows.',
      encapsulationDetail: 'Adds TCP/UDP header with Source/Destination Port, Seq, Ack, and Checksum.',
      headerFields: ['Source Port (16-bit)', 'Destination Port (16-bit)', 'Sequence Number (32-bit)', 'Ack Number (32-bit)', 'Window Size'],
      color: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
    },
    {
      number: 3,
      name: 'Network Layer',
      pdu: 'Packet',
      protocols: ['IPv4', 'IPv6', 'ICMP', 'IPsec', 'OSPF', 'IS-IS', 'ARP (L2/L3)'],
      devices: ['Routers', 'Layer 3 Switches', 'VPC Routers'],
      description: 'Handles logical IP addressing, packet fragmentation, and dynamic path determination (routing).',
      encapsulationDetail: 'Encapsulates segment into IP packet with Source IP, Destination IP, and TTL.',
      headerFields: ['Version/IHL', 'DSCP/ECN', 'Total Length', 'TTL (8-bit)', 'Protocol (8-bit)', 'Source IP', 'Destination IP'],
      color: 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
    },
    {
      number: 2,
      name: 'Data Link Layer',
      pdu: 'Frame',
      protocols: ['Ethernet (802.3)', 'Wi-Fi (802.11)', '802.1Q VLAN', 'PPP', 'LACP'],
      devices: ['Layer 2 Switches', 'Network Interface Cards (NIC)', 'Wireless Access Points'],
      description: 'Provides physical hardware MAC addressing, framing, media access control (CSMA/CD), and CRC error detection.',
      encapsulationDetail: 'Wraps packet into Ethernet frame with Source MAC, Destination MAC, EtherType, and Frame Check Sequence (FCS/CRC32).',
      headerFields: ['Destination MAC (48-bit)', 'Source MAC (48-bit)', '802.1Q Tag (Optional)', 'EtherType (16-bit)', 'FCS / CRC-32 (Trailer)'],
      color: 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
    },
    {
      number: 1,
      name: 'Physical Layer',
      pdu: 'Bits / Signal',
      protocols: ['10GBASE-T', '100GBASE-SR4', 'Single-Mode Fiber (SMF)', 'Cat6A RJ45', 'SFP28 / QSFP-DD'],
      devices: ['Transceivers (SFP+)', 'Patch Panels', 'Fiber Cables', 'Repeaters / Hubs'],
      description: 'Transmits unstructured raw bit streams across physical physical electrical voltages, optical light pulses, or RF radio waves.',
      encapsulationDetail: 'Encodes binary 1s and 0s into Manchester, PAM4, or NRZ line code pulses.',
      headerFields: ['Preamble (7 bytes 0xAA)', 'Start Frame Delimiter (SFD 0xAB)', 'Line Encoding Signals'],
      color: 'border-violet-500 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30'
    }
  ];

  const current = osiLayers.find(l => l.number === selectedLayer) || osiLayers[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">OSI 7-Layer & TCP/IP Reference Model Explorer</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Interactive exploration of Protocol Data Units (PDUs), encapsulation flows, hardware devices, and layer protocols.
            </p>
          </div>
        </div>

        {/* Encapsulation Simulation Direction Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
            <span>Encapsulation Flow:</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              {encapDirection === 'encapsulate' ? 'Outgoing: Layer 7 → Layer 1 (TX Headers Added)' : 'Incoming: Layer 1 → Layer 7 (RX Headers Stripped)'}
            </span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setEncapDirection('encapsulate')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1 ${
                encapDirection === 'encapsulate' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <ArrowDown className="h-3.5 w-3.5" />
              <span>Encapsulate (TX)</span>
            </button>
            <button
              onClick={() => setEncapDirection('decapsulate')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1 ${
                encapDirection === 'decapsulate' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span>Decapsulate (RX)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Layer Selection Stack */}
        <div className="lg:col-span-5 space-y-2">
          {osiLayers.map((layer) => {
            const isSelected = layer.number === selectedLayer;
            return (
              <div
                key={layer.number}
                onClick={() => setSelectedLayer(layer.number)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? `${layer.color} shadow-sm font-bold scale-[1.01]`
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="h-7 w-7 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center justify-center">
                    L{layer.number}
                  </span>
                  <div>
                    <div className="text-xs font-bold">{layer.name}</div>
                    <div className="text-[11px] opacity-75 font-mono">PDU: {layer.pdu}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {layer.protocols.slice(0, 2).join(', ')}...
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Layer Deep Dive */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-500 font-mono">
                Layer {current.number} Specification
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{current.name}</h2>
            </div>
            <span className="px-3 py-1 rounded-full font-mono text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              PDU: {current.pdu}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {current.description}
          </p>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Protocols</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {current.protocols.map((p, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Operating Hardware / Devices</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {current.devices.map((d, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Encapsulation Data Structure & Headers
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {current.encapsulationDetail}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 font-mono text-xs text-slate-700 dark:text-slate-300">
                {current.headerFields.map((h, i) => (
                  <div key={i} className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center space-x-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
