import React, { useState, useEffect, useMemo } from 'react';
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
  Lock,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Pin,
  PinOff,
  Sparkles,
  Command,
  X
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
  badge?: string;
  desc: string;
}

export const ALL_TOOLS: ToolItem[] = [
  // 1. IP & Subnetting
  { id: 'ipv4', label: 'IPv4 Calculator', category: 'IP & Subnetting', icon: Network, desc: 'Advanced CIDR subnetting, wildcard masks, binary octets' },
  { id: 'ipv6', label: 'IPv6 Calculator', category: 'IP & Subnetting', icon: Globe, badge: '128-bit', desc: 'Full 128-bit IPv6 expansion, EUI-64, PTR reverse DNS' },
  { id: 'cidr', label: 'CIDR Calculator', category: 'IP & Subnetting', icon: Calculator, desc: 'Fast slash prefix aggregation & 32-bit allocation bar' },
  { id: 'vlsm', label: 'VLSM Calculator', category: 'IP & Subnetting', icon: Layers, desc: 'Variable length subnet masking with tree visualizer' },
  { id: 'splitter', label: 'Subnet Splitter', category: 'IP & Subnetting', icon: Split, desc: 'Carve major prefixes into equal smaller subnets' },
  { id: 'range', label: 'IP Range Finder', category: 'IP & Subnetting', icon: Route, desc: 'Convert Start/End IPs into minimal CIDR blocks' },
  { id: 'summarizer', label: 'Route Summarization', category: 'IP & Subnetting', icon: GitMerge, desc: 'Supernetting route table aggregation & reduction' },
  { id: 'overlap', label: 'Overlap Checker', category: 'IP & Subnetting', icon: ShieldAlert, desc: 'Detect subnet conflicts and VPC overlapping CIDRs' },
  { id: 'matrix', label: 'CIDR Reference', category: 'IP & Subnetting', icon: TableProperties, desc: 'Complete /0 to /32 quick reference matrix' },

  // 2. Protocols & Simulation
  { id: 'tcp', label: 'TCP Handshake Visualizer', category: 'Protocols & Sim', icon: Activity, badge: 'Interactive', desc: 'Interactive 3-way handshake & connection teardown' },
  { id: 'tls', label: 'TLS Visualizer', category: 'Protocols & Sim', icon: Lock, badge: 'v1.3', desc: 'TLS 1.2 vs 1.3 handshake, ECDHE keys & X.509 cert chain' },
  { id: 'dns-vis', label: 'DNS Visualizer', category: 'Protocols & Sim', icon: Globe, desc: 'Root to TLD to Authoritative recursive query flow' },
  { id: 'nat', label: 'NAT Simulator', category: 'Protocols & Sim', icon: Network, badge: 'PAT', desc: 'SNAT, DNAT Port Forwarding & dynamic PAT table' },
  { id: 'routing-table', label: 'Routing Table Viewer', category: 'Protocols & Sim', icon: Route, badge: 'LPM', desc: 'Longest Prefix Match (LPM) FIB/RIB lookup engine' },
  { id: 'osi', label: 'OSI Explorer', category: 'Protocols & Sim', icon: Layers, badge: '7-Layer', desc: '7-Layer interactive reference model & encapsulation' },

  // 3. Packet & Traffic
  { id: 'packet-decoder', label: 'Packet Decoder', category: 'Packet & Traffic', icon: Binary, desc: 'Dissect Ethernet, 802.1Q, IPv4/6 & TCP/UDP byte streams' },
  { id: 'pcap', label: 'PCAP Viewer', category: 'Packet & Traffic', icon: FileText, badge: 'Wireshark', desc: 'Wireshark-style 3-pane packet capture dissector' },
  { id: 'packet-builder', label: 'Packet Builder', category: 'Packet & Traffic', icon: Terminal, badge: 'Scapy', desc: 'Craft raw byte frames with Scapy generator' },

  // 4. Planning & Architecture
  { id: 'topology', label: 'Topology Designer', category: 'Planning & Arch', icon: Network, badge: 'Canvas', desc: 'Interactive visual drag-and-drop network diagrammer' },
  { id: 'design-canvas', label: 'Design Canvas', category: 'Planning & Arch', icon: Compass, desc: 'VPC subnets, security boundaries & blueprint docs' },
  { id: 'rack', label: 'Rack Planner', category: 'Planning & Arch', icon: HardDrive, badge: '42U', desc: '42U datacenter elevation, power watts & BTU heat' },
  { id: 'vlan', label: 'VLAN Planner', category: 'Planning & Arch', icon: Layers, badge: '802.1Q', desc: '802.1Q tag planner, SVI gateways & switchport scripts' },
  { id: 'ospf', label: 'OSPF Planner', category: 'Planning & Arch', icon: Route, desc: 'Interface metric auto-cost, LSA matrix & multi-area' },
  { id: 'bgp', label: 'BGP Tools', category: 'Planning & Arch', icon: Globe, badge: 'BGP4', desc: 'AS-Path decision algorithm & neighbor route-maps' },

  // 5. Security & Tools
  { id: 'firewall', label: 'Firewall Rule Generator', category: 'Security & Tools', icon: Shield, badge: 'Multi-Vendor', desc: 'Cisco ACL, iptables, AWS SG, Azure NSG & GCP rules' },
  { id: 'dns-builder', label: 'DNS Record Builder', category: 'Security & Tools', icon: Server, badge: 'BIND', desc: 'RFC 1035 BIND zone file builder for A, MX, CAA, SRV' },
  { id: 'spf', label: 'SPF Generator', category: 'Security & Tools', icon: MailCheck, desc: 'v=spf1 record generator with RFC 7208 lookup validator' },
  { id: 'dmarc', label: 'DMARC Generator', category: 'Security & Tools', icon: ShieldCheck, desc: 'v=DMARC1 policy generator with RUA/RUF reporting' },
  { id: 'headers', label: 'Header Analyzer', category: 'Security & Tools', icon: Shield, badge: 'A+ Score', desc: 'HSTS, CSP, X-Frame security score & Nginx/Caddy' },
  { id: 'jwt', label: 'JWT Decoder', category: 'Security & Tools', icon: ShieldAlert, desc: 'Inspect header, payload claims & expiration status' },
  { id: 'sha256', label: 'SHA256 Generator', category: 'Security & Tools', icon: Binary, desc: 'SHA-256, SHA-512, MD5 firmware checksum comparator' },
  { id: 'passwords', label: 'Password Generator', category: 'Security & Tools', icon: KeyRound, badge: 'Type 7', desc: 'High-entropy passwords & Cisco Type 7 cipher' },
  { id: 'configs', label: 'Device Configs', category: 'Security & Tools', icon: Terminal, desc: 'Cisco IOS, Juniper Junos, Linux & MikroTik scripts' }
];

