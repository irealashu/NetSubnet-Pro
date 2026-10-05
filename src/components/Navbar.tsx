import React, { useState } from 'react';
import {
  Network,
  Globe,
  Calculator,
  Layers,
  Split,
  Route,
  GitMerge,
  Server,
  MailCheck,
  ShieldCheck,
  KeyRound,
  Binary,
  ShieldAlert,
  Shield,
  Activity,
  FileText,
  Compass,
  HardDrive,
  Terminal,
  TableProperties,
  Search,
  Moon,
  Sun,
  Lock,
  Cpu,
  ChevronDown
} from 'lucide-react';

export type ActiveTab =
  | 'ipv4'
  | 'ipv6'
  | 'cidr'
  | 'vlsm'
  | 'splitter'
  | 'range'
  | 'summarizer'
  | 'overlap'
  | 'matrix'
  | 'tcp'
  | 'tls'
  | 'dns-vis'
  | 'nat'
  | 'routing-table'
  | 'osi'
  | 'packet-decoder'
  | 'pcap'
  | 'packet-builder'
  | 'topology'
  | 'design-canvas'
  | 'rack'
  | 'vlan'
  | 'ospf'
  | 'bgp'
  | 'firewall'
  | 'dns-builder'
  | 'spf'
  | 'dmarc'
  | 'headers'
  | 'jwt'
  | 'sha256'
  | 'passwords'
  | 'configs';

export interface ToolItem {
  id: ActiveTab;
  label: string;
  category: 'IP & Subnetting' | 'Protocols & Sim' | 'Packet & Traffic' | 'Planning & Arch' | 'Security & Tools';
  icon: any;
  desc: string;
}

