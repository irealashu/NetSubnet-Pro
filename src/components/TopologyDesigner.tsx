import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { exportTopologyToPdf } from '../utils/pdfExport';
import {
  Network,
  Server,
  Shield,
  Laptop,
  Cloud,
  Plus,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Layers,
  Activity,
  Play,
  RotateCcw,
  Zap,
  Radio,
  Cpu,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Wifi,
  Move,
  Focus,
  FileText
} from 'lucide-react';

export type NodeType = 'router' | 'switch' | 'firewall' | 'server' | 'cloud' | 'pc' | 'loadbalancer' | 'ap';

export interface TopologyNode {
  id: string;
  type: NodeType;
  name: string;
  ip: string;
  subnet: string;
  vlan: number;
  zone: 'WAN' | 'DMZ' | 'LAN' | 'DB' | 'MGMT';
  vendor: 'Cisco' | 'Juniper' | 'PaloAlto' | 'Linux' | 'Arista';
  x: number;
  y: number;
}

export interface TopologyLink {
  id: string;
  from: string;
  to: string;
  labelFrom: string;
  labelTo: string;
  speed: '1G' | '10G' | '100G' | 'Fiber' | 'Wireless';
  status: 'up' | 'down';
}

export const TopologyDesigner: React.FC = () => {
  // Initial Enterprise 3-Tier DMZ & Spine Topology (Normalized coordinates)
  const initialNodes: TopologyNode[] = [
    { id: 'wan', type: 'cloud', name: 'Internet Gateway', ip: '198.51.100.1', subnet: '198.51.100.0/24', vlan: 0, zone: 'WAN', vendor: 'Cisco', x: 400, y: 50 },
    { id: 'fw1', type: 'firewall', name: 'Next-Gen Firewall', ip: '198.51.100.2', subnet: '198.51.100.0/24', vlan: 99, zone: 'DMZ', vendor: 'PaloAlto', x: 400, y: 150 },
    { id: 'r1', type: 'router', name: 'Core Router 01', ip: '10.0.0.1', subnet: '10.0.0.0/24', vlan: 1, zone: 'LAN', vendor: 'Cisco', x: 400, y: 260 },
    { id: 'sw1', type: 'switch', name: 'Dist Switch A (VLAN 10)', ip: '10.0.10.1', subnet: '10.0.10.0/24', vlan: 10, zone: 'LAN', vendor: 'Arista', x: 220, y: 370 },
    { id: 'sw2', type: 'switch', name: 'Dist Switch B (VLAN 20)', ip: '10.0.20.1', subnet: '10.0.20.0/24', vlan: 20, zone: 'DB', vendor: 'Arista', x: 580, y: 370 },
    { id: 'srv1', type: 'server', name: 'Web Cluster Node', ip: '10.0.10.50', subnet: '10.0.10.0/24', vlan: 10, zone: 'DMZ', vendor: 'Linux', x: 140, y: 480 },
    { id: 'srv2', type: 'server', name: 'App Backend', ip: '10.0.10.60', subnet: '10.0.10.0/24', vlan: 10, zone: 'LAN', vendor: 'Linux', x: 300, y: 480 },
    { id: 'db1', type: 'server', name: 'PostgreSQL Primary', ip: '10.0.20.50', subnet: '10.0.20.0/24', vlan: 20, zone: 'DB', vendor: 'Linux', x: 500, y: 480 },
    { id: 'pc1', type: 'pc', name: 'Admin Workstation', ip: '10.0.20.100', subnet: '10.0.20.0/24', vlan: 20, zone: 'MGMT', vendor: 'Linux', x: 660, y: 480 }
  ];

  const initialLinks: TopologyLink[] = [
    { id: 'l1', from: 'wan', to: 'fw1', labelFrom: 'WAN', labelTo: 'eth1/1', speed: '100G', status: 'up' },
    { id: 'l2', from: 'fw1', to: 'r1', labelFrom: 'eth1/2', labelTo: 'Gi0/0/0', speed: '10G', status: 'up' },
    { id: 'l3', from: 'r1', to: 'sw1', labelFrom: 'Gi0/0/1', labelTo: 'Te1/1', speed: '10G', status: 'up' },
    { id: 'l4', from: 'r1', to: 'sw2', labelFrom: 'Gi0/0/2', labelTo: 'Te1/1', speed: '10G', status: 'up' },
    { id: 'l5', from: 'sw1', to: 'sw2', labelFrom: 'Po1', labelTo: 'Po1', speed: '10G', status: 'up' },
    { id: 'l6', from: 'sw1', to: 'srv1', labelFrom: 'Gi1/0/1', labelTo: 'eth0', speed: '1G', status: 'up' },
    { id: 'l7', from: 'sw1', to: 'srv2', labelFrom: 'Gi1/0/2', labelTo: 'eth0', speed: '1G', status: 'up' },
    { id: 'l8', from: 'sw2', to: 'db1', labelFrom: 'Gi1/0/1', labelTo: 'eth0', speed: '1G', status: 'up' },
    { id: 'l9', from: 'sw2', to: 'pc1', labelFrom: 'Gi1/0/24', labelTo: 'eth0', speed: '1G', status: 'up' }
  ];

  const [nodes, setNodes] = useState<TopologyNode[]>(initialNodes);
  const [links, setLinks] = useState<TopologyLink[]>(initialLinks);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('r1');
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  // Link creation mode
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [linkSourceNodeId, setLinkSourceNodeId] = useState<string | null>(null);

  // Infinite Pan & Zoom State
  const [zoomLevel, setZoomLevel] = useState<number>(0.95);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 30, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isExpandedCanvas, setIsExpandedCanvas] = useState(false);

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Packet Simulator State
  const [simSourceId, setSimSourceId] = useState<string>('pc1');
  const [simTargetId, setSimTargetId] = useState<string>('wan');
  const [simResult, setSimResult] = useState<{
    path: string[];
    hops: number;
    latency: number;
    status: 'success' | 'unreachable';
    logs: string[];
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Auto Fit to Screen Function
  const fitToScreen = useCallback((targetNodes: TopologyNode[] = nodes) => {
    if (!containerRef.current || targetNodes.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const containerW = rect.width || 750;
    const containerH = rect.height || 540;

    const xs = targetNodes.map(n => n.x);
    const ys = targetNodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const padding = 80;
    const boundingW = Math.max(maxX - minX + padding * 2, 200);
    const boundingH = Math.max(maxY - minY + padding * 2, 200);

    const scaleX = containerW / boundingW;
    const scaleY = containerH / boundingH;
    const newScale = Math.min(scaleX, scaleY, 1.2);
    const clampedScale = Math.max(0.4, Math.min(1.2, newScale));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const newPanX = containerW / 2 - centerX * clampedScale;
    const newPanY = containerH / 2 - centerY * clampedScale;

    setZoomLevel(parseFloat(clampedScale.toFixed(2)));
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  }, [nodes]);

  // Initial fit on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      fitToScreen();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Find shortest path using BFS Graph Traversal
  const simulatePacketTrace = () => {
    if (simSourceId === simTargetId) {
      setSimResult({
        path: [simSourceId],
        hops: 0,
        latency: 0.1,
        status: 'success',
        logs: ['Source is destination (Loopback ping).']
      });
      return;
    }

    const adj: Record<string, string[]> = {};
    nodes.forEach(n => { adj[n.id] = []; });
    links.forEach(l => {
      if (l.status === 'up') {
        if (adj[l.from]) adj[l.from].push(l.to);
        if (adj[l.to]) adj[l.to].push(l.from);
      }
    });

    const queue: { id: string; path: string[] }[] = [{ id: simSourceId, path: [simSourceId] }];
    const visited = new Set<string>([simSourceId]);
    let foundPath: string[] | null = null;

    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      if (id === simTargetId) {
        foundPath = path;
        break;
      }

      for (const neighbor of (adj[id] || [])) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ id: neighbor, path: [...path, neighbor] });
        }
      }
    }

    setIsSimulating(true);

    if (foundPath) {
      const logs: string[] = [];
      let totalLatency = 0.5;

      for (let i = 0; i < foundPath.length - 1; i++) {
        const fromNode = nodes.find(n => n.id === foundPath![i]);
        const toNode = nodes.find(n => n.id === foundPath![i + 1]);
        const link = links.find(l => (l.from === fromNode?.id && l.to === toNode?.id) || (l.to === fromNode?.id && l.from === toNode?.id));
        const linkLatency = link?.speed === '100G' ? 0.2 : link?.speed === '10G' ? 0.5 : 1.2;
        totalLatency += linkLatency;

        logs.push(
          `Hop ${i + 1}: ${fromNode?.name} (${fromNode?.ip}) → ${toNode?.name} (${toNode?.ip}) via ${link?.speed} link [TTL: ${64 - i}, +${linkLatency.toFixed(1)}ms]`
        );
      }

      setSimResult({
        path: foundPath,
        hops: foundPath.length - 1,
        latency: parseFloat(totalLatency.toFixed(1)),
        status: 'success',
        logs
      });
    } else {
      setSimResult({
        path: [],
        hops: 0,
        latency: 0,
        status: 'unreachable',
        logs: [`Destination host ${nodes.find(n => n.id === simTargetId)?.name} is unreachable. No active Layer 2/3 link path found.`]
      });
    }

    setTimeout(() => setIsSimulating(false), 800);
  };

  // Canvas Pan & Node Drag Handlers
  const handleCanvasPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    // Only pan if clicking canvas background directly
    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'rect') {
      setSelectedNodeId(null);
      setSelectedLinkId(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleNodePointerDown = (nodeId: string, e: React.PointerEvent<SVGGElement>) => {
    e.stopPropagation();

    if (isLinkingMode) {
      if (!linkSourceNodeId) {
        setLinkSourceNodeId(nodeId);
      } else if (linkSourceNodeId !== nodeId) {
        // Create Link
        const newLink: TopologyLink = {
          id: `l_${Math.random().toString(36).substring(2, 7)}`,
          from: linkSourceNodeId,
          to: nodeId,
          labelFrom: 'eth1',
          labelTo: 'eth1',
          speed: '10G',
          status: 'up'
        };
        setLinks(prev => [...prev, newLink]);
        setLinkSourceNodeId(null);
        setIsLinkingMode(false);
      }
      return;
    }

    setSelectedNodeId(nodeId);
    setSelectedLinkId(null);
    setDraggingNodeId(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseCanvasX = (e.clientX - rect.left - pan.x) / zoomLevel;
      const mouseCanvasY = (e.clientY - rect.top - pan.y) / zoomLevel;
      setDragOffset({ x: mouseCanvasX - node.x, y: mouseCanvasY - node.y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseCanvasX = (e.clientX - rect.left - pan.x) / zoomLevel;
      const mouseCanvasY = (e.clientY - rect.top - pan.y) / zoomLevel;

      const newX = mouseCanvasX - dragOffset.x;
      const newY = mouseCanvasY - dragOffset.y;

      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: Math.round(newX), y: Math.round(newY) } : n));
    }
  };

  const handlePointerUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.max(0.3, Math.min(2.5, zoomLevel * zoomFactor));

    // Zoom toward cursor position
    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoomLevel);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoomLevel);

    setZoomLevel(parseFloat(newZoom.toFixed(2)));
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  };

  const addNode = (type: NodeType) => {
    const counts = nodes.filter(n => n.type === type).length + 1;
    // Place near current view center
    const rect = containerRef.current?.getBoundingClientRect();
    const centerX = rect ? (rect.width / 2 - pan.x) / zoomLevel : 400;
    const centerY = rect ? (rect.height / 2 - pan.y) / zoomLevel : 250;

    const newNode: TopologyNode = {
      id: `${type}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      name: `${type.toUpperCase()}-${counts.toString().padStart(2, '0')}`,
      ip: `10.0.${nodes.length + 10}.1`,
      subnet: `10.0.${nodes.length + 10}.0/24`,
      vlan: 10,
      zone: 'LAN',
      vendor: 'Cisco',
      x: Math.round(centerX + (Math.random() * 80 - 40)),
      y: Math.round(centerY + (Math.random() * 80 - 40))
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const removeSelectedNode = () => {
    if (!selectedNodeId) return;
    setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
    setLinks(prev => prev.filter(l => l.from !== selectedNodeId && l.to !== selectedNodeId));
    setSelectedNodeId(null);
    if (simResult) setSimResult(null);
  };

  const removeSelectedLink = () => {
    if (!selectedLinkId) return;
    setLinks(prev => prev.filter(l => l.id !== selectedLinkId));
    setSelectedLinkId(null);
    if (simResult) setSimResult(null);
  };

  // Pre-built Topology Templates
  const loadTemplate = (templateName: 'campus' | 'spineleaf' | 'sdwan') => {
    let newNodes: TopologyNode[] = [];
    let newLinks: TopologyLink[] = [];

    if (templateName === 'campus') {
      newNodes = initialNodes;
      newLinks = initialLinks;
    } else if (templateName === 'spineleaf') {
      newNodes = [
        { id: 's1', type: 'switch', name: 'Spine Switch 01', ip: '10.100.1.1', subnet: '10.100.1.0/24', vlan: 100, zone: 'LAN', vendor: 'Arista', x: 260, y: 80 },
        { id: 's2', type: 'switch', name: 'Spine Switch 02', ip: '10.100.1.2', subnet: '10.100.1.0/24', vlan: 100, zone: 'LAN', vendor: 'Arista', x: 540, y: 80 },
        { id: 'l1', type: 'switch', name: 'Leaf Switch 01 (Rack A)', ip: '10.100.10.1', subnet: '10.100.10.0/24', vlan: 10, zone: 'LAN', vendor: 'Arista', x: 160, y: 240 },
        { id: 'l2', type: 'switch', name: 'Leaf Switch 02 (Rack B)', ip: '10.100.20.1', subnet: '10.100.20.0/24', vlan: 20, zone: 'LAN', vendor: 'Arista', x: 400, y: 240 },
        { id: 'l3', type: 'switch', name: 'Leaf Switch 03 (Rack C)', ip: '10.100.30.1', subnet: '10.100.30.0/24', vlan: 30, zone: 'LAN', vendor: 'Arista', x: 640, y: 240 },
        { id: 'srvA', type: 'server', name: 'Compute Node A', ip: '10.100.10.10', subnet: '10.100.10.0/24', vlan: 10, zone: 'LAN', vendor: 'Linux', x: 160, y: 400 },
        { id: 'srvB', type: 'server', name: 'Compute Node B', ip: '10.100.20.10', subnet: '10.100.20.0/24', vlan: 20, zone: 'LAN', vendor: 'Linux', x: 400, y: 400 },
        { id: 'srvC', type: 'server', name: 'Storage SAN Target', ip: '10.100.30.10', subnet: '10.100.30.0/24', vlan: 30, zone: 'DB', vendor: 'Linux', x: 640, y: 400 }
      ];
      newLinks = [
        { id: 'sl1', from: 's1', to: 'l1', labelFrom: '100G', labelTo: '100G', speed: '100G', status: 'up' },
        { id: 'sl2', from: 's1', to: 'l2', labelFrom: '100G', labelTo: '100G', speed: '100G', status: 'up' },
        { id: 'sl3', from: 's1', to: 'l3', labelFrom: '100G', labelTo: '100G', speed: '100G', status: 'up' },
        { id: 'sl4', from: 's2', to: 'l1', labelFrom: '100G', labelTo: '100G', speed: '100G', status: 'up' },
        { id: 'sl5', from: 's2', to: 'l2', labelFrom: '100G', labelTo: '100G', speed: '100G', status: 'up' },
        { id: 'sl6', from: 's2', to: 'l3', labelFrom: '100G', labelTo: '100G', speed: '100G', status: 'up' },
        { id: 'sl7', from: 'l1', to: 'srvA', labelFrom: '25G', labelTo: '25G', speed: '10G', status: 'up' },
        { id: 'sl8', from: 'l2', to: 'srvB', labelFrom: '25G', labelTo: '25G', speed: '10G', status: 'up' },
        { id: 'sl9', from: 'l3', to: 'srvC', labelFrom: '25G', labelTo: '25G', speed: '10G', status: 'up' }
      ];
    } else if (templateName === 'sdwan') {
      newNodes = [
        { id: 'cloud', type: 'cloud', name: 'MPLS & Internet Underlay', ip: '198.51.100.1', subnet: '198.51.100.0/24', vlan: 0, zone: 'WAN', vendor: 'Cisco', x: 400, y: 70 },
        { id: 'hub', type: 'router', name: 'HQ SD-WAN Hub Edge', ip: '10.254.0.1', subnet: '10.254.0.0/24', vlan: 1, zone: 'LAN', vendor: 'Cisco', x: 400, y: 200 },
        { id: 'spoke1', type: 'router', name: 'Branch A Edge (Dallas)', ip: '10.1.0.1', subnet: '10.1.0.0/24', vlan: 1, zone: 'LAN', vendor: 'Cisco', x: 180, y: 340 },
        { id: 'spoke2', type: 'router', name: 'Branch B Edge (London)', ip: '10.2.0.1', subnet: '10.2.0.0/24', vlan: 1, zone: 'LAN', vendor: 'Cisco', x: 620, y: 340 },
        { id: 'pc_a', type: 'pc', name: 'Dallas POS Terminal', ip: '10.1.0.50', subnet: '10.1.0.0/24', vlan: 10, zone: 'LAN', vendor: 'Linux', x: 180, y: 460 },
        { id: 'pc_b', type: 'pc', name: 'London Workstation', ip: '10.2.0.50', subnet: '10.2.0.0/24', vlan: 10, zone: 'LAN', vendor: 'Linux', x: 620, y: 460 }
      ];
      newLinks = [
        { id: 'sd1', from: 'cloud', to: 'hub', labelFrom: 'WAN-1', labelTo: 'IPsec Tunnel', speed: '100G', status: 'up' },
        { id: 'sd2', from: 'cloud', to: 'spoke1', labelFrom: 'WAN-2', labelTo: 'IPsec Tunnel', speed: '10G', status: 'up' },
        { id: 'sd3', from: 'cloud', to: 'spoke2', labelFrom: 'WAN-3', labelTo: 'IPsec Tunnel', speed: '10G', status: 'up' },
        { id: 'sd4', from: 'spoke1', to: 'pc_a', labelFrom: 'LAN', labelTo: 'eth0', speed: '1G', status: 'up' },
        { id: 'sd5', from: 'spoke2', to: 'pc_b', labelFrom: 'LAN', labelTo: 'eth0', speed: '1G', status: 'up' }
      ];
    }

    setNodes(newNodes);
    setLinks(newLinks);
    setSelectedNodeId(null);
    setSimResult(null);
    setTimeout(() => fitToScreen(newNodes), 50);
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportTopologyToPdf({
        title: 'Enterprise Backbone Architecture',
        nodes,
        links,
        simResult
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const exportTopologyJson = () => {
    const data = JSON.stringify({ nodes, links }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netvok_topology_${Date.now()}.json`;
    a.click();
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedLink = links.find(l => l.id === selectedLinkId);

  const renderIcon = (type: NodeType) => {
    switch (type) {
      case 'router': return <Network className="h-5 w-5 text-blue-500" />;
      case 'switch': return <Layers className="h-5 w-5 text-indigo-500" />;
      case 'firewall': return <Shield className="h-5 w-5 text-rose-500" />;
      case 'server': return <Server className="h-5 w-5 text-emerald-500" />;
      case 'cloud': return <Cloud className="h-5 w-5 text-sky-500" />;
      case 'pc': return <Laptop className="h-5 w-5 text-amber-500" />;
      case 'loadbalancer': return <Cpu className="h-5 w-5 text-purple-500" />;
      case 'ap': return <Wifi className="h-5 w-5 text-teal-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Network className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Enterprise Network Topology Designer & Simulator</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Infinite pan-and-zoom canvas with auto-fit, device stencils, live packet traceroute simulation, and auto-path resolution.
              </p>
            </div>
          </div>

          {/* Quick Actions & Templates */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-950 text-xs">
              <button
                onClick={() => loadTemplate('campus')}
                className="px-2.5 py-1 font-semibold rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Campus 3-Tier
              </button>
              <button
                onClick={() => loadTemplate('spineleaf')}
                className="px-2.5 py-1 font-semibold rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Spine-Leaf DC
              </button>
              <button
                onClick={() => loadTemplate('sdwan')}
                className="px-2.5 py-1 font-semibold rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                SD-WAN Hub
              </button>
            </div>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50 shadow-xs"
              title="Export complete publication-ready multi-page PDF with fitted map and inventory schedule"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{isExportingPdf ? 'Generating PDF...' : 'Export to PDF'}</span>
            </button>

            <button
              onClick={exportTopologyJson}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Toolbar & Stencils */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Add Device Stencils */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Add Device:</span>
            {[
              { type: 'router', label: '+ Router' },
              { type: 'switch', label: '+ Switch' },
              { type: 'firewall', label: '+ Firewall' },
              { type: 'server', label: '+ Server' },
              { type: 'loadbalancer', label: '+ Load Balancer' },
              { type: 'cloud', label: '+ Cloud WAN' },
              { type: 'pc', label: '+ Host PC' },
              { type: 'ap', label: '+ AP' }
            ].map((st) => (
              <button
                key={st.type}
                onClick={() => addNode(st.type as any)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Connect Link Button & Canvas Navigation Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setIsLinkingMode(prev => !prev);
                setLinkSourceNodeId(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                isLinkingMode
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{isLinkingMode ? 'Click 2 Devices to Connect...' : 'Connect Link'}</span>
            </button>

            {/* Fit to Screen Button */}
            <button
              onClick={() => fitToScreen()}
              className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold flex items-center space-x-1 transition-colors"
              title="Fit diagram perfectly to canvas view"
            >
              <Focus className="h-3.5 w-3.5" />
              <span>Fit to Screen</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.3, prev - 0.1))}
                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1 font-bold text-slate-600 dark:text-slate-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(2.2, prev + 0.1))}
                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  setZoomLevel(1);
                  setPan({ x: 30, y: 20 });
                }}
                className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600"
                title="Reset Pan & Zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Expand / Collapse Canvas Height */}
            <button
              onClick={() => setIsExpandedCanvas(prev => !prev)}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
              title={isExpandedCanvas ? 'Standard View' : 'Expand Canvas View'}
            >
              {isExpandedCanvas ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive SVG Diagram Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-2 px-2 text-xs font-mono text-slate-400">
            <span>Canvas: {nodes.length} Nodes | {links.length} Links</span>
            <span className="hidden sm:inline">💡 Drag canvas to pan. Mouse wheel to zoom. Drag nodes to move.</span>
          </div>

          <div
            ref={containerRef}
            className={`relative w-full bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden select-none transition-all duration-300 ${
              isExpandedCanvas ? 'h-[720px]' : 'h-[540px]'
            } ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {/* Grid Pattern Background */}
            <svg
              ref={svgRef}
              className="w-full h-full"
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onWheel={handleWheel}
            >
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" className="text-slate-200/50 dark:text-slate-800/40" strokeWidth="1" />
                </pattern>
                {/* Arrowhead marker for links */}
                <marker id="arrow" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-slate-400 dark:text-slate-600" />
                </marker>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Render Connecting Cables / Links & Nodes with Infinite Pan & Zoom Transformation */}
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoomLevel})`}>
                {links.map((link) => {
                  const fromNode = nodes.find(n => n.id === link.from);
                  const toNode = nodes.find(n => n.id === link.to);
                  if (!fromNode || !toNode) return null;

                  const isSelected = link.id === selectedLinkId;
                  const isSimPath = simResult?.path &&
                    simResult.path.includes(link.from) &&
                    simResult.path.includes(link.to) &&
                    Math.abs(simResult.path.indexOf(link.from) - simResult.path.indexOf(link.to)) === 1;

                  const midX = (fromNode.x + toNode.x) / 2;
                  const midY = (fromNode.y + toNode.y) / 2;

                  return (
                    <g
                      key={link.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLinkId(link.id);
                        setSelectedNodeId(null);
                      }}
                      className="cursor-pointer group"
                    >
                      {/* Invisible wider stroke for easier clicking */}
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke="transparent"
                        strokeWidth="16"
                      />

                      {/* Visible Link Line */}
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        className={`transition-all ${
                          isSimPath
                            ? 'stroke-emerald-500 stroke-[3.5] animate-pulse'
                            : isSelected
                            ? 'stroke-blue-500 stroke-[3]'
                            : link.status === 'down'
                            ? 'stroke-rose-500 stroke-2 stroke-dasharray-[4,4]'
                            : link.speed === '100G'
                            ? 'stroke-purple-500 stroke-[2.5]'
                            : link.speed === '10G'
                            ? 'stroke-blue-400 dark:stroke-blue-500 stroke-2'
                            : 'stroke-slate-300 dark:stroke-slate-700 stroke-2'
                        }`}
                      />

                      {/* Speed Badge / Link Label */}
                      <rect
                        x={midX - 22}
                        y={midY - 9}
                        width="44"
                        height="18"
                        rx="4"
                        className={`${
                          isSimPath
                            ? 'fill-emerald-600 text-white'
                            : isSelected
                            ? 'fill-blue-600 text-white'
                            : 'fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800'
                        }`}
                      />
                      <text
                        x={midX}
                        y={midY + 3.5}
                        textAnchor="middle"
                        className={`text-[9px] font-mono font-bold select-none ${
                          isSimPath || isSelected ? 'fill-white' : 'fill-slate-600 dark:fill-slate-300'
                        }`}
                      >
                        {link.speed}
                      </text>
                    </g>
                  );
                })}

                {/* Render Nodes */}
                {nodes.map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  const isInSimPath = simResult?.path?.includes(node.id);
                  const isLinkSource = node.id === linkSourceNodeId;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onPointerDown={(e) => handleNodePointerDown(node.id, e)}
                      className="cursor-pointer select-none group"
                    >
                      {/* Selection Aura */}
                      {(isSelected || isInSimPath || isLinkSource) && (
                        <circle
                          r="28"
                          className={`${
                            isLinkSource
                              ? 'fill-amber-500/20 stroke-amber-500 stroke-2 animate-pulse'
                              : isInSimPath
                              ? 'fill-emerald-500/20 stroke-emerald-500 stroke-2'
                              : 'fill-blue-500/20 stroke-blue-500 stroke-2'
                          }`}
                        />
                      )}

                      {/* Node Body Card */}
                      <circle
                        r="20"
                        className={`transition-all shadow-md ${
                          isSelected
                            ? 'fill-white dark:fill-slate-900 stroke-blue-600 stroke-2'
                            : 'fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700 stroke-1 group-hover:stroke-blue-400'
                        }`}
                      />

                      {/* Icon */}
                      <foreignObject x="-10" y="-10" width="20" height="20" className="pointer-events-none">
                        <div className="w-full h-full flex items-center justify-center">
                          {renderIcon(node.type)}
                        </div>
                      </foreignObject>

                      {/* Node Label Text */}
                      <text
                        y="34"
                        textAnchor="middle"
                        className="text-[11px] font-bold fill-slate-800 dark:fill-slate-100 select-none pointer-events-none"
                      >
                        {node.name}
                      </text>
                      <text
                        y="46"
                        textAnchor="middle"
                        className="text-[9px] font-mono fill-slate-500 dark:fill-slate-400 select-none pointer-events-none"
                      >
                        {node.ip}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Quick Canvas Navigation Overlay Bar */}
            <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-500 flex items-center space-x-2 shadow-xs">
              <Move className="h-3 w-3 text-slate-400" />
              <span>Pan: X {pan.x}, Y {pan.y}</span>
              <span>|</span>
              <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Inspector & Live Packet Simulator (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Packet Simulation & Traceroute */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span>Live Packet Trace & Route Ping</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Source Node</label>
                  <select
                    value={simSourceId}
                    onChange={(e) => setSimSourceId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono dark:text-white"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.name} ({n.ip})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Target Node</label>
                  <select
                    value={simTargetId}
                    onChange={(e) => setSimTargetId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono dark:text-white"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.name} ({n.ip})</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={simulatePacketTrace}
                disabled={isSimulating}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5" />
                <span>{isSimulating ? 'Tracing Path...' : 'Simulate Packet Trace'}</span>
              </button>

              {simResult && (
                <div className={`p-3 rounded-lg border text-xs space-y-2 font-mono ${
                  simResult.status === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}>
                  <div className="flex justify-between font-bold">
                    <span>Status: {simResult.status === 'success' ? 'Path Reachable (200 OK)' : 'Unreachable'}</span>
                    {simResult.status === 'success' && <span>{simResult.latency} ms</span>}
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                    {simResult.logs.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Node Inspector */}
          {selectedNode ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {renderIcon(selectedNode.type)}
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Device Properties
                  </h2>
                </div>
                <button
                  onClick={removeSelectedNode}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                  title="Delete Device"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Hostname</label>
                  <input
                    type="text"
                    value={selectedNode.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, name: val } : n));
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">IP Address</label>
                    <input
                      type="text"
                      value={selectedNode.ip}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, ip: val } : n));
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Subnet</label>
                    <input
                      type="text"
                      value={selectedNode.subnet}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, subnet: val } : n));
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Security Zone</label>
                    <select
                      value={selectedNode.zone}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, zone: val } : n));
                      }}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono dark:text-white"
                    >
                      <option value="LAN">LAN</option>
                      <option value="DMZ">DMZ</option>
                      <option value="WAN">WAN</option>
                      <option value="DB">DB</option>
                      <option value="MGMT">MGMT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">OS / Vendor</label>
                    <select
                      value={selectedNode.vendor}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, vendor: val } : n));
                      }}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono dark:text-white"
                    >
                      <option value="Cisco">Cisco IOS</option>
                      <option value="Juniper">Juniper Junos</option>
                      <option value="PaloAlto">Palo Alto PAN-OS</option>
                      <option value="Arista">Arista EOS</option>
                      <option value="Linux">Linux Debian/RHEL</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedLink ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Link Properties
                  </h2>
                </div>
                <button
                  onClick={removeSelectedLink}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                  title="Delete Link"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Link Speed</label>
                  <select
                    value={selectedLink.speed}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setLinks(prev => prev.map(l => l.id === selectedLink.id ? { ...l, speed: val } : l));
                    }}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono dark:text-white"
                  >
                    <option value="1G">1 Gbps (Copper Cat6)</option>
                    <option value="10G">10 Gbps (10GBASE-T / SFP+)</option>
                    <option value="100G">100 Gbps (QSFP28 Fiber)</option>
                    <option value="Wireless">Wireless 802.11ax</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Operational State</label>
                  <select
                    value={selectedLink.status}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setLinks(prev => prev.map(l => l.id === selectedLink.id ? { ...l, status: val } : l));
                    }}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded font-mono dark:text-white"
                  >
                    <option value="up">Link UP (Operational)</option>
                    <option value="down">Link DOWN (Simulate Cable Cut / Fault)</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm text-center text-xs text-slate-400">
              Select any device node or link cable to inspect and edit its network properties.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
