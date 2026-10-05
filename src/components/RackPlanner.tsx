import React, { useState, useMemo } from 'react';
import { exportRackToPdf } from '../utils/pdfExport';
import { Server, HardDrive, Zap, Flame, Plus, Trash2, Download, Layers, ShieldCheck, FileText } from 'lucide-react';

export interface RackUnitItem {
  id: string;
  name: string;
  type: 'server-1u' | 'server-2u' | 'server-4u' | 'switch-1u' | 'patch-panel-1u' | 'ups-2u' | 'pdu-1u';
  startU: number;
  heightU: number;
  powerWatts: number;
  weightKg: number;
  ip: string;
  notes: string;
}

export const RackPlanner: React.FC = () => {
  const [totalRackU, setTotalRackU] = useState<number>(42);
  const [rackName, setRackName] = useState('Datacenter Rack 01 (Row A)');

  const [items, setItems] = useState<RackUnitItem[]>([
    { id: '1', name: 'Top-of-Rack Switch 1 (Cisco Nexus 9300)', type: 'switch-1u', startU: 42, heightU: 1, powerWatts: 350, weightKg: 8.5, ip: '10.254.0.1', notes: '48x 25G SFP28 + 6x 100G QSFP28' },
    { id: '2', name: 'Top-of-Rack Switch 2 (Cisco Nexus 9300)', type: 'switch-1u', startU: 41, heightU: 1, powerWatts: 350, weightKg: 8.5, ip: '10.254.0.2', notes: 'vPC Secondary Egress' },
    { id: '3', name: 'Cat6A 48-Port Patch Panel', type: 'patch-panel-1u', startU: 40, heightU: 1, powerWatts: 0, weightKg: 2.0, ip: 'N/A', notes: 'Structured Cabling Distribution' },
    { id: '4', name: 'App Hypervisor Node 01 (Dell PowerEdge R750)', type: 'server-2u', startU: 30, heightU: 2, powerWatts: 750, weightKg: 28.0, ip: '10.0.10.11', notes: '2x Xeon Gold, 512GB RAM' },
    { id: '5', name: 'App Hypervisor Node 02 (Dell PowerEdge R750)', type: 'server-2u', startU: 28, heightU: 2, powerWatts: 750, weightKg: 28.0, ip: '10.0.10.12', notes: '2x Xeon Gold, 512GB RAM' },
    { id: '6', name: 'SAN Storage Array (4U NetApp FAS8300)', type: 'server-4u', startU: 10, heightU: 4, powerWatts: 1200, weightKg: 65.0, ip: '10.0.20.10', notes: '24x 15.3TB NVMe SSD' },
    { id: '7', name: 'Smart UPS Battery Backup (APC Smart-UPS 3000VA)', type: 'ups-2u', startU: 1, heightU: 2, powerWatts: 150, weightKg: 42.0, ip: '10.254.0.50', notes: 'Redundant Power Delivery' }
  ]);

  const [selectedItemId, setSelectedItemId] = useState<string | null>('1');

  // Calculate totals
  const { totalWatts, totalAmps208V, totalBtu, totalWeightKg, occupiedU, utilizationPercent } = useMemo(() => {
    const watts = items.reduce((sum, item) => sum + item.powerWatts, 0);
    const weight = items.reduce((sum, item) => sum + item.weightKg, 0);
    const occU = items.reduce((sum, item) => sum + item.heightU, 0);
    const amps = parseFloat((watts / 208).toFixed(1));
    const btu = Math.round(watts * 3.412142);
    const util = Math.round((occU / totalRackU) * 100);

    return {
      totalWatts: watts,
      totalAmps208V: amps,
      totalBtu: btu,
      totalWeightKg: Math.round(weight),
      occupiedU: occU,
      utilizationPercent: util
    };
  }, [items, totalRackU]);

  const addDevice = (type: RackUnitItem['type'], heightU: number, defaultWatts: number) => {
    // Find highest available slot
    const newItem: RackUnitItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: `New ${heightU}U Device`,
      type,
      startU: 20,
      heightU,
      powerWatts: defaultWatts,
      weightKg: heightU * 12,
      ip: '10.0.10.100',
      notes: 'Standard mount'
    };
    setItems(prev => [...prev, newItem]);
    setSelectedItemId(newItem.id);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  const selectedItem = items.find(i => i.id === selectedItemId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Datacenter Server Rack Elevation & Power Planner</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Design 42U / 24U rack elevations, calculate power draw (Watts / Amps @ 208V), thermal load (BTU/hr), and weight capacity.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={totalRackU}
              onChange={(e) => setTotalRackU(parseInt(e.target.value, 10))}
              className="font-mono text-xs px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-lg dark:text-white font-bold"
            >
              <option value={42}>42U Standard Full Rack</option>
              <option value={48}>48U Tall Rack</option>
              <option value={24}>24U Half Rack</option>
              <option value={12}>12U Wall Mount</option>
            </select>

            <button
              onClick={() => {
                exportRackToPdf({
                  rackName,
                  totalU: totalRackU,
                  items,
                  stats: {
                    totalWatts,
                    totalAmps208V,
                    totalBtu,
                    totalWeightKg,
                    occupiedU,
                    utilizationPercent
                  }
                });
              }}
              className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
              title="Export rack elevation and power schedule to PDF"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Live Power & Capacity Metrics */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-500">Rack Space Utilization</div>
            <div className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-0.5">
              {occupiedU} / {totalRackU} U ({utilizationPercent}%)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-500">Power Consumption</div>
            <div className="text-xl font-bold text-amber-500 mt-0.5">
              {totalWatts.toLocaleString()} W ({totalAmps208V}A @ 208V)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-500">Thermal Output</div>
            <div className="text-xl font-bold text-rose-500 mt-0.5">
              {totalBtu.toLocaleString()} BTU/hr
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-500">Total Hardware Weight</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {totalWeightKg} kg (~{(totalWeightKg * 2.20462).toFixed(0)} lbs)
            </div>
          </div>
        </div>
      </div>

      {/* Rack Elevation & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual 42U Rack Elevation */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Physical Rack Elevation ({rackName})
            </h2>
            <div className="flex gap-1.5">
              <button
                onClick={() => addDevice('server-1u', 1, 350)}
                className="px-2 py-1 rounded text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 font-bold"
              >
                +1U Server
              </button>
              <button
                onClick={() => addDevice('server-2u', 2, 750)}
                className="px-2 py-1 rounded text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 font-bold"
              >
                +2U Server
              </button>
            </div>
          </div>

          {/* 42U Vertical Stack Display */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-[600px] overflow-y-auto space-y-1">
            {Array.from({ length: totalRackU }, (_, idx) => {
              const uNumber = totalRackU - idx;
              // Check if an item covers this U
              const occupyingItem = items.find(i => uNumber >= i.startU && uNumber < i.startU + i.heightU);
              const isStartOfItem = occupyingItem && occupyingItem.startU + occupyingItem.heightU - 1 === uNumber;
              const isSelected = occupyingItem && occupyingItem.id === selectedItemId;

              if (occupyingItem && !isStartOfItem) {
                return null; // Don't render redundant rows for multi-U devices
              }

              if (occupyingItem && isStartOfItem) {
                return (
                  <div
                    key={uNumber}
                    onClick={() => setSelectedItemId(occupyingItem.id)}
                    style={{ minHeight: `${occupyingItem.heightU * 32}px` }}
                    className={`rounded-lg border-2 p-2 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-teal-400 bg-teal-950/60 text-white shadow-md'
                        : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs font-bold text-slate-500 w-8">
                        {occupyingItem.heightU > 1 ? `U${occupyingItem.startU}-${occupyingItem.startU + occupyingItem.heightU - 1}` : `U${uNumber}`}
                      </span>
                      <div>
                        <div className="text-xs font-bold">{occupyingItem.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{occupyingItem.ip} • {occupyingItem.powerWatts}W</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-400">
                      {occupyingItem.heightU}U
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={uNumber}
                  className="h-7 rounded border border-dashed border-slate-800 bg-slate-950 flex items-center justify-between px-3 text-[10px] font-mono text-slate-600 hover:bg-slate-900/50 cursor-pointer"
                >
                  <span>U{uNumber}</span>
                  <span className="text-slate-700">Empty Slot</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Hardware Inspector */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <HardDrive className="h-4 w-4 text-teal-500" />
            <span>Mounted Equipment Details</span>
          </h2>

          {selectedItem ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Device Name / Model
                </label>
                <input
                  type="text"
                  value={selectedItem.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, name: val } : i));
                  }}
                  className="w-full font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Start Position (U)
                  </label>
                  <input
                    type="number"
                    value={selectedItem.startU}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 1;
                      setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, startU: val } : i));
                    }}
                    className="w-full font-mono text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Height (Units)
                  </label>
                  <input
                    type="number"
                    value={selectedItem.heightU}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 1;
                      setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, heightU: val } : i));
                    }}
                    className="w-full font-mono text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Power Draw (Watts)
                  </label>
                  <input
                    type="number"
                    value={selectedItem.powerWatts}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, powerWatts: val } : i));
                    }}
                    className="w-full font-mono text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={selectedItem.weightKg}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, weightKg: val } : i));
                    }}
                    className="w-full font-mono text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Management IP Address
                </label>
                <input
                  type="text"
                  value={selectedItem.ip}
                  onChange={(e) => {
                    const val = e.target.value;
                    setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, ip: val } : i));
                  }}
                  className="w-full font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => removeItem(selectedItem.id)}
                  className="w-full py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-semibold flex items-center justify-center space-x-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Unmount Device</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Click any rack unit in the elevation diagram to inspect electrical load and specifications.</p>
          )}
        </div>
      </div>
    </div>
  );
};
