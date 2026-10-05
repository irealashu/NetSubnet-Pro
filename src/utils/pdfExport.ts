import { jsPDF } from 'jspdf';
import { TopologyNode, TopologyLink } from '../components/TopologyDesigner';

export interface TopologyPdfData {
  title: string;
  nodes: TopologyNode[];
  links: TopologyLink[];
  simResult?: {
    path: string[];
    hops: number;
    latency: number;
    status: 'success' | 'unreachable';
    logs: string[];
  } | null;
}

/**
 * Renders the topology nodes and links onto an HTML5 canvas scaled to fit perfectly without any clipping,
 * and converts it to a PNG data URL.
 */
export async function renderTopologyToImage(nodes: TopologyNode[], links: TopologyLink[]): Promise<string> {
  const canvas = document.createElement('canvas');
  const width = 1600;
  const height = 1000;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#0f172a'; // slate-900
  ctx.fillRect(0, 0, width, height);

  // Subtle grid
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  if (nodes.length === 0) return canvas.toDataURL('image/png');

  // Compute bounding box
  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const padding = 120;
  const bboxW = Math.max(maxX - minX + padding * 2, 200);
  const bboxH = Math.max(maxY - minY + padding * 2, 200);

  const scale = Math.min(width / bboxW, height / bboxH);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const offsetX = width / 2 - centerX * scale;
  const offsetY = height / 2 - centerY * scale;

  const transform = (x: number, y: number) => ({
    x: x * scale + offsetX,
    y: y * scale + offsetY
  });

  // Draw links
  links.forEach((l) => {
    const from = nodes.find(n => n.id === l.from);
    const to = nodes.find(n => n.id === l.to);
    if (!from || !to) return;

    const ptFrom = transform(from.x, from.y);
    const ptTo = transform(to.x, to.y);

    ctx.beginPath();
    ctx.moveTo(ptFrom.x, ptFrom.y);
    ctx.lineTo(ptTo.x, ptTo.y);

    if (l.status === 'down') {
      ctx.strokeStyle = '#f43f5e'; // rose-500
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 3;
    } else if (l.speed === '100G') {
      ctx.strokeStyle = '#a855f7'; // purple-500
      ctx.setLineDash([]);
      ctx.lineWidth = 4.5;
    } else if (l.speed === '10G') {
      ctx.strokeStyle = '#3b82f6'; // blue-500
      ctx.setLineDash([]);
      ctx.lineWidth = 3.5;
    } else {
      ctx.strokeStyle = '#64748b'; // slate-500
      ctx.setLineDash([]);
      ctx.lineWidth = 2.5;
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw speed badge
    const midX = (ptFrom.x + ptTo.x) / 2;
    const midY = (ptFrom.y + ptTo.y) / 2;

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(midX - 32, midY - 14, 64, 28, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(l.speed, midX, midY);
  });

  // Draw nodes
  nodes.forEach((n) => {
    const pt = transform(n.x, n.y);
    const radius = 32;

    // Node outer circle
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);

    let fillColor = '#1e293b';
    let strokeColor = '#3b82f6';

    if (n.type === 'router') { strokeColor = '#3b82f6'; }
    else if (n.type === 'switch') { strokeColor = '#6366f1'; }
    else if (n.type === 'firewall') { strokeColor = '#f43f5e'; }
    else if (n.type === 'server') { strokeColor = '#10b981'; }
    else if (n.type === 'cloud') { strokeColor = '#0ea5e9'; }
    else if (n.type === 'pc') { strokeColor = '#f59e0b'; }

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3.5;
    ctx.fill();
    ctx.stroke();

    // Inner icon symbol
    ctx.fillStyle = strokeColor;
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.type.substring(0, 3).toUpperCase(), pt.x, pt.y);

    // Node labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(n.name, pt.x, pt.y + radius + 22);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText(n.ip, pt.x, pt.y + radius + 40);
  });

  return canvas.toDataURL('image/png');
}

/**
 * Generates an executive, publication-grade multi-page network documentation PDF:
 * Page 1: Fitted Landscape Topology Diagram with executive metadata & statistics.
 * Page 2: Device Hardware & IP Subnet Inventory Schedule.
 * Page 3: Interconnect & Cable Run Matrix.
 * Page 4: Traffic Simulation / Traceroute Route Verification (if provided).
 */
