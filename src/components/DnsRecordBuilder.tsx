import React, { useState } from 'react';
import { DnsRecord, generateZoneFile } from '../utils/dnsSpfDmarc';
import { Server, Plus, Trash2, Copy, Check, Download, Layers, ShieldCheck } from 'lucide-react';

export const DnsRecordBuilder: React.FC = () => {
  const [domain, setDomain] = useState('example.com');
  const [records, setRecords] = useState<DnsRecord[]>([
    { id: '1', type: 'A', name: '@', value: '198.51.100.45', ttl: 3600 },
    { id: '2', type: 'AAAA', name: '@', value: '2001:db8:85a3::8a2e:370:7334', ttl: 3600 },
    { id: '3', type: 'CNAME', name: 'www', value: 'example.com', ttl: 3600 },
    { id: '4', type: 'MX', name: '@', value: 'mail.example.com', priority: 10, ttl: 3600 },
    { id: '5', type: 'TXT', name: '@', value: 'v=spf1 include:_spf.google.com ~all', ttl: 3600 },
    { id: '6', type: 'CAA', name: '@', value: 'letsencrypt.org', flags: 0, tag: 'issue', ttl: 3600 },
    { id: '7', type: 'SRV', name: '_sip._tcp', value: 'sipserver.example.com', priority: 10, weight: 60, port: 5060, ttl: 3600 }
  ]);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const addRecord = (type: DnsRecord['type']) => {
    const newRec: DnsRecord = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      name: '@',
      value: type === 'A' ? '1.1.1.1' : type === 'AAAA' ? '2606:4700::1' : type === 'MX' ? 'mx.domain.com' : 'target.com',
      ttl: 3600,
      priority: type === 'MX' || type === 'SRV' ? 10 : undefined,
      weight: type === 'SRV' ? 10 : undefined,
      port: type === 'SRV' ? 443 : undefined,
      tag: type === 'CAA' ? 'issue' : undefined
    };
    setRecords(prev => [...prev, newRec]);
  };

  const removeRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const updateRecord = (id: string, updates: Partial<DnsRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const zoneOutput = generateZoneFile(domain, records);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadZoneFile = () => {
    const blob = new Blob([zoneOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `db.${domain || 'example.com'}.zone`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">DNS Zone Record Builder & RFC Formatter</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Generate RFC 1035 compliant BIND zone files, A/AAAA, MX, CAA, SRV, CNAME, and TXT records.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={downloadZoneFile}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Zone File</span>
            </button>
          </div>
        </div>

        {/* Domain Name Bar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Root Domain Name ($ORIGIN)
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full font-mono text-sm px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="sm:self-end">
            <div className="flex flex-wrap gap-1.5">
              {(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'CAA', 'NS'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => addRecord(t)}
                  className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-600 dark:bg-slate-800 dark:hover:bg-sky-950/60 dark:hover:text-sky-400 text-slate-700 dark:text-slate-300 text-xs font-bold font-mono transition-colors flex items-center space-x-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>+{t}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Pane View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Record Editor Table */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <Layers className="h-4 w-4 text-sky-500" />
            <span>Configured DNS Records ({records.length})</span>
          </h2>

          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {records.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                    {r.type}
                  </span>

                  <div className="flex items-center space-x-2 flex-1 max-w-[200px]">
                    <span className="text-[10px] text-slate-400">Host:</span>
                    <input
                      type="text"
                      value={r.name}
                      onChange={(e) => updateRecord(r.id, { name: e.target.value })}
                      placeholder="@"
                      className="w-full font-mono text-xs px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded dark:text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-2 w-24">
                    <span className="text-[10px] text-slate-400">TTL:</span>
                    <input
                      type="number"
                      value={r.ttl}
                      onChange={(e) => updateRecord(r.id, { ttl: parseInt(e.target.value, 10) || 3600 })}
                      className="w-full font-mono text-xs px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded dark:text-white"
                    />
                  </div>

                  <button
                    onClick={() => removeRecord(r.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Specific field rows based on type */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {r.type === 'MX' && (
                    <div className="flex items-center space-x-1.5 w-24">
                      <span className="text-[10px] text-slate-400 font-mono">Priority:</span>
                      <input
                        type="number"
                        value={r.priority ?? 10}
                        onChange={(e) => updateRecord(r.id, { priority: parseInt(e.target.value, 10) || 10 })}
                        className="w-full font-mono text-xs px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded dark:text-white"
                      />
                    </div>
                  )}

                  {r.type === 'SRV' && (
                    <>
                      <input
                        type="number"
                        placeholder="Pri"
                        value={r.priority ?? 10}
                        onChange={(e) => updateRecord(r.id, { priority: parseInt(e.target.value, 10) || 10 })}
                        className="w-16 font-mono text-xs px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded dark:text-white"
                      />
                      <input
                        type="number"
                        placeholder="Weight"
                        value={r.weight ?? 10}
                        onChange={(e) => updateRecord(r.id, { weight: parseInt(e.target.value, 10) || 10 })}
                        className="w-16 font-mono text-xs px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded dark:text-white"
                      />
                      <input
                        type="number"
                        placeholder="Port"
                        value={r.port ?? 443}
                        onChange={(e) => updateRecord(r.id, { port: parseInt(e.target.value, 10) || 443 })}
                        className="w-16 font-mono text-xs px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded dark:text-white"
                      />
                    </>
                  )}

                  {r.type === 'CAA' && (
                    <select
                      value={r.tag || 'issue'}
                      onChange={(e) => updateRecord(r.id, { tag: e.target.value as any })}
                      className="font-mono text-xs px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded dark:text-white"
                    >
                      <option value="issue">issue</option>
                      <option value="issuewild">issuewild</option>
                      <option value="iodef">iodef</option>
                    </select>
                  )}

                  <input
                    type="text"
                    value={r.value}
                    onChange={(e) => updateRecord(r.id, { value: e.target.value })}
                    placeholder="Target Value / IP / Host"
                    className="flex-1 min-w-[200px] font-mono text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live BIND Zone Preview */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 flex flex-col">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Standard RFC BIND Zone File</span>
            </h2>
            <button
              onClick={() => copyToClipboard(zoneOutput, 'zone')}
              className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1 font-mono"
            >
              {copiedKey === 'zone' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              <span>Copy</span>
            </button>
          </div>

          <pre className="flex-1 font-mono text-xs bg-slate-950 text-slate-200 p-4 rounded-lg overflow-x-auto border border-slate-800 select-all whitespace-pre">
            {zoneOutput}
          </pre>
        </div>
      </div>
    </div>
  );
};
