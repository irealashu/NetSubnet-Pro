import React, { useState, useMemo } from 'react';
import { Globe, ArrowRight, Server, Laptop, RotateCcw, CheckCircle2, ShieldCheck, Layers, Play, Database, Search } from 'lucide-react';

export interface DnsResolutionStep {
  step: number;
  actor: string;
  target: string;
  action: string;
  query: string;
  response: string;
  isCached: boolean;
  ttl: number;
  type: 'recursive' | 'iterative' | 'cache' | 'authoritative';
}

export const DnsVisualizer: React.FC = () => {
  const [domainInput, setDomainInput] = useState('api.github.com');
  const [recordType, setRecordType] = useState<'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS'>('A');
  const [resolverIp, setResolverIp] = useState('8.8.8.8');
  const [simulateCacheHit, setSimulateCacheHit] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Parse domain parts
  const domainParts = useMemo(() => {
    const clean = domainInput.trim().toLowerCase().replace(/^\.+|\.+$/g, '');
    const tokens = clean.split('.');
    const tld = tokens.length > 1 ? tokens[tokens.length - 1] : 'com';
    const sld = tokens.length > 1 ? tokens[tokens.length - 2] : tokens[0];
    const apex = `${sld}.${tld}`;
    const host = tokens.slice(0, Math.max(1, tokens.length - 2)).join('.') || '@';
    return { clean, tld, apex, host };
  }, [domainInput]);

  // Dynamic step generator
  const steps: DnsResolutionStep[] = useMemo(() => {
    const { clean, tld, apex } = domainParts;

    if (simulateCacheHit) {
      return [
        {
          step: 1,
          actor: 'Client Stub Resolver (Browser / OS)',
          target: 'Local In-Memory Cache',
          action: `Local DNS cache lookup for ${clean} [${recordType}]. Cache HIT (Remaining TTL: 240s)!`,
          query: `Cache query: ${recordType} ${clean}`,
          response: recordType === 'A' ? 'A 140.82.121.4 (from local cache)' : `${recordType} target.${apex}`,
          isCached: true,
          ttl: 240,
          type: 'cache'
        }
      ];
    }

    const tldServer = `a.gtld-servers.net (.${tld})`;
    const authNs = `ns1.${apex}`;
    let finalAnswer = '140.82.121.4';
    if (recordType === 'AAAA') finalAnswer = '2606:4700::6810:84e5';
    if (recordType === 'MX') finalAnswer = `10 mail.${apex}`;
    if (recordType === 'TXT') finalAnswer = '"v=spf1 include:_spf.google.com ~all"';
    if (recordType === 'CNAME') finalAnswer = `lb.${apex}`;
    if (recordType === 'NS') finalAnswer = `${authNs}`;

    return [
      {
        step: 1,
        actor: 'Client Stub Resolver (192.168.1.100)',
        target: `Recursive Resolver (${resolverIp})`,
        action: `Check local hosts file & browser cache: MISS. Forward Recursive Query to configured DNS resolver ${resolverIp}.`,
        query: `Standard query: ${recordType} ${clean} (Recursive flag = 1)`,
        response: 'Pending iterative resolution across DNS hierarchy...',
        isCached: false,
        ttl: 0,
        type: 'recursive'
      },
      {
        step: 2,
        actor: `Recursive Resolver (${resolverIp})`,
        target: 'Root Name Server (a.root-servers.net.)',
        action: `Resolver queries Root Zone (.) hints for Top-Level Domain ".${tld}" delegation.`,
        query: `Iterative query: Who is authoritative for .${tld}?`,
        response: `Referral (Delegation) to .${tld} TLD Nameserver cluster (${tldServer})`,
        isCached: false,
        ttl: 172800,
        type: 'iterative'
      },
      {
        step: 3,
        actor: `Recursive Resolver (${resolverIp})`,
        target: `TLD Name Server (${tldServer})`,
        action: `Resolver queries .${tld} registry for "${apex}" authoritative nameservers.`,
        query: `Iterative query: Who is authoritative for ${apex}?`,
        response: `Delegation to Authoritative NS: ${authNs} (Glue record attached)`,
        isCached: false,
        ttl: 86400,
        type: 'iterative'
      },
      {
        step: 4,
        actor: `Recursive Resolver (${resolverIp})`,
        target: `Authoritative Name Server (${authNs})`,
        action: `Resolver queries zone authority for exact record: ${clean} [${recordType}].`,
        query: `Query: ${recordType} ${clean}?`,
        response: `ANSWER SECTION: ${clean} 300 IN ${recordType} ${finalAnswer} (Authoritative Answer AA=1)`,
        isCached: false,
        ttl: 300,
        type: 'authoritative'
      },
      {
        step: 5,
        actor: `Recursive Resolver (${resolverIp})`,
        target: 'Client Stub (192.168.1.100)',
        action: `Recursive resolver caches answer for 300 seconds and returns validated answer to client.`,
        query: `Resolution complete for ${clean}`,
        response: `${recordType} ${finalAnswer} (Resolved in 24 ms, TTL: 300s, DNSSEC: Validated)`,
        isCached: true,
        ttl: 300,
        type: 'cache'
      }
    ];
  }, [domainParts, recordType, resolverIp, simulateCacheHit]);

  const currentStep = steps[currentStepIdx] || steps[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">DNS Recursive & Iterative Resolution Visualizer</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Simulate Root (.) to TLD (.com) to Authoritative Name Server iterative queries with TTL cache mechanics.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentStepIdx(0)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 flex items-center space-x-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
            <button
              disabled={currentStepIdx === steps.length - 1}
              onClick={() => setCurrentStepIdx(prev => Math.min(steps.length - 1, prev + 1))}
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center space-x-1 disabled:opacity-50"
            >
              <span>Next Step</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Queried Domain / Hostname
            </label>
            <input
              type="text"
              value={domainInput}
              onChange={(e) => {
                setDomainInput(e.target.value);
                setCurrentStepIdx(0);
              }}
              placeholder="e.g. api.github.com"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg font-mono text-xs dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              DNS Record Type
            </label>
            <select
              value={recordType}
              onChange={(e) => {
                setRecordType(e.target.value as any);
                setCurrentStepIdx(0);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg font-mono text-xs dark:text-white"
            >
              <option value="A">A (IPv4 Address)</option>
              <option value="AAAA">AAAA (IPv6 Address)</option>
              <option value="CNAME">CNAME (Canonical Alias)</option>
              <option value="MX">MX (Mail Exchange)</option>
              <option value="TXT">TXT (SPF / Verification)</option>
              <option value="NS">NS (Name Servers)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Recursive Resolver
            </label>
            <select
              value={resolverIp}
              onChange={(e) => {
                setResolverIp(e.target.value);
                setCurrentStepIdx(0);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg font-mono text-xs dark:text-white"
            >
              <option value="8.8.8.8">8.8.8.8 (Google Public DNS)</option>
              <option value="1.1.1.1">1.1.1.1 (Cloudflare Fast DNS)</option>
              <option value="9.9.9.9">9.9.9.9 (Quad9 Security)</option>
              <option value="208.67.222.222">208.67.222.222 (Cisco OpenDNS)</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer pb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={simulateCacheHit}
                onChange={(e) => {
                  setSimulateCacheHit(e.target.checked);
                  setCurrentStepIdx(0);
                }}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <span>Simulate Local Cache Hit</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Hierarchy & Flow View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step List Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {steps.map((st, idx) => {
            const isActive = idx === currentStepIdx;
            const isPast = idx < currentStepIdx;

            return (
              <div
                key={st.step}
                onClick={() => setCurrentStepIdx(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 ring-2 ring-sky-500/20 shadow-sm'
                    : isPast
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-70'
                    : 'border-dashed border-slate-200 dark:border-slate-800 opacity-40 hover:opacity-80'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                      isActive ? 'bg-sky-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {st.step}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {st.actor} → {st.target}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    st.type === 'authoritative'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : st.type === 'cache'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                  }`}>
                    {st.type}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                  {st.action}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950 font-mono text-xs space-y-1 text-slate-700 dark:text-slate-300">
                  <div className="text-sky-600 dark:text-sky-400 font-semibold">↳ Query: {st.query}</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold">↳ Response: {st.response}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* DNS Server Hierarchy Map (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <Layers className="h-4 w-4 text-sky-500" />
            <span>DNS Tree Hierarchy</span>
          </h2>

          <div className="space-y-3 text-xs font-mono">
            {/* Root Layer */}
            <div className={`p-3 rounded-lg border transition-all ${
              currentStepIdx === 1
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 font-bold text-sky-900 dark:text-sky-200'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
            }`}>
              <div className="text-[10px] text-slate-400 font-sans uppercase font-bold">1. Root Zone Cluster</div>
              <div>. (13 Root Letter Clusters A-M)</div>
            </div>

            {/* TLD Layer */}
            <div className={`p-3 rounded-lg border transition-all ${
              currentStepIdx === 2
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 font-bold text-sky-900 dark:text-sky-200'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
            }`}>
              <div className="text-[10px] text-slate-400 font-sans uppercase font-bold">2. Top-Level Domain (TLD)</div>
              <div>.{domainParts.tld} Registry Servers</div>
            </div>

            {/* Authoritative Layer */}
            <div className={`p-3 rounded-lg border transition-all ${
              currentStepIdx === 3
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 font-bold text-sky-900 dark:text-sky-200'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
            }`}>
              <div className="text-[10px] text-slate-400 font-sans uppercase font-bold">3. Authoritative DNS Zone</div>
              <div>{domainParts.apex} (Zone NS)</div>
            </div>

            {/* Client Resolver */}
            <div className={`p-3 rounded-lg border transition-all ${
              currentStepIdx === 0 || currentStepIdx === 4
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-900 dark:text-emerald-200'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
            }`}>
              <div className="text-[10px] text-slate-400 font-sans uppercase font-bold">4. Recursive Resolver & Cache</div>
              <div>{resolverIp} (TTL: {currentStep.ttl}s)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
