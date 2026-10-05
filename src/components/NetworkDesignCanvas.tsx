import React, { useState } from 'react';
import { Cloud, Server, Shield, Laptop, Network, Plus, Trash2, Download, Layers, ShieldCheck, Compass } from 'lucide-react';

export interface CanvasSubnetZone {
  id: string;
  name: string;
  cidr: string;
  env: 'Production' | 'Staging' | 'DMZ' | 'Management' | 'Cloud VPC';
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  devices: string[];
}

export const NetworkDesignCanvas: React.FC = () => {
  const [zones, setZones] = useState<CanvasSubnetZone[]>([
    {
      id: 'z1',
      name: 'Public DMZ Perimeter',
      cidr: '198.51.100.0/24',
      env: 'DMZ',
      color: 'border-rose-500 bg-rose-950/20 text-rose-400',
      x: 30,
      y: 30,
      width: 280,
      height: 200,
      devices: ['WAF Appliance (198.51.100.2)', 'Nginx Reverse Proxy (198.51.100.10)', 'External Bastion (198.51.100.25)']
    },
    {
      id: 'z2',
      name: 'Application Core VPC',
      cidr: '10.0.10.0/24',
      env: 'Production',
      color: 'border-blue-500 bg-blue-950/20 text-blue-400',
      x: 340,
      y: 30,
      width: 280,
      height: 200,
      devices: ['API Gateway Pods (10.0.10.20)', 'Microservice Cluster (10.0.10.50-80)', 'Redis Cache Cluster']
    },
    {
      id: 'z3',
      name: 'Secure Database Subnet',
      cidr: '10.0.20.0/24',
      env: 'Production',
      color: 'border-emerald-500 bg-emerald-950/20 text-emerald-400',
      x: 650,
      y: 30,
      width: 280,
      height: 200,
      devices: ['PostgreSQL Primary (10.0.20.5)', 'PostgreSQL Read Replica (10.0.20.6)', 'Vault HSM Key Store']
    },
    {
      id: 'z4',
      name: 'Out-of-Band Management (OOBM)',
      cidr: '10.254.0.0/24',
      env: 'Management',
      color: 'border-amber-500 bg-amber-950/20 text-amber-400',
      x: 340,
      y: 260,
      width: 280,
      height: 180,
      devices: ['Cisco Nexus Core (10.254.0.1)', 'PDU & UPS SNMP Monitor', 'IPMI / iLO Console Server']
    }
  ]);

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>('z2');
  const [newDeviceName, setNewDeviceName] = useState('');

  const addDeviceToSelected = () => {
    if (!selectedZoneId || !newDeviceName.trim()) return;
    setZones(prev => prev.map(z => z.id === selectedZoneId ? { ...z, devices: [...z.devices, newDeviceName.trim()] } : z));
    setNewDeviceName('');
  };

  const selectedZone = zones.find(z => z.id === selectedZoneId);

  const downloadArchitectureDoc = () => {
    let doc = `# Enterprise Network Architecture & Security Zones Blueprint\n\n`;
    for (const z of zones) {
      doc += `## ${z.name} (${z.cidr})\n`;
      doc += `- **Environment Zone**: ${z.env}\n`;
      doc += `- **Assigned Assets**:\n`;
      for (const d of z.devices) {
        doc += `  - ${d}\n`;
      }
      doc += `\n`;
    }
    const blob = new Blob([doc], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'network_architecture_blueprint.md';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Network Design Canvas & Security Zone Blueprint</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Architectural segmentation board for cloud VPCs, on-prem security boundaries, micro-segmentation, and asset documentation.
              </p>
            </div>
          </div>

          <button
            onClick={downloadArchitectureDoc}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Architecture Doc</span>
          </button>
        </div>
      </div>

      {/* Interactive Blueprint Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm min-h-[500px] relative overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.map((zone) => {
              const isSelected = zone.id === selectedZoneId;
              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/30 shadow-lg scale-[1.01]'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {zone.env}
                      </span>
                      <h3 className="font-bold text-sm text-white mt-1">{zone.name}</h3>
                    </div>
                    <span className="font-mono text-xs font-bold text-indigo-400">{zone.cidr}</span>
                  </div>

                  {/* Devices inside zone */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Encapsulated Assets ({zone.devices.length}):</span>
                    {zone.devices.map((d, i) => (
                      <div key={i} className="p-1.5 rounded bg-slate-950 text-xs font-mono text-slate-300 border border-slate-800/60 flex items-center space-x-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                        <span className="truncate">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone Inspector & Asset Manager */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <Layers className="h-4 w-4 text-indigo-500" />
            <span>Zone Inspector & Asset Allocator</span>
          </h2>

          {selectedZone ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  value={selectedZone.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setZones(prev => prev.map(z => z.id === selectedZone.id ? { ...z, name: val } : z));
                  }}
                  className="w-full font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Subnet CIDR Block
                </label>
                <input
                  type="text"
                  value={selectedZone.cidr}
                  onChange={(e) => {
                    const val = e.target.value;
                    setZones(prev => prev.map(z => z.id === selectedZone.id ? { ...z, cidr: val } : z));
                  }}
                  className="w-full font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white font-bold text-indigo-600 dark:text-indigo-400"
                />
              </div>

              {/* Add Device */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Add Asset / Virtual Machine
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    placeholder="e.g. K8s Worker Node (10.0.10.85)"
                    className="flex-1 font-mono text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded dark:text-white"
                  />
                  <button
                    onClick={addDeviceToSelected}
                    className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Asset List */}
              <div className="space-y-1.5">
                {selectedZone.devices.map((d, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-950 text-xs font-mono">
                    <span className="truncate">{d}</span>
                    <button
                      onClick={() => setZones(prev => prev.map(z => z.id === selectedZone.id ? { ...z, devices: z.devices.filter((_, idx) => idx !== i) } : z))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Select a zone on the canvas to configure parameters and assets.</p>
          )}
        </div>
      </div>
    </div>
  );
};
