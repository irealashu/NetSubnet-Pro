import React, { useState, useMemo } from 'react';
import { ipToInt, intToIp, calculateSubnet } from '../utils/ipv4';
import { Route, Copy, Check, ArrowRight, Layers, Table, CheckCircle2, AlertCircle } from 'lucide-react';

export const IpRangeFinder: React.FC = () => {
  const [startIp, setStartIp] = useState('192.168.1.50');
  const [endIp, setEndIp] = useState('192.168.1.150');
  const [testIp, setTestIp] = useState('192.168.1.75');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Convert arbitrary IP range into minimal set of CIDR blocks
  const { cidrBlocks, totalIps, isValid, error } = useMemo(() => {
    try {
      const startInt = ipToInt(startIp.trim());
      const endInt = ipToInt(endIp.trim());

      if (startInt > endInt) {
        return { cidrBlocks: [], totalIps: 0, isValid: false, error: 'Start IP must be less than or equal to End IP' };
      }

      let current = startInt;
      const blocks: { cidr: string; count: number; net: string; mask: string }[] = [];

      while (current <= endInt) {
        // Find max power of 2 aligned at current
        let maxBits = 0;
        while ((current & (1 << maxBits)) === 0 && (current + (1 << (maxBits + 1)) - 1) <= endInt && maxBits < 32) {
          maxBits++;
        }

        // Check if fits within range
        while ((current + (1 << maxBits) - 1) > endInt && maxBits > 0) {
          maxBits--;
        }

        const prefix = 32 - maxBits;
        const blockSubnet = calculateSubnet(intToIp(current), prefix);
        const count = Math.pow(2, maxBits);

        blocks.push({
          cidr: `${intToIp(current)}/${prefix}`,
          count,
          net: intToIp(current),
          mask: blockSubnet.subnetMask
        });

        current += count;
      }

      return {
        cidrBlocks: blocks,
        totalIps: endInt - startInt + 1,
        isValid: true,
        error: null
      };
    } catch (err: any) {
      return { cidrBlocks: [], totalIps: 0, isValid: false, error: err.message || 'Invalid IP addresses' };
    }
  }, [startIp, endIp]);

  // Test IP containment check
  const containment = useMemo(() => {
    try {
      const s = ipToInt(startIp.trim());
      const e = ipToInt(endIp.trim());
      const t = ipToInt(testIp.trim());
      const isInside = t >= s && t <= e;
      const offset = t - s;
      return { isInside, offset, error: null };
    } catch {
      return { isInside: false, offset: 0, error: 'Invalid test IP format' };
    }
  }, [startIp, endIp, testIp]);

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
            <Route className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">IP Range to CIDR Finder & Boundary Aggregator</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Convert arbitrary Start and End IP boundaries into the optimal, minimal set of exact CIDR prefix blocks.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Start IP Address
            </label>
            <input
              type="text"
              value={startIp}
              onChange={(e) => setStartIp(e.target.value)}
              placeholder="192.168.1.50"
              className="w-full font-mono text-sm px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              End IP Address
            </label>
            <input
              type="text"
              value={endIp}
              onChange={(e) => setEndIp(e.target.value)}
              placeholder="192.168.1.150"
              className="w-full font-mono text-sm px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Range Stats */}
      {isValid && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Discrete IP Addresses</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {totalIps.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">Minimal CIDR Blocks Required</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {cidrBlocks.length} {cidrBlocks.length === 1 ? 'Block' : 'Blocks'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400">Range Coverage</div>
            <div className="font-mono text-xs font-bold text-slate-900 dark:text-white mt-2 truncate">
              {startIp} → {endIp}
            </div>
          </div>
        </div>
      )}

      {/* CIDR Blocks Output */}
      {isValid && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
                <Table className="h-4 w-4 text-emerald-500" />
                <span>Computed Minimal CIDR Prefixes</span>
              </h2>
              <button
                onClick={() => copyToClipboard(cidrBlocks.map(b => b.cidr).join('\n'), 'all-cidr')}
                className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1"
              >
                {copiedKey === 'all-cidr' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                <span>Copy All</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">CIDR Prefix</th>
                    <th className="p-2.5">Subnet Mask</th>
                    <th className="p-2.5 text-right">IP Count</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {cidrBlocks.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 text-slate-400">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">{b.cidr}</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-400">{b.mask}</td>
                      <td className="p-2.5 text-right font-semibold">{b.count.toLocaleString()}</td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => copyToClipboard(b.cidr, `block-${idx}`)}
                          className="p-1 rounded text-slate-500 hover:text-emerald-600"
                        >
                          {copiedKey === `block-${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Point-in-Range Tester */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <span>Point-in-Range Verification</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Test Target IP
              </label>
              <input
                type="text"
                value={testIp}
                onChange={(e) => setTestIp(e.target.value)}
                placeholder="192.168.1.75"
                className="w-full font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
              />
            </div>

            <div className={`p-4 rounded-xl border ${
              containment.isInside
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300'
            }`}>
              <div className="flex items-center space-x-2 font-bold text-sm">
                {containment.isInside ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>IP is Inside Range!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-rose-500" />
                    <span>IP is Outside Range</span>
                  </>
                )}
              </div>
              <p className="text-xs mt-1 opacity-80">
                {containment.isInside
                  ? `Position: +${containment.offset.toLocaleString()} IPs offset from ${startIp}`
                  : `Target IP falls outside the boundaries [${startIp} ... ${endIp}].`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
