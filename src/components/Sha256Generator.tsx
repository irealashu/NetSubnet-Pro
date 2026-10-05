import React, { useState, useEffect } from 'react';
import { computeHash, computeHmac, computeMD5 } from '../utils/crypto';
import { Binary, Copy, Check, Hash, FileCheck, ShieldCheck, ArrowRight } from 'lucide-react';

export const Sha256Generator: React.FC = () => {
  const [inputText, setInputText] = useState('cisco-ios-xe-17.9.4.bin');
  const [hmacKey, setHmacKey] = useState('SecretHmacKey2026');
  const [compareHash, setCompareHash] = useState('');
  const [sha256, setSha256] = useState('');
  const [sha512, setSha512] = useState('');
  const [sha1, setSha1] = useState('');
  const [md5, setMd5] = useState('');
  const [hmacSha256, setHmacSha256] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const s256 = await computeHash('SHA-256', inputText);
        const s512 = await computeHash('SHA-512', inputText);
        const s1 = await computeHash('SHA-1', inputText);
        const m = computeMD5(inputText);
        const hmac = await computeHmac(hmacKey, inputText);

        setSha256(s256);
        setSha512(s512);
        setSha1(s1);
        setMd5(m);
        setHmacSha256(hmac);
      } catch (err) {
        console.error(err);
      }
    };
    run();
  }, [inputText, hmacKey]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Compare check
  const cleanCompare = compareHash.trim().toLowerCase();
  const matchedAlgorithm = cleanCompare
    ? cleanCompare === sha256
      ? 'SHA-256'
      : cleanCompare === sha512
      ? 'SHA-512'
      : cleanCompare === sha1
      ? 'SHA-1'
      : cleanCompare === md5
      ? 'MD5'
      : null
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Binary className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Cryptographic Checksum & Firmware Hash Verifier</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Calculate SHA-256, SHA-512, MD5, SHA-1, and HMAC-SHA256 digests for Cisco IOS/Junos images and configuration files.
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Input String / Text / Payload
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste firmware release note checksum string or configuration payload..."
              className="w-full font-mono text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              HMAC Secret Key (Optional)
            </label>
            <input
              type="text"
              value={hmacKey}
              onChange={(e) => setHmacKey(e.target.value)}
              className="w-full font-mono text-xs px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Hash Verification / Matching Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
          <FileCheck className="h-4 w-4 text-indigo-500" />
          <span>Vendor Checksum Comparator</span>
        </h2>

        <div className="flex gap-3">
          <input
            type="text"
            value={compareHash}
            onChange={(e) => setCompareHash(e.target.value)}
            placeholder="Paste expected vendor hash (e.g. from Cisco/Juniper download portal)..."
            className="flex-1 font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
          />
        </div>

        {cleanCompare && (
          <div className={`p-3 rounded-lg border text-xs flex items-center space-x-2 ${
            matchedAlgorithm
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}>
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>
              {matchedAlgorithm
                ? `MATCH CONFIRMED! Checksum matches computed ${matchedAlgorithm} digest.`
                : 'CHECKSUM MISMATCH! Provided hash does not match any computed algorithm.'}
            </span>
          </div>
        )}
      </div>

      {/* Calculated Digests List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
          <Hash className="h-4 w-4 text-indigo-500" />
          <span>Calculated Cryptographic Digests</span>
        </h2>

        <div className="space-y-3">
          {[
            { label: 'SHA-256 (FIPS 180-4)', value: sha256, key: 's256', color: 'text-indigo-600 dark:text-indigo-400' },
            { label: 'SHA-512 (High Security)', value: sha512, key: 's512', color: 'text-blue-600 dark:text-blue-400' },
            { label: 'HMAC-SHA256', value: hmacSha256, key: 'hmac', color: 'text-purple-600 dark:text-purple-400' },
            { label: 'MD5 (RFC 1321 - Legacy)', value: md5, key: 'md5', color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'SHA-1 (Legacy Checksum)', value: sha1, key: 's1', color: 'text-amber-600 dark:text-amber-400' }
          ].map((item) => (
            <div key={item.key} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-semibold">{item.label}</span>
                <button
                  onClick={() => copyToClipboard(item.value, item.key)}
                  className="hover:text-indigo-600 flex items-center space-x-1"
                >
                  {copiedKey === item.key ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedKey === item.key ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className={`font-mono text-xs break-all font-bold select-all ${item.color}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
