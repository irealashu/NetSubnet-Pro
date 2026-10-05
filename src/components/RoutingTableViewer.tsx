import React, { useState, useMemo } from 'react';
import { ipToInt, calculateSubnet } from '../utils/ipv4';
import { Route, Search, Plus, Trash2, CheckCircle2, ArrowRight, Shield, Layers, HelpCircle } from 'lucide-react';

export interface RouteEntry {
  id: string;
  prefix: string; // e.g. 10.0.0.0/8
  nextHop: string;
  interface: string;
  metric: number;
  adminDistance: number;
  protocol: 'Connected' | 'Static' | 'OSPF' | 'BGP' | 'EIGRP' | 'Default';
}

export const RoutingTableViewer: React.FC = () => {
  const [routes, setRoutes] = useState<RouteEntry[]>([
    { id: '1', prefix: '0.0.0.0/0', nextHop: '198.51.100.1', interface: 'GigabitEthernet0/0/0', metric: 1, adminDistance: 1, protocol: 'Default' },
    { id: '2', prefix: '10.0.0.0/8', nextHop: '10.254.0.1', interface: 'GigabitEthernet0/0/1', metric: 20, adminDistance: 110, protocol: 'OSPF' },
    { id: '3', prefix: '10.50.0.0/16', nextHop: '10.254.0.5', interface: 'GigabitEthernet0/0/2', metric: 10, adminDistance: 110, protocol: 'OSPF' },
    { id: '4', prefix: '10.50.10.0/24', nextHop: '10.254.10.1', interface: 'GigabitEthernet0/0/3', metric: 5, adminDistance: 90, protocol: 'EIGRP' },
    { id: '5', prefix: '10.50.10.45/32', nextHop: 'Directly Connected', interface: 'Loopback0', metric: 0, adminDistance: 0, protocol: 'Connected' },
    { id: '6', prefix: '172.16.0.0/12', nextHop: '192.0.2.2', interface: 'TenGigabitEthernet0/1/0', metric: 0, adminDistance: 20, protocol: 'BGP' },
    { id: '7', prefix: '192.168.1.0/24', nextHop: 'Directly Connected', interface: 'Vlan10', metric: 0, adminDistance: 0, protocol: 'Connected' }
  ]);

  const [testIp, setTestIp] = useState('10.50.10.45');
  const [newPrefix, setNewPrefix] = useState('');
  const [newNextHop, setNewNextHop] = useState('');
  const [newInterface, setNewInterface] = useState('GigabitEthernet0/0/1');

  // Longest Prefix Match (LPM) Routing Engine
  const lpmResult = useMemo(() => {
    try {
      const targetInt = ipToInt(testIp.trim());
      const matches: { route: RouteEntry; cidr: number; reason: string }[] = [];

      for (const r of routes) {
        const [netStr, cidrStr] = r.prefix.split('/');
        const cidr = parseInt(cidrStr || '32', 10);
        const sub = calculateSubnet(netStr, cidr);
        const netInt = ipToInt(sub.networkAddress);
        const maskInt = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;

        if ((targetInt & maskInt) === (netInt & maskInt)) {
          matches.push({
            route: r,
            cidr,
            reason: `Matches /${cidr} subnet [${sub.networkAddress} - ${sub.broadcastAddress}]`
          });
        }
      }

      // Sort by longest CIDR prefix descending, then Administrative Distance ascending, then metric ascending
      matches.sort((a, b) => {
        if (b.cidr !== a.cidr) return b.cidr - a.cidr;
        if (a.route.adminDistance !== b.route.adminDistance) return a.route.adminDistance - b.route.adminDistance;
        return a.route.metric - b.route.metric;
      });

      const winner = matches[0] || null;

      return {
        winner,
        candidateMatches: matches,
        error: null
      };
    } catch (err: any) {
      return { winner: null, candidateMatches: [], error: err.message || 'Invalid target IP format' };
    }
  }, [routes, testIp]);

  const addRoute = () => {
    if (!newPrefix.includes('/')) return;
    const newEntry: RouteEntry = {
      id: Math.random().toString(36).substring(2, 9),
      prefix: newPrefix.trim(),
      nextHop: newNextHop.trim() || 'Directly Connected',
      interface: newInterface,
      metric: 10,
      adminDistance: 1,
      protocol: 'Static'
    };
    setRoutes(prev => [...prev, newEntry]);
    setNewPrefix('');
    setNewNextHop('');
  };

  const removeRoute = (id: string) => {
    setRoutes(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Route className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Routing Table & Longest Prefix Match (LPM) Engine</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Interactive FIB/RIB routing lookup engine testing target IPs against prefix length, Administrative Distance (AD), and metric.
            </p>
          </div>
        </div>

        {/* Target IP Lookup Bar */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Destination IP to Route (FIB Lookup)
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={testIp}
              onChange={(e) => setTestIp(e.target.value)}
              placeholder="e.g. 10.50.10.45"
              className="flex-1 font-mono text-sm px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white focus:ring-2 focus:ring-blue-500 font-bold"
            />
          </div>
        </div>
      </div>

      {/* LPM Decision Banner */}
      {lpmResult.winner ? (
        <div className="p-5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border-2 border-emerald-500 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-sm text-emerald-950 dark:text-emerald-200">
                FIB Best Route Forwarding Match Selected!
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
              Matched Prefix: {lpmResult.winner.route.prefix}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800">
              <span className="text-slate-400">Next Hop:</span>
              <div className="font-bold text-slate-900 dark:text-white truncate">{lpmResult.winner.route.nextHop}</div>
            </div>
            <div className="p-2.5 rounded bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800">
              <span className="text-slate-400">Egress Interface:</span>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 truncate">{lpmResult.winner.route.interface}</div>
            </div>
            <div className="p-2.5 rounded bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800">
              <span className="text-slate-400">Admin Distance:</span>
              <div className="font-bold text-slate-900 dark:text-white">{lpmResult.winner.route.adminDistance} ({lpmResult.winner.route.protocol})</div>
            </div>
            <div className="p-2.5 rounded bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800">
              <span className="text-slate-400">Prefix Match Length:</span>
              <div className="font-bold text-slate-900 dark:text-white">/{lpmResult.winner.cidr} (Longest Match)</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
          No matching route in routing table! Packet would be dropped with ICMP Destination Net Unreachable.
        </div>
      )}

      {/* Full Routing Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <Layers className="h-4 w-4 text-blue-500" />
            <span>IP Routing Information Base (RIB Table - {routes.length} Routes)</span>
          </h2>
        </div>

        {/* Add route inline */}
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
          <input
            type="text"
            placeholder="Prefix (e.g. 192.168.100.0/24)"
            value={newPrefix}
            onChange={(e) => setNewPrefix(e.target.value)}
            className="flex-1 min-w-[160px] font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded dark:text-white"
          />
          <input
            type="text"
            placeholder="Next-Hop IP"
            value={newNextHop}
            onChange={(e) => setNewNextHop(e.target.value)}
            className="flex-1 min-w-[140px] font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded dark:text-white"
          />
          <input
            type="text"
            placeholder="Interface"
            value={newInterface}
            onChange={(e) => setNewInterface(e.target.value)}
            className="w-40 font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded dark:text-white"
          />
          <button
            onClick={addRoute}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Route</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-2.5">Protocol</th>
                <th className="p-2.5">Network Prefix</th>
                <th className="p-2.5">Next Hop</th>
                <th className="p-2.5">Egress Interface</th>
                <th className="p-2.5 text-center">AD / Metric</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {routes.map((r) => {
                const isWinner = lpmResult.winner?.route.id === r.id;
                const isCandidate = lpmResult.candidateMatches.some(m => m.route.id === r.id);

                return (
                  <tr
                    key={r.id}
                    className={`transition-colors ${
                      isWinner
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                        : isCandidate
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 text-slate-800 dark:text-slate-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {r.protocol}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold">{r.prefix}</td>
                    <td className="p-2.5">{r.nextHop}</td>
                    <td className="p-2.5">{r.interface}</td>
                    <td className="p-2.5 text-center">[{r.adminDistance}/{r.metric}]</td>
                    <td className="p-2.5 text-center">
                      {isWinner ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-bold">
                          BEST ROUTE
                        </span>
                      ) : isCandidate ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                          Candidate
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">-</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => removeRoute(r.id)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
