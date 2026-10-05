import React, { useState, useMemo } from 'react';
import { decodeJWT } from '../utils/crypto';
import { ShieldAlert, Copy, Check, Clock, AlertTriangle, CheckCircle2, Lock, Code, Info } from 'lucide-react';

export const JwtDecoder: React.FC = () => {
  const sampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik5ldHdvcmsgRW5naW5lZXIiLCJyb2xlIjoiU3VwZXJBZG1pbiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyMDgwMDAwMDAwfQ.cTh-sample-signature-hash';
  const [tokenInput, setTokenInput] = useState(sampleJwt);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const decoded = useMemo(() => {
    return decodeJWT(tokenInput);
  }, [tokenInput]);

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
          <div className="p-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">JSON Web Token (JWT) Inspector & Claims Decoder</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Decode and inspect RFC 7519 JWT headers, payload claims, expiration timestamps, and signature structure safely client-side.
            </p>
          </div>
        </div>

        {/* Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Encoded JWT Token String
          </label>
          <textarea
            rows={4}
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Paste eyJhbGciOi... JWT token here..."
            className="w-full font-mono text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {decoded.error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{decoded.error}</span>
          </div>
        )}
      </div>

      {decoded.isValidStructure && (
        <>
          {/* Expiration Status Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border shadow-sm ${
              decoded.isExpired
                ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
            }`}>
              <div className="text-xs font-semibold">Expiration Status (exp)</div>
              <div className="text-lg font-bold mt-1 flex items-center space-x-1.5">
                {decoded.isExpired ? (
                  <>
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                    <span>EXPIRED</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span>VALID (Active)</span>
                  </>
                )}
              </div>
              <div className="text-[11px] opacity-75 mt-0.5">
                {decoded.expiresAt ? decoded.expiresAt : 'No expiration claim set'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-slate-500 dark:text-slate-400">Issued At (iat)</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {decoded.issuedAt ? decoded.issuedAt : 'Not specified'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-slate-500 dark:text-slate-400">Signing Algorithm (alg)</div>
              <div className="text-lg font-mono font-bold text-violet-600 dark:text-violet-400 mt-1">
                {decoded.header.alg || 'None'}
              </div>
            </div>
          </div>

          {/* 3-Section JWT Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-wider text-rose-500 flex items-center space-x-1.5">
                  <Code className="h-4 w-4" />
                  <span>1. Header (Algorithm & Type)</span>
                </h2>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2), 'hdr')}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  {copiedKey === 'hdr' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-rose-400 font-mono text-xs rounded-lg border border-slate-800 overflow-x-auto select-all">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-wider text-violet-500 flex items-center space-x-1.5">
                  <Info className="h-4 w-4" />
                  <span>2. Payload (Data Claims)</span>
                </h2>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2), 'pay')}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  {copiedKey === 'pay' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-violet-400 font-mono text-xs rounded-lg border border-slate-800 overflow-x-auto select-all">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>

            {/* Signature */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-wider text-sky-500 flex items-center space-x-1.5">
                  <Lock className="h-4 w-4" />
                  <span>3. Signature Hash</span>
                </h2>
                <button
                  onClick={() => copyToClipboard(decoded.signature, 'sig')}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  {copiedKey === 'sig' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="p-3 bg-slate-950 text-sky-400 font-mono text-xs rounded-lg border border-slate-800 break-all select-all">
                {decoded.signature}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Signature is verified server-side with HMAC secret or RSA/ECDSA public key.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
