import React, { useState, useMemo } from 'react';
import { buildSpfRecord, SpfConfig } from '../utils/dnsSpfDmarc';
import { MailCheck, Copy, Check, Plus, Trash2, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const SpfGenerator: React.FC = () => {
  const [domain, setDomain] = useState('example.com');
  const [allowA, setAllowA] = useState(true);
  const [allowMx, setAllowMx] = useState(true);
  const [allowPtr, setAllowPtr] = useState(false);
  const [ip4List, setIp4List] = useState<string[]>(['198.51.100.1', '203.0.113.0/24']);
  const [ip6List, setIp6List] = useState<string[]>(['2001:db8::/32']);
  const [includes, setIncludes] = useState<string[]>(['_spf.google.com', 'mailgun.org']);
  const [qualifier, setQualifier] = useState<'-all' | '~all' | '?all' | '+all'>('~all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const newIp4Input = '';
  const [ip4Input, setIp4Input] = useState('');
  const [includeInput, setIncludeInput] = useState('');

  const config: SpfConfig = {
    domain,
    allowA,
    allowMx,
    allowPtr,
    ip4Addresses: ip4List,
    ip6Addresses: ip6List,
    includes,
    qualifier
  };

  const { record, dnsLookupCount, warnings } = useMemo(() => {
    return buildSpfRecord(config);
  }, [config]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const addIp4 = () => {
    if (ip4Input.trim()) {
      setIp4List(prev => [...prev, ip4Input.trim()]);
      setIp4Input('');
    }
  };

  const addInclude = () => {
    if (includeInput.trim()) {
      setIncludes(prev => [...prev, includeInput.trim()]);
      setIncludeInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <MailCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">SPF Record Generator & RFC 7208 Validator</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Build Sender Policy Framework (SPF) DNS TXT records with mechanism controls and 10-lookup validation.
            </p>
          </div>
        </div>

        {/* Generated SPF Preview Banner */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>DNS TXT Record for {domain || 'domain.com'}</span>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                dnsLookupCount > 10 ? 'bg-rose-900/60 text-rose-300' : 'bg-emerald-900/60 text-emerald-300'
              }`}>
                {dnsLookupCount} / 10 DNS Lookups
              </span>
              <button
                onClick={() => copyToClipboard(record, 'spf')}
                className="text-amber-400 hover:text-amber-300 flex items-center space-x-1"
              >
                {copiedKey === 'spf' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copy</span>
              </button>
            </div>
          </div>
          <div className="font-mono text-sm text-amber-400 font-bold break-all select-all">
            {record}
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="mt-4 space-y-2">
            {warnings.map((w, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mechanism Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Settings & Qualifiers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Basic Mechanisms & Default Policy
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Domain Name
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="w-full font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowA}
                  onChange={(e) => setAllowA(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Allow domain's A record IP addresses (<code className="font-mono">a</code>)
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowMx}
                  onChange={(e) => setAllowMx(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Allow inbound MX mail servers to send email (<code className="font-mono">mx</code>)
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowPtr}
                  onChange={(e) => setAllowPtr(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Allow reverse DNS PTR lookup (<code className="font-mono">ptr</code> - discouraged)
                </span>
              </label>
            </div>

            {/* Qualifier Selector */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Default Enforcement Qualifier (Catch-All)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { q: '~all', title: 'SoftFail (~all)', desc: 'Recommended. Marks failing emails with header, delivery accepted.' },
                  { q: '-all', title: 'HardFail (-all)', desc: 'Strict. Rejects unauthenticated emails outright.' },
                  { q: '?all', title: 'Neutral (?all)', desc: 'No explicit policy statement.' },
                  { q: '+all', title: 'Pass (+all)', desc: 'Danger! Allows any server on internet to send on your behalf.' }
                ].map((item) => (
                  <button
                    key={item.q}
                    type="button"
                    onClick={() => setQualifier(item.q as any)}
                    className={`p-2.5 rounded-lg text-left border transition-all ${
                      qualifier === item.q
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono">{item.title}</div>
                    <div className="text-[10px] mt-0.5 opacity-80">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* IP Addresses & 3rd Party Includes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Authorized IP Ranges & Email Services
          </h2>

          {/* IPv4 entries */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Authorized IPv4 Ranges (ip4:)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ip4Input}
                onChange={(e) => setIp4Input(e.target.value)}
                placeholder="198.51.100.1 or 203.0.113.0/24"
                className="flex-1 font-mono text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
              />
              <button
                onClick={addIp4}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-white dark:bg-slate-700 text-xs font-semibold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ip4List.map((ip, i) => (
                <span key={i} className="inline-flex items-center space-x-1 font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  <span>ip4:{ip}</span>
                  <button onClick={() => setIp4List(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-rose-500">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 3rd Party Includes */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Third-Party Vendor Includes (include:)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={includeInput}
                onChange={(e) => setIncludeInput(e.target.value)}
                placeholder="_spf.google.com, sendgrid.net, mailgun.org"
                className="flex-1 font-mono text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
              />
              <button
                onClick={addInclude}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-white dark:bg-slate-700 text-xs font-semibold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {includes.map((inc, i) => (
                <span key={i} className="inline-flex items-center space-x-1 font-mono text-xs px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <span>include:{inc}</span>
                  <button onClick={() => setIncludes(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-rose-500">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
