import React, { useState, useMemo } from 'react';
import { decodePacketBytes, parseHexOrBase64ToBytes, DecodedPacket } from '../utils/packetParser';
import { Binary, Layers, Eye, Copy, Check, AlertTriangle, HelpCircle, ChevronRight, Hash } from 'lucide-react';

export const PacketDecoder: React.FC = () => {
  const sampleHex = '001a2b3c4d5e005056c0000808004500003c1a2b40004006e232c0a8016968153ad2cc7801bb0000000000000000a002faf05bc00000020405b40402080a012345670000000001030307';
  const [inputHex, setInputHex] = useState(sampleHex);
  const [hoveredOffset, setHoveredOffset] = useState<{ start: number; length: number } | null>(null);
  const [selectedLayerIdx, setSelectedLayerIdx] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { decoded, error } = useMemo(() => {
    try {
      const bytes = parseHexOrBase64ToBytes(inputHex);
      const dec = decodePacketBytes(bytes);
      return { decoded: dec, error: null };
    } catch (err: any) {
      return { decoded: null, error: err.message || 'Invalid packet byte representation' };
    }
  }, [inputHex]);

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
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Binary className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Raw Packet Dissector & Bitfield Inspector</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Dissect raw hexadecimal or Base64 byte streams into Layer 2 Ethernet II, 802.1Q, IPv4/IPv6 headers, and TCP/UDP/ICMP payloads.
            </p>
          </div>
        </div>

        {/* Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Hexadecimal / Base64 Raw Packet Stream
          </label>
          <textarea
            rows={3}
            value={inputHex}
            onChange={(e) => setInputHex(e.target.value)}
            placeholder="Paste raw packet hex (e.g. 001a2b3c...)"
            className="w-full font-mono text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {decoded && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Protocol Tree & Fields */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
              <Layers className="h-4 w-4 text-blue-500" />
              <span>Decoded Protocol Stack Layers ({decoded.layers.length})</span>
            </h2>

            <div className="space-y-3">
              {decoded.layers.map((layer, lIdx) => (
                <div
                  key={lIdx}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden"
                >
                  <div
                    onClick={() => setSelectedLayerIdx(lIdx)}
                    className="p-3 bg-slate-100 dark:bg-slate-800/60 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                        {layer.protocol}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{layer.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {layer.length} bytes (offset {layer.startOffset})
                    </span>
                  </div>

                  <div className="p-3 divide-y divide-slate-200/60 dark:divide-slate-800/60">
                    {layer.fields.map((f, fIdx) => (
                      <div
                        key={fIdx}
                        onMouseEnter={() => setHoveredOffset({ start: f.byteStart, length: f.byteLength })}
                        onMouseLeave={() => setHoveredOffset(null)}
                        className="py-1.5 flex items-center justify-between hover:bg-blue-50/50 dark:hover:bg-blue-950/30 rounded px-1.5 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{f.name}</span>
                          <span className="text-[10px] text-slate-400">{f.description}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{f.value}</span>
                          {f.hexValue && (
                            <div className="text-[10px] font-mono text-slate-400">0x{f.hexValue}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hex Dump Inspector Pane */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 flex flex-col">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
                <Hash className="h-4 w-4 text-blue-500" />
                <span>Hex Dump & ASCII Inspector</span>
              </h2>
              <span className="text-xs text-slate-500 font-mono">{decoded.length} Bytes</span>
            </div>

            <div className="flex-1 bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs overflow-x-auto text-slate-300 select-all space-y-1">
              {decoded.hexDump.map((hexLine, lineIdx) => {
                const asciiLine = decoded.asciiDump[lineIdx];
                const lineOffset = (lineIdx * 16).toString(16).padStart(4, '0');
                return (
                  <div key={lineIdx} className="flex space-x-4">
                    <span className="text-slate-500 select-none">{lineOffset}</span>
                    <span className="text-blue-400 whitespace-pre">{hexLine}</span>
                    <span className="text-emerald-400 select-none">{asciiLine}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Hover over any protocol field in the left pane to highlight its corresponding byte range in the frame.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