export const ALL_TOOLS: ToolItem[] = [
  // 1. IP & Subnetting
  { id: 'ipv4', label: 'IPv4 Calculator', category: 'IP & Subnetting', icon: Network, desc: 'Advanced CIDR subnetting, wildcard masks, binary octets' },
  { id: 'ipv6', label: 'IPv6 Calculator', category: 'IP & Subnetting', icon: Globe, desc: 'Full 128-bit IPv6 expansion, EUI-64, PTR reverse DNS' },
  { id: 'cidr', label: 'CIDR Calculator', category: 'IP & Subnetting', icon: Calculator, desc: 'Fast slash prefix aggregation & 32-bit allocation bar' },
  { id: 'vlsm', label: 'VLSM Calculator', category: 'IP & Subnetting', icon: Layers, desc: 'Variable length subnet masking with tree visualizer' },
  { id: 'splitter', label: 'Subnet Splitter', category: 'IP & Subnetting', icon: Split, desc: 'Carve major prefixes into equal smaller subnets' },
  { id: 'range', label: 'IP Range Finder', category: 'IP & Subnetting', icon: Route, desc: 'Convert Start/End IPs into minimal CIDR blocks' },
  { id: 'summarizer', label: 'Route Summarization', category: 'IP & Subnetting', icon: GitMerge, desc: 'Supernetting route table aggregation & reduction' },
  { id: 'overlap', label: 'Overlap Checker', category: 'IP & Subnetting', icon: ShieldAlert, desc: 'Detect subnet conflicts and VPC overlapping CIDRs' },
  { id: 'matrix', label: 'CIDR Reference', category: 'IP & Subnetting', icon: TableProperties, desc: 'Complete /0 to /32 quick reference matrix' },

  // 2. Protocols & Simulation
  { id: 'tcp', label: 'TCP Handshake Visualizer', category: 'Protocols & Sim', icon: Activity, desc: 'Interactive 3-way handshake & connection teardown' },
  { id: 'tls', label: 'TLS Visualizer', category: 'Protocols & Sim', icon: Lock, desc: 'TLS 1.2 vs 1.3 handshake, ECDHE keys & X.509 cert chain' },
  { id: 'dns-vis', label: 'DNS Visualizer', category: 'Protocols & Sim', icon: Globe, desc: 'Root to TLD to Authoritative recursive query flow' },
  { id: 'nat', label: 'NAT Simulator', category: 'Protocols & Sim', icon: Network, desc: 'SNAT, DNAT Port Forwarding & dynamic PAT table' },
  { id: 'routing-table', label: 'Routing Table Viewer', category: 'Protocols & Sim', icon: Route, desc: 'Longest Prefix Match (LPM) FIB/RIB lookup engine' },
  { id: 'osi', label: 'OSI Explorer', category: 'Protocols & Sim', icon: Layers, desc: '7-Layer interactive reference model & encapsulation' },

  // 3. Packet & Traffic
  { id: 'packet-decoder', label: 'Packet Decoder', category: 'Packet & Traffic', icon: Binary, desc: 'Dissect Ethernet, 802.1Q, IPv4/6 & TCP/UDP byte streams' },
  { id: 'pcap', label: 'PCAP Viewer', category: 'Packet & Traffic', icon: FileText, desc: 'Wireshark-style 3-pane packet capture dissector' },
  { id: 'packet-builder', label: 'Packet Builder', category: 'Packet & Traffic', icon: Terminal, desc: 'Craft raw byte frames with Scapy generator' },

  // 4. Planning & Architecture
  { id: 'topology', label: 'Topology Designer', category: 'Planning & Arch', icon: Network, desc: 'Interactive visual drag-and-drop network diagrammer' },
  { id: 'design-canvas', label: 'Design Canvas', category: 'Planning & Arch', icon: Compass, desc: 'VPC subnets, security boundaries & blueprint docs' },
  { id: 'rack', label: 'Rack Planner', category: 'Planning & Arch', icon: HardDrive, desc: '42U datacenter elevation, power watts & BTU heat' },
  { id: 'vlan', label: 'VLAN Planner', category: 'Planning & Arch', icon: Layers, desc: '802.1Q tag planner, SVI gateways & switchport scripts' },
  { id: 'ospf', label: 'OSPF Planner', category: 'Planning & Arch', icon: Route, desc: 'Interface metric auto-cost, LSA matrix & multi-area' },
  { id: 'bgp', label: 'BGP Tools', category: 'Planning & Arch', icon: Globe, desc: 'AS-Path decision algorithm & neighbor route-maps' },

  // 5. Security & Tools
  { id: 'firewall', label: 'Firewall Rule Generator', category: 'Security & Tools', icon: Shield, desc: 'Cisco ACL, iptables, AWS SG, Azure NSG & GCP rules' },
  { id: 'dns-builder', label: 'DNS Record Builder', category: 'Security & Tools', icon: Server, desc: 'RFC 1035 BIND zone file builder for A, MX, CAA, SRV' },
  { id: 'spf', label: 'SPF Generator', category: 'Security & Tools', icon: MailCheck, desc: 'v=spf1 record generator with RFC 7208 lookup validator' },
  { id: 'dmarc', label: 'DMARC Generator', category: 'Security & Tools', icon: ShieldCheck, desc: 'v=DMARC1 policy generator with RUA/RUF reporting' },
  { id: 'headers', label: 'Header Analyzer', category: 'Security & Tools', icon: Shield, desc: 'HSTS, CSP, X-Frame security score & Nginx/Caddy' },
  { id: 'jwt', label: 'JWT Decoder', category: 'Security & Tools', icon: ShieldAlert, desc: 'Inspect header, payload claims & expiration status' },
  { id: 'sha256', label: 'SHA256 Generator', category: 'Security & Tools', icon: Binary, desc: 'SHA-256, SHA-512, MD5 firmware checksum comparator' },
  { id: 'passwords', label: 'Password Generator', category: 'Security & Tools', icon: KeyRound, desc: 'High-entropy passwords & Cisco Type 7 cipher' },
  { id: 'configs', label: 'Device Configs', category: 'Security & Tools', icon: Terminal, desc: 'Cisco IOS, Juniper Junos, Linux & MikroTik scripts' }
];

const CATEGORIES = [
  'All Tools',
  'IP & Subnetting',
  'Protocols & Sim',
  'Packet & Traffic',
  'Planning & Arch',
  'Security & Tools'
] as const;

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Tools');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredTools = ALL_TOOLS.filter((t) => {
    const matchesCategory = selectedCategory === 'All Tools' || t.category === selectedCategory;
    const matchesQuery =
      t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const currentTool = ALL_TOOLS.find((t) => t.id === activeTab) || ALL_TOOLS[0];

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Product Badge */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="h-9 w-9 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  Netvok
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  Tools
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Enterprise Network Engineering & Protocol Suite
              </p>
            </div>
          </div>

          {/* Quick Search / Command Palette Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quick search 30 tools (e.g. IPv6, BGP, TCP, DMARC, PCAP)..."
                className="w-full text-xs pl-9 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Controls & Theme Switch */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Category Filter Pills & Search Results Row */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-2.5 border-t border-slate-100 dark:border-slate-800/80 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Horizontal Quick Tool Bar */}
        <div className="flex overflow-x-auto pb-2 space-x-1 scrollbar-none">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTab === tool.id;
            return (
              <button
                key={tool.id}
                id={`nav-tab-${tool.id}`}
                onClick={() => setActiveTab(tool.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