export async function exportTopologyToPdf(data: TopologyPdfData): Promise<void> {
  const { title, nodes, links, simResult } = data;
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm

  // ==========================================
  // PAGE 1: Executive Cover & Topology Map
  // ==========================================

  // Header Banner
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('NETVOK TOOLS — ENTERPRISE NETWORK TOPOLOGY REPORT', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${new Date().toLocaleString()} | Architecture Blueprint: ${title}`, 14, 21);

  // Summary Metrics Badges
  const badgeY = 34;
  const badgeW = 60;
  const badgeH = 14;

  const metrics = [
    { label: 'Total Managed Nodes', val: `${nodes.length} Devices` },
    { label: 'Interconnect Links', val: `${links.length} Active Runs` },
    { label: 'Core Throughput', val: '100G / 10G LACP' },
    { label: 'Security Zones', val: 'WAN, DMZ, LAN, DB' }
  ];

  metrics.forEach((m, idx) => {
    const x = 14 + idx * (badgeW + 7);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(x, badgeY, badgeW, badgeH, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label.toUpperCase(), x + 4, badgeY + 5);
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(m.val, x + 4, badgeY + 11);
  });

  // Render & Embed Topology Diagram (Page 1)
  const imgData = await renderTopologyToImage(nodes, links);
  if (imgData) {
    const mapY = 53;
    const mapW = pageWidth - 28; // 269mm
    const mapH = pageHeight - mapY - 14; // ~143mm
    doc.addImage(imgData, 'PNG', 14, mapY, mapW, mapH);
  }

  // Page 1 Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Page 1 of 3 — Architectural Diagram Overview', 14, pageHeight - 6);
  doc.text('CONFIDENTIAL & PROPRIETARY — NETVOK INFRASTRUCTURE SUITE', pageWidth - 14, pageHeight - 6, { align: 'right' });

  // ==========================================
  // PAGE 2: Device & Interface Inventory Table
  // ==========================================
  doc.addPage('a4', 'landscape');

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('DEVICE HARDWARE & IP SUBNET INVENTORY', 14, 14);

  // Table Headers
  let tableY = 32;
  const colWidths = [45, 30, 38, 40, 24, 30, 38];
  const headers = ['Hostname / Name', 'Device Type', 'IPv4 Address', 'Subnet CIDR', 'VLAN', 'Zone', 'Vendor / OS'];

  doc.setFillColor(226, 232, 240);
  doc.rect(14, tableY, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  let curX = 16;
  headers.forEach((h, idx) => {
    doc.text(h, curX, tableY + 5.5);
    curX += colWidths[idx];
  });

  tableY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  nodes.forEach((node, idx) => {
    if (tableY > pageHeight - 20) {
      doc.addPage('a4', 'landscape');
      tableY = 25;
    }

    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, tableY, pageWidth - 28, 7.5, 'F');
    }

    doc.setTextColor(15, 23, 42);
    let xPos = 16;

    doc.setFont('helvetica', 'bold');
    doc.text(node.name, xPos, tableY + 5);
    xPos += colWidths[0];

    doc.setFont('helvetica', 'normal');
    doc.text(node.type.toUpperCase(), xPos, tableY + 5);
    xPos += colWidths[1];

    doc.setFont('courier', 'bold');
    doc.text(node.ip, xPos, tableY + 5);
    xPos += colWidths[2];

    doc.text(node.subnet, xPos, tableY + 5);
    xPos += colWidths[3];

    doc.setFont('helvetica', 'normal');
    doc.text(node.vlan === 0 ? 'Trunk / Native' : `VLAN ${node.vlan}`, xPos, tableY + 5);
    xPos += colWidths[4];

    doc.text(node.zone, xPos, tableY + 5);
    xPos += colWidths[5];

    doc.text(node.vendor, xPos, tableY + 5);

    tableY += 7.5;
  });

  // Page 2 Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Page 2 of 3 — Comprehensive Hardware Schedule', 14, pageHeight - 6);
  doc.text('CONFIDENTIAL & PROPRIETARY — NETVOK INFRASTRUCTURE SUITE', pageWidth - 14, pageHeight - 6, { align: 'right' });

  // ==========================================
  // PAGE 3: Cable Runs & Interconnect Matrix
  // ==========================================
  doc.addPage('a4', 'landscape');

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('INTERCONNECT CABLING & LINK RUN SCHEDULE', 14, 14);

  tableY = 32;
  const linkColWidths = [30, 60, 60, 40, 35, 40];
  const linkHeaders = ['Link ID', 'Source Device (Port)', 'Destination Device (Port)', 'Link Speed / Medium', 'Operational State', 'Redundancy'];

  doc.setFillColor(226, 232, 240);
  doc.rect(14, tableY, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  curX = 16;
  linkHeaders.forEach((h, idx) => {
    doc.text(h, curX, tableY + 5.5);
    curX += linkColWidths[idx];
  });

  tableY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  links.forEach((link, idx) => {
    const fromNode = nodes.find(n => n.id === link.from);
    const toNode = nodes.find(n => n.id === link.to);

    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, tableY, pageWidth - 28, 7.5, 'F');
    }

    doc.setTextColor(15, 23, 42);
    let xPos = 16;

    doc.setFont('courier', 'bold');
    doc.text(link.id, xPos, tableY + 5);
    xPos += linkColWidths[0];

    doc.setFont('helvetica', 'normal');
    doc.text(`${fromNode?.name || link.from} (${link.labelFrom})`, xPos, tableY + 5);
    xPos += linkColWidths[1];

    doc.text(`${toNode?.name || link.to} (${link.labelTo})`, xPos, tableY + 5);
    xPos += linkColWidths[2];

    doc.setFont('helvetica', 'bold');
    doc.text(link.speed, xPos, tableY + 5);
    xPos += linkColWidths[3];

    if (link.status === 'up') {
      doc.setTextColor(16, 185, 129); // green
      doc.text('UP (Operational)', xPos, tableY + 5);
    } else {
      doc.setTextColor(244, 63, 94); // red
      doc.text('DOWN (Fault)', xPos, tableY + 5);
    }
    xPos += linkColWidths[4];

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Active-Active LACP', xPos, tableY + 5);

    tableY += 7.5;
  });

  // If Simulation Traceroute Logs Exist, add below the cable table
  if (simResult && simResult.logs.length > 0) {
    tableY += 10;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, tableY, pageWidth - 28, 38, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('TRAFFIC TRACEROUTE & HOP-BY-HOP AUDIT LOGS', 18, tableY + 6);

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    let logY = tableY + 12;
    simResult.logs.slice(0, 4).forEach((log) => {
      doc.text(`> ${log}`, 18, logY);
      logY += 5.5;
    });
  }

  // Page 3 Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Page 3 of 3 — Interconnect Schedule & Audit', 14, pageHeight - 6);
  doc.text('CONFIDENTIAL & PROPRIETARY — NETVOK INFRASTRUCTURE SUITE', pageWidth - 14, pageHeight - 6, { align: 'right' });

  // Save PDF
  doc.save(`netvok_topology_report_${Date.now()}.pdf`);
}

export interface RackPdfData {
  rackName: string;
  totalU: number;
  items: Array<{
    name: string;
    type: string;
    startU: number;
    heightU: number;
    powerWatts: number;
    weightKg: number;
    ip: string;
    notes: string;
  }>;
  stats: {
    totalWatts: number;
    totalAmps208V: number;
    totalBtu: number;
    totalWeightKg: number;
    occupiedU: number;
    utilizationPercent: number;
  };
}

export function exportRackToPdf(data: RackPdfData): void {
  const { rackName, totalU, items, stats } = data;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  // ==========================================
  // PAGE 1: Datacenter Elevation & Metric Summary
  // ==========================================
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('NETVOK TOOLS — DATACENTER RACK ELEVATION REPORT', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${new Date().toLocaleString()} | Rack Name: ${rackName} (${totalU}U Chassis)`, 14, 20);

  // Summary Metrics Badges
  const badgeY = 32;
  const badgeW = 43;
  const badgeH = 14;

  const metrics = [
    { label: 'Total Power Load', val: `${(stats.totalWatts / 1000).toFixed(2)} kW` },
    { label: 'Current Draw (208V)', val: `${stats.totalAmps208V} A` },
    { label: 'Thermal Output', val: `${stats.totalBtu.toLocaleString()} BTU/hr` },
    { label: 'Rack Space Used', val: `${stats.occupiedU}/${totalU}U (${stats.utilizationPercent}%)` }
  ];

  metrics.forEach((m, idx) => {
    const x = 14 + idx * (badgeW + 4);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(x, badgeY, badgeW, badgeH, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label.toUpperCase(), x + 3, badgeY + 4.5);
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(m.val, x + 3, badgeY + 10.5);
  });

  // Table of Rack Elevation Items
  let tableY = 53;
  const colWidths = [18, 55, 30, 24, 25, 30];
  const headers = ['Unit #', 'Device Model / Asset', 'IP Address', 'Power (W)', 'Weight (kg)', 'Subsystem / Role'];

  doc.setFillColor(226, 232, 240);
  doc.rect(14, tableY, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  let curX = 16;
  headers.forEach((h, idx) => {
    doc.text(h, curX, tableY + 5.5);
    curX += colWidths[idx];
  });

  tableY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const sortedItems = [...items].sort((a, b) => b.startU - a.startU);

  sortedItems.forEach((item, idx) => {
    if (tableY > pageHeight - 20) {
      doc.addPage('a4', 'portrait');
      tableY = 25;
    }

    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, tableY, pageWidth - 28, 7, 'F');
    }

    doc.setTextColor(15, 23, 42);
    let xPos = 16;

    doc.setFont('courier', 'bold');
    doc.text(`${item.startU}U${item.heightU > 1 ? `-${item.startU + item.heightU - 1}U` : ''}`, xPos, tableY + 5);
    xPos += colWidths[0];

    doc.setFont('helvetica', 'bold');
    doc.text(item.name.substring(0, 32), xPos, tableY + 5);
    xPos += colWidths[1];

    doc.setFont('courier', 'normal');
    doc.text(item.ip, xPos, tableY + 5);
    xPos += colWidths[2];

    doc.setFont('helvetica', 'normal');
    doc.text(`${item.powerWatts} W`, xPos, tableY + 5);
    xPos += colWidths[3];

    doc.text(`${item.weightKg} kg`, xPos, tableY + 5);
    xPos += colWidths[4];

    doc.text(item.notes.substring(0, 20), xPos, tableY + 5);

    tableY += 7;
  });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Page 1 of 1 — Datacenter Facility Infrastructure Report', 14, pageHeight - 6);
  doc.text('CONFIDENTIAL & PROPRIETARY — NETVOK INFRASTRUCTURE SUITE', pageWidth - 14, pageHeight - 6, { align: 'right' });

  doc.save(`netvok_rack_elevation_${Date.now()}.pdf`);
}

