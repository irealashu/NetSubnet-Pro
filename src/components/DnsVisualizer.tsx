import React, { useState } from 'react';
import { Globe, ArrowRight, Server, Laptop, RotateCcw, CheckCircle2, ShieldCheck, Layers } from 'lucide-react';

export interface DnsResolutionStep {
  step: number;
  actor: string;
  target: string;
  action: string;
  query: string;
  response: string;
  isCached: boolean;
  ttl: number;
}

export const DnsVisualizer: React.FC = () => {
  const [domain, setDomain] = useState('app.github.com');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const steps: DnsResolutionStep[] = [
    {
      step: 1,
      actor: 'Client Stub Resolver (Browser / OS)',
      target: 'Local Recursive Resolver (8.8.8.8)',
      action: 'Check local OS hosts file and browser cache. Cache miss! Send Recursive Query for A record.',
      query: 'Standard query: A app.github.com',
      response: 'Pending recursive resolution...',
      isCached: false,
      ttl: 0
    },
    {
      step: 2,
      actor: 'Recursive Resolver (ISP / 8.8.8.8)',
      target: 'Root Name Server (a.root-servers.net.)',
      action: 'Recursive resolver queries Root Hints for Top-Level Domain (TLD) ".com".',
      query: 'Iterative query: Who is authoritative for .com?',
      response: 'Referral to .com TLD Name Server (a.gtld-servers.net)',
      isCached: false,
      ttl: 172800
    },
    {
      step: 3,
      actor: 'Recursive Resolver',
      target: '.com TLD Name Server (a.gtld-servers.net)',
      action: 'Resolver queries .com registry for "github.com" authoritative NS records.',
      query: 'Iterative query: Who hosts github.com?',
      response: 'Delegation to Authoritative NS: ns-128.awsdns-16.com',
      isCached: false,
      ttl: 86400
    },
    {
      step: 4,
      actor: 'Recursive Resolver',
      target: 'Authoritative Name Server (ns-128.awsdns-16.com)',
      action: 'Resolver asks authoritative name server for exact "app.github.com" record.',
      query: 'Query: What is the IP for app.github.com?',
      response: 'ANSWER: CNAME github.com -> A 140.82.121.4',
      isCached: false,
      ttl: 300
    },
    {
      step: 5,
      actor: 'Recursive Resolver',
      target: 'Client Browser (192.168.1.100)',
      action: 'Recursive resolver caches answer for 300s (TTL) and returns IP address to client.',
      query: 'Resolution complete',
      response: 'A 140.82.121.4 (Resolved in 28ms)',
      isCached: true,
      ttl: 300
    }
  ];

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
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">DNS Resolution Flow & Hierarchy Visualizer</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Simulate iterative and recursive DNS resolution from Root Name Servers (.) to TLDs (.com) to Authoritative Nameservers.
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
              <span>Next Step ({currentStepIdx + 1}/{steps.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="mt-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
            Target FQDN Domain Name
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full max-w-md font-mono text-sm px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
          />
        </div>
      </div>

      {/* 4-Node Visual Hierarchy Diagram */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Hierarchical Domain Name Tree Resolution
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center space-y-2">
            <div className="h-9 w-9 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Laptop className="h-4 w-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">1. Client / OS</div>
            <div className="text-[11px] text-slate-500">Stub Resolver Cache</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center space-y-2">
            <div className="h-9 w-9 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Server className="h-4 w-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">2. Recursive DNS</div>
            <div className="text-[11px] text-slate-500">8.8.8.8 / 1.1.1.1</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center space-y-2">
            <div className="h-9 w-9 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Globe className="h-4 w-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">3. Root & TLD (.) (.com)</div>
            <div className="text-[11px] text-slate-500">13 Root Server Clusters</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center space-y-2">
            <div className="h-9 w-9 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">4. Authoritative NS</div>
            <div className="text-[11px] text-slate-500">Zone Master Records</div>
          </div>
        </div>
      </div>

      {/* Step details */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Resolution Trace Log
        </h2>

        <div className="space-y-3">
          {steps.map((s, idx) => (
            <div
              key={s.step}
              onClick={() => setCurrentStepIdx(idx)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                idx === currentStepIdx
                  ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-70'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900 dark:text-white">
                  Step {s.step}: {s.actor} → {s.target}
                </span>
                {s.ttl > 0 && (
                  <span className="font-mono text-slate-500">TTL: {s.ttl}s</span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{s.action}</p>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-slate-950 text-sky-400 border border-slate-800">
                  <span className="text-slate-500">Query:</span> {s.query}
                </div>
                <div className="p-2 rounded bg-slate-950 text-emerald-400 border border-slate-800">
                  <span className="text-slate-500">Reply:</span> {s.response}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
