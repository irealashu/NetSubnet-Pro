import React, { useState, useMemo } from 'react';
import { calculateSubnet, intToIp, ipToInt } from '../utils/ipv4';
import { Split, Download, Copy, Check, Table, HelpCircle, Layers, ArrowRight } from 'lucide-react';

export const SubnetSplitter: React.FC = () => {
  const [parentIp, setParentIp] = useState('192.168.0.0');
  const [parentCidr, setParentCidr] = useState(24);
  const [targetCidr, setTargetCidr] = useState(26);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const parentSubnet = useMemo(() => {
    try {
      return calculateSubnet(parentIp, parentCidr);
    } catch {
      return calculateSubnet('192.168.0.0', 24);
    }
  }, [parentIp, parentCidr]);

  // Generate split subnets
  const splitSubnets = useMemo(() => {
    if (targetCidr <= parentCidr) return [];

    const diff = targetCidr - parentCidr;
    const count = Math.min(256, Math.pow(2, diff)); // cap display at 256 for smooth rendering
    const parentStartInt = ipToInt(parentSubnet.networkAddress);
    const blockSize = Math.pow(2, 32 - targetCidr);

    const list = [];
    for (let i = 0; i < count; i++) {
      const netInt = parentStartInt + i * blockSize;
      const sub = calculateSubnet(intToIp(netInt), targetCidr);
      list.push({
        id: i + 1,
        network: sub.networkAddress,
        cidr: sub.cidr,
        slashNotation: `${sub.networkAddress}/${sub.cidr}`,
        netmask: sub.subnetMask,
        usableRange: `${sub.firstUsableHost} - ${sub.lastUsableHost}`,
        broadcast: sub.broadcastAddress,
        usableHosts: sub.usableHosts,
        totalHosts: sub.totalHosts
      });
    }

    return list;
  }, [parentSubnet, parentCidr, targetCidr]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadCsv = () => {
    let csv = 'Index,Network,CIDR,Subnet Mask,Usable Host Range,Broadcast,Usable Hosts\n';
    for (const s of splitSubnets) {
      csv += `${s.id},"${s.network}",/${s.cidr},"${s.netmask}","${s.usableRange}","${s.broadcast}",${s.usableHosts}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `subnet_split_${parentSubnet.networkAddress}_${parentCidr}_into_${targetCidr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPossible = Math.pow(2, Math.max(0, targetCidr - parentCidr));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Split className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">IPv4 Subnet Splitter & Carver</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Divide any major IPv4 prefix into equal smaller subnets for micro-segmentation, VLANs, or cloud VPC subnets.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={downloadCsv}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Input Configuration */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Parent IP Network
            </label>
            <input
              type="text"
              value={parentIp}
              onChange={(e) => setParentIp(e.target.value)}
              placeholder="192.168.0.0"
              className="w-full font-mono text-sm px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Parent Prefix: /{parentCidr}
            </label>
            <select
              value={parentCidr}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setParentCidr(val);
                if (targetCidr <= val) setTargetCidr(Math.min(30, val + 2));
              }}
              className="w-full font-mono text-sm px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((c) => (
                <option key={c} value={c}>
                  /{c} ({calculateSubnet('10.0.0.0', c).totalHosts.toLocaleString()} IPs)
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Target Subnet Size: /{targetCidr}
            </label>
            <select
              value={targetCidr}
              onChange={(e) => setTargetCidr(parseInt(e.target.value, 10))}
              className="w-full font-mono text-sm px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white font-bold text-purple-600 dark:text-purple-400"
            >
              {Array.from({ length: 32 - parentCidr }, (_, i) => parentCidr + 1 + i).map((c) => (
                <option key={c} value={c}>
                  /{c} → {Math.pow(2, c - parentCidr)} Subnets of {Math.max(0, Math.pow(2, 32 - c) - 2)} usable hosts
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Split Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Child Subnets</div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {totalPossible.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400">Usable Hosts / Subnet</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {splitSubnets[0] ? splitSubnets[0].usableHosts.toLocaleString() : 0}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400">Subnet Mask</div>
          <div className="font-mono text-sm font-bold text-slate-900 dark:text-white mt-1.5">
            {splitSubnets[0] ? splitSubnets[0].netmask : ''}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400">Subnet Bits Borrowed</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {targetCidr - parentCidr} bits
          </div>
        </div>
      </div>

      {/* Split Subnet Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
            <Table className="h-4 w-4 text-purple-500" />
            <span>Divided Subnet Allocation Table ({splitSubnets.length} displayed)</span>
          </h2>
          <span className="text-xs text-slate-500">
            Base Network: {parentSubnet.networkAddress}/{parentCidr}
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg max-h-[500px]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 sticky top-0">
              <tr>
                <th className="p-2.5">#</th>
                <th className="p-2.5">Network Prefix</th>
                <th className="p-2.5">Subnet Mask</th>
                <th className="p-2.5">Usable Host Range</th>
                <th className="p-2.5">Broadcast</th>
                <th className="p-2.5 text-right">Hosts</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {splitSubnets.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-2.5 text-slate-400">{sub.id}</td>
                  <td className="p-2.5 font-bold text-purple-600 dark:text-purple-400">{sub.slashNotation}</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-400">{sub.netmask}</td>
                  <td className="p-2.5 text-slate-800 dark:text-slate-200">{sub.usableRange}</td>
                  <td className="p-2.5 text-slate-500 dark:text-slate-400">{sub.broadcast}</td>
                  <td className="p-2.5 text-right font-semibold">{sub.usableHosts}</td>
                  <td className="p-2.5 text-center">
                    <button
                      onClick={() => copyToClipboard(sub.slashNotation, `sub-${sub.id}`)}
                      className="p-1 rounded text-slate-500 hover:text-purple-600"
                      title="Copy Prefix"
                    >
                      {copiedKey === `sub-${sub.id}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
