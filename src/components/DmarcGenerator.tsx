import React, { useState, useMemo } from 'react';
import { buildDmarcRecord, DmarcConfig } from '../utils/dnsSpfDmarc';
import { ShieldCheck, Copy, Check, Info, ShieldAlert, AlertCircle, HelpCircle } from 'lucide-react';

export const DmarcGenerator: React.FC = () => {
  const [domain, setDomain] = useState('example.com');
  const [policy, setPolicy] = useState<'none' | 'quarantine' | 'reject'>('quarantine');
  const [subdomainPolicy, setSubdomainPolicy] = useState<'none' | 'quarantine' | 'reject'>('reject');
  const [ruaEmail, setRuaEmail] = useState('dmarc-rua@example.com');
  const [rufEmail, setRufEmail] = useState('dmarc-ruf@example.com');
  const [percentage, setPercentage] = useState(100);
  const [dkimAlignment, setDkimAlignment] = useState<'r' | 's'>('r');
  const [spfAlignment, setSpfAlignment] = useState<'r' | 's'>('r');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const config: DmarcConfig = {
    domain,
    policy,
    subdomainPolicy,
    aggregateEmails: ruaEmail ? [ruaEmail] : [],
    forensicEmails: rufEmail ? [rufEmail] : [],
    percentage,
    dkimAlignment,
    spfAlignment,
    reportInterval: 86400
  };

  const { record, explanation } = useMemo(() => {
    return buildDmarcRecord(config);
  }, [config]);

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
          <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">DMARC Record Generator & Alignment Builder</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Generate Domain-based Message Authentication, Reporting, and Conformance (RFC 7489) TXT policies with RUA/RUF reporting.
            </p>
          </div>
        </div>

        {/* Live DMARC Record Preview */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>DNS TXT Host: <strong className="text-white">_dmarc.{domain || 'example.com'}</strong></span>
            <button
              onClick={() => copyToClipboard(record, 'dmarc')}
              className="text-red-400 hover:text-red-300 flex items-center space-x-1"
            >
              {copiedKey === 'dmarc' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copy TXT Value</span>
            </button>
          </div>
          <div className="font-mono text-sm text-red-400 font-bold break-all select-all">
            {record}
          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Policies */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Enforcement & Subdomain Policies
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Primary Domain Policy (p=)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { p: 'none', label: 'p=none', desc: 'Monitoring only' },
                  { p: 'quarantine', label: 'p=quarantine', desc: 'Send to Spam' },
                  { p: 'reject', label: 'p=reject', desc: 'Block outright' }
                ].map((item) => (
                  <button
                    key={item.p}
                    onClick={() => setPolicy(item.p as any)}
                    className={`p-2.5 rounded-lg text-left border transition-all ${
                      policy === item.p
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-mono">{item.label}</div>
                    <div className="text-[10px] opacity-75">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Subdomain Policy (sp=)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['none', 'quarantine', 'reject'] as const).map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setSubdomainPolicy(sp)}
                    className={`p-2 rounded text-center border font-mono text-xs ${
                      subdomainPolicy === sp
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-800 dark:text-red-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    sp={sp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Policy Application Percentage: {percentage}%
                </label>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(parseInt(e.target.value, 10))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Reporting & Alignments */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Reporting Mailboxes & DKIM/SPF Alignment
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Aggregate Feedback Reports URI (rua=)
              </label>
              <input
                type="text"
                value={ruaEmail}
                onChange={(e) => setRuaEmail(e.target.value)}
                placeholder="dmarc-reports@example.com"
                className="w-full font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Forensic / Failure Incident Reports URI (ruf=)
              </label>
              <input
                type="text"
                value={rufEmail}
                onChange={(e) => setRufEmail(e.target.value)}
                placeholder="dmarc-forensics@example.com"
                className="w-full font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  DKIM Alignment (adkim)
                </label>
                <select
                  value={dkimAlignment}
                  onChange={(e) => setDkimAlignment(e.target.value as any)}
                  className="w-full font-mono text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
                >
                  <option value="r">r (Relaxed - Subdomains match)</option>
                  <option value="s">s (Strict - Exact domain only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  SPF Alignment (aspf)
                </label>
                <select
                  value={spfAlignment}
                  onChange={(e) => setSpfAlignment(e.target.value as any)}
                  className="w-full font-mono text-xs px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
                >
                  <option value="r">r (Relaxed - Subdomains match)</option>
                  <option value="s">s (Strict - Exact domain only)</option>
                </select>
              </div>
            </div>

            {/* Explanation card */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Info className="h-3.5 w-3.5 text-blue-500" />
                <span>Policy Execution Breakdown</span>
              </div>
              <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
                {explanation.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
