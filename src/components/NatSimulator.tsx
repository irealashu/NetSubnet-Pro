import React, { useState } from 'react';
import { Network, ArrowRight, ArrowLeft, Play, RotateCcw, Server, Laptop, Globe, Table, ShieldCheck, Activity, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export interface NatSession {
  id: string;
  protocol: 'TCP' | 'UDP';
  insideLocal: string;     // 192.168.1.100:54321
  insideGlobal: string;    // 203.0.113.5:10001
  outsideLocal: string;    // 142.250.190.46:443
  outsideGlobal: string;   // 142.250.190.46:443
  state: string;
}

export const NatSimulator: React.FC = () => {
  const [natMode, setNatMode] = useState<'PAT' | 'SNAT' | 'DNAT'>('PAT');
  const [publicGatewayIp, setPublicGatewayIp] = useState('203.0.113.5');
  const [clientIp, setClientIp] = useState('192.168.1.100');
  const [clientPort, setClientPort] = useState(54321);
  const [targetServerIp, setTargetServerIp] = useState('142.250.190.46');
  const [targetServerPort, setTargetServerPort] = useState(443);
  const [selectedProto, setSelectedProto] = useState<'TCP' | 'UDP'>('TCP');

  // Interactive NAT Sessions Table
  const [natTable, setNatTable] = useState<NatSession[]>([
    {
      id: '1',
      protocol: 'TCP',
      insideLocal: '192.168.1.100:54321',
      insideGlobal: '203.0.113.5:10001',
      outsideLocal: '142.250.190.46:443',
      outsideGlobal: '142.250.190.46:443',
      state: 'ESTABLISHED'
    },
    {
      id: '2',
      protocol: 'TCP',
      insideLocal: '192.168.1.105:61200',
      insideGlobal: '203.0.113.5:10002',
      outsideLocal: '104.21.58.210:443',
      outsideGlobal: '104.21.58.210:443',
      state: 'ESTABLISHED'
    }
  ]);

  const [activePacketFlow, setActivePacketFlow] = useState<{
    direction: 'outbound' | 'inbound';
    step: 1 | 2 | 3;
    srcBefore: string;
    dstBefore: string;
    srcAfter: string;
    dstAfter: string;
  } | null>(null);

  const simulateOutbound = () => {
    // Check if session exists or allocate new PAT port
    const inLocalStr = `${clientIp}:${clientPort}`;
    let existing = natTable.find(s => s.insideLocal === inLocalStr && s.protocol === selectedProto);

    let allocatedPort = 10001;
    if (!existing) {
      allocatedPort = 10000 + natTable.length + 1;
      const newSession: NatSession = {
        id: Math.random().toString(36).substring(2, 9),
        protocol: selectedProto,
        insideLocal: inLocalStr,
        insideGlobal: `${publicGatewayIp}:${allocatedPort}`,
        outsideLocal: `${targetServerIp}:${targetServerPort}`,
        outsideGlobal: `${targetServerIp}:${targetServerPort}`,
        state: 'ESTABLISHED'
      };
      setNatTable(prev => [newSession, ...prev]);
    } else {
      allocatedPort = parseInt(existing.insideGlobal.split(':')[1], 10);
    }

    setActivePacketFlow({
      direction: 'outbound',
      step: 2,
      srcBefore: `${clientIp}:${clientPort}`,
      dstBefore: `${targetServerIp}:${targetServerPort}`,
      srcAfter: `${publicGatewayIp}:${allocatedPort}`,
      dstAfter: `${targetServerIp}:${targetServerPort}`
    });
  };

  const simulateInbound = () => {
    if (natTable.length === 0) return;
    const session = natTable[0];
    setActivePacketFlow({
      direction: 'inbound',
      step: 2,
      srcBefore: session.outsideGlobal,
      dstBefore: session.insideGlobal,
      srcAfter: session.outsideLocal,
      dstAfter: session.insideLocal
    });
  };

  const removeSession = (id: string) => {
    setNatTable(prev => prev.filter(s => s.id !== id));
  };

  const clearAllSessions = () => {
    setNatTable([]);
    setActivePacketFlow(null);
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

        {/* Configuration Grid */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Private Client IP & Port (Inside Local)
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                value={clientIp}
                onChange={(e) => setClientIp(e.target.value)}
                className="w-2/3 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono text-xs dark:text-white"
              />
              <input
                type="number"
                value={clientPort}
                onChange={(e) => setClientPort(parseInt(e.target.value, 10) || 54321)}
                className="w-1/3 px-1 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono text-xs dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Gateway Public IP (Inside Global)
            </label>
            <input
              type="text"
              value={publicGatewayIp}
              onChange={(e) => setPublicGatewayIp(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono text-xs dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Target Remote Server (Outside Global)
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                value={targetServerIp}
                onChange={(e) => setTargetServerIp(e.target.value)}
                className="w-2/3 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono text-xs dark:text-white"
              />
              <input
                type="number"
                value={targetServerPort}
                onChange={(e) => setTargetServerPort(parseInt(e.target.value, 10) || 443)}
                className="w-1/3 px-1 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono text-xs dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={simulateOutbound}
              className="flex-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center justify-center space-x-1"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Send Outbound</span>
            </button>
            <button
              onClick={simulateInbound}
              disabled={natTable.length === 0}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1 disabled:opacity-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Send Inbound</span>
            </button>
          </div>
        </div>
      </div>

      {/* Packet Translation Animation Bar */}
      {activePacketFlow && (
        <div className="bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-900/50 rounded-xl p-5 shadow-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="h-4 w-4 animate-pulse" />
              <span>Active {activePacketFlow.direction.toUpperCase()} Packet Header Translation</span>
            </span>
            <button
              onClick={() => setActivePacketFlow(null)}
              className="text-[11px] text-slate-400 hover:text-slate-600"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Before NAT (Pre-Routing / LAN Interface)
              </span>
              <div>Source IP:Port: <span className="font-bold text-indigo-600 dark:text-indigo-400">{activePacketFlow.srcBefore}</span></div>
              <div>Destination IP:Port: <span className="font-bold text-slate-700 dark:text-slate-200">{activePacketFlow.dstBefore}</span></div>
            </div>

            <div className="p-3 bg-orange-50 dark:bg-orange-950/40 rounded-lg border border-orange-200 dark:border-orange-900/60">
              <span className="text-[10px] text-orange-600 dark:text-orange-400 uppercase font-bold block mb-1">
                After NAT Translation (Post-Routing / WAN Interface)
              </span>
              <div>Source IP:Port: <span className="font-bold text-orange-600 dark:text-orange-400">{activePacketFlow.srcAfter}</span></div>
              <div>Destination IP:Port: <span className="font-bold text-slate-700 dark:text-slate-200">{activePacketFlow.dstAfter}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Active NAT Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Table className="h-4 w-4 text-orange-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Hardware NAT / PAT State Translation Table ({natTable.length} Sessions)
            </h2>
          </div>
          {natTable.length > 0 && (
            <button
              onClick={clearAllSessions}
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
            >
              Clear All Sessions
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Proto</th>
                <th className="py-2.5 px-3">Inside Local (Private Host)</th>
                <th className="py-2.5 px-3">Inside Global (Public PAT)</th>
                <th className="py-2.5 px-3">Outside Local</th>
                <th className="py-2.5 px-3">Outside Global (Target)</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {natTable.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-orange-600 dark:text-orange-400">{s.protocol}</td>
                  <td className="py-2.5 px-3 text-slate-900 dark:text-white font-semibold">{s.insideLocal}</td>
                  <td className="py-2.5 px-3 text-orange-600 dark:text-orange-400 font-bold">{s.insideGlobal}</td>
                  <td className="py-2.5 px-3 text-slate-500">{s.outsideLocal}</td>
                  <td className="py-2.5 px-3 text-slate-500">{s.outsideGlobal}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      {s.state}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => removeSession(s.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete session"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
