import React, { useState } from 'react';
import { Network, ArrowRight, Play, RotateCcw, Server, Laptop, Globe, Table, ShieldCheck, Activity } from 'lucide-react';

export interface NatSession {
  id: string;
  protocol: 'TCP' | 'UDP';
  insideLocal: string;     // 192.168.1.50:52410
  insideGlobal: string;    // 203.0.113.5:10254
  outsideLocal: string;    // 142.250.190.46:443
  outsideGlobal: string;   // 142.250.190.46:443
  timeoutSeconds: number;
}

export const NatSimulator: React.FC = () => {
  const [natMode, setNatMode] = useState<'PAT' | 'SNAT' | 'DNAT'>('PAT');
  const [publicGatewayIp, setPublicGatewayIp] = useState('203.0.113.5');
  const [clientIp, setClientIp] = useState('192.168.1.100');
  const [clientPort, setClientPort] = useState(54321);
  const [targetServerIp, setTargetServerIp] = useState('142.250.190.46');
  const [targetServerPort, setTargetServerPort] = useState(443);

  // Interactive NAT Sessions Table
  const [natTable, setNatTable] = useState<NatSession[]>([
    {
      id: '1',
      protocol: 'TCP',
      insideLocal: '192.168.1.100:54321',
      insideGlobal: '203.0.113.5:10001',
      outsideLocal: '142.250.190.46:443',
      outsideGlobal: '142.250.190.46:443',
      timeoutSeconds: 86400
    },
    {
      id: '2',
      protocol: 'TCP',
      insideLocal: '192.168.1.105:61200',
      insideGlobal: '203.0.113.5:10002',
      outsideLocal: '104.21.58.210:443',
      outsideGlobal: '104.21.58.210:443',
      timeoutSeconds: 86400
    }
  ]);

  const [simStep, setSimStep] = useState<number>(0);

  const triggerPacket = () => {
    setSimStep(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <Network className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">NAT & Port Address Translation (PAT) Simulator</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Simulate RFC 3022 NAT translations, dynamic PAT overload tables, and bi-directional packet header rewrites.
              </p>
            </div>
          </div>

          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-950">
            {(['PAT', 'SNAT', 'DNAT'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setNatMode(m)}
                className={`px-3 py-1.5 text-xs font-bold font-mono rounded ${
                  natMode === m
                    ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                {m === 'PAT' ? 'PAT / Overload' : m === 'SNAT' ? 'Static 1:1 NAT' : 'Port Forwarding (DNAT)'}
              </button>
            ))}
          </div>
        </div>

        {/* Input Configuration */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Private Client IP & Port (Inside Local)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={clientIp}
                onChange={(e) => setClientIp(e.target.value)}
                className="flex-1 font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white"
              />
              <input
                type="number"
                value={clientPort}
                onChange={(e) => setClientPort(parseInt(e.target.value, 10) || 54321)}
                className="w-20 font-mono text-xs px-2 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Public NAT Gateway IP (Inside Global)
            </label>
            <input
              type="text"
              value={publicGatewayIp}
              onChange={(e) => setPublicGatewayIp(e.target.value)}
              className="w-full font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white font-bold text-orange-600 dark:text-orange-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Public Web Server (Outside Global)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={targetServerIp}
                onChange={(e) => setTargetServerIp(e.target.value)}
                className="flex-1 font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white"
              />
              <input
                type="number"
                value={targetServerPort}
                onChange={(e) => setTargetServerPort(parseInt(e.target.value, 10) || 443)}
                className="w-20 font-mono text-xs px-2 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Network Diagram Visualizer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Packet Traversal & Translation Stages
        </h2>

        {/* 3-Tier Visual Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Node 1: Private LAN Client */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2 text-center">
            <div className="h-10 w-10 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Laptop className="h-5 w-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">Private Host (LAN)</div>
            <div className="font-mono text-xs text-slate-600 dark:text-slate-400">{clientIp}:{clientPort}</div>
            <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[11px] font-mono text-left">
              <div><strong>Src:</strong> {clientIp}:{clientPort}</div>
              <div><strong>Dst:</strong> {targetServerIp}:{targetServerPort}</div>
            </div>
          </div>

          {/* Node 2: NAT Gateway Router */}
          <div className="p-4 rounded-xl border-2 border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 space-y-2 text-center relative">
            <div className="h-10 w-10 mx-auto rounded-full bg-orange-500 text-white flex items-center justify-center shadow-sm">
              <Network className="h-5 w-5" />
            </div>
            <div className="font-bold text-xs text-orange-900 dark:text-orange-300">NAT Gateway Router</div>
            <div className="font-mono text-xs text-orange-800 dark:text-orange-200">Public IP: {publicGatewayIp}</div>
            <div className="p-2 rounded bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-800 text-[11px] font-mono text-left">
              <div className="text-orange-600 dark:text-orange-400 font-bold mb-0.5">Translation Rewrites:</div>
              <div><strong>Outbound:</strong> Src → {publicGatewayIp}:10001</div>
              <div><strong>Inbound:</strong> Dst → {clientIp}:{clientPort}</div>
            </div>
          </div>

          {/* Node 3: Internet Web Server */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2 text-center">
            <div className="h-10 w-10 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Server className="h-5 w-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">Destination Server (WAN)</div>
            <div className="font-mono text-xs text-slate-600 dark:text-slate-400">{targetServerIp}:{targetServerPort}</div>
            <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-[11px] font-mono text-left">
              <div><strong>Src:</strong> {publicGatewayIp}:10001</div>
              <div><strong>Dst:</strong> {targetServerIp}:{targetServerPort}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cisco / Linux NAT Translation Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <Table className="h-4 w-4 text-orange-500" />
            <span>Active NAT Translation Session Table (Cisco `show ip nat translations`)</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">{natTable.length} Sessions Active</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-2.5">Protocol</th>
                <th className="p-2.5">Inside Local</th>
                <th className="p-2.5">Inside Global</th>
                <th className="p-2.5">Outside Local</th>
                <th className="p-2.5">Outside Global</th>
                <th className="p-2.5 text-right">TTL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {natTable.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-2.5 font-bold text-orange-600 dark:text-orange-400">{s.protocol}</td>
                  <td className="p-2.5">{s.insideLocal}</td>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">{s.insideGlobal}</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-400">{s.outsideLocal}</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-400">{s.outsideGlobal}</td>
                  <td className="p-2.5 text-right text-slate-400">{s.timeoutSeconds}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
