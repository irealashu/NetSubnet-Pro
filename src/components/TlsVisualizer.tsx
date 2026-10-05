import React, { useState, useMemo } from 'react';
import { Lock, ShieldCheck, Key, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, Cpu, Layers, RotateCcw, FileCode, Play, Sparkles, Check } from 'lucide-react';

export const TlsVisualizer: React.FC = () => {
  const [version, setVersion] = useState<'1.3' | '1.2'>('1.3');
  const [sniDomain, setSniDomain] = useState('api.stripe.com');
  const [cipherSuite, setCipherSuite] = useState('TLS_AES_256_GCM_SHA384');
  const [alpnProtocol, setAlpnProtocol] = useState<'h2' | 'h3' | 'http/1.1'>('h2');
  const [keyCurve, setKeyCurve] = useState<'X25519' | 'secp256r1' | 'secp384r1'>('X25519');
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'handshake' | 'certificate' | 'keyschedule'>('handshake');

  const steps13 = useMemo(() => [
    {
      step: 1,
      sender: 'Client → Server',
      title: '1. ClientHello + 0-RTT Key Share',
      desc: `Client initiates connection with Server Name Indication (SNI = ${sniDomain}), ALPN = [${alpnProtocol}], and pre-computed Elliptic Curve Diffie-Hellman Key Share (${keyCurve} public key = 0x8a92f1...).`,
      time: '0 ms (0-RTT)',
      encrypted: false,
      payload: `TLS 1.3 ClientHello [SNI: ${sniDomain}, ALPN: ${alpnProtocol}, KeyShare: ${keyCurve}, Supported Ciphers: ${cipherSuite}]`
    },
    {
      step: 2,
      sender: 'Server → Client',
      title: '2. ServerHello + Encrypted Extensions + Cert Chain + Finished',
      desc: `Server selects cipher ${cipherSuite}, generates its ${keyCurve} public key, derives Handshake Secret, immediately activates encryption, and sends encrypted X.509 Certificate + Signature + Handshake Finished.`,
      time: '+12 ms (1-RTT Roundtrip Complete)',
      encrypted: true,
      payload: `ServerHello [Selected: ${cipherSuite}, KeyShare: ${keyCurve}], EncryptedExtensions, Certificate Chain, CertificateVerify, HandshakeFinished`
    },
    {
      step: 3,
      sender: 'Client → Server',
      title: '3. Handshake Finished & Encrypted HTTP Stream',
      desc: `Client verifies server certificate chain and Finished HMAC tag. Client derives Application Traffic Secrets and begins transmitting encrypted ${alpnProtocol.toUpperCase()} requests instantly.`,
      time: '+14 ms',
      encrypted: true,
      payload: `HandshakeFinished + Encrypted Application Data (${alpnProtocol.toUpperCase()} GET /v1/charges HTTP/2.0)`
    }
  ], [sniDomain, cipherSuite, alpnProtocol, keyCurve]);

  const steps12 = useMemo(() => [
    {
      step: 1,
      sender: 'Client → Server',
      title: '1. ClientHello',
      desc: `Client transmits TLS 1.2 ClientHello with Random_C (32 bytes), supported ciphers, and SNI (${sniDomain}).`,
      time: '0 ms',
      encrypted: false,
      payload: `TLS 1.2 ClientHello [Random_C, SNI: ${sniDomain}, Ciphers: ECDHE-RSA-AES256-GCM-SHA384]`
    },
    {
      step: 2,
      sender: 'Server → Client',
      title: '2. ServerHello + Plaintext Certificate + ServerKeyExchange + Done',
      desc: 'Server chooses cipher, sends its plaintext X.509 certificate, ECDHE parameters with signature, and signals ServerHelloDone.',
      time: '+15 ms (1-RTT)',
      encrypted: false,
      payload: `ServerHello [Random_S], Plaintext Certificate (${sniDomain}), ServerKeyExchange (${keyCurve}), ServerHelloDone`
    },
    {
      step: 3,
      sender: 'Client → Server',
      title: '3. ClientKeyExchange + ChangeCipherSpec + Finished',
      desc: 'Client sends ephemeral public key, computes Pre-Master Secret, activates symmetric encryption with ChangeCipherSpec, and sends first encrypted Finished message.',
      time: '+30 ms (2-RTT)',
      encrypted: true,
      payload: 'ClientKeyExchange, ChangeCipherSpec, EncryptedHandshakeFinished'
    },
    {
      step: 4,
      sender: 'Server → Client',
      title: '4. ChangeCipherSpec + Finished & Application Data Ready',
      desc: 'Server activates encryption, verifies Finished message, and completes 2-RTT handshake. Application traffic begins.',
      time: '+45 ms',
      encrypted: true,
      payload: 'NewSessionTicket, ChangeCipherSpec, EncryptedHandshakeFinished'
    }
  ], [sniDomain, keyCurve]);

  const activeSteps = version === '1.3' ? steps13 : steps12;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">TLS 1.2 vs TLS 1.3 Cryptography & Handshake Visualizer</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Interactive step-by-step cryptographic protocol negotiation, Diffie-Hellman Key Exchange (ECDHE), and 1-RTT latency analysis.
              </p>
            </div>
          </div>

          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-950">
            <button
              onClick={() => { setVersion('1.3'); setCurrentStep(0); }}
              className={`px-3 py-1.5 text-xs font-bold font-mono rounded ${
                version === '1.3' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              TLS 1.3 (1-RTT)
            </button>
            <button
              onClick={() => { setVersion('1.2'); setCurrentStep(0); }}
              className={`px-3 py-1.5 text-xs font-bold font-mono rounded ${
                version === '1.2' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              TLS 1.2 (2-RTT)
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              SNI Hostname
            </label>
            <input
              type="text"
              value={sniDomain}
              onChange={(e) => setSniDomain(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono text-xs dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Cipher Suite
            </label>
            <select
              value={cipherSuite}
              onChange={(e) => setCipherSuite(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono text-xs dark:text-white"
            >
              <option value="TLS_AES_256_GCM_SHA384">TLS_AES_256_GCM_SHA384</option>
              <option value="TLS_CHACHA20_POLY1305_SHA256">TLS_CHACHA20_POLY1305_SHA256</option>
              <option value="TLS_AES_128_GCM_SHA256">TLS_AES_128_GCM_SHA256</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Key Exchange Curve
            </label>
            <select
              value={keyCurve}
              onChange={(e) => setKeyCurve(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono text-xs dark:text-white"
            >
              <option value="X25519">X25519 (Curve25519 - 256-bit)</option>
              <option value="secp256r1">secp256r1 (NIST P-256)</option>
              <option value="secp384r1">secp384r1 (NIST P-384)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              ALPN Protocol
            </label>
            <select
              value={alpnProtocol}
              onChange={(e) => setAlpnProtocol(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono text-xs dark:text-white"
            >
              <option value="h2">h2 (HTTP/2 Multiplexed)</option>
              <option value="h3">h3 (HTTP/3 QUIC)</option>
              <option value="http/1.1">http/1.1 (HTTP 1.1 Keep-Alive)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs View */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        {[
          { id: 'handshake', label: 'Handshake Sequence', icon: Key },
          { id: 'certificate', label: 'X.509 Certificate Chain', icon: ShieldCheck },
          { id: 'keyschedule', label: 'HKDF Key Schedule & Secrets', icon: Cpu }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`pb-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === t.id
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <t.icon className="h-4 w-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'handshake' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {activeSteps.map((st, idx) => {
              const isSelected = idx === currentStep;
              return (
                <div
                  key={st.step}
                  onClick={() => setCurrentStep(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {st.time}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                      st.encrypted
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {st.encrypted ? 'Encrypted' : 'Plaintext'}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-1.5">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {st.desc}
                  </p>

                  <div className="p-2 rounded bg-slate-100 dark:bg-slate-950 font-mono text-[10px] text-slate-700 dark:text-slate-400 break-all">
                    {st.payload}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'certificate' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>X.509 Public Key Certificate Chain Hierarchy</span>
          </h2>

          <div className="space-y-3 font-mono text-xs">
            {/* Root CA */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-slate-400 text-[10px] uppercase font-bold mb-1">
                <span>1. Root Certificate Authority (Self-Signed Trust Anchor)</span>
                <span className="text-emerald-500">Trusted in OS Store</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white">CN = DigiCert Global Root G2, O = DigiCert Inc</div>
              <div className="text-slate-500 text-[11px] mt-1">Key: RSA 4096-bit | Signature: SHA256withRSA | Valid: 2013 - 2038</div>
            </div>

            {/* Intermediate CA */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 ml-4 border-l-4 border-l-blue-500">
              <div className="flex justify-between text-slate-400 text-[10px] uppercase font-bold mb-1">
                <span>2. Intermediate Certificate Authority</span>
                <span className="text-blue-500">Signed by Root</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white">CN = DigiCert TLS Hybrid ECC SHA384 2020 CA1</div>
              <div className="text-slate-500 text-[11px] mt-1">Key: ECC P-384 | Signature: SHA384withECDSA</div>
            </div>

            {/* Leaf Certificate */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-300 dark:border-emerald-800 ml-8 border-l-4 border-l-emerald-500">
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold mb-1">
                <span>3. End-Entity (Leaf Domain) Certificate</span>
                <span>Active SAN Verified</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white">CN = {sniDomain}</div>
              <div className="text-slate-600 dark:text-slate-300 text-[11px] mt-1">
                Subject Alternative Names (SAN): {sniDomain}, *.{sniDomain.split('.').slice(-2).join('.')}
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">Key: ECDSA ({keyCurve}) | Status: OCSP Stapling Valid</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'keyschedule' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <Cpu className="h-4 w-4 text-emerald-500" />
            <span>HKDF (HMAC Key Derivation Function) Cryptographic Schedule</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">1. Early Secret (0-RTT Stage)</span>
              <div>PSF (Pre-Shared Key): <span className="text-slate-400">0x00...00</span></div>
              <div>Early Secret = <span className="text-emerald-600 dark:text-emerald-400">HKDF-Extract(0, PSK)</span></div>
              <div className="text-[11px] text-slate-500">Derives client early traffic secret for 0-RTT data.</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">2. Handshake Secret (1-RTT Stage)</span>
              <div>ECDHE Shared Secret: <span className="text-indigo-500 font-bold">Curve25519(C_pub, S_priv)</span></div>
              <div>Handshake Secret = <span className="text-emerald-600 dark:text-emerald-400">HKDF-Extract(EarlySecret, ECDHE)</span></div>
              <div className="text-[11px] text-slate-500">Derives Client & Server Handshake Traffic Secrets.</div>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-300 dark:border-emerald-800 md:col-span-2 space-y-2">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block">
                3. Master Secret & Symmetric Traffic Keys
              </span>
              <div>Master Secret = <span className="text-emerald-700 dark:text-emerald-300 font-bold">HKDF-Extract(HandshakeSecret, 0)</span></div>
              <div>Client Application Key: <span className="text-indigo-600 dark:text-indigo-400 font-bold">AES-256-GCM Key (32 bytes) + IV (12 bytes)</span></div>
              <div>Server Application Key: <span className="text-emerald-600 dark:text-emerald-400 font-bold">AES-256-GCM Key (32 bytes) + IV (12 bytes)</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
