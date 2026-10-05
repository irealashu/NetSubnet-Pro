// DNS Record, SPF Record, DMARC Generator & HTTP Security Header Utilities

export interface DnsRecord {
  id: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'SRV' | 'CAA' | 'PTR' | 'NS' | 'SOA';
  name: string;
  value: string;
  ttl: number;
  priority?: number;
  weight?: number;
  port?: number;
  flags?: number;
  tag?: 'issue' | 'issuewild' | 'iodef';
}

export function generateZoneFile(domain: string, records: DnsRecord[]): string {
  const cleanDomain = domain.trim().replace(/\.$/, '');
  let out = `; Zone file for ${cleanDomain}\n`;
  out += `$ORIGIN ${cleanDomain}.\n`;
  out += `$TTL 3600\n\n`;
  out += `@ IN SOA ns1.${cleanDomain}. hostmaster.${cleanDomain}. (\n`;
  out += `  2026100501 ; Serial (YYYYMMDDNN)\n`;
  out += `  7200       ; Refresh (2 hours)\n`;
  out += `  3600       ; Retry (1 hour)\n`;
  out += `  1209600    ; Expire (2 weeks)\n`;
  out += `  3600       ; Minimum TTL\n)\n\n`;

  for (const r of records) {
    const formattedName = r.name === '@' || r.name === '' ? '@' : r.name;
    if (r.type === 'MX') {
      out += `${formattedName.padEnd(24)} ${r.ttl}  IN  MX    ${r.priority ?? 10}  ${r.value}.\n`;
    } else if (r.type === 'SRV') {
      out += `${formattedName.padEnd(24)} ${r.ttl}  IN  SRV   ${r.priority ?? 10} ${r.weight ?? 10} ${r.port ?? 443} ${r.value}.\n`;
    } else if (r.type === 'CAA') {
      out += `${formattedName.padEnd(24)} ${r.ttl}  IN  CAA   ${r.flags ?? 0} ${r.tag ?? 'issue'} "${r.value}"\n`;
    } else if (r.type === 'TXT') {
      out += `${formattedName.padEnd(24)} ${r.ttl}  IN  TXT   "${r.value.replace(/"/g, '\\"')}"\n`;
    } else if (r.type === 'CNAME' || r.type === 'NS' || r.type === 'PTR') {
      const target = r.value.endsWith('.') ? r.value : `${r.value}.`;
      out += `${formattedName.padEnd(24)} ${r.ttl}  IN  ${r.type.padEnd(5)} ${target}\n`;
    } else {
      out += `${formattedName.padEnd(24)} ${r.ttl}  IN  ${r.type.padEnd(5)} ${r.value}\n`;
    }
  }

  return out;
}

// SPF Generator
export interface SpfConfig {
  domain: string;
  allowA: boolean;
  allowMx: boolean;
  allowPtr: boolean;
  ip4Addresses: string[];
  ip6Addresses: string[];
  includes: string[];
  qualifier: '-all' | '~all' | '?all' | '+all';
  redirect?: string;
  exp?: string;
}

export function buildSpfRecord(cfg: SpfConfig): { record: string; dnsLookupCount: number; warnings: string[] } {
  const parts: string[] = ['v=spf1'];
  let lookups = 0;
  const warnings: string[] = [];

  if (cfg.allowA) {
    parts.push('a');
    lookups++;
  }
  if (cfg.allowMx) {
    parts.push('mx');
    lookups++;
  }
  if (cfg.allowPtr) {
    parts.push('ptr');
    lookups++;
    warnings.push('The "ptr" mechanism is discouraged by RFC 7208 due to performance and reliability issues.');
  }

  for (const ip4 of cfg.ip4Addresses) {
    if (ip4.trim()) parts.push(`ip4:${ip4.trim()}`);
  }
  for (const ip6 of cfg.ip6Addresses) {
    if (ip6.trim()) parts.push(`ip6:${ip6.trim()}`);
  }

  for (const inc of cfg.includes) {
    if (inc.trim()) {
      parts.push(`include:${inc.trim()}`);
      lookups++;
    }
  }

  if (cfg.redirect?.trim()) {
    parts.push(`redirect=${cfg.redirect.trim()}`);
    lookups++;
  } else {
    parts.push(cfg.qualifier);
  }

  if (cfg.exp?.trim()) {
    parts.push(`exp=${cfg.exp.trim()}`);
    lookups++;
  }

  if (lookups > 10) {
    warnings.push(`SPF record exceeds the RFC 7208 maximum limit of 10 DNS lookups (currently ${lookups} lookups). Receiving MTAs will evaluate this as PermError.`);
  }

  const record = parts.join(' ');
  return { record, dnsLookupCount: lookups, warnings };
}

