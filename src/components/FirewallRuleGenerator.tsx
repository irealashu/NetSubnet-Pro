import React, { useState, useMemo } from 'react';
import { generateFirewallRules, FirewallRuleParams } from '../utils/firewallRules';
import { Shield, Copy, Check, Terminal, Cloud, Server, Download, Layers } from 'lucide-react';

export const FirewallRuleGenerator: React.FC = () => {
  const [action, setAction] = useState<'ALLOW' | 'DENY'>('ALLOW');
  const [direction, setDirection] = useState<'INBOUND' | 'OUTBOUND'>('INBOUND');
  const [protocol, setProtocol] = useState<'TCP' | 'UDP' | 'ICMP' | 'ALL'>('TCP');
  const [srcIp, setSrcIp] = useState('198.51.100.0/24');
  const [srcPort, setSrcPort] = useState('any');
  const [dstIp, setDstIp] = useState('10.0.1.50');
  const [dstPort, setDstPort] = useState('443');
  const [ruleName, setRuleName] = useState('Allow-HTTPS-DMZ');
  const [priority, setPriority] = useState(100);
  const [description, setDescription] = useState('Permit inbound HTTPS traffic to DMZ reverse proxy cluster');

  const [activeVendorTab, setActiveVendorTab] = useState<'cisco' | 'iptables' | 'aws' | 'azure' | 'gcp' | 'fortinet' | 'juniper' | 'pfsense'>('cisco');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const params: FirewallRuleParams = {
    action,
    direction,
    protocol,
    srcIp,
    srcPort,
    dstIp,
    dstPort,
    ruleName,
    priority,
    description
  };

  const generated = useMemo(() => {
    return generateFirewallRules(params);
  }, [params]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentSnippet =
    activeVendorTab === 'cisco' ? generated.ciscoAcl :
    activeVendorTab === 'iptables' ? generated.iptables :
    activeVendorTab === 'aws' ? generated.awsTerraform :
    activeVendorTab === 'azure' ? generated.azureCli :
    activeVendorTab === 'gcp' ? generated.gcpCli :
    activeVendorTab === 'fortinet' ? generated.fortinet :
    activeVendorTab === 'juniper' ? generated.juniper :
    generated.pfSense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Multi-Vendor Firewall Rule & Security Policy Generator</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Convert abstract network security rules into Cisco IOS ACL, Linux iptables/nftables, AWS SG Terraform, Azure NSG, GCP, Fortinet, and Juniper syntax.
            </p>
          </div>
        </div>

        {/* Input Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Rule Name & Intent
            </label>
            <input
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="w-full font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Action & Direction
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                className="w-full font-mono text-xs px-2 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white font-bold text-emerald-600 dark:text-emerald-400"
              >
                <option value="ALLOW">ALLOW (Permit)</option>
                <option value="DENY">DENY (Drop)</option>
              </select>

              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                className="w-full font-mono text-xs px-2 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white"
              >
                <option value="INBOUND">Inbound (Ingress)</option>
                <option value="OUTBOUND">Outbound (Egress)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Protocol
            </label>
            <select
              value={protocol}
              onChange={(e) => setProtocol(e.target.value as any)}
              className="w-full font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white font-bold"
            >
              <option value="TCP">TCP (Transmission Control Protocol)</option>
              <option value="UDP">UDP (User Datagram Protocol)</option>
              <option value="ICMP">ICMP (Ping / Traceroute)</option>
              <option value="ALL">ALL (IP Protocol Any)</option>
            </select>
          </div>
        </div>

        {/* Source & Destination IP/Port Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Source IP / CIDR Block
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={srcIp}
                onChange={(e) => setSrcIp(e.target.value)}
                placeholder="0.0.0.0/0 or 192.168.1.0/24"
                className="flex-1 font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white"
              />
              <input
                type="text"
                value={srcPort}
                onChange={(e) => setSrcPort(e.target.value)}
                placeholder="Port (any)"
                className="w-24 font-mono text-xs px-2 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Destination IP / CIDR Block & Port
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={dstIp}
                onChange={(e) => setDstIp(e.target.value)}
                placeholder="10.0.1.50 or 0.0.0.0/0"
                className="flex-1 font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white font-bold text-rose-600 dark:text-rose-400"
              />
              <input
                type="text"
                value={dstPort}
                onChange={(e) => setDstPort(e.target.value)}
                placeholder="Port (e.g. 443)"
                className="w-24 font-mono text-xs px-2 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Output Tabs & Syntax Viewer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Vendor Selector Tabs */}
          <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 space-x-1">
            {[
              { id: 'cisco', label: 'Cisco IOS / ASA' },
              { id: 'iptables', label: 'Linux iptables/nft' },
              { id: 'aws', label: 'AWS SG (Terraform)' },
              { id: 'azure', label: 'Azure NSG (CLI)' },
              { id: 'gcp', label: 'GCP VPC (gcloud)' },
              { id: 'fortinet', label: 'Fortinet FortiOS' },
              { id: 'juniper', label: 'Juniper Junos' },
              { id: 'pfsense', label: 'pfSense XML' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveVendorTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-mono font-bold transition-colors border-b-2 -mb-px ${
                  activeVendorTab === tab.id
                    ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => copyToClipboard(currentSnippet, activeVendorTab)}
            className="text-xs px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center space-x-1.5 transition-colors self-end sm:self-auto"
          >
            {copiedKey === activeVendorTab ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedKey === activeVendorTab ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-lg bg-slate-950 text-rose-300 font-mono text-xs overflow-x-auto border border-slate-800 select-all min-h-[220px]">
          {currentSnippet}
        </pre>
      </div>
    </div>
  );
};
