import React, { useState } from 'react';
import { Network, ArrowRight, ArrowLeft, Play, RotateCcw, CheckCircle2, Shield, Info, Activity } from 'lucide-react';

export interface HandshakeStep {
  id: number;
  stage: 'SYN' | 'SYN-ACK' | 'ACK' | 'DATA_REQ' | 'DATA_RESP' | 'FIN_CLIENT' | 'ACK_SERVER' | 'FIN_SERVER' | 'ACK_CLIENT';
  sender: 'Client (192.168.1.100:54321)' | 'Server (93.184.216.34:443)';
  direction: 'client-to-server' | 'server-to-client';
  flags: string;
  seq: number;
  ack: number;
  length: number;
  title: string;
  description: string;
  clientState: string;
  serverState: string;
}

export const TcpHandshakeVisualizer: React.FC = () => {
  const steps: HandshakeStep[] = [
    {
      id: 1,
      stage: 'SYN',
      sender: 'Client (192.168.1.100:54321)',
      direction: 'client-to-server',
      flags: 'SYN',
      seq: 1000,
      ack: 0,
      length: 0,
      title: 'Step 1: Connection Request (SYN)',
      description: 'Client chooses initial sequence number (ISN_c = 1000) and sends SYN packet to initiate TCP 3-way handshake.',
      clientState: 'SYN_SENT',
      serverState: 'LISTEN'
    },
    {
      id: 2,
      stage: 'SYN-ACK',
      sender: 'Server (93.184.216.34:443)',
      direction: 'server-to-client',
      flags: 'SYN, ACK',
      seq: 5000,
      ack: 1001,
      length: 0,
      title: 'Step 2: Server Acknowledgment & Sync (SYN-ACK)',
      description: 'Server allocates buffers, chooses ISN_s = 5000, and acknowledges client ISN (Ack = 1000 + 1 = 1001).',
      clientState: 'SYN_SENT',
      serverState: 'SYN_RECEIVED'
    },
    {
      id: 3,
      stage: 'ACK',
      sender: 'Client (192.168.1.100:54321)',
      direction: 'client-to-server',
      flags: 'ACK',
      seq: 1001,
      ack: 5001,
      length: 0,
      title: 'Step 3: Handshake Complete (ACK)',
      description: 'Client acknowledges server ISN (Ack = 5000 + 1 = 5001). Connection is now fully ESTABLISHED on both endpoints.',
      clientState: 'ESTABLISHED',
      serverState: 'ESTABLISHED'
    },
    {
      id: 4,
      stage: 'DATA_REQ',
      sender: 'Client (192.168.1.100:54321)',
      direction: 'client-to-server',
      flags: 'PSH, ACK',
      seq: 1001,
      ack: 5001,
      length: 250,
      title: 'Step 4: Data Transmission (HTTP GET Request)',
      description: 'Client pushes 250 bytes of HTTP request payload. Seq remains 1001.',
      clientState: 'ESTABLISHED',
      serverState: 'ESTABLISHED'
    },
    {
      id: 5,
      stage: 'DATA_RESP',
      sender: 'Server (93.184.216.34:443)',
      direction: 'server-to-client',
      flags: 'PSH, ACK',
      seq: 5001,
      ack: 1251,
      length: 1200,
      title: 'Step 5: Server Data Response & Ack',
      description: 'Server acknowledges 250 bytes received (Ack = 1001 + 250 = 1251) and sends 1200 bytes of response data.',
      clientState: 'ESTABLISHED',
      serverState: 'ESTABLISHED'
    },
    {
      id: 6,
      stage: 'FIN_CLIENT',
      sender: 'Client (192.168.1.100:54321)',
      direction: 'client-to-server',
      flags: 'FIN, ACK',
      seq: 1251,
      ack: 6201,
      length: 0,
      title: 'Step 6: Connection Termination Initiation (FIN)',
      description: 'Client indicates it has no more data to transmit and sends FIN flag.',
      clientState: 'FIN_WAIT_1',
      serverState: 'ESTABLISHED'
    },
    {
      id: 7,
      stage: 'ACK_SERVER',
      sender: 'Server (93.184.216.34:443)',
      direction: 'server-to-client',
      flags: 'ACK',
      seq: 6201,
      ack: 1252,
      length: 0,
      title: 'Step 7: Server Acknowledges Termination',
      description: 'Server confirms FIN receipt (Ack = 1251 + 1 = 1252). Server enters CLOSE_WAIT.',
      clientState: 'FIN_WAIT_2',
      serverState: 'CLOSE_WAIT'
    },
    {
      id: 8,
      stage: 'FIN_SERVER',
      sender: 'Server (93.184.216.34:443)',
      direction: 'server-to-client',
      flags: 'FIN, ACK',
      seq: 6201,
      ack: 1252,
      length: 0,
      title: 'Step 8: Server Connection Close (FIN)',
      description: 'Server sends its own FIN to close the reverse direction of the socket.',
      clientState: 'TIME_WAIT',
      serverState: 'LAST_ACK'
    },
    {
      id: 9,
      stage: 'ACK_CLIENT',
      sender: 'Client (192.168.1.100:54321)',
      direction: 'client-to-server',
      flags: 'ACK',
      seq: 1252,
      ack: 6202,
      length: 0,
      title: 'Step 9: Final Connection Closed (2MSL Timer)',
      description: 'Client sends final ACK and enters TIME_WAIT state (typically 2 * Maximum Segment Lifetime = 60s - 120s) to absorb delayed packets.',
      clientState: 'CLOSED',
      serverState: 'CLOSED'
    }
  ];

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const currentStep = steps[currentStepIdx];

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
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">TCP 3-Way Handshake & Connection Teardown Simulator</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Interactive step-by-step visualization of TCP Sequence, Acknowledgment numbers, state machines, and sliding windows.
              </p>
            </div>
          </div>

          {/* Player controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentStepIdx(0)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 flex items-center space-x-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
            <button
              disabled={currentStepIdx === 0}
              onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={currentStepIdx === steps.length - 1}
              onClick={() => setCurrentStepIdx(prev => Math.min(steps.length - 1, prev + 1))}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-50 flex items-center space-x-1"
            >
              <span>Next Step ({currentStepIdx + 1}/{steps.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* State Machine Status Header */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Client Endpoint (192.168.1.100:54321)</div>
            <div className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              State: {currentStep.clientState}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Server Endpoint (93.184.216.34:443)</div>
            <div className="font-mono text-base font-bold text-blue-600 dark:text-blue-400 mt-1">
              State: {currentStep.serverState}
            </div>
          </div>
        </div>
      </div>

      {/* Ladder Diagram Visualizer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          TCP Flow Ladder Diagram (Time-Sequence)
        </h2>

        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isCurrent = idx === currentStepIdx;
            const isPast = idx < currentStepIdx;

            return (
              <div
                key={step.id}
                onClick={() => setCurrentStepIdx(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-sm'
                    : isPast
                    ? 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/60 opacity-40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center ${
                      isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {step.id}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{step.title}</span>
                  </div>

                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold">
                      [{step.flags}]
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">Seq={step.seq}</span>
                    <span className="text-slate-600 dark:text-slate-300">Ack={step.ack}</span>
                    {step.length > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400">Len={step.length}B</span>
                    )}
                  </div>
                </div>

                {/* Packet Direction Flow Arrow */}
                <div className="my-2 py-1 px-3 bg-slate-100 dark:bg-slate-950/60 rounded flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
                  <span>Client</span>
                  <div className="flex-1 mx-4 flex items-center justify-center">
                    {step.direction === 'client-to-server' ? (
                      <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold">
                        <span className="border-t border-dashed border-indigo-400 w-24"></span>
                        <span>━━━━━▶</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold">
                        <span>◀━━━━━</span>
                        <span className="border-t border-dashed border-blue-400 w-24"></span>
                      </div>
                    )}
                  </div>
                  <span>Server</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
