import React, { useState } from 'react';
import { Lock, ShieldCheck, Key, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, Cpu, Layers } from 'lucide-react';

export const TlsVisualizer: React.FC = () => {
  const [version, setVersion] = useState<'1.3' | '1.2'>('1.3');
  const [currentStep, setCurrentStep] = useState(0);

  const steps13 = [
    {
      step: 1,
      sender: 'Client → Server',
      title: '1. ClientHello + Key Share (1-RTT Setup)',
      desc: 'Client sends supported Cipher Suites, SNI (Server Name Indication), and precomputed Diffie-Hellman Key Share (Curve25519/P-256 public key).',
      time: '0 ms (0-RTT)',
      encrypted: false,
      payload: 'TLS 1.3 ClientHello, Cipher: TLS_AES_256_GCM_SHA384, KeyShare: ecdh_x25519'
    },
    {
      step: 2,
      sender: 'Server → Client',
      title: '2. ServerHello + EncryptedExtensions + Certificate + Finished',
      desc: 'Server chooses cipher suite, computes shared secret via its own Key Share, encrypts all subsequent handshake messages with derived handshake key, sends X.509 Certificate Chain & CertificateVerify signature.',
      time: '+15 ms (1-RTT)',
      encrypted: true,
      payload: 'ServerHello, KeyShare: ecdh_x25519, EncryptedCertificate, CertificateVerify, HandshakeFinished'
    },
    {
      step: 3,
      sender: 'Client → Server',
      title: '3. Handshake Finished & Encrypted Application Data',
      desc: 'Client verifies server certificate & HMAC Finished tag. Client sends Handshake Finished and begins transmitting encrypted HTTP/2 or HTTP/3 frames immediately.',
      time: '+16 ms',
      encrypted: true,
      payload: 'HandshakeFinished + HTTP/2 Encrypted Application Data (GET /index.html)'
    }
  ];

  const steps12 = [
    {
      step: 1,
      sender: 'Client → Server',
      title: '1. ClientHello',
      desc: 'Client sends TLS version 1.2, random bytes, and list of supported cipher suites.',
      time: '0 ms',
      encrypted: false,
      payload: 'TLS 1.2 ClientHello, Random_C, Ciphers: ECDHE-RSA-AES256-GCM-SHA384'
    },
    {
      step: 2,
      sender: 'Server → Client',
      title: '2. ServerHello + Certificate + ServerKeyExchange + ServerHelloDone',
      desc: 'Server sends selected cipher suite, X.509 Certificate (in plaintext), ECDHE parameters, and ServerHelloDone.',
      time: '+15 ms (1-RTT)',
      encrypted: false,
      payload: 'ServerHello, Random_S, Plaintext Certificate Chain, ECDHE Params, ServerHelloDone'
    },
    {
      step: 3,
      sender: 'Client → Server',
      title: '3. ClientKeyExchange + ChangeCipherSpec + Finished',
      desc: 'Client computes Pre-Master Secret, sends ClientKeyExchange, activates encryption via ChangeCipherSpec, and sends first encrypted Finished message.',
      time: '+30 ms (2-RTT)',
      encrypted: true,
      payload: 'ClientKeyExchange, ChangeCipherSpec, EncryptedHandshakeMessage'
    },
    {
      step: 4,
      sender: 'Server → Client',
      title: '4. ChangeCipherSpec + Finished & Application Data Ready',
      desc: 'Server switches to symmetric encryption, verifies Finished message, and opens connection for HTTP application data.',
      time: '+45 ms',
      encrypted: true,
      payload: 'NewSessionTicket, ChangeCipherSpec, EncryptedHandshakeMessage'
    }
  ];

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
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">TLS 1.2 vs TLS 1.3 Handshake & Cryptography Visualizer</h1>
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
              TLS 1.3 (1-RTT Modern)
            </button>
            <button
              onClick={() => { setVersion('1.2'); setCurrentStep(0); }}
              className={`px-3 py-1.5 text-xs font-bold font-mono rounded ${
                version === '1.2' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              TLS 1.2 (2-RTT Legacy)
            </button>
          </div>
        </div>

        {/* Feature comparison badges */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] text-slate-500">Handshake Latency</div>
            <div className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
              {version === '1.3' ? '1 RTT (15ms)' : '2 RTT (30-45ms)'}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] text-slate-500">Certificate Encryption</div>
            <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
              {version === '1.3' ? 'Fully Encrypted' : 'Plaintext in Transit'}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] text-slate-500">Forward Secrecy</div>
            <div className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
              Mandatory ECDHE
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] text-slate-500">Zero Round-Trip Resumption</div>
            <div className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
              {version === '1.3' ? '0-RTT (Early Data)' : 'Not Supported'}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Handshake Sequence */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Step-by-Step Message Flow Simulation ({version === '1.3' ? 'TLS 1.3 RFC 8446' : 'TLS 1.2 RFC 5246'})
        </h2>

        <div className="space-y-4">
          {activeSteps.map((s, idx) => (
            <div
              key={s.step}
              onClick={() => setCurrentStep(idx)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                idx === currentStep
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{s.title}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-slate-500">{s.time}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    s.encrypted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {s.encrypted ? '🔒 ENCRYPTED' : '🔓 PLAINTEXT'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                {s.desc}
              </p>

              <div className="mt-2 p-2 rounded bg-slate-950 text-emerald-400 font-mono text-xs border border-slate-800 select-all">
                {s.payload}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate Chain Hierarchy Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>X.509 Public Key Infrastructure (PKI) Certificate Trust Chain</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">1. Root CA (Self-Signed)</span>
            <div className="font-bold text-xs text-slate-900 dark:text-white">ISRG Root X1</div>
            <div className="text-[11px] text-slate-500">Stored in Operating System / Browser Trust Store</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">2. Intermediate CA</span>
            <div className="font-bold text-xs text-slate-900 dark:text-white">R3 (Let's Encrypt Authority)</div>
            <div className="text-[11px] text-slate-500">Signed by Root CA to issue leaf certificates</div>
          </div>

          <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">3. Leaf / End-Entity Cert</span>
            <div className="font-bold text-xs text-slate-900 dark:text-white">CN=netsubnet.pro</div>
            <div className="text-[11px] text-slate-500">Contains Server RSA/ECDSA 256-bit Public Key & SANs</div>
          </div>
        </div>
      </div>
    </div>
  );
};
