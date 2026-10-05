import React, { useState, useMemo } from 'react';
import { generateServerHeaderConfigs, SecurityHeadersConfig } from '../utils/dnsSpfDmarc';
import { Shield, Copy, Check, Server, FileCode, CheckCircle2, AlertTriangle } from 'lucide-react';

export const HeaderAnalyzer: React.FC = () => {
  const [hstsEnabled, setHstsEnabled] = useState(true);
  const [hstsMaxAge, setHstsMaxAge] = useState(31536000);
  const [hstsSubdomains, setHstsSubdomains] = useState(true);
  const [hstsPreload, setHstsPreload] = useState(true);

  const [cspEnabled, setCspEnabled] = useState(true);
  const [cspDefaultSrc, setCspDefaultSrc] = useState("'self'");
  const [cspScriptSrc, setCspScriptSrc] = useState("'self' https://trustedscripts.com");
  const [cspStyleSrc, setCspStyleSrc] = useState("'self' 'unsafe-inline'");

  const [xFrameOptions, setXFrameOptions] = useState<'DENY' | 'SAMEORIGIN' | 'DISABLED'>('DENY');
  const [xContentTypeOptions, setXContentTypeOptions] = useState(true);
  const [referrerPolicy, setReferrerPolicy] = useState('strict-origin-when-cross-origin');
  const [permissionsPolicy, setPermissionsPolicy] = useState('camera=(), microphone=(), geolocation=()');

  const [corsEnabled, setCorsEnabled] = useState(false);
  const [corsOrigin, setCorsOrigin] = useState('https://app.example.com');
  const [activeServerTab, setActiveServerTab] = useState<'nginx' | 'apache' | 'caddy' | 'cloudflare' | 'express'>('nginx');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const config: SecurityHeadersConfig = {
    hsts: {
      enabled: hstsEnabled,
      maxAge: hstsMaxAge,
      includeSubDomains: hstsSubdomains,
      preload: hstsPreload
    },
    csp: {
      enabled: cspEnabled,
      defaultSrc: cspDefaultSrc.split(' ').filter(Boolean),
      scriptSrc: cspScriptSrc.split(' ').filter(Boolean),
      styleSrc: cspStyleSrc.split(' ').filter(Boolean),
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:'],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: true
    },
    xFrameOptions: xFrameOptions as any,
    xContentTypeOptions,
    referrerPolicy,
    permissionsPolicy,
    cors: {
      enabled: corsEnabled,
      allowOrigin: corsOrigin,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      allowCredentials: true
    }
  };

  const serverConfigs = useMemo(() => {
    return generateServerHeaderConfigs(config);
  }, [config]);

  // Calculate Security Score Grade (A+ to F)
  const score = useMemo(() => {
    let pts = 0;
    if (hstsEnabled) pts += 25;
    if (hstsPreload) pts += 5;
    if (cspEnabled) pts += 35;
    if (xFrameOptions !== 'DISABLED') pts += 15;
    if (xContentTypeOptions) pts += 10;
    if (referrerPolicy) pts += 10;

    let grade = 'F';
    let color = 'text-rose-500';
    if (pts >= 95) { grade = 'A+'; color = 'text-emerald-500'; }
    else if (pts >= 85) { grade = 'A'; color = 'text-emerald-600'; }
    else if (pts >= 70) { grade = 'B'; color = 'text-blue-500'; }
    else if (pts >= 50) { grade = 'C'; color = 'text-amber-500'; }
    else if (pts >= 30) { grade = 'D'; color = 'text-orange-500'; }

    return { pts, grade, color };
  }, [hstsEnabled, hstsPreload, cspEnabled, xFrameOptions, xContentTypeOptions, referrerPolicy]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">HTTP Security Headers Generator & Scorecard</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Configure CSP, HSTS, X-Frame-Options, and Permissions-Policy with instant Nginx, Apache, Cloudflare & Caddy exports.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Security Grade</div>
              <div className={`text-2xl font-black ${score.color}`}>{score.grade} ({score.pts}/100)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Pane View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Configuration Toggles */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Security Policy Controls
          </h2>

          <div className="space-y-4">
            {/* HSTS */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Strict-Transport-Security (HSTS)
                </span>
                <input
                  type="checkbox"
                  checked={hstsEnabled}
                  onChange={(e) => setHstsEnabled(e.target.checked)}
                  className="rounded text-teal-600 h-4 w-4"
                />
              </label>
              {hstsEnabled && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500">Max-Age:</span>
                    <select
                      value={hstsMaxAge}
                      onChange={(e) => setHstsMaxAge(parseInt(e.target.value, 10))}
                      className="font-mono text-xs px-2 py-1 bg-white dark:bg-slate-900 border rounded dark:text-white"
                    >
                      <option value={31536000}>1 Year (31,536,000s - Standard)</option>
                      <option value={63072000}>2 Years (63,072,000s - Preload)</option>
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={hstsSubdomains}
                        onChange={(e) => setHstsSubdomains(e.target.checked)}
                        className="rounded text-teal-600 h-3.5 w-3.5"
                      />
                      <span>includeSubDomains</span>
                    </label>
                    <label className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={hstsPreload}
                        onChange={(e) => setHstsPreload(e.target.checked)}
                        className="rounded text-teal-600 h-3.5 w-3.5"
                      />
                      <span>preload</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Content Security Policy */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Content-Security-Policy (CSP)
                </span>
                <input
                  type="checkbox"
                  checked={cspEnabled}
                  onChange={(e) => setCspEnabled(e.target.checked)}
                  className="rounded text-teal-600 h-4 w-4"
                />
              </label>
              {cspEnabled && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono">default-src:</span>
                    <input
                      type="text"
                      value={cspDefaultSrc}
                      onChange={(e) => setCspDefaultSrc(e.target.value)}
                      className="w-full font-mono text-xs px-2 py-1 bg-white dark:bg-slate-900 border rounded dark:text-white mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono">script-src:</span>
                    <input
                      type="text"
                      value={cspScriptSrc}
                      onChange={(e) => setCspScriptSrc(e.target.value)}
                      className="w-full font-mono text-xs px-2 py-1 bg-white dark:bg-slate-900 border rounded dark:text-white mt-0.5"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* X-Frame-Options & Sniff */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  X-Frame-Options
                </label>
                <select
                  value={xFrameOptions}
                  onChange={(e) => setXFrameOptions(e.target.value as any)}
                  className="w-full font-mono text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded dark:text-white"
                >
                  <option value="DENY">DENY (Clickjacking protection)</option>
                  <option value="SAMEORIGIN">SAMEORIGIN</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Referrer-Policy
                </label>
                <select
                  value={referrerPolicy}
                  onChange={(e) => setReferrerPolicy(e.target.value)}
                  className="w-full font-mono text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded dark:text-white"
                >
                  <option value="strict-origin-when-cross-origin">strict-origin-when-cross-origin</option>
                  <option value="no-referrer">no-referrer</option>
                  <option value="same-origin">same-origin</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Server Config Outputs */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 flex flex-col">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
              <Server className="h-4 w-4 text-teal-500" />
              <span>Target Server Configuration</span>
            </h2>
            <button
              onClick={() => copyToClipboard(serverConfigs[activeServerTab], activeServerTab)}
              className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1 font-mono"
            >
              {copiedKey === activeServerTab ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copy</span>
            </button>
          </div>

          {/* Server Selector Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2">
            {(['nginx', 'apache', 'caddy', 'cloudflare', 'express'] as const).map((srv) => (
              <button
                key={srv}
                onClick={() => setActiveServerTab(srv)}
                className={`px-3 py-1.5 text-xs font-mono font-bold capitalize transition-colors border-b-2 -mb-px ${
                  activeServerTab === srv
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {srv}
              </button>
            ))}
          </div>

          <pre className="flex-1 font-mono text-xs bg-slate-950 text-teal-300 p-4 rounded-lg overflow-x-auto border border-slate-800 select-all whitespace-pre min-h-[300px]">
            {serverConfigs[activeServerTab]}
          </pre>
        </div>
      </div>
    </div>
  );
};
