# Netvok Tools — Enterprise Network Engineering Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

**Netvok Tools** is a comprehensive, client-side 30-in-1 network engineering suite, protocol simulation workbench, and datacenter architectural planner. Built for network engineers, systems administrators, SecOps professionals, and students, it delivers immediate calculations, interactive protocol dissection, and publication-ready multi-page PDF reports directly in the web browser with zero server roundtrips.

---

## 📑 Table of Contents

- [Key Architecture Highlights](#-key-architecture-highlights)
- [Complete 30-Tool Suite Breakdown](#-complete-30-tool-suite-breakdown)
  - [1. IP Addressing & Subnetting](#1-ip-addressing--subnetting)
  - [2. Protocols & Network Simulation](#2-protocols--network-simulation)
  - [3. Packet Analysis & Traffic Crafting](#3-packet-analysis--traffic-crafting)
  - [4. Planning & Datacenter Architecture](#4-planning--datacenter-architecture)
  - [5. Security, DNS & Device Configuration](#5-security-dns--device-configuration)
- [Multi-Page PDF & Diagram Export Engine](#-multi-page-pdf--diagram-export-engine)
- [Tech Stack & Dependencies](#-tech-stack--dependencies)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development Server](#development-server)
  - [Production Build](#production-build)
- [Directory Structure](#-directory-structure)
- [Privacy & Security](#-privacy--security)
- [Contributing](#-contributing)
- [License](#-license)

---

## ⚡ Key Architecture Highlights

- **100% In-Browser & Zero-Telemetry**: All mathematical calculations, CIDR bit manipulations, packet parses, and cryptographic hash derivations occur strictly in client-side WebAssembly / TypeScript runtime.
- **Infinite Pan, Zoom & Auto-Fit Canvas**: The Topology Designer provides a boundless SVG canvas with mouse-wheel zoom, drag-to-pan, and 1-click **Fit to Screen** auto-framing.
- **Publication-Ready Multi-Page PDF Export**: Generates landscape A4 reports featuring an auto-fitted topology map on Page 1 (guaranteed zero cutoff) alongside device hardware tables and interconnect cable schedules on subsequent pages.
- **Global Command Palette (`⌘K` / `Ctrl+K`)**: Instant keyboard-driven lookup to jump to any of the 30 tools or filter by protocol and category.
- **Persistent Header & Quick Breadcrumb Switcher**: Instant 1-click tool switching directly from the top navigation bar with dark/light mode toggling.

---

## 🛠️ Complete 30-Tool Suite Breakdown

### 1. IP Addressing & Subnetting

| Tool | Description | Capabilities |
| :--- | :--- | :--- |
| **IPv4 Calculator** | Professional CIDR calculator | Subnet mask, wildcard mask, network & broadcast IPs, first/last usable hosts, binary octet breakdown, Classful classification, and RFC 1918 status. |
| **IPv6 Calculator** | 128-bit IPv6 subnet & address tool | Full 32-character hexadecimal expansion, RFC 5952 zero-compression, EUI-64 MAC conversion, prefix ranges, and `ip6.arpa` PTR reverse DNS generation. |
| **CIDR Calculator** | Slash prefix aggregation tool | Instant visual 32-bit allocation bar, usable host calculation (/0 to /32), and subnet mask conversions. |
| **VLSM Calculator** | Variable Length Subnet Masking engine | Custom host requirement sizing, automated optimal prefix allocation tree, zero-waste hierarchical carving, and route summarization export. |
| **Subnet Splitter** | Prefix subdivider | Decompose parent CIDR networks into equal smaller `/24`, `/26`, `/28`, etc. subnets with tabular export. |
| **IP Range Finder** | Start/End IP to CIDR converter | Converts arbitrary IP ranges into the minimal mathematical set of valid non-overlapping CIDR blocks. |
| **Route Summarization** | Supernetting & route aggregator | Minimizes routing tables by summarizing multiple subnets into optimal aggregate prefixes while highlighting unassigned space. |
| **Overlap Checker** | VPC & subnet conflict detector | Audits list of CIDR blocks, detecting direct overlaps, subset containment, and VPC IP space collisions. |
| **CIDR Reference Matrix** | Quick-reference lookup cheat sheet | Complete reference table from `/0` to `/32` displaying subnet masks, wildcard masks, total addresses, usable hosts, and Cisco/BGP use cases. |

---

### 2. Protocols & Network Simulation

| Tool | Description | Capabilities |
| :--- | :--- | :--- |
| **TCP 3-Way Handshake Simulator** | Interactive TCP state machine | Step-by-step 3-way connection setup (`SYN`, `SYN-ACK`, `ACK`), HTTP data streaming, and 4-way teardown (`FIN`, `ACK`, `TIME_WAIT`). Includes configurable ISNs, window size, packet loss simulation, RTO backoff timers, and 8-bit TCP flag vectors. |
| **TLS 1.2 vs 1.3 Cryptography Visualizer** | Cryptographic handshake comparator | Compares 1-RTT (TLS 1.3) vs 2-RTT (TLS 1.2) connection latency, ECDHE key shares (X25519, P-256), ALPN protocols (HTTP/3, HTTP/2), HKDF key derivation schedules, and X.509 certificate chains. |
| **DNS Resolution Visualizer** | Hierarchical DNS query flow | Simulates recursive and iterative resolution queries starting from Root Hints (`.`), Top-Level Domains (`.com`), Authoritative Nameservers, to Local Resolvers with TTL caching and DNSSEC badges. |
| **NAT / PAT Hardware Simulator** | Dynamic translation engine | Simulates RFC 3022 Port Address Translation (PAT / Overload), 1:1 Static NAT, and DNAT Port Forwarding with live Inside Local, Inside Global, Outside Local, and Outside Global state table tracking. |
| **Routing Table Viewer** | Longest Prefix Match (LPM) engine | Simulates hardware FIB/RIB route table lookups with configurable Administrative Distance, metric evaluation, binary bitmask matching, and egress interface selection. |
| **OSI 7-Layer Explorer** | Interactive reference model | Deep dives into all 7 OSI layers (Physical to Application) with interactive payload encapsulation and decapsulation animations. |

---

### 3. Packet Analysis & Traffic Crafting

| Tool | Description | Capabilities |
| :--- | :--- | :--- |
| **Packet Decoder** | Byte stream dissector | Dissects raw hexadecimal and Base64 byte dumps across Ethernet II, 802.1Q VLAN, IPv4, IPv6, TCP, UDP, and ICMP headers. |
| **PCAP Viewer** | Wireshark-style 3-pane dissector | Inspects packet capture streams across 3 linked panes: Packet List Grid, Protocol Field Dissection Tree, and Hex / ASCII byte viewer. Includes pre-loaded captures (HTTP, DNS, TCP, TLS, ARP, DHCP, ICMP). |
| **Packet Builder** | Raw frame crafter & Scapy generator | Build customized Layer 2 Ethernet, 802.1Q, IPv4, and TCP/UDP frames byte-by-byte with live RFC 1071 16-bit one's complement checksum calculation and Python Scapy export. |

---

### 4. Planning & Datacenter Architecture

| Tool | Description | Capabilities |
| :--- | :--- | :--- |
| **Topology Designer** | Canvas diagrammer & traceroute engine | Drag-and-drop network topology canvas with Routers, Switches, Next-Gen Firewalls, Servers, Load Balancers, Cloud WAN, and PCs. Features infinite pan/zoom, **Fit to Screen**, interactive cable speed linking (100G, 10G, 1G, Wireless), live BFS packet path tracing, and multi-page PDF exports. |
| **Design Canvas** | Security zone architectural board | VPC subnets, DMZ perimeters, micro-segmentation boundaries, and Markdown architecture documentation builder. |
| **Rack Planner** | 42U / 48U Datacenter elevation designer | Visualizes rack chassis elevations, calculates total power wattage (kW), 208V current draw (Amps), thermal dissipation (BTU/hr), chassis weight, and exports elevation PDF reports. |
| **VLAN Planner** | 802.1Q Matrix & switchport generator | Designs VLAN segmentations, SVI default gateways, QinQ double tagging, and generates Cisco IOS / Juniper Junos switchport configurations. |
| **OSPF Planner** | Multi-area link-state designer | Calculates interface auto-cost metrics based on reference bandwidth, DR/BDR election priority, LSA type matrices (Type 1 to 5), and multi-area Backbone Area 0 design. |
| **BGP Tools** | BGP-4 Best Path decision engine | Simulates the 9-step BGP route selection algorithm (Weight, Local Preference, Locally Originated, AS-Path length, Origin, MED, eBGP vs iBGP, IGP metric, Router ID) and generates Cisco/Juniper route-maps. |

---

### 5. Security, DNS & Device Configuration

| Tool | Description | Capabilities |
| :--- | :--- | :--- |
| **Firewall Rule Generator** | Multi-vendor policy builder | Generates validated firewall ACL rules for Cisco IOS Extended ACL, Linux `iptables`, Linux `nftables`, AWS Security Groups (CLI & Terraform), Azure NSG, GCP VPC Firewall, and Fortinet FortiOS. |
| **DNS Record Builder** | RFC 1035 BIND zone file crafter | Formats BIND zone records for `A`, `AAAA`, `CNAME`, `MX`, `TXT`, `SRV`, `CAA`, `NS`, and `SOA` with TTL validation. |
| **SPF Generator** | `v=spf1` Email authentication builder | Generates Sender Policy Framework TXT records with `include:`, `ip4:`, `ip6:`, `a`, `mx`, and fallback qualifiers (`~all`, `-all`), enforcing the RFC 7208 10-DNS-lookup limit. |
| **DMARC Generator** | `v=DMARC1` Policy generator | Generates Domain-based Message Authentication records with policy enforcement (`none`, `quarantine`, `reject`), alignment modes (DKIM/SPF strict vs relaxed), and RUA/RUF reporting URIs. |
| **Header Analyzer** | HTTP Security scorecard & exporter | Audits HTTP response headers against OWASP standards (HSTS, CSP, X-Frame-Options, Permissions-Policy, Referrer-Policy) and generates Nginx, Apache, Caddy, Cloudflare, and Express configurations. |
| **JWT Decoder** | Client-side token inspector | Decodes JSON Web Token (JWT) headers and payload claims, checking issued-at (`iat`), expiration (`exp`), and algorithm (`alg`) without sending tokens to any external server. |
| **SHA256 & Hash Generator** | Firmware checksum validator | Computes SHA-256, SHA-512, SHA-1, and MD5 hashes in real-time via Web Crypto API for verifying firmware images and ISO downloads. |
| **Password & Secret Generator** | Cryptographic entropy & Cisco Type 7 | Generates high-entropy random passwords and encrypts/decrypts Cisco Type 7 password ciphers for legacy device audits. |
| **Device Config Generator** | Multi-vendor baseline provisioning | Generates production base configurations for Cisco IOS-XE, Juniper Junos, Arista EOS, MikroTik RouterOS, and Linux NetworkManager (VLANs, OSPF, SSH, NTP, Syslog, BGP). |

---

## 📄 Multi-Page PDF & Diagram Export Engine

The suite features a custom PDF generation engine powered by `jspdf` and HTML5 Canvas vector rendering (`src/utils/pdfExport.ts`):

- **Page 1: Executive Overview & Auto-Fitted Map**:
  - Calculates the exact dynamic bounding box of all active devices.
  - Automatically centers and scales the diagram onto an A4 landscape canvas with zero element clipping.
  - Formats summary badges: Total Managed Nodes, Active Interconnect Links, Core Bandwidth, and Security Zones.
- **Page 2: Hardware & IP Address Schedule**:
  - Tabular inventory listing Hostname, Device Type, Management IP, Subnet CIDR, VLAN ID, Security Zone, and Vendor/OS.
- **Page 3: Interconnect & Cabling Schedule**:
  - Physical and logical link schedule listing Source Port, Destination Port, Speed/Medium, Link State, and Redundancy.
  - Includes real-time hop-by-hop packet trace and latency logs when simulations are executed.

---

## 💻 Tech Stack & Dependencies

- **Core Framework**: React 19, TypeScript
- **Bundler & Dev Server**: Vite 6
- **Styling**: Tailwind CSS v4 (CSS-first `@import "tailwindcss";`)
- **Icons**: Lucide React
- **Document Generation**: jsPDF
- **Server Entry**: Express (for production container runtime)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or 20.x+)
- [npm](https://www.npmjs.com/) (version 9.x+)

### Installation

Clone the repository and install all dependencies:

```bash
git clone https://github.com/your-username/netvok-tools.git
cd netvok-tools
npm install
```

### Development Server

Start the local Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build

To compile a minified production build and verify type safety:

```bash
npm run lint
npm run build
```

To run the full-stack production server:

```bash
npm run start
```

---

## 📂 Directory Structure

```text
├── index.html                  # HTML entry point with dark mode script & SEO meta
├── package.json                # Project configuration and dependencies
├── package-lock.json           # Locked dependency tree
├── server.js                   # Express static asset & SPA production server
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite bundler configuration with Tailwind plugin
├── src/
│   ├── main.tsx                # React application entry point
│   ├── index.css               # Global styling and Tailwind CSS imports
│   ├── App.tsx                 # Root component orchestrating active tools & state
│   ├── components/             # 30+ Modular Tool Components
│   │   ├── TopHeader.tsx       # Persistent top header with Netvok branding & ⌘K
│   │   ├── Sidebar.tsx         # Collapsible & pinned 30-tool categorized navigation
│   │   ├── SubnetCalculator.tsx# IPv4 Subnetting & CIDR Calculator
│   │   ├── Ipv6Calculator.tsx  # 128-bit IPv6 Calculator & EUI-64
│   │   ├── CidrCalculator.tsx  # CIDR Prefix aggregator
│   │   ├── VlsmPlanner.tsx     # Variable Length Subnet Masking Planner
│   │   ├── SubnetSplitter.tsx  # Subnet division engine
│   │   ├── IpRangeFinder.tsx   # Start/End IP to CIDR blocks
│   │   ├── RouteSummarizer.tsx # Supernetting & route aggregator
│   │   ├── OverlapChecker.tsx  # Subnet & VPC overlap conflict detector
│   │   ├── CidrMatrix.tsx      # /0 to /32 quick reference matrix
│   │   ├── TcpHandshakeVisualizer.tsx # TCP state machine & retransmit simulator
│   │   ├── TlsVisualizer.tsx   # TLS 1.2 vs 1.3 cryptographic visualizer
│   │   ├── DnsVisualizer.tsx   # DNS Recursive & Iterative flow visualizer
│   │   ├── NatSimulator.tsx    # NAT/PAT hardware table simulator
│   │   ├── RoutingTableViewer.tsx # Longest Prefix Match (LPM) router
│   │   ├── OsiExplorer.tsx     # 7-Layer encapsulation explorer
│   │   ├── PacketDecoder.tsx   # Hex / Base64 packet dissector
│   │   ├── PcapViewer.tsx      # Wireshark-style 3-pane capture viewer
│   │   ├── PacketBuilder.tsx   # Raw frame crafter & Scapy generator
│   │   ├── TopologyDesigner.tsx# Canvas network topology diagrammer & traceroute
│   │   ├── NetworkDesignCanvas.tsx # Security zone blueprint canvas
│   │   ├── RackPlanner.tsx     # 42U Datacenter rack elevation planner
│   │   ├── VlanPlanner.tsx     # 802.1Q VLAN matrix & switchport builder
│   │   ├── OspfPlanner.tsx     # OSPF multi-area & cost metric designer
│   │   ├── BgpTools.tsx        # BGP-4 path selection algorithm engine
│   │   ├── FirewallRuleGenerator.tsx # Multi-vendor firewall rule builder
│   │   ├── DnsRecordBuilder.tsx# BIND DNS zone record creator
│   │   ├── SpfGenerator.tsx    # v=spf1 email authentication builder
│   │   ├── DmarcGenerator.tsx  # v=DMARC1 policy generator
│   │   ├── HeaderAnalyzer.tsx  # HTTP security headers scorecard
│   │   ├── JwtDecoder.tsx      # Client-side JWT token inspector
│   │   ├── Sha256Generator.tsx # Web Crypto hash verification
│   │   ├── PasswordGenerator.tsx # High-entropy passwords & Cisco Type 7
│   │   └── ConfigGenerator.tsx # Base router/switch template generator
│   └── utils/                  # Mathematical and Parsing Engines
│       ├── ipv4.ts             # IPv4 bitwise mathematics & CIDR algorithms
│       ├── ipv6.ts             # IPv6 128-bit expansion, compression & EUI-64
│       ├── packetParser.ts     # Binary Ethernet/IP/TCP dissector & checksums
│       ├── pcapSamples.ts      # Real PCAP packet capture datasets
│       ├── dnsSpfDmarc.ts      # BIND, SPF, DMARC, and Security Header generators
│       └── pdfExport.ts        # jsPDF multi-page vector export engine
```

---

## 🔒 Privacy & Security

- **Client-Side Processing**: No network payloads, IP addresses, JWT tokens, or topology files are uploaded or transmitted to external servers.
- **No Third-Party Analytics**: Netvok Tools does not bundle tracking scripts, telemetry pixels, or third-party behavioral analytics.
- **Web Crypto API**: Cryptographic hashes (SHA-256, SHA-512) and random byte generation use the native browser `window.crypto.subtle` API.

---

## 🤝 Contributing

Contributions, issues, and feature suggestions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-network-tool`)
3. Commit your changes (`git commit -m 'Add amazing network tool'`)
4. Push to the branch (`git push origin feature/amazing-network-tool`)
5. Open a Pull Request

---

## 📜 License

This project is open-source software licensed under the [MIT License](LICENSE).
