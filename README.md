# Netvok Tools

A modern network utility suite for subnetting, routing, protocol analysis, packet inspection, architecture planning, and security helpers.

Netvok Tools is built as a React + TypeScript application that brings together a collection of practical networking tools in a single dashboard interface.

## Overview

This project provides a browser-based workspace for:

- IPv4 and IPv6 subnet calculations
- CIDR and VLSM planning
- Route summarization and overlap detection
- Protocol visualizations (TCP, TLS, DNS, NAT, OSI, routing tables)
- Packet decoding and traffic inspection utilities
- Network architecture and design tools
- Security utilities such as firewall rules, SPF/DMARC generation, JWT inspection, and password generation

## Features

### IP & Subnetting
- IPv4 Calculator
- IPv6 Calculator
- CIDR Calculator
- VLSM Calculator
- Subnet Splitter
- IP Range Finder
- Route Summarization
- Overlap Checker
- CIDR Reference Matrix

### Protocols & Simulation
- TCP Handshake Visualizer
- TLS Visualizer
- DNS Visualizer
- NAT Simulator
- Routing Table Viewer
- OSI Explorer

### Packet & Traffic
- Packet Decoder
- PCAP Viewer
- Packet Builder

### Planning & Architecture
- Topology Designer
- Design Canvas
- Rack Planner
- VLAN Planner
- OSPF Planner
- BGP Tools

### Security & Utilities
- Firewall Rule Generator
- DNS Record Builder
- SPF Generator
- DMARC Generator
- Header Analyzer
- JWT Decoder
- SHA256 Generator
- Password Generator
- Device Config Generator

## Tech Stack

- React 19
- TypeScript
- Vite
- Express
- Tailwind CSS
- Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run the app in development mode

```bash
npm run dev
```

The app runs locally with Vite on port 3000.

### Build for production

```bash
npm run build
```

### Start the production server

```bash
npm run start
```

## Project Structure

```text
.
├── src/
│   ├── components/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── server.js
├── tsconfig.json
├── vite.config.ts
├── LICENSE
├── metadata.json
└── README.md
```

## Use Cases

- Network administrators calculating subnet ranges and designing addressing plans
- Engineers validating CIDR overlap and route summarization
- Security teams generating SPF, DMARC, firewall, and header policies
- Students and professionals learning TCP, TLS, DNS, and OSI networking behavior

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome. Feel free to open an issue or submit a pull request with improvements, bug fixes, or new networking utilities.
