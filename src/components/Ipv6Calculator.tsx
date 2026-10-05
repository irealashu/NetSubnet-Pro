import React, { useState, useMemo } from 'react';
import { calculateIPv6, generateEui64, IPv6Result } from '../utils/ipv6';
import { Globe, Copy, Check, Hash, Cpu, ArrowRight, Shield, Layers, HelpCircle } from 'lucide-react';

export const Ipv6Calculator: React.FC = () => {
  const [ipInput, setIpInput] = useState('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
  const [prefixLength, setPrefixLength] = useState(64);
  const [macInput, setMacInput] = useState('00:1A:2B:3C:4D:5E');
  const [euiPrefix, setEuiPrefix] = useState('2001:db8:acad::');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const result: IPv6Result = useMemo(() => {
    try {
      return calculateIPv6(ipInput, prefixLength);
    } catch {
      return calculateIPv6('2001:db8::1', 64);
    }
  }, [ipInput, prefixLength]);

  const generatedEui64 = useMemo(() => {
    try {
      return generateEui64(macInput, euiPrefix);
    } catch (err: any) {
      return `Error: ${err.message}`;
    }
  }, [macInput, euiPrefix]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleIpv6 = [
    { label: 'Documentation Prefix', ip: '2001:db8:abcd:0012::1', prefix: 64 },
    { label: 'Unique Local (ULA)', ip: 'fd12:3456:789a:1::1', prefix: 48 },
    { label: 'Link-Local Host', ip: 'fe80::1ff:fe23:4567', prefix: 10 },
    { label: 'Google Public DNS', ip: '2001:4860:4860::8888', prefix: 32 },
    { label: 'Cloudflare DNS', ip: '2606:4700:4700::1111', prefix: 32 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">IPv6 Subnet Calculator & EUI-64 Generator</h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Full 128-bit IPv6 expansion, RFC 4291 classification, solicited-node multicast, and reverse DNS PTR builder.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5">
            {sampleIpv6.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIpInput(s.ip);
                  setPrefixLength(s.prefix);
                }}
                className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors font-mono"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              IPv6 Address / Hextets
            </label>
            <div className="relative">
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="2001:db8:85a3::8a2e:370:7334"
                className="w-full font-mono text-sm px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Prefix Length: /{prefixLength}
              </label>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                {128 - prefixLength} host bits
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="128"
              value={prefixLength}
              onChange={(e) => setPrefixLength(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>/32 (ISP)</span>
              <span>/48 (Site)</span>
              <span>/64 (Subnet)</span>
              <span>/128 (Host)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Address Formats & Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <Hash className="h-4 w-4 text-indigo-500" />
            <span>Address Formats & Subnet Details</span>
          </h2>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Compressed Address (RFC 5952)</span>
                <button
                  onClick={() => copyToClipboard(result.compressedAddress, 'comp')}
                  className="hover:text-indigo-600 flex items-center space-x-1"
                >
                  {copiedKey === 'comp' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedKey === 'comp' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-sm bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold break-all">
                {result.compressedAddress}/{result.prefixLength}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Expanded Full 128-bit Address</span>
                <button
                  onClick={() => copyToClipboard(result.fullAddress, 'full')}
                  className="hover:text-indigo-600 flex items-center space-x-1"
                >
                  {copiedKey === 'full' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="font-mono text-xs bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 break-all">
                {result.fullAddress}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Total /64 Subnets</div>
                <div className="font-mono text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                  {result.totalSubnets64}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Host Addresses</div>
                <div className="font-mono text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                  {result.totalAddresses}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Solicited-Node Multicast Address</div>
              <div className="font-mono text-xs bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-medium">
                {result.solicitedNodeMulticast}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Reverse DNS PTR Record (ip6.arpa)</span>
                <button
                  onClick={() => copyToClipboard(result.reverseDnsPtr, 'ptr')}
                  className="hover:text-indigo-600 flex items-center space-x-1"
                >
                  {copiedKey === 'ptr' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="font-mono text-[11px] bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 break-all select-all">
                {result.reverseDnsPtr}
              </div>
            </div>
          </div>
        </div>

        {/* Address Classification & EUI-64 Generator */}
        <div className="space-y-6">
          {/* Classification */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>RFC Scope & Classification</span>
            </h2>

            <div className="p-4 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-emerald-900 dark:text-emerald-300">
                  {result.addressType.type}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold font-mono">
                  {result.addressType.scope}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {result.addressType.description}
              </p>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-1">
                Standard: {result.addressType.rfc}
              </div>
            </div>

            {/* Hextet Bit Allocation Display */}
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex items-center space-x-1">
                <Layers className="h-3.5 w-3.5" />
                <span>128-Bit Hextet Structure</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {result.hextets.map((hex, i) => {
                  const bitStart = i * 16;
                  const isNet = bitStart + 16 <= result.prefixLength;
                  const isPartial = bitStart < result.prefixLength && bitStart + 16 > result.prefixLength;

                  return (
                    <div
                      key={i}
                      className={`p-2 rounded text-center border font-mono text-xs ${
                        isNet
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                          : isPartial
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="font-bold">{hex}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">
                        {isNet ? 'Network' : isPartial ? 'Mixed' : 'Interface'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* EUI-64 Generator */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-blue-500" />
              <span>EUI-64 MAC-to-IPv6 Generator</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  MAC Address (48-bit)
                </label>
                <input
                  type="text"
                  value={macInput}
                  onChange={(e) => setMacInput(e.target.value)}
                  placeholder="00:1A:2B:3C:4D:5E"
                  className="w-full font-mono text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  IPv6 Prefix (/64)
                </label>
                <input
                  type="text"
                  value={euiPrefix}
                  onChange={(e) => setEuiPrefix(e.target.value)}
                  placeholder="2001:db8:acad::"
                  className="w-full font-mono text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>
            </div>

            <div className="mt-2 p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-semibold text-blue-900 dark:text-blue-300">Generated EUI-64 SLAAC Address</span>
                <button
                  onClick={() => copyToClipboard(generatedEui64, 'eui')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 font-sans"
                >
                  {copiedKey === 'eui' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="font-mono text-xs text-blue-800 dark:text-blue-200 font-bold break-all">
                {generatedEui64}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
