import React, { useState, useMemo } from 'react';
import { SAMPLE_PCAP_SESSIONS, PcapPacketItem, PcapCaptureSession } from '../utils/pcapSamples';
import { decodePacketBytes, parseHexOrBase64ToBytes, DecodedPacket } from '../utils/packetParser';
import { FileText, Eye, Layers, Hash, Upload, Download, Copy, Check, Play, HardDrive } from 'lucide-react';

export const PcapViewer: React.FC = () => {
  const [selectedSessionIdx, setSelectedSessionIdx] = useState(0);
  const activeSession = SAMPLE_PCAP_SESSIONS[selectedSessionIdx] || SAMPLE_PCAP_SESSIONS[0];
  const [selectedPacketId, setSelectedPacketId] = useState<number>(1);
  const [customHexInput, setCustomHexInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const currentPacketItem = activeSession.packets.find(p => p.id === selectedPacketId) || activeSession.packets[0];

  const decodedPacket: DecodedPacket | null = useMemo(() => {
    try {
      const hex = customHexInput.trim() || currentPacketItem.rawHex;
      const bytes = parseHexOrBase64ToBytes(hex);
      return decodePacketBytes(bytes);
    } catch {
      return null;
    }
  }, [currentPacketItem, customHexInput]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Wireshark-Style PCAP Packet Capture Dissector</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Inspect 3-pane packet captures: Packet List, Protocol Dissection Tree, and Raw Byte Hex Dump.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_PCAP_SESSIONS.map((sess, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedSessionIdx(idx);
                  setSelectedPacketId(1);
                  setCustomHexInput('');
                }}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                  selectedSessionIdx === idx
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {sess.name}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
          Session Description: {activeSession.description}
        </p>
      </div>

      {/* Pane 1: Packet List Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            1. Packet Capture Frame Stream ({activeSession.packets.length} Packets)
          </h2>
          <span className="text-xs text-slate-500 font-mono">Link-Layer: {activeSession.linkType}</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-2">No.</th>
                <th className="p-2">Time (ms)</th>
                <th className="p-2">Source</th>
                <th className="p-2">Destination</th>
                <th className="p-2">Protocol</th>
                <th className="p-2">Length</th>
                <th className="p-2">Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {activeSession.packets.map((pkt) => {
                const isSelected = pkt.id === selectedPacketId;
                return (
                  <tr
                    key={pkt.id}
                    onClick={() => {
                      setSelectedPacketId(pkt.id);
                      setCustomHexInput('');
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <td className="p-2 text-slate-400">{pkt.id}</td>
                    <td className="p-2">{pkt.timeOffsetMs.toFixed(3)}</td>
                    <td className="p-2">{pkt.src}</td>
                    <td className="p-2">{pkt.dst}</td>
                    <td className="p-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {pkt.protocol}
                      </span>
                    </td>
                    <td className="p-2">{pkt.length}</td>
                    <td className="p-2 text-slate-900 dark:text-white truncate max-w-xs">{pkt.info}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pane 2 & 3: Protocol Tree & Hex Dump Split View */}
      {decodedPacket && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Protocol Tree */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
              <Layers className="h-4 w-4 text-teal-500" />
              <span>2. Dissected Protocol Headers (Frame {currentPacketItem.id})</span>
            </h2>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {decodedPacket.layers.map((layer, lIdx) => (
                <div key={lIdx} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{layer.name}</span>
                    <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold">{layer.length} Bytes</span>
                  </div>

                  <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50 text-xs font-mono">
                    {layer.fields.map((f, fIdx) => (
                      <div key={fIdx} className="py-1 flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">{f.name}:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hex Dump */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 flex flex-col">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
                <Hash className="h-4 w-4 text-teal-500" />
                <span>3. Frame Hex Dump & ASCII Bytes</span>
              </h2>
              <button
                onClick={() => copyToClipboard(currentPacketItem.rawHex, 'hex')}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                {copiedKey === 'hex' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            <pre className="flex-1 p-3.5 rounded-lg bg-slate-950 text-teal-300 font-mono text-xs overflow-x-auto border border-slate-800 select-all space-y-1">
              {decodedPacket.hexDump.map((hex, i) => (
                <div key={i} className="flex space-x-3">
                  <span className="text-slate-600 select-none">{(i * 16).toString(16).padStart(4, '0')}</span>
                  <span className="text-teal-400">{hex}</span>
                  <span className="text-emerald-400 select-none">{decodedPacket.asciiDump[i]}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