// DMARC Generator
export interface DmarcConfig {
  domain: string;
  policy: 'none' | 'quarantine' | 'reject';
  subdomainPolicy?: 'none' | 'quarantine' | 'reject';
  aggregateEmails: string[];
  forensicEmails: string[];
  percentage: number;
  dkimAlignment: 'r' | 's'; // relaxed or strict
  spfAlignment: 'r' | 's';  // relaxed or strict
  reportInterval: number;   // in seconds, e.g. 86400
  forensicOptions?: string[]; // 0, 1, d, s
}

export function buildDmarcRecord(cfg: DmarcConfig): { record: string; explanation: string[] } {
  const parts: string[] = [`v=DMARC1`, `p=${cfg.policy}`];
  const explanation: string[] = [];

  if (cfg.policy === 'none') {
    explanation.push('Policy "p=none": Monitoring mode only. Email delivery is unaffected, but reports are sent.');
  } else if (cfg.policy === 'quarantine') {
    explanation.push('Policy "p=quarantine": Failing emails are treated with suspicion (sent to Spam/Junk folder).');
  } else if (cfg.policy === 'reject') {
    explanation.push('Policy "p=reject": Maximum enforcement. Failing emails are dropped at SMTP handshake.');
  }

  if (cfg.subdomainPolicy && cfg.subdomainPolicy !== cfg.policy) {
    parts.push(`sp=${cfg.subdomainPolicy}`);
    explanation.push(`Subdomain Policy "sp=${cfg.subdomainPolicy}": Explicit rule for child domains.`);
  }

  if (cfg.aggregateEmails.length > 0) {
    const formattedRua = cfg.aggregateEmails.filter(e => e.trim()).map(e => e.startsWith('mailto:') ? e : `mailto:${e}`).join(',');
    if (formattedRua) {
      parts.push(`rua=${formattedRua}`);
      explanation.push(`RUA Reports sent to: ${formattedRua}`);
    }
  }

  if (cfg.forensicEmails.length > 0) {
    const formattedRuf = cfg.forensicEmails.filter(e => e.trim()).map(e => e.startsWith('mailto:') ? e : `mailto:${e}`).join(',');
    if (formattedRuf) {
      parts.push(`ruf=${formattedRuf}`);
      explanation.push(`Forensic Failure (RUF) reports sent to: ${formattedRuf}`);
    }
  }

  if (cfg.percentage < 100) {
    parts.push(`pct=${cfg.percentage}`);
    explanation.push(`Policy applies to ${cfg.percentage}% of incoming message streams.`);
  }

  if (cfg.dkimAlignment === 's') {
    parts.push(`adkim=s`);
    explanation.push('Strict DKIM Alignment (d= domain in signature must strictly match the From header domain).');
  }

  if (cfg.spfAlignment === 's') {
    parts.push(`aspf=s`);
    explanation.push('Strict SPF Alignment (envelope Return-Path must strictly match the From header domain).');
  }

  if (cfg.reportInterval !== 86400) {
    parts.push(`ri=${cfg.reportInterval}`);
  }

  return {
    record: parts.join('; '),
    explanation
  };
}

// HTTP Security Headers
export interface SecurityHeadersConfig {
  hsts: { enabled: boolean; maxAge: number; includeSubDomains: boolean; preload: boolean };
  csp: {
    enabled: boolean;
    defaultSrc: string[];
    scriptSrc: string[];
    styleSrc: string[];
    imgSrc: string[];
    connectSrc: string[];
    frameAncestors: string[];
    upgradeInsecureRequests: boolean;
  };
  xFrameOptions: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM' | 'DISABLED';
  xContentTypeOptions: boolean;
  referrerPolicy: string;
  permissionsPolicy: string;
  cors: {
    enabled: boolean;
    allowOrigin: string;
    allowMethods: string[];
    allowHeaders: string[];
    allowCredentials: boolean;
  };
}