export const CATEGORY_GROUPS = [
  { name: 'IP & Subnetting', icon: Network, color: 'text-blue-500' },
  { name: 'Protocols & Sim', icon: Activity, color: 'text-indigo-500' },
  { name: 'Packet & Traffic', icon: Binary, color: 'text-emerald-500' },
  { name: 'Planning & Arch', icon: Compass, color: 'text-purple-500' },
  { name: 'Security & Tools', icon: Shield, color: 'text-rose-500' }
] as const;

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isPinned: boolean;
  setIsPinned: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  isPinned,
  setIsPinned
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // The sidebar is visually expanded if either pinned open, or hovered in collapsed mode, or open on mobile
  const isExpanded = isPinned || isHovered || isMobileOpen;

  const toggleCategory = (catName: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  const handleSelectTool = (id: ActiveTab) => {
    setActiveTab(id);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return ALL_TOOLS;
    const q = searchQuery.toLowerCase();
    return ALL_TOOLS.filter(
      t => t.label.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main SaaS Left Navigation Bar */}
      <aside
        onMouseEnter={() => {
          if (!isPinned) setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (!isPinned) setIsHovered(false);
        }}
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out select-none shadow-xl lg:shadow-none ${
          isExpanded ? 'w-72' : 'w-18'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header & Pin Controls */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div
            onClick={() => {
              if (!isPinned) setIsPinned(true);
            }}
            className={`flex items-center space-x-3 overflow-hidden ${!isPinned ? 'cursor-pointer' : ''}`}
            title={!isPinned ? 'Click to pin sidebar always open' : undefined}
          >
            <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-slate-200/80 dark:border-slate-700/80">
              <Layers className="h-5 w-5" />
            </div>
            {isExpanded && (
              <div className="flex flex-col truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                    Tools & Protocols
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  30 Modular Suites
                </span>
              </div>
            )}
          </div>

          {/* Pin Toggle Button for Desktop */}
          {isExpanded && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsPinned(prev => !prev)}
                className={`p-1.5 rounded-lg transition-colors hidden lg:flex items-center justify-center ${
                  isPinned
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`}
                title={isPinned ? 'Unpin Sidebar (Open on Hover)' : 'Pin Sidebar Always Open'}
              >
                {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Filter Search Bar when Expanded */}
        {isExpanded && (
          <div className="px-3 pt-3 pb-1 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 30 tools..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        )}

        {/* Navigation Categories & Tool Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {CATEGORY_GROUPS.map((group) => {
            const groupTools = filteredTools.filter(t => t.category === group.name);
            if (groupTools.length === 0) return null;

            const isGroupCollapsed = collapsedCategories[group.name];
            const GroupIcon = group.icon;

            return (
              <div key={group.name} className="space-y-1">
                {/* Category Header */}
                {isExpanded ? (
                  <button
                    onClick={() => toggleCategory(group.name)}
                    className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors group"
                  >
                    <div className="flex items-center space-x-1.5">
                      <GroupIcon className={`h-3.5 w-3.5 ${group.color}`} />
                      <span>{group.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {groupTools.length}
                      </span>
                      {isGroupCollapsed ? (
                        <ChevronRight className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                      ) : (
                        <ChevronDown className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                      )}
                    </div>
                  </button>
                ) : (
                  <div className="my-1.5 border-t border-slate-100 dark:border-slate-800/80" />
                )}

                {/* Tool Item Buttons */}
                {(!isGroupCollapsed || !isExpanded) && (
                  <div className="space-y-0.5">
                    {groupTools.map((tool) => {
                      const Icon = tool.icon;
                      const isActive = activeTab === tool.id;

                      return (
                        <button
                          key={tool.id}
                          id={`sidebar-item-${tool.id}`}
                          onClick={() => handleSelectTool(tool.id)}
                          title={!isExpanded ? `${tool.label} — ${tool.desc}` : undefined}
                          className={`w-full flex items-center rounded-xl transition-all relative group ${
                            isExpanded ? 'px-2.5 py-2' : 'p-2.5 justify-center'
                          } ${
                            isActive
                              ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/25'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 shrink-0 transition-transform ${
                              isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-500'
                            } ${!isExpanded ? 'h-5 w-5' : ''}`}
                          />

                          {isExpanded && (
                            <div className="ml-2.5 flex-1 flex items-center justify-between truncate text-left">
                              <span className="text-xs truncate tracking-tight">
                                {tool.label}
                              </span>
                              {tool.badge && (
                                <span
                                  className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ml-1.5 shrink-0 ${
                                    isActive
                                      ? 'bg-white/20 text-white'
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                  }`}
                                >
                                  {tool.badge}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Collapsed Tooltip Flyout */}
                          {!isExpanded && (
                            <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 border border-slate-700 hidden lg:block">
                              <div className="font-bold flex items-center space-x-1">
                                <span>{tool.label}</span>
                                {tool.badge && <span className="text-[10px] text-blue-400 font-mono">[{tool.badge}]</span>}
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal">{tool.desc}</div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer State & Mode Info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
          {isExpanded ? (
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono">30 Tools Active</span>
              </div>
              <span className="text-[10px] font-mono opacity-70">
                {isPinned ? 'Pinned' : 'Hover Mode'}
              </span>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="System Ready" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
