import React, { useState, useEffect, useMemo } from 'react';
import { Network, ArrowRight, ArrowLeft, Play, Pause, RotateCcw, CheckCircle2, Shield, Info, Activity, AlertTriangle, Settings, RefreshCw } from 'lucide-react';

export interface HandshakeStep {
  id: number;
  stage: 'SYN' | 'SYN-ACK' | 'ACK' | 'DATA_REQ' | 'DATA_RESP' | 'FIN_CLIENT' | 'ACK_SERVER' | 'FIN_SERVER' | 'ACK_CLIENT';
  sender: string;
  receiver: string;
  direction: 'client-to-server' | 'server-to-client';
  flags: {
    SYN: boolean;
    ACK: boolean;
    FIN: boolean;
    RST: boolean;
    PSH: boolean;
    URG: boolean;
    ECE: boolean;
    CWR: boolean;
  };
  seq: number;
  ack: number;
  length: number;
  win: number;
  title: string;
  description: string;
  clientState: string;
  serverState: string;
  isRetransmission?: boolean;
}

export const TcpHandshakeVisualizer: React.FC = () => {
  const [clientIp, setClientIp] = useState('192.168.1.100');
  const [clientPort, setClientPort] = useState(54321);
  const [serverIp, setServerIp] = useState('93.184.216.34');
  const [serverPort, setServerPort] = useState(443);
  const [clientIsn, setClientIsn] = useState(1000);
  const [serverIsn, setServerIsn] = useState(5000);
  const [dataPayloadLen, setDataPayloadLen] = useState(250);
  const [windowSize, setWindowSize] = useState(65535);
  const [simulateLoss, setSimulateLoss] = useState(false);

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2000);

  // Dynamic step generator based on parameters
  const steps: HandshakeStep[] = useMemo(() => {
    const cEndpoint = `${clientIp}:${clientPort}`;
    const sEndpoint = `${serverIp}:${serverPort}`;

    const normalSteps: HandshakeStep[] = [
      {
        id: 1,
        stage: 'SYN',
        sender: `Client (${cEndpoint})`,
        receiver: `Server (${sEndpoint})`,
        direction: 'client-to-server',
        flags: { SYN: true, ACK: false, FIN: false, RST: false, PSH: false, URG: false, ECE: false, CWR: false },
        seq: clientIsn,
        ack: 0,
        length: 0,
        win: windowSize,
        title: 'Step 1: Connection Request (SYN)',
        description: `Client initiates TCP 3-way handshake with ISN_c = ${clientIsn}, Window = ${windowSize}, MSS = 1460 bytes.`,
        clientState: 'SYN_SENT',
        serverState: 'LISTEN'
      },
      {
        id: 2,
        stage: 'SYN-ACK',
        sender: `Server (${sEndpoint})`,
        receiver: `Client (${cEndpoint})`,
        direction: 'server-to-client',
        flags: { SYN: true, ACK: true, FIN: false, RST: false, PSH: false, URG: false, ECE: false, CWR: false },
        seq: serverIsn,
        ack: clientIsn + 1,
        length: 0,
        win: windowSize,
        title: 'Step 2: Server Acknowledgment & Sync (SYN-ACK)',
        description: `Server acknowledges client ISN (Ack = ${clientIsn + 1}) and transmits its own ISN_s = ${serverIsn}.`,
        clientState: 'SYN_SENT',
        serverState: 'SYN_RECEIVED'
      },
      {
        id: 3,
        stage: 'ACK',
        sender: `Client (${cEndpoint})`,
        receiver: `Server (${sEndpoint})`,
        direction: 'client-to-server',
        flags: { SYN: false, ACK: true, FIN: false, RST: false, PSH: false, URG: false, ECE: false, CWR: false },
        seq: clientIsn + 1,
        ack: serverIsn + 1,
        length: 0,
        win: windowSize,
        title: 'Step 3: Handshake Established (ACK)',
        description: `Client completes 3-way handshake (Ack = ${serverIsn + 1}). Sockets transition to ESTABLISHED on both peers.`,
        clientState: 'ESTABLISHED',
        serverState: 'ESTABLISHED'
      },
      {
        id: 4,
        stage: 'DATA_REQ',
        sender: `Client (${cEndpoint})`,
        receiver: `Server (${sEndpoint})`,
        direction: 'client-to-server',
        flags: { SYN: false, ACK: true, FIN: false, RST: false, PSH: true, URG: false, ECE: false, CWR: false },
        seq: clientIsn + 1,
        ack: serverIsn + 1,
        length: dataPayloadLen,
        win: windowSize,
        title: `Step 4: Application Data (HTTP/TLS GET Request - ${dataPayloadLen} Bytes)`,
        description: `Client transmits ${dataPayloadLen} bytes of HTTP/TLS payload. Seq = ${clientIsn + 1}, Next Expected Seq = ${clientIsn + 1 + dataPayloadLen}.`,
        clientState: 'ESTABLISHED',
        serverState: 'ESTABLISHED'
      }
    ];

    if (simulateLoss) {
      normalSteps.push({
        id: 5,
        stage: 'DATA_REQ',
        sender: `Client (${cEndpoint})`,
        receiver: `Server (${sEndpoint})`,
        direction: 'client-to-server',
        flags: { SYN: false, ACK: true, FIN: false, RST: false, PSH: true, URG: false, ECE: false, CWR: false },
        seq: clientIsn + 1,
        ack: serverIsn + 1,
        length: dataPayloadLen,
        win: windowSize,
        title: 'Step 5: Retransmission Timeout (RTO Triggered)',
        description: `Packet dropped in transit! Client RTO timer (200ms) expired. Client retransmits identical ${dataPayloadLen}-byte segment.`,
        clientState: 'ESTABLISHED (Retransmitting)',
        serverState: 'ESTABLISHED',
        isRetransmission: true
      });
    }

    const nextSeqC = clientIsn + 1 + dataPayloadLen;
    const respLen = 1200;

    normalSteps.push(
      {
        id: normalSteps.length + 1,
        stage: 'DATA_RESP',
        sender: `Server (${sEndpoint})`,
        receiver: `Client (${cEndpoint})`,
        direction: 'server-to-client',
        flags: { SYN: false, ACK: true, FIN: false, RST: false, PSH: true, URG: false, ECE: false, CWR: false },
        seq: serverIsn + 1,
        ack: nextSeqC,
        length: respLen,
        win: windowSize,
        title: `Step ${normalSteps.length + 1}: Server Data Response (${respLen} Bytes)`,
        description: `Server acknowledges client payload (Ack = ${nextSeqC}) and streams ${respLen} bytes of HTTP response.`,
        clientState: 'ESTABLISHED',
        serverState: 'ESTABLISHED'
      },
      {
        id: normalSteps.length + 1,
        stage: 'FIN_CLIENT',
        sender: `Client (${cEndpoint})`,
        receiver: `Server (${sEndpoint})`,
        direction: 'client-to-server',
        flags: { SYN: false, ACK: true, FIN: true, RST: false, PSH: false, URG: false, ECE: false, CWR: false },
        seq: nextSeqC,
        ack: serverIsn + 1 + respLen,
        length: 0,
        win: windowSize,
        title: `Step ${normalSteps.length + 1}: Client Connection Teardown (FIN)`,
        description: 'Client finishes transmission and sends FIN. Client socket enters FIN_WAIT_1.',
        clientState: 'FIN_WAIT_1',
        serverState: 'ESTABLISHED'
      },
      {
        id: normalSteps.length + 1,
        stage: 'ACK_SERVER',
        sender: `Server (${sEndpoint})`,
        receiver: `Client (${cEndpoint})`,
        direction: 'server-to-client',
        flags: { SYN: false, ACK: true, FIN: false, RST: false, PSH: false, URG: false, ECE: false, CWR: false },
        seq: serverIsn + 1 + respLen,
        ack: nextSeqC + 1,
        length: 0,
        win: windowSize,
        title: `Step ${normalSteps.length + 1}: Server Acknowledges FIN`,
        description: `Server confirms client FIN receipt (Ack = ${nextSeqC + 1}). Server enters CLOSE_WAIT.`,
        clientState: 'FIN_WAIT_2',
        serverState: 'CLOSE_WAIT'
      },
      {
        id: normalSteps.length + 1,
        stage: 'FIN_SERVER',
        sender: `Server (${sEndpoint})`,
        receiver: `Client (${cEndpoint})`,
        direction: 'server-to-client',
        flags: { SYN: false, ACK: true, FIN: true, RST: false, PSH: false, URG: false, ECE: false, CWR: false },
        seq: serverIsn + 1 + respLen,
        ack: nextSeqC + 1,
        length: 0,
        win: windowSize,
        title: `Step ${normalSteps.length + 1}: Server Closes Reverse Socket (FIN)`,
        description: 'Server finishes background cleanup and sends its own FIN flag. Server enters LAST_ACK.',
        clientState: 'TIME_WAIT',
        serverState: 'LAST_ACK'
      },
      {
        id: normalSteps.length + 1,
        stage: 'ACK_CLIENT',
        sender: `Client (${cEndpoint})`,
        receiver: `Server (${sEndpoint})`,
        direction: 'client-to-server',
        flags: { SYN: false, ACK: true, FIN: false, RST: false, PSH: false, URG: false, ECE: false, CWR: false },
        seq: nextSeqC + 1,
        ack: serverIsn + 1 + respLen + 1,
        length: 0,
        win: windowSize,
        title: `Step ${normalSteps.length + 1}: Final Teardown Complete (TIME_WAIT 2MSL)`,
        description: 'Client sends final ACK and begins 2MSL timer (typically 60s) to absorb lingering duplicate segments before CLOSED.',
        clientState: 'CLOSED (After 2MSL)',
        serverState: 'CLOSED'
      }
    );

    return normalSteps;
  }, [clientIp, clientPort, serverIp, serverPort, clientIsn, serverIsn, dataPayloadLen, windowSize, simulateLoss]);

  // Auto-play timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStepIdx(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps.length, playbackSpeed]);

  const currentStep = steps[currentStepIdx] || steps[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">TCP 3-Way Handshake & Teardown Simulator</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Interactive step-by-step visualization of Sequence/Ack math, TCP state machines, sliding windows, and loss recovery.
              </p>
            </div>
          </div>

          {/* Player controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setCurrentStepIdx(0); setIsPlaying(false); }}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 flex items-center space-x-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
            <button
              disabled={currentStepIdx === 0}
              onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 disabled:opacity-40 flex items-center space-x-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>
            <button
              onClick={() => setIsPlaying(prev => !prev)}
              className={`px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center space-x-1.5 ${
                isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              disabled={currentStepIdx === steps.length - 1}
              onClick={() => setCurrentStepIdx(prev => Math.min(steps.length - 1, prev + 1))}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-40 flex items-center space-x-1"
            >
              <span>Next</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Configurable Parameters Toolbar */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Client IP & Port</label>
            <div className="flex gap-1">
              <input
                type="text"
                value={clientIp}
                onChange={(e) => setClientIp(e.target.value)}
                className="w-2/3 px-2 py-1 bg-slate-50 dark:bg-slate-950 border rounded font-mono text-[11px] dark:text-white"
              />
              <input
                type="number"
                value={clientPort}
                onChange={(e) => setClientPort(parseInt(e.target.value, 10) || 54321)}
                className="w-1/3 px-1 py-1 bg-slate-50 dark:bg-slate-950 border rounded font-mono text-[11px] dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Server IP & Port</label>
            <div className="flex gap-1">
              <input
                type="text"
                value={serverIp}
                onChange={(e) => setServerIp(e.target.value)}
                className="w-2/3 px-2 py-1 bg-slate-50 dark:bg-slate-950 border rounded font-mono text-[11px] dark:text-white"
              />
              <input
                type="number"
                value={serverPort}
                onChange={(e) => setServerPort(parseInt(e.target.value, 10) || 443)}
                className="w-1/3 px-1 py-1 bg-slate-50 dark:bg-slate-950 border rounded font-mono text-[11px] dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Client ISN</label>
            <input
              type="number"
              value={clientIsn}
              onChange={(e) => setClientIsn(parseInt(e.target.value, 10) || 1000)}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border rounded font-mono text-[11px] dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Server ISN</label>
            <input
              type="number"
              value={serverIsn}
              onChange={(e) => setServerIsn(parseInt(e.target.value, 10) || 5000)}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border rounded font-mono text-[11px] dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Playback Speed</label>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseInt(e.target.value, 10))}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border rounded font-mono text-[11px] dark:text-white"
            >
              <option value={3000}>0.5x Slow</option>
              <option value={2000}>1.0x Normal</option>
              <option value={1000}>2.0x Fast</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-1.5 cursor-pointer pb-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
              <input
                type="checkbox"
                checked={simulateLoss}
                onChange={(e) => {
                  setSimulateLoss(e.target.checked);
                  setCurrentStepIdx(0);
                }}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Simulate Loss / RTO</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Dual-Endpoint Ladder Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step Ladder Timeline (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          {/* Dual Column Headers */}
          <div className="flex justify-between items-center px-4 py-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Client Endpoint</span>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{clientIp}:{clientPort}</span>
              <div className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                {currentStep.clientState}
              </div>
            </div>

            <div className="text-center font-mono text-xs font-bold text-slate-400">
              TCP Handshake Flow
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Server Endpoint</span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{serverIp}:{serverPort}</span>
              <div className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                {currentStep.serverState}
              </div>
            </div>
          </div>

          {/* Interactive Step Stack */}
          <div className="space-y-3 pt-2">
            {steps.map((st, idx) => {
              const isActive = idx === currentStepIdx;
              const isPast = idx < currentStepIdx;
              const isClientToServ = st.direction === 'client-to-server';

              return (
                <div
                  key={st.id}
                  onClick={() => setCurrentStepIdx(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-sm'
                      : isPast
                      ? 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100 bg-white dark:bg-slate-900'
                      : 'border-dashed border-slate-200 dark:border-slate-800 opacity-40 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                        isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {st.title}
                      </span>
                      {st.isRetransmission && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Retransmit</span>
                        </span>
                      )}
                    </div>

                    {/* Direction Arrow Badge */}
                    <div className={`flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      isClientToServ
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {isClientToServ ? (
                        <>
                          <span>Client</span>
                          <ArrowRight className="h-3 w-3" />
                          <span>Server</span>
                        </>
                      ) : (
                        <>
                          <span>Server</span>
                          <ArrowRight className="h-3 w-3" />
                          <span>Client</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Packet Sequence & Flags Math Bar */}
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono">
                    <div className="flex flex-wrap gap-2 text-slate-600 dark:text-slate-300">
                      <span><strong>Seq:</strong> {st.seq}</span>
                      <span><strong>Ack:</strong> {st.ack}</span>
                      <span><strong>Len:</strong> {st.length} B</span>
                      <span><strong>Win:</strong> {st.win}</span>
                    </div>

                    {/* Flags tags */}
                    <div className="flex gap-1">
                      {Object.entries(st.flags)
                        .filter(([_, val]) => val)
                        .map(([flag]) => (
                          <span
                            key={flag}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                              flag === 'SYN'
                                ? 'bg-indigo-600 text-white'
                                : flag === 'FIN'
                                ? 'bg-rose-600 text-white'
                                : flag === 'RST'
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {flag}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Packet Deep Inspection Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
              <Shield className="h-4 w-4 text-indigo-500" />
              <span>Active TCP Frame Inspector</span>
            </h2>

            <div className="p-3.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 space-y-2">
              <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                {currentStep.title}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* 8 TCP Control Bits Matrix */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                TCP Header Control Flags (8-Bit Vector)
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                {Object.entries(currentStep.flags).map(([flag, isSet]) => (
                  <div
                    key={flag}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                      isSet
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="text-[9px] opacity-80">{flag}</div>
                    <div className="text-sm">{isSet ? '1' : '0'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sequence Calculation Math */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Next Expected Sequence Math
              </span>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 font-mono space-y-1 text-slate-700 dark:text-slate-300">
                <div>Next Client Seq = {currentStep.direction === 'client-to-server' ? currentStep.seq + (currentStep.length || 1) : currentStep.ack}</div>
                <div>Next Server Ack = {currentStep.direction === 'client-to-server' ? currentStep.seq + (currentStep.length || 1) : currentStep.ack}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