export function generateServerHeaderConfigs(cfg: SecurityHeadersConfig): { nginx: string; apache: string; cloudflare: string; caddy: string; express: string } {
  const hstsValue = cfg.hsts.enabled
    ? `max-age=${cfg.hsts.maxAge}${cfg.hsts.includeSubDomains ? '; includeSubDomains' : ''}${cfg.hsts.preload ? '; preload' : ''}`
    : '';

  const cspParts: string[] = [];
  if (cfg.csp.enabled) {
    if (cfg.csp.defaultSrc.length) cspParts.push(`default-src ${cfg.csp.defaultSrc.join(' ')}`);
    if (cfg.csp.scriptSrc.length) cspParts.push(`script-src ${cfg.csp.scriptSrc.join(' ')}`);
    if (cfg.csp.styleSrc.length) cspParts.push(`style-src ${cfg.csp.styleSrc.join(' ')}`);
    if (cfg.csp.imgSrc.length) cspParts.push(`img-src ${cfg.csp.imgSrc.join(' ')}`);
    if (cfg.csp.connectSrc.length) cspParts.push(`connect-src ${cfg.csp.connectSrc.join(' ')}`);
    if (cfg.csp.frameAncestors.length) cspParts.push(`frame-ancestors ${cfg.csp.frameAncestors.join(' ')}`);
    if (cfg.csp.upgradeInsecureRequests) cspParts.push('upgrade-insecure-requests');
  }
  const cspValue = cspParts.join('; ');

  // Nginx
  let nginx = `# Nginx Security Headers Configuration\n`;
  if (hstsValue) nginx += `add_header Strict-Transport-Security "${hstsValue}" always;\n`;
  if (cspValue) nginx += `add_header Content-Security-Policy "${cspValue}" always;\n`;
  if (cfg.xFrameOptions !== 'DISABLED') nginx += `add_header X-Frame-Options "${cfg.xFrameOptions}" always;\n`;
  if (cfg.xContentTypeOptions) nginx += `add_header X-Content-Type-Options "nosniff" always;\n`;
  if (cfg.referrerPolicy) nginx += `add_header Referrer-Policy "${cfg.referrerPolicy}" always;\n`;
  if (cfg.permissionsPolicy) nginx += `add_header Permissions-Policy "${cfg.permissionsPolicy}" always;\n`;
  if (cfg.cors.enabled) {
    nginx += `add_header Access-Control-Allow-Origin "${cfg.cors.allowOrigin}" always;\n`;
    nginx += `add_header Access-Control-Allow-Methods "${cfg.cors.allowMethods.join(', ')}" always;\n`;
  }

  // Apache
  let apache = `# Apache .htaccess / VirtualHost Security Headers\n<IfModule mod_headers.c>\n`;
  if (hstsValue) apache += `  Header always set Strict-Transport-Security "${hstsValue}"\n`;
  if (cspValue) apache += `  Header always set Content-Security-Policy "${cspValue}"\n`;
  if (cfg.xFrameOptions !== 'DISABLED') apache += `  Header always set X-Frame-Options "${cfg.xFrameOptions}"\n`;
  if (cfg.xContentTypeOptions) apache += `  Header always set X-Content-Type-Options "nosniff"\n`;
  if (cfg.referrerPolicy) apache += `  Header always set Referrer-Policy "${cfg.referrerPolicy}"\n`;
  if (cfg.permissionsPolicy) apache += `  Header always set Permissions-Policy "${cfg.permissionsPolicy}"\n`;
  apache += `</IfModule>\n`;

  // Caddy
  let caddy = `# Caddyfile Security Headers\nheader {\n`;
  if (hstsValue) caddy += `    Strict-Transport-Security "${hstsValue}"\n`;
  if (cspValue) caddy += `    Content-Security-Policy "${cspValue}"\n`;
  if (cfg.xFrameOptions !== 'DISABLED') caddy += `    X-Frame-Options "${cfg.xFrameOptions}"\n`;
  if (cfg.xContentTypeOptions) caddy += `    X-Content-Type-Options "nosniff"\n`;
  if (cfg.referrerPolicy) caddy += `    Referrer-Policy "${cfg.referrerPolicy}"\n`;
  if (cfg.permissionsPolicy) caddy += `    Permissions-Policy "${cfg.permissionsPolicy}"\n`;
  caddy += `}\n`;

  // Cloudflare Workers
  let cloudflare = `// Cloudflare Worker Security Header Injection
export default {
  async fetch(request, env, ctx) {
    const response = await fetch(request);
    const newHeaders = new Headers(response.headers);
${hstsValue ? `    newHeaders.set("Strict-Transport-Security", "${hstsValue}");\n` : ''}${cspValue ? `    newHeaders.set("Content-Security-Policy", "${cspValue}");\n` : ''}${cfg.xFrameOptions !== 'DISABLED' ? `    newHeaders.set("X-Frame-Options", "${cfg.xFrameOptions}");\n` : ''}${cfg.xContentTypeOptions ? `    newHeaders.set("X-Content-Type-Options", "nosniff");\n` : ''}${cfg.referrerPolicy ? `    newHeaders.set("Referrer-Policy", "${cfg.referrerPolicy}");\n` : ''}    return new Response(response.body, { status: response.status, headers: newHeaders });
  }
};`;

  // Express Helmet / Middleware
  let express = `// Express.js / Node.js Middleware
import express from 'express';
import helmet from 'helmet';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: ${cfg.csp.enabled ? `{\n      directives: {\n        defaultSrc: ${JSON.stringify(cfg.csp.defaultSrc)},\n        scriptSrc: ${JSON.stringify(cfg.csp.scriptSrc)},\n        styleSrc: ${JSON.stringify(cfg.csp.styleSrc)}\n      }\n    }` : 'false'},
    hsts: ${cfg.hsts.enabled ? `{ maxAge: ${cfg.hsts.maxAge}, includeSubDomains: ${cfg.hsts.includeSubDomains}, preload: ${cfg.hsts.preload} }` : 'false'},
    frameguard: ${cfg.xFrameOptions !== 'DISABLED' ? `{ action: "${cfg.xFrameOptions.toLowerCase()}" }` : 'false'},
    noSniff: ${cfg.xContentTypeOptions}
  })
);`;

  return { nginx, apache, cloudflare, caddy, express };
}
