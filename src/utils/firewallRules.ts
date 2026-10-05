// Multi-Vendor Firewall Rule Generator

export interface FirewallRuleParams {
  action: 'ALLOW' | 'DENY';
  direction: 'INBOUND' | 'OUTBOUND';
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'ALL';
  srcIp: string;
  srcPort: string;
  dstIp: string;
  dstPort: string;
  ruleName: string;
  priority: number;
  description: string;
}

export function generateFirewallRules(p: FirewallRuleParams) {
  const isAllow = p.action === 'ALLOW';
  const protoLower = p.protocol.toLowerCase();
  const ciscoAction = isAllow ? 'permit' : 'deny';
  const ciscoProto = p.protocol === 'ALL' ? 'ip' : protoLower;

  // Cisco IOS / ASA ACL
  const ciscoSrc = p.srcIp === 'any' || p.srcIp === '0.0.0.0/0' ? 'any' : p.srcIp.includes('/') ? p.srcIp.replace('/', ' ') : `host ${p.srcIp}`;
  const ciscoDst = p.dstIp === 'any' || p.dstIp === '0.0.0.0/0' ? 'any' : p.dstIp.includes('/') ? p.dstIp.replace('/', ' ') : `host ${p.dstIp}`;
  const ciscoPort = p.dstPort && p.dstPort !== 'any' ? ` eq ${p.dstPort}` : '';
  const ciscoAcl = `! Cisco Extended ACL (${p.ruleName})
ip access-list extended ${p.ruleName.toUpperCase().replace(/\s+/g, '_')}_ACL
 remark ${p.description || 'Generated rule'}
 ${ciscoAction} ${ciscoProto} ${ciscoSrc} ${ciscoDst}${ciscoPort} log
! Apply to interface:
! interface GigabitEthernet0/0/1
!  ip access-group ${p.ruleName.toUpperCase().replace(/\s+/g, '_')}_ACL ${p.direction.toLowerCase()}`;

  // Linux iptables & nftables
  const chain = p.direction === 'INBOUND' ? 'INPUT' : 'OUTPUT';
  const iptTarget = isAllow ? 'ACCEPT' : 'DROP';
  const iptProto = p.protocol === 'ALL' ? '' : `-p ${protoLower}`;
  const iptSrc = p.srcIp === 'any' || p.srcIp === '0.0.0.0/0' ? '' : `-s ${p.srcIp}`;
  const iptDst = p.dstIp === 'any' || p.dstIp === '0.0.0.0/0' ? '' : `-d ${p.dstIp}`;
  const iptDport = (p.protocol === 'TCP' || p.protocol === 'UDP') && p.dstPort && p.dstPort !== 'any' ? `--dport ${p.dstPort}` : '';

  const iptables = `# Linux iptables rule
iptables -A ${chain} ${iptProto} ${iptSrc} ${iptDst} ${iptDport} -m comment --comment "${p.ruleName}: ${p.description}" -j ${iptTarget}

# Linux nftables modern syntax
nft add rule inet filter ${p.direction.toLowerCase()} ${p.srcIp !== 'any' ? `ip saddr ${p.srcIp} ` : ''}${p.dstIp !== 'any' ? `ip daddr ${p.dstIp} ` : ''}${p.protocol !== 'ALL' ? `${protoLower} ` : ''}${iptDport ? `dport ${p.dstPort} ` : ''}${iptTarget.toLowerCase()} comment \\"${p.ruleName}\\"`;

  // AWS Security Group JSON & Terraform
  const awsPort = p.dstPort && p.dstPort !== 'any' && !p.dstPort.includes('-') ? parseInt(p.dstPort, 10) : 0;
  const awsTerraform = `# AWS Security Group Rule (Terraform)
resource "aws_security_group_rule" "${p.ruleName.toLowerCase().replace(/[^a-z0-9]/g, '_')}" {
  type              = "${p.direction === 'INBOUND' ? 'ingress' : 'egress'}"
  from_port         = ${awsPort || 0}
  to_port           = ${awsPort || (p.protocol === 'ALL' ? 0 : 65535)}
  protocol          = "${p.protocol === 'ALL' ? '-1' : protoLower}"
  cidr_blocks       = ["${p.srcIp === 'any' ? '0.0.0.0/0' : p.srcIp}"]
  security_group_id = aws_security_group.main.id
  description       = "${p.ruleName} - ${p.description}"
}`;

  // Azure NSG (Azure CLI)
  const azureCli = `# Azure Network Security Group Rule (Azure CLI)
az network nsg rule create \\
  --resource-group Production-RG \\
  --nsg-name Core-VNet-NSG \\
  --name "${p.ruleName.replace(/\s+/g, '-')}" \\
  --priority ${p.priority || 100} \\
  --direction ${p.direction === 'INBOUND' ? 'Inbound' : 'Outbound'} \\
  --access ${isAllow ? 'Allow' : 'Deny'} \\
  --protocol ${p.protocol === 'ALL' ? '*' : p.protocol} \\
  --source-address-prefixes "${p.srcIp === 'any' ? '*' : p.srcIp}" \\
  --source-port-ranges "*" \\
  --destination-address-prefixes "${p.dstIp === 'any' ? '*' : p.dstIp}" \\
  --destination-port-ranges "${p.dstPort === 'any' ? '*' : p.dstPort}" \\
  --description "${p.description}"`;

  // Google Cloud Platform (GCP gcloud)
  const gcpCli = `# Google Cloud VPC Firewall Rule (gcloud)
gcloud compute firewall-rules create "allow-${p.ruleName.toLowerCase().replace(/[^a-z0-9]/g, '-')}" \\
  --network="default" \\
  --direction="${p.direction}" \\
  --priority=${p.priority || 1000} \\
  --action="${isAllow ? 'ALLOW' : 'DENY'}" \\
  --rules="${protoLower}:${p.dstPort === 'any' ? 'all' : p.dstPort}" \\
  --source-ranges="${p.srcIp === 'any' ? '0.0.0.0/0' : p.srcIp}" \\
  --description="${p.description}"`;

  // Fortinet FortiOS CLI
  const fortinet = `# FortiGate FortiOS CLI Rule
config firewall policy
    edit 0
        set name "${p.ruleName}"
        set srcintf "any"
        set dstintf "any"
        set srcaddr "${p.srcIp === 'any' ? 'all' : p.srcIp}"
        set dstaddr "${p.dstIp === 'any' ? 'all' : p.dstIp}"
        set action ${isAllow ? 'accept' : 'deny'}
        set schedule "always"
        set service "${p.dstPort === '443' ? 'HTTPS' : p.dstPort === '80' ? 'HTTP' : p.dstPort === '22' ? 'SSH' : 'ALL'}"
        set logtraffic all
        set comments "${p.description}"
    next
end`;

  // Juniper Junos
  const juniper = `# Juniper Junos Security Policy
set security policies from-zone untrust to-zone trust policy ${p.ruleName.replace(/\s+/g, '_')} match source-address ${p.srcIp === 'any' ? 'any' : p.srcIp}
set security policies from-zone untrust to-zone trust policy ${p.ruleName.replace(/\s+/g, '_')} match destination-address ${p.dstIp === 'any' ? 'any' : p.dstIp}
set security policies from-zone untrust to-zone trust policy ${p.ruleName.replace(/\s+/g, '_')} match application ${p.dstPort === '443' ? 'junos-https' : p.dstPort === '80' ? 'junos-http' : 'any'}
set security policies from-zone untrust to-zone trust policy ${p.ruleName.replace(/\s+/g, '_')} then ${isAllow ? 'permit' : 'deny'}
set security policies from-zone untrust to-zone trust policy ${p.ruleName.replace(/\s+/g, '_')} then log session-close`;

  // pfSense XML snippet
  const pfSense = `<!-- pfSense / OPNsense Filter Rule Snippet -->
<rule>
  <id>${p.priority || 100}</id>
  <type>${isAllow ? 'pass' : 'block'}</type>
  <interface>lan</interface>
  <ipprotocol>inet</ipprotocol>
  <protocol>${protoLower}</protocol>
  <source><address>${p.srcIp === 'any' ? '*' : p.srcIp}</address></source>
  <destination>
    <address>${p.dstIp === 'any' ? '*' : p.dstIp}</address>
    <port>${p.dstPort === 'any' ? '*' : p.dstPort}</port>
  </destination>
  <descr><![CDATA[${p.ruleName}: ${p.description}]]></descr>
</rule>`;

  return {
    ciscoAcl,
    iptables,
    awsTerraform,
    azureCli,
    gcpCli,
    fortinet,
    juniper,
    pfSense
  };
}
