import React, { useState, useMemo } from 'react';
import { buildCustomPacket, PacketBuilderConfig } from '../utils/packetParser';
import { Terminal, Copy, Check, Play, Code, ShieldCheck, Layers, ArrowRight } from 'lucide-react';

export const PacketBuilder: React.FC = () => {
  const [srcMac, setSrcMac] = useState('00:1A:2B:3C:4D:5E');
  const [dstMac, setDstMac] = useState('00:50:56:C0:00:08');
  const [vlanTag, setVlanTag] = useState<number | undefined>(100);
  const [srcIp, setSrcIp] = useState('192.168.1.50');
  const [dstIp, setDstIp] = useState('10.0.0.1');
  const [ttl, setTtl] = useState(64);
  const [protocol, setProtocol] = useState<'TCP' | 'UDP' | 'ICMP'>('TCP');
  const [srcPort, setSrcPort] = useState(54321);
  const [dstPort, setDstPort] = useState(80);
  const [syn, setSyn] = useState(true);
  const [ack, setAck] = useState(false);
  const [fin, setFin] = useState(false);
  const [rst, setRst] = useState(false);
  const [psh, setPsh] = useState(false);
  const [seqNum, setSeqNum] = useState(1000);
  const [ackNum, setAckNum] = useState(0);
  const [payloadText, setPayloadText] = useState('GET /api/v1/health HTTP/1.1\r\nHost: target\r\n\r\n');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const config: PacketBuilderConfig = {
    srcMac,
    dstMac,
    vlanTag,
    srcIp,
    dstIp,
    ttl,
    protocol,
    srcPort,
    dstPort,
    tcpFlags: { syn, ack, fin, rst, psh },
    seqNum,
    ackNum,
    payloadText
  };

  const { rawBytes, hexString, scapyCode } = useMemo(() => {
    return buildCustomPacket(config);
  }, [config]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Terminal className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Interactive Raw Packet Crafting Studio</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Build custom Ethernet II + 802.1Q + IPv4 + TCP/UDP frames byte-by-byte with live checksums and Python Scapy generator.
            </p>
          </div>
        </div>

        {/* Form Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Layer 2 Ethernet */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Layer 2: Ethernet & VLAN
            </h3>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Source MAC</label>
              <input
                type="text"
                value={srcMac}
                onChange={(e) => setSrcMac(e.target.value)}
                className="w-full font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Destination MAC</label>
              <input
                type="text"
                value={dstMac}
                onChange={(e) => setDstMac(e.target.value)}
                className="w-full font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">802.1Q VLAN Tag</label>
              <input
                type="number"
                value={vlanTag || 0}
                onChange={(e) => setVlanTag(parseInt(e.target.value, 10) || undefined)}
                className="w-full font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded dark:text-white"
              />
            </div>
          </div>

          {/* Layer 3 IPv4 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Layer 3: IPv4 Header
            </h3>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Source IP</label>
              <input
                type="text"
                value={srcIp}
                onChange={(e) => setSrcIp(e.target.value)}
                className="w-full font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Destination IP</label>
              <input
                type="text"
                value={dstIp}
                onChange={(e) => setDstIp(e.target.value)}
                className="w-full font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded dark:text-white font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">TTL</label>
                <input
                  type="number"
                  value={ttl}
                  onChange={(e) => setTtl(parseInt(e.target.value, 10) || 64)}
                  className="w-full font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Protocol</label>
                <select
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value as any)}
                  className="w-full font-mono text-xs px-2 py-1.5 bg-white dark:bg-slate-900 border rounded dark:text-white font-bold"
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="ICMP">ICMP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Layer 4 & Payload */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Layer 4 & Payload
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Src Port</label>
                <input
                  type="number"
                  value={srcPort}
                  onChange={(e) => setSrcPort(parseInt(e.target.value, 10) || 54321)}
                  className="w-full font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Dst Port</label>
                <input
                  type="number"
                  value={dstPort}
                  onChange={(e) => setDstPort(parseInt(e.target.value, 10) || 80)}
                  className="w-full font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded dark:text-white font-bold"
                />
              </div>
            </div>

            {protocol === 'TCP' && (
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: 'SYN', state: syn, set: setSyn },
                  { label: 'ACK', state: ack, set: setAck },
                  { label: 'FIN', state: fin, set: setFin },
                  { label: 'RST', state: rst, set: setRst },
                  { label: 'PSH', state: psh, set: setPsh },
                ].map((f) => (
                  <label key={f.label} className="flex items-center space-x-1 text-xs cursor-pointer font-mono font-bold">
                    <input
                      type="checkbox"
                      checked={f.state}
                      onChange={(e) => f.set(e.target.checked)}
                      className="rounded text-emerald-600 h-3.5 w-3.5"
                    />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
            )}

            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Payload ASCII String</label>
              <input
                type="text"
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                className="w-full font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hex Stream & Scapy Code Generation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hex byte stream */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 flex flex-col">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Raw Packet Hex Stream ({rawBytes.length} Bytes)
            </h2>
            <button
              onClick={() => copyToClipboard(hexString, 'hex')}
              className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1"
            >
              {copiedKey === 'hex' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copy Hex</span>
            </button>
          </div>
          <pre className="flex-1 p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-lg border border-slate-800 select-all whitespace-pre-wrap break-all min-h-[220px]">
            {hexString}
          </pre>
        </div>

        {/* Python Scapy Script */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 flex flex-col">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Code className="h-4 w-4 text-emerald-500" />
              <span>Python Scapy Script</span>
            </h2>
            <button
              onClick={() => copyToClipboard(scapyCode, 'scapy')}
              className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1"
            >
              {copiedKey === 'scapy' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copy Code</span>
            </button>
          </div>
          <pre className="flex-1 p-4 bg-slate-950 text-sky-300 font-mono text-xs rounded-lg border border-slate-800 select-all whitespace-pre min-h-[220px]">
            {scapyCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
