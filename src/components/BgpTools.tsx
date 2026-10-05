import React, { useState, useMemo } from 'react';
import { Globe, Copy, Check, ShieldCheck, ArrowRight, Table, Layers, Terminal } from 'lucide-react';

export interface BgpRouteCandidate {
  id: string;
  neighbor: string;
  type: 'eBGP' | 'iBGP';
  weight: number;         // Cisco proprietary (highest wins)
  localPref: number;      // Higher wins
  locallyOriginated: boolean;
  asPath: number[];       // Shortest wins
  origin: 'IGP' | 'EGP' | 'Incomplete'; // IGP < EGP < Incomplete
  med: number;            // Multi-Exit Discriminator (Lowest wins)
  igpMetric: number;      // Lowest IGP metric to next-hop wins
  routerId: string;       // Lowest Router ID wins
}

export const BgpTools: React.FC = () => {
  const [candidates, setCandidates] = useState<BgpRouteCandidate[]>([
    { id: '1', neighbor: '198.51.100.1 (ISP-A)', type: 'eBGP', weight: 100, localPref: 100, locallyOriginated: false, asPath: [65001, 15169], origin: 'IGP', med: 0, igpMetric: 10, routerId: '1.1.1.1' },
    { id: '2', neighbor: '203.0.113.1 (ISP-B)', type: 'eBGP', weight: 100, localPref: 100, locallyOriginated: false, asPath: [65002, 13335, 15169], origin: 'IGP', med: 50, igpMetric: 10, routerId: '2.2.2.2' },
    { id: '3', neighbor: '10.254.0.2 (Core-iBGP)', type: 'iBGP', weight: 0, localPref: 120, locallyOriginated: false, asPath: [65001, 15169], origin: 'IGP', med: 0, igpMetric: 5, routerId: '10.254.0.2' }
  ]);

  const [localAsn, setLocalAsn] = useState(65000);
  const [targetPrefix, setTargetPrefix] = useState('8.8.8.0/24');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // BGP Best Path Selection Algorithm
  const decisionResult = useMemo(() => {
    // 1. Highest Weight (Cisco)
    // 2. Highest Local Preference
    // 3. Locally Originated (network/redistribute > aggregate)
    // 4. Shortest AS_PATH
    // 5. Lowest Origin code (IGP < EGP < ?)
    // 6. Lowest MED
    // 7. eBGP over iBGP
    // 8. Lowest IGP metric to BGP Next-Hop
    // 9. Lowest BGP Router ID

    let currentWinners = [...candidates];
    const logs: string[] = [];

    // Step 1: Weight
    const maxWeight = Math.max(...currentWinners.map(c => c.weight));
    const afterWeight = currentWinners.filter(c => c.weight === maxWeight);
    if (afterWeight.length < currentWinners.length) {
      logs.push(`Step 1 (Weight): Filtered out routes with weight < ${maxWeight}`);
    }
    currentWinners = afterWeight;

    // Step 2: Local Pref
    if (currentWinners.length > 1) {
      const maxLp = Math.max(...currentWinners.map(c => c.localPref));
      const afterLp = currentWinners.filter(c => c.localPref === maxLp);
      if (afterLp.length < currentWinners.length) {
        logs.push(`Step 2 (Local Preference): Preferred routes with Local-Pref = ${maxLp}`);
      }
      currentWinners = afterLp;
    }

    // Step 3: AS_PATH length
    if (currentWinners.length > 1) {
      const minPath = Math.min(...currentWinners.map(c => c.asPath.length));
      const afterPath = currentWinners.filter(c => c.asPath.length === minPath);
      if (afterPath.length < currentWinners.length) {
        logs.push(`Step 4 (AS_PATH): Preferred shorter AS path length = ${minPath}`);
      }
      currentWinners = afterPath;
    }

    // Step 4: eBGP over iBGP
    if (currentWinners.length > 1) {
      const hasEbgp = currentWinners.some(c => c.type === 'eBGP');
      if (hasEbgp) {
        const afterEbgp = currentWinners.filter(c => c.type === 'eBGP');
        if (afterEbgp.length < currentWinners.length) {
          logs.push('Step 7 (eBGP vs iBGP): Preferred external eBGP routes over internal iBGP');
        }
        currentWinners = afterEbgp;
      }
    }

    return {
      bestRoute: currentWinners[0] || null,
      decisionLogs: logs
    };
  }, [candidates]);

  // Cisco BGP Config Generator
  const ciscoBgpConfig = `! Cisco IOS BGP Router Configuration (AS ${localAsn})
router bgp ${localAsn}
 bgp router-id 10.0.0.1
 bgp log-neighbor-changes
 network ${targetPrefix.split('/')[0]} mask 255.255.255.0
 ! Neighbors
 neighbor 198.51.100.1 remote-as 65001
 neighbor 198.51.100.1 description ISP-A Primary Transit
 neighbor 198.51.100.1 route-map SET-PREF-IN in
 !
 neighbor 203.0.113.1 remote-as 65002
 neighbor 203.0.113.1 description ISP-B Backup Transit
!
route-map SET-PREF-IN permit 10
 set local-preference 150
 set community ${localAsn}:100`;

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
          <div className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Border Gateway Protocol (BGP) Best Path Engine & Community Tools</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Calculate BGP best path selection algorithm, simulate AS-Path prepending, and generate BGP neighbor route-maps.
            </p>
          </div>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Local Autonomous System Number (ASN)
            </label>
            <input
              type="number"
              value={localAsn}
              onChange={(e) => setLocalAsn(parseInt(e.target.value, 10) || 65000)}
              className="w-full font-mono text-sm px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Advertised IP Prefix
            </label>
            <input
              type="text"
              value={targetPrefix}
              onChange={(e) => setTargetPrefix(e.target.value)}
              className="w-full font-mono text-sm px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white font-bold text-orange-600 dark:text-orange-400"
            />
          </div>
        </div>
      </div>

      {/* Decision Algorithm Results */}
      {decisionResult.bestRoute && (
        <div className="p-5 rounded-xl bg-orange-50/80 dark:bg-orange-950/30 border-2 border-orange-500 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm text-orange-950 dark:text-orange-200">
              ★ Selected Best BGP Path: {decisionResult.bestRoute.neighbor}
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-200">
              AS-PATH: [{decisionResult.bestRoute.asPath.join(' ')}]
            </span>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 font-mono space-y-1 pt-1">
            {decisionResult.decisionLogs.map((log, i) => (
              <div key={i}>✓ {log}</div>
            ))}
          </div>
        </div>
      )}

      {/* BGP Route Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
          <Table className="h-4 w-4 text-orange-500" />
          <span>BGP Path Attribute Matrix</span>
        </h2>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-2.5">Neighbor</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Weight</th>
                <th className="p-2.5">Local-Pref</th>
                <th className="p-2.5">AS-PATH</th>
                <th className="p-2.5">MED</th>
                <th className="p-2.5">Origin</th>
                <th className="p-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {candidates.map((c) => {
                const isWinner = c.id === decisionResult.bestRoute?.id;
                return (
                  <tr key={c.id} className={isWinner ? 'bg-orange-50 dark:bg-orange-950/40 font-bold text-orange-900 dark:text-orange-200' : 'text-slate-700 dark:text-slate-300'}>
                    <td className="p-2.5">{c.neighbor}</td>
                    <td className="p-2.5">{c.type}</td>
                    <td className="p-2.5">{c.weight}</td>
                    <td className="p-2.5">{c.localPref}</td>
                    <td className="p-2.5">[{c.asPath.join(' ')}]</td>
                    <td className="p-2.5">{c.med}</td>
                    <td className="p-2.5">{c.origin}</td>
                    <td className="p-2.5 text-center">
                      {isWinner ? <span className="px-2 py-0.5 rounded bg-orange-500 text-white text-[10px]">BEST PATH</span> : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cisco Config Output */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-orange-500" />
            <span>Cisco BGP Configuration Generator</span>
          </h2>
          <button
            onClick={() => copyToClipboard(ciscoBgpConfig, 'bgp')}
            className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1"
          >
            {copiedKey === 'bgp' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy Config</span>
          </button>
        </div>
        <pre className="p-4 bg-slate-950 text-orange-300 font-mono text-xs rounded-lg border border-slate-800 select-all">
          {ciscoBgpConfig}
        </pre>
      </div>
    </div>
  );
};
