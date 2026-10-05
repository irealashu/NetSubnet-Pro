import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab, ALL_TOOLS } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { SubnetCalculator } from './components/SubnetCalculator';
import { VlsmPlanner } from './components/VlsmPlanner';
import { RouteSummarizer } from './components/RouteSummarizer';
import { OverlapChecker } from './components/OverlapChecker';
import { ConfigGenerator } from './components/ConfigGenerator';
import { CidrMatrix } from './components/CidrMatrix';
import { Ipv6Calculator } from './components/Ipv6Calculator';
import { CidrCalculator } from './components/CidrCalculator';
import { SubnetSplitter } from './components/SubnetSplitter';
import { IpRangeFinder } from './components/IpRangeFinder';
import { DnsRecordBuilder } from './components/DnsRecordBuilder';
import { SpfGenerator } from './components/SpfGenerator';
import { DmarcGenerator } from './components/DmarcGenerator';
import { PasswordGenerator } from './components/PasswordGenerator';
import { Sha256Generator } from './components/Sha256Generator';
import { JwtDecoder } from './components/JwtDecoder';
import { HeaderAnalyzer } from './components/HeaderAnalyzer';
import { PacketDecoder } from './components/PacketDecoder';
import { TcpHandshakeVisualizer } from './components/TcpHandshakeVisualizer';
import { NatSimulator } from './components/NatSimulator';
import { RoutingTableViewer } from './components/RoutingTableViewer';
import { FirewallRuleGenerator } from './components/FirewallRuleGenerator';
import { TlsVisualizer } from './components/TlsVisualizer';
import { DnsVisualizer } from './components/DnsVisualizer';
import { OsiExplorer } from './components/OsiExplorer';
import { PcapViewer } from './components/PcapViewer';
import { TopologyDesigner } from './components/TopologyDesigner';
import { BgpTools } from './components/BgpTools';
import { OspfPlanner } from './components/OspfPlanner';
import { VlanPlanner } from './components/VlanPlanner';
import { NetworkDesignCanvas } from './components/NetworkDesignCanvas';
import { RackPlanner } from './components/RackPlanner';
import { PacketBuilder } from './components/PacketBuilder';
import { OverlapItem } from './types/network';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ipv4');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar_pinned');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('sidebar_pinned', String(isPinned));
  }, [isPinned]);

  const [calcIpOverride, setCalcIpOverride] = useState<string | null>(null);
  const [calcCidrOverride, setCalcCidrOverride] = useState<number | null>(null);
  const [vlsmMajorIp, setVlsmMajorIp] = useState<string | null>(null);
  const [vlsmMajorCidr, setVlsmMajorCidr] = useState<number | null>(null);
  const [summarizerRoutes, setSummarizerRoutes] = useState<string[] | null>(null);
  const [overlapItems, setOverlapItems] = useState<OverlapItem[] | null>(null);
  const [configIp, setConfigIp] = useState<string>('192.168.10.1');
  const [configCidr, setConfigCidr] = useState<number>(24);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme_dark');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Sync dark class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_dark', 'false');
    }
  }, [darkMode]);

  const handleInspectSubnet = (ip: string, cidr: number) => {
    setCalcIpOverride(ip);
    setCalcCidrOverride(cidr);
    setActiveTab('ipv4');
  };

  const handleSelectCidrFromMatrix = (cidr: number) => {
    localStorage.setItem('lastCIDR', String(cidr));
    setCalcCidrOverride(cidr);
    setActiveTab('ipv4');
  };

  const handlePlanVlsm = (ip: string, cidr: number) => {
    setVlsmMajorIp(ip);
    setVlsmMajorCidr(cidr);
    setActiveTab('vlsm');
  };

  const handleSelectForConfig = (ip: string, cidr: number) => {
    setConfigIp(ip);
    setConfigCidr(cidr);
    setActiveTab('configs');
  };

  const handleCheckOverlap = (cidrOrItems: string | OverlapItem[]) => {
    if (typeof cidrOrItems === 'string') {
      setOverlapItems([
        { id: '1', cidr: cidrOrItems, name: 'Target Subnet' },
        { id: '2', cidr: '10.0.0.0/16', name: 'Corporate Core VPC' },
        { id: '3', cidr: '172.16.0.0/12', name: 'Datacenter Segment' },
        { id: '4', cidr: '192.168.0.0/16', name: 'Site-to-Site VPN' }
      ]);
    } else {
      setOverlapItems(cidrOrItems);
    }
    setActiveTab('overlap');
  };

  const handleAddToSummarizer = (cidrOrRoutes: string | string[]) => {
    if (typeof cidrOrRoutes === 'string') {
      setSummarizerRoutes([cidrOrRoutes]);
    } else {
      setSummarizerRoutes(cidrOrRoutes);
    }
    setActiveTab('summarizer');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* SaaS Collapsible Left Side Navigation Bar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isPinned={isPinned}
        setIsPinned={setIsPinned}
      />

      {/* Main Content Area (Offset for left sidebar) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isPinned ? 'lg:pl-72' : 'lg:pl-18'
      }`}>
        {/* Top Header Bar with Breadcrumb & Search Palette */}
        <TopHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Dynamic Tool Workspace Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* 1. IP & Subnetting Tools */}
          {activeTab === 'ipv4' && (
            <SubnetCalculator
              initialIpOverride={calcIpOverride || undefined}
              initialCidrOverride={calcCidrOverride || undefined}
              onSelectForConfig={(res) => {
                handleSelectForConfig(res.firstUsableHost || res.networkAddress, res.cidr);
              }}
              onPlanVlsm={(ip, cidr) => {
                handlePlanVlsm(ip, cidr);
              }}
              onCheckOverlap={(slashNotation) => {
                handleCheckOverlap(slashNotation);
              }}
              onAddToSummarizer={(slashNotation) => {
                handleAddToSummarizer(slashNotation);
              }}
            />
          )}

          {activeTab === 'ipv6' && <Ipv6Calculator />}
          {activeTab === 'cidr' && <CidrCalculator />}

          {activeTab === 'vlsm' && (
            <VlsmPlanner
              initialMajorIp={vlsmMajorIp || undefined}
              initialMajorCidr={vlsmMajorCidr || undefined}
              onInspectSubnet={handleInspectSubnet}
              onSelectForConfig={handleSelectForConfig}
              onSummarizeRoutes={(routes) => {
                setSummarizerRoutes(routes);
                setActiveTab('summarizer');
              }}
              onCheckOverlap={(items) => {
                setOverlapItems(items);
                setActiveTab('overlap');
              }}
            />
          )}

          {activeTab === 'splitter' && <SubnetSplitter />}
          {activeTab === 'range' && <IpRangeFinder />}

          {activeTab === 'summarizer' && (
            <RouteSummarizer
              initialRoutes={summarizerRoutes || undefined}
              onInspectSubnet={handleInspectSubnet}
              onSelectForConfig={handleSelectForConfig}
              onCheckOverlap={(cidr) => {
                handleCheckOverlap(cidr);
              }}
            />
          )}

          {activeTab === 'overlap' && (
            <OverlapChecker
              initialItems={overlapItems || undefined}
              onSummarizeRoutes={(routes) => {
                setSummarizerRoutes(routes);
                setActiveTab('summarizer');
              }}
              onInspectSubnet={handleInspectSubnet}
              onSelectForConfig={handleSelectForConfig}
            />
          )}

          {activeTab === 'matrix' && (
            <CidrMatrix
              onSelectCidr={handleSelectCidrFromMatrix}
              onPlanVlsm={(cidr) => {
                setVlsmMajorCidr(cidr);
                setActiveTab('vlsm');
              }}
            />
          )}

          {/* 2. Protocols & Simulation Tools */}
          {activeTab === 'tcp' && <TcpHandshakeVisualizer />}
          {activeTab === 'tls' && <TlsVisualizer />}
          {activeTab === 'dns-vis' && <DnsVisualizer />}
          {activeTab === 'nat' && <NatSimulator />}
          {activeTab === 'routing-table' && <RoutingTableViewer />}
          {activeTab === 'osi' && <OsiExplorer />}

          {/* 3. Packet & Traffic Tools */}
          {activeTab === 'packet-decoder' && <PacketDecoder />}
          {activeTab === 'pcap' && <PcapViewer />}
          {activeTab === 'packet-builder' && <PacketBuilder />}

          {/* 4. Planning & Architecture Tools */}
          {activeTab === 'topology' && <TopologyDesigner />}
          {activeTab === 'design-canvas' && <NetworkDesignCanvas />}
          {activeTab === 'rack' && <RackPlanner />}
          {activeTab === 'vlan' && <VlanPlanner />}
          {activeTab === 'ospf' && <OspfPlanner />}
          {activeTab === 'bgp' && <BgpTools />}

          {/* 5. Security & Utilities Tools */}
          {activeTab === 'firewall' && <FirewallRuleGenerator />}
          {activeTab === 'dns-builder' && <DnsRecordBuilder />}
          {activeTab === 'spf' && <SpfGenerator />}
          {activeTab === 'dmarc' && <DmarcGenerator />}
          {activeTab === 'headers' && <HeaderAnalyzer />}
          {activeTab === 'jwt' && <JwtDecoder />}
          {activeTab === 'sha256' && <Sha256Generator />}
          {activeTab === 'passwords' && <PasswordGenerator />}

          {activeTab === 'configs' && (
            <ConfigGenerator
              initialIp={configIp}
              initialCidr={configCidr}
              onInspectSubnet={handleInspectSubnet}
              onPlanVlsm={handlePlanVlsm}
            />
          )}
        </main>
      </div>
    </div>
  );
};
