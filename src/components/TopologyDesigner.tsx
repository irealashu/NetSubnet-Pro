import React, { useState } from 'react';
import { Network, Server, Shield, Laptop, Cloud, Plus, Trash2, Download, RefreshCw, ZoomIn, ZoomOut, Move, Layers } from 'lucide-react';

export interface TopologyNode {
  id: string;
  type: 'router' | 'switch' | 'firewall' | 'server' | 'cloud' | 'pc';
  name: string;
  ip: string;
  x: number;
  y: number;
}

export interface TopologyLink {
  id: string;
  from: string;
  to: string;
  label: string;
}

export const TopologyDesigner: React.FC = () => {
  const [nodes, setNodes] = useState<TopologyNode[]>([
    { id: '1', type: 'cloud', name: 'Internet / ISP WAN', ip: '198.51.100.1', x: 400, y: 50 },
    { id: '2', type: 'firewall', name: 'Edge Firewall (ASA)', ip: '198.51.100.2', x: 400, y: 150 },
    { id: '3', type: 'router', name: 'Core Router 01', ip: '10.0.0.1', x: 400, y: 260 },
    { id: '4', type: 'switch', name: 'Dist Switch A (VLAN 10)', ip: '10.0.10.1', x: 220, y: 370 },
    { id: '5', type: 'switch', name: 'Dist Switch B (VLAN 20)', ip: '10.0.20.1', x: 580, y: 370 },
    { id: '6', type: 'server', name: 'App DB Cluster', ip: '10.0.10.50', x: 140, y: 470 },
    { id: '7', type: 'server', name: 'Web Frontends', ip: '10.0.10.60', x: 300, y: 470 },
    { id: '8', type: 'pc', name: 'SecOps Workstation', ip: '10.0.20.100', x: 580, y: 470 }
  ]);

  const [links, setLinks] = useState<TopologyLink[]>([
    { id: 'l1', from: '1', to: '2', label: 'Gig0/0 (WAN)' },
    { id: 'l2', from: '2', to: '3', label: 'Gig0/1 (Transit)' },
    { id: 'l3', from: '3', to: '4', label: 'Trunk LACP-1' },
    { id: 'l4', from: '3', to: '5', label: 'Trunk LACP-2' },
    { id: 'l5', from: '4', to: '6', label: 'Gig1/0/1' },
    { id: 'l6', from: '4', to: '7', label: 'Gig1/0/2' },
    { id: 'l7', from: '5', to: '8', label: 'Gig1/0/24' },
    { id: 'l8', from: '4', to: '5', label: 'VPC Peer Link' }
  ]);

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('3');

  const handlePointerDown = (nodeId: string, e: React.PointerEvent<SVGGElement>) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDragOffset({ x: e.clientX - node.x, y: e.clientY - node.y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingNodeId) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const newX = Math.max(30, Math.min(svgRect.width - 30, e.clientX - svgRect.left));
    const newY = Math.max(30, Math.min(svgRect.height - 30, e.clientY - svgRect.top));

    setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: Math.round(newX), y: Math.round(newY) } : n));
  };

  const handlePointerUp = () => {
    setDraggingNodeId(null);
  };

  const addNode = (type: TopologyNode['type']) => {
    const newNode: TopologyNode = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      name: `New ${type.toUpperCase()}`,
      ip: '10.0.100.1',
      x: 350 + Math.random() * 80,
      y: 200 + Math.random() * 80
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const removeSelectedNode = () => {
    if (!selectedNodeId) return;
    setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
    setLinks(prev => prev.filter(l => l.from !== selectedNodeId && l.to !== selectedNodeId));
    setSelectedNodeId(null);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const downloadJson = () => {
    const data = JSON.stringify({ nodes, links }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'network_topology.json';
    a.click();
  };

  const renderIcon = (type: TopologyNode['type']) => {
    switch (type) {
      case 'router': return <Network className="h-5 w-5 text-blue-500" />;
      case 'switch': return <Layers className="h-5 w-5 text-indigo-500" />;
      case 'firewall': return <Shield className="h-5 w-5 text-rose-500" />;
      case 'server': return <Server className="h-5 w-5 text-emerald-500" />;
      case 'cloud': return <Cloud className="h-5 w-5 text-sky-500" />;
      case 'pc': return <Laptop className="h-5 w-5 text-amber-500" />;
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
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Interactive Network Topology Designer</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Drag-and-drop network topology canvas with routers, switches, firewalls, servers, interface links, and JSON export.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={downloadJson}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Diagram</span>
            </button>
          </div>
        </div>

        {/* Stencil Palette Toolbar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap gap-1.5">
            {[
              { type: 'router', label: '+ Router' },
              { type: 'switch', label: '+ Switch' },
              { type: 'firewall', label: '+ Firewall' },
              { type: 'server', label: '+ Server' },
              { type: 'cloud', label: '+ Cloud/WAN' },
              { type: 'pc', label: '+ Host PC' },
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

          {selectedNodeId && (
            <button
              onClick={removeSelectedNode}
              className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 flex items-center space-x-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Selected</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas & Inspector View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Interactive Canvas */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden h-[560px]">
          {/* Background grid dots */}
          <svg
            className="w-full h-full select-none cursor-crosshair"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Draw links */}
            {links.map((link) => {
              const fromNode = nodes.find(n => n.id === link.from);
              const toNode = nodes.find(n => n.id === link.to);
              if (!fromNode || !toNode) return null;

              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2;

              return (
                <g key={link.id}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray={link.label.includes('Peer') ? '4' : undefined}
                  />
                  <rect
                    x={midX - 35}
                    y={midY - 9}
                    width="70"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    stroke="#1e293b"
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {link.label}
                  </text>
                </g>
              );
            })}

            {/* Draw nodes */}
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const isDragging = node.id === draggingNodeId;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onPointerDown={(e) => handlePointerDown(node.id, e)}
                  className="cursor-move"
                >
                  <circle
                    r="24"
                    fill={isSelected ? '#1e293b' : '#0f172a'}
                    stroke={isSelected ? '#3b82f6' : '#334155'}
                    strokeWidth={isSelected ? '3' : '1.5'}
                  />
                  {/* Render node icon indicator */}
                  <circle r="6" fill={isDragging ? '#60a5fa' : '#3b82f6'} />
                  <text
                    y="36"
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {node.name}
                  </text>
                  <text
                    y="48"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {node.ip}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Node Property Inspector */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <Shield className="h-4 w-4 text-blue-500" />
            <span>Device Property Inspector</span>
          </h2>

          {selectedNode ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Device Hostname
                </label>
                <input
                  type="text"
                  value={selectedNode.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, name: val } : n));
                  }}
                  className="w-full font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Management IP Address
                </label>
                <input
                  type="text"
                  value={selectedNode.ip}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, ip: val } : n));
                  }}
                  className="w-full font-mono text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-lg dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    X Coordinate
                  </label>
                  <input
                    type="number"
                    value={selectedNode.x}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, x: val } : n));
                    }}
                    className="w-full font-mono text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Y Coordinate
                  </label>
                  <input
                    type="number"
                    value={selectedNode.y}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, y: val } : n));
                    }}
                    className="w-full font-mono text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border rounded dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Connected Interfaces:</div>
                {links
                  .filter(l => l.from === selectedNode.id || l.to === selectedNode.id)
                  .map(l => (
                    <div key={l.id} className="font-mono text-slate-600 dark:text-slate-300">
                      • {l.label} ({l.from === selectedNode.id ? `To ${nodes.find(n => n.id === l.to)?.name}` : `From ${nodes.find(n => n.id === l.from)?.name}`})
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any device in the canvas to inspect its IP, hostname, and interface links.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
