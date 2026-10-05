import React, { useState, useEffect, useMemo } from 'react';
import { generatePassword, encryptCiscoType7, decryptCiscoType7, computeMD5 } from '../utils/crypto';
import { KeyRound, Copy, Check, RefreshCw, Lock, Shield, Eye, EyeOff, Terminal } from 'lucide-react';

export const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState(20);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNums, setIncludeNums] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(true);
  const [password, setPassword] = useState('');
  const [entropy, setEntropy] = useState(0);
  const [strength, setStrength] = useState<'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong'>('Strong');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Cisco Type 7 Reversible Obfuscator
  const [type7Input, setType7Input] = useState('cisco123');
  const [type7Decrypted, setType7Decrypted] = useState('');
  const [type7Encrypted, setType7Encrypted] = useState('');
  const [type7Mode, setType7Mode] = useState<'encrypt' | 'decrypt'>('decrypt');

  const regenerate = () => {
    const res = generatePassword({
      length,
      includeUppercase: includeUpper,
      includeLowercase: includeLower,
      includeNumbers: includeNums,
      includeSymbols,
      avoidAmbiguous,
      format: 'generic'
    });
    setPassword(res.password);
    setEntropy(res.entropyBits);
    setStrength(res.strength);
  };

  useEffect(() => {
    regenerate();
  }, [length, includeUpper, includeLower, includeNums, includeSymbols, avoidAmbiguous]);

  useEffect(() => {
    try {
      if (type7Mode === 'decrypt') {
        setType7Decrypted(decryptCiscoType7(type7Input));
      } else {
        setType7Encrypted(encryptCiscoType7(type7Input));
      }
    } catch (err: any) {
      if (type7Mode === 'decrypt') setType7Decrypted(`Error: ${err.message}`);
      else setType7Encrypted(`Error: ${err.message}`);
    }
  }, [type7Input, type7Mode]);

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
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Network Device Password & Cisco Secret Generator</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Generate high-entropy passwords for console, enable secret, SNMPv3 keys, VPN PSKs, and Cisco Type 7 obfuscation.
            </p>
          </div>
        </div>

        {/* Primary Password Banner */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span className="flex items-center space-x-2">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Cryptographically Secure Token (Web Crypto API)</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              strength === 'Very Strong' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-blue-900/60 text-blue-300'
            }`}>
              {strength} ({entropy} bits entropy)
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="font-mono text-lg sm:text-xl text-emerald-400 font-bold break-all select-all">
              {password}
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={regenerate}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => copyToClipboard(password, 'pwd')}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                {copiedKey === 'pwd' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'pwd' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Cisco Type 7 Utility */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator Controls */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span>Entropy & Character Pool Options</span>
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password Length: {length} Characters
                </label>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>8 (Min)</span>
                <span>16 (Standard)</span>
                <span>32 (High Security)</span>
                <span>64 (VPN PSK)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUpper}
                  onChange={(e) => setIncludeUpper(e.target.checked)}
                  className="rounded text-emerald-600 h-4 w-4"
                />
                <span>Uppercase (A-Z)</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLower}
                  onChange={(e) => setIncludeLower(e.target.checked)}
                  className="rounded text-emerald-600 h-4 w-4"
                />
                <span>Lowercase (a-z)</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNums}
                  onChange={(e) => setIncludeNums(e.target.checked)}
                  className="rounded text-emerald-600 h-4 w-4"
                />
                <span>Numbers (0-9)</span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded text-emerald-600 h-4 w-4"
                />
                <span>Symbols (!@#$%)</span>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={avoidAmbiguous}
                  onChange={(e) => setAvoidAmbiguous(e.target.checked)}
                  className="rounded text-emerald-600 h-4 w-4"
                />
                <span>Exclude ambiguous characters (1, l, I, 0, O, |, ;)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Cisco Type 7 Decryptor / Encryptor */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-blue-500" />
              <span>Cisco Type 7 Reversible Cipher</span>
            </h2>
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-950">
              <button
                onClick={() => {
                  setType7Mode('decrypt');
                  setType7Input('0822404F1A0A');
                }}
                className={`px-2 py-1 text-xs rounded font-medium ${type7Mode === 'decrypt' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'}`}
              >
                Decrypt
              </button>
              <button
                onClick={() => {
                  setType7Mode('encrypt');
                  setType7Input('cisco123');
                }}
                className={`px-2 py-1 text-xs rounded font-medium ${type7Mode === 'encrypt' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'}`}
              >
                Encrypt
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {type7Mode === 'decrypt' ? 'Cisco Type 7 Ciphertext (e.g. 0822404F1A0A)' : 'Plaintext Password'}
              </label>
              <input
                type="text"
                value={type7Input}
                onChange={(e) => setType7Input(e.target.value)}
                placeholder={type7Mode === 'decrypt' ? '0822404F1A0A' : 'mySecretPass'}
                className="w-full font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
              />
            </div>

            <div className="p-3.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40">
              <div className="flex justify-between items-center text-xs text-blue-900 dark:text-blue-300 mb-1 font-semibold">
                <span>{type7Mode === 'decrypt' ? 'Recovered Plaintext Password' : 'Cisco Type 7 Ciphertext'}</span>
                <button
                  onClick={() => copyToClipboard(type7Mode === 'decrypt' ? type7Decrypted : type7Encrypted, 't7')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 font-sans"
                >
                  {copiedKey === 't7' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="font-mono text-sm text-blue-900 dark:text-blue-200 font-bold break-all">
                {type7Mode === 'decrypt' ? type7Decrypted : type7Encrypted}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Note: Cisco Type 7 uses a fixed 26-byte XOR key designed only for screen obfuscation, not cryptographic security. Always use <code>enable secret</code> (Type 5 / 8 / 9) in production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
