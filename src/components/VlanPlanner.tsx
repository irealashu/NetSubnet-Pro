import React, { useState } from 'react';
import { Layers, Plus, Trash2, Copy, Check, Terminal, Table, Download, ShieldCheck } from 'lucide-react';

export interface VlanItem {
  id: string;
  vlanId: number;
  name: string;
  subnet: string;
  gateway: string;
  dhcpPool: string;
  ports: string;
  isVoice: boolean;
}

export const VlanPlanner: React.FC = () => {
  const [vlans, setVlans] = useState<VlanItem[]>([
    { id: '1', vlanId: 10, name: 'MGMT-INFRA', subnet: '10.0.10.0/24', gateway: '10.0.10.1', dhcpPool: '10.0.10.50 - 10.0.10.200', ports: 'Gi1/0/1 - Gi1/0/4', isVoice: false },
    { id: '2', vlanId: 20, name: 'CORP-USERS', subnet: '10.0.20.0/24', gateway: '10.0.20.1', dhcpPool: '10.0.20.50 - 10.0.20.250', ports: 'Gi1/0/5 - Gi1/0/24', isVoice: false },
    { id: '3', vlanId: 30, name: 'VOIP-PHONES', subnet: '10.0.30.0/24', gateway: '10.0.30.1', dhcpPool: '10.0.30.50 - 10.0.30.250', ports: 'Tagged on all access', isVoice: true },
    { id: '4', vlanId: 40, name: 'GUEST-WIFI', subnet: '172.16.40.0/23', gateway: '172.16.40.1', dhcpPool: '172.16.40.10 - 172.16.41.250', ports: 'Gi1/0/45 - Gi1/0/48 (AP)', isVoice: false },
    { id: '5', vlanId: 99, name: 'DMZ-PUBLIC', subnet: '192.168.99.0/24', gateway: '192.168.99.1', dhcpPool: 'Disabled (Static Only)', ports: 'Gi1/0/25 - Gi1/0/30', isVoice: false }
  ]);

  const [newVlanId, setNewVlanId] = useState<number>(50);
  const [newName, setNewName] = useState('IOT-DEVICES');
  const [newSubnet, setNewSubnet] = useState('10.0.50.0/24');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const addVlan = () => {
    const item: VlanItem = {
      id: Math.random().toString(36).substring(2, 9),
      vlanId: newVlanId,
      name: newName.toUpperCase().replace(/\s+/g, '-'),
      subnet: newSubnet,
      gateway: newSubnet.replace(/\.0\/.*$/, '.1'),
      dhcpPool: `${newSubnet.replace(/\.0\/.*$/, '.50')} - ${newSubnet.replace(/\.0\/.*$/, '.250')}`,
      ports: 'Gi1/0/31 - Gi1/0/40',
      isVoice: false
    };
    setVlans(prev => [...prev, item]);
    setNewVlanId(prev => prev + 10);
  };

  const removeVlan = (id: string) => {
    setVlans(prev => prev.filter(v => v.id !== id));
  };

  // Cisco IOS Switchport Configuration
  const ciscoSwitchConfig = `! Cisco IOS Switchport VLAN Configuration
! 1. Create VLAN database entries
${vlans.map(v => `vlan ${v.vlanId}\n name ${v.name}`).join('\n')}\n!
! 2. SVI Routing Gateways (Core / Layer 3 Switch)
${vlans.map(v => `interface Vlan${v.vlanId}\n description Gateway for ${v.name}\n ip address ${v.gateway} 255.255.255.0\n no shutdown`).join('\n')}\n!
! 3. 802.1Q Trunk Port Uplink
interface GigabitEthernet1/0/48
 description UPLINK-TO-CORE
 switchport mode trunk
 switchport trunk native vlan 999
 switchport trunk allowed vlan ${vlans.map(v => v.vlanId).join(',')}`;

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
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">IEEE 802.1Q VLAN Architecture & Subnet Planner</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Plan enterprise VLAN IDs (1-4094), gateway SVIs, DHCP scopes, access vs trunk ports, and Cisco switchport script generation.
            </p>
          </div>
        </div>

        {/* Add VLAN inline form */}
        <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 items-end">
          <div className="w-24">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">VLAN ID</label>
            <input
              type="number"
              value={newVlanId}
              onChange={(e) => setNewVlanId(parseInt(e.target.value, 10) || 1)}
              className="w-full font-mono text-xs px-2.5 py-2 bg-white dark:bg-slate-900 border rounded-lg dark:text-white"
            />
          </div>

          <div className="flex-1 min-w-[160px]">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">VLAN Name / Purpose</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full font-mono text-xs px-2.5 py-2 bg-white dark:bg-slate-900 border rounded-lg dark:text-white uppercase font-bold"
            />
          </div>

          <div className="flex-1 min-w-[160px]">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subnet CIDR</label>
            <input
              type="text"
              value={newSubnet}
              onChange={(e) => setNewSubnet(e.target.value)}
              className="w-full font-mono text-xs px-2.5 py-2 bg-white dark:bg-slate-900 border rounded-lg dark:text-white"
            />
          </div>

          <button
            onClick={addVlan}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add VLAN</span>
          </button>
        </div>
      </div>

      {/* VLAN Allocation Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
          <Table className="h-4 w-4 text-indigo-500" />
          <span>Configured Virtual LAN Matrix ({vlans.length} VLANs)</span>
        </h2>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-2.5">VLAN ID</th>
                <th className="p-2.5">Name</th>
                <th className="p-2.5">Subnet</th>
                <th className="p-2.5">SVI Gateway</th>
                <th className="p-2.5">DHCP Scope</th>
                <th className="p-2.5">Switchports</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {vlans.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">VLAN {v.vlanId}</td>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">{v.name}</td>
                  <td className="p-2.5">{v.subnet}</td>
                  <td className="p-2.5 font-semibold text-emerald-600 dark:text-emerald-400">{v.gateway}</td>
                  <td className="p-2.5 text-slate-500">{v.dhcpPool}</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-300">{v.ports}</td>
                  <td className="p-2.5 text-center">
                    <button onClick={() => removeVlan(v.id)} className="text-slate-400 hover:text-rose-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cisco Switch Configuration Output */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-indigo-500" />
            <span>Cisco Catalyst / Nexus Switchport Configuration</span>
          </h2>
          <button
            onClick={() => copyToClipboard(ciscoSwitchConfig, 'vlan')}
            className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1 font-mono"
          >
            {copiedKey === 'vlan' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy Script</span>
          </button>
        </div>
        <pre className="p-4 bg-slate-950 text-indigo-300 font-mono text-xs rounded-lg border border-slate-800 select-all overflow-x-auto min-h-[220px]">
          {ciscoSwitchConfig}
        </pre>
      </div>
    </div>
  );
};
