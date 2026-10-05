import React, { useState, useMemo } from 'react';
import { calculateSubnet, intToIp, ipToInt } from '../utils/ipv4';
import { Calculator, Copy, Check, ArrowRight, ArrowDownRight, Layers, Table, Network } from 'lucide-react';

export const CidrCalculator: React.FC = () => {
  const [ip, setIp] = useState('10.200.0.0');
  const [cidr, setCidr] = useState(16);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const subnet = useMemo(() => {
    try {
      return calculateSubnet(ip, cidr);
    } catch {
      return calculateSubnet('10.0.0.0', 24);
    }
  }, [ip, cidr]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate bit breakdown
  const bitBlocks = useMemo(() => {
    const list = [];
    for (let i = 0; i < 32; i++) {
      list.push(i < cidr ? 1 : 0);
    }
    return list;
  }, [cidr]);

  // CIDR Lookup quick reference table
  const cidrTable = useMemo(() => {
    const rows = [];
    for (let c = 8; c <= 30; c++) {
      const res = calculateSubnet('192.168.0.0', c);
      rows.push({
        cidr: `/${c}`,
        mask: res.subnetMask,
        wildcard: res.wildcardMask,
        total: res.totalHosts.toLocaleString(),
        usable: res.usableHosts.toLocaleString(),
      });
    }
    return rows;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">CIDR Calculator & Bitmask Analyzer</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Instant Classless Inter-Domain Routing (CIDR) calculation, bit allocations, wildcard masks, and quick conversion.
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              IP Network / Prefix
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="10.200.0.0"
              className="w-full font-mono text-sm px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 dark:text-white"
            />
          </div>

          <div className="md:col-span-6">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                CIDR Prefix: /{cidr}
              </label>
              <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold">
                {subnet.subnetMask}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="32"
              value={cidr}
              onChange={(e) => setCidr(parseInt(e.target.value, 10))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>/8 (Class A)</span>
              <span>/16 (Class B)</span>
              <span>/24 (Class C)</span>
              <span>/30 (P2P)</span>
              <span>/32 (Host)</span>
            </div>
          </div>
        </div>

        {/* Interactive 32-bit Bitmask Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              32-Bit CIDR Allocation Bar ({cidr} Network Bits | {32 - cidr} Host Bits)
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Total: {subnet.totalHosts.toLocaleString()} | Usable: {subnet.usableHosts.toLocaleString()}
            </span>
          </div>

          <div
            style={{ gridTemplateColumns: 'repeat(32, minmax(0, 1fr))' }}
            className="grid gap-0.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto min-w-[580px]"
          >
            {bitBlocks.map((bit, idx) => (
              <button
                key={idx}
                onClick={() => setCidr(idx + 1)}
                title={`Bit ${idx + 1}: ${bit === 1 ? 'Network Bit' : 'Host Bit'} (Click to set /${idx + 1})`}
                className={`h-7 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-all ${
                  bit === 1
                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {bit}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1 px-1">
            <span>MSB (Bit 1)</span>
            <span>Octet 1</span>
            <span>Octet 2</span>
            <span>Octet 3</span>
            <span>LSB (Bit 32)</span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400">Network Address</div>
          <div className="font-mono text-base font-bold text-teal-600 dark:text-teal-400 mt-1">
            {subnet.networkAddress}/{subnet.cidr}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400">Broadcast Address</div>
          <div className="font-mono text-base font-bold text-slate-900 dark:text-white mt-1">
            {subnet.broadcastAddress}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400">Wildcard (Cisco ACL)</div>
          <div className="font-mono text-base font-bold text-slate-900 dark:text-white mt-1">
            {subnet.wildcardMask}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400">Usable Range</div>
          <div className="font-mono text-xs font-bold text-slate-900 dark:text-white mt-1.5 truncate">
            {subnet.firstUsableHost} - {subnet.lastUsableHost}
          </div>
        </div>
      </div>

      {/* Fast CIDR Lookup Matrix Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
          <Table className="h-4 w-4 text-teal-500" />
          <span>CIDR Prefix Quick Reference Chart (/8 to /30)</span>
        </h2>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-2.5">Prefix</th>
                <th className="p-2.5">Subnet Mask</th>
                <th className="p-2.5">Wildcard Mask</th>
                <th className="p-2.5 text-right">Total Hosts</th>
                <th className="p-2.5 text-right">Usable Hosts</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {cidrTable.map((row, i) => {
                const isSelected = row.cidr === `/${cidr}`;
                return (
                  <tr
                    key={i}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <td className="p-2.5 font-bold text-teal-600 dark:text-teal-400">{row.cidr}</td>
                    <td className="p-2.5">{row.mask}</td>
                    <td className="p-2.5">{row.wildcard}</td>
                    <td className="p-2.5 text-right">{row.total}</td>
                    <td className="p-2.5 text-right">{row.usable}</td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => setCidr(parseInt(row.cidr.replace('/', ''), 10))}
                        className="px-2 py-1 rounded text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-600 transition-colors font-sans"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
