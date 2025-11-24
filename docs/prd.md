# Product Requirements Document: ServerCraft

**Author:** Geraldo Andrade
**Date:** 2025-11-23
**Version:** 2.0

---

## Executive Summary

**ServerCraft** is a cross-platform desktop application (Windows, macOS, Linux) that unifies SSH-based session management with visual configuration management. It aims to be the "Royal TS meets Ansible with a no-code interface," filling the gap between simple SSH clients and complex, agent-based or code-heavy configuration management tools.

### What Makes ServerCraft Special

**Multi-Context Management** - Users don't just manage VMs; they manage VMs + containers + K8s + services as interconnected layers. ServerCraft is an "Infrastructure IDE" that understands all these contexts and lets you navigate between them seamlessly. This is what transforms it from "another SSH client" into a complete server management platform.

---

## 1. Problem Statement

Currently, users managing multiple VPS instances face a fragmented landscape:

* **Simple SSH Managers (e.g., Royal TS, mRemoteNG):** Good for access, but lack configuration management capabilities.
* **Complex Automation Tools (e.g., Ansible, Semaphore):** Powerful but require steep learning curves (YAML, Docker) and often web-based setups.
* **Agent-Based Solutions (e.g., RunCloud, Ploi):** Convenient but require installing agents, often have per-server fees, and create cloud dependencies.
* **Container Tools (e.g., Portainer):** Good for Docker but require agents and don't integrate with broader server management.

### Value Proposition

ServerCraft provides a **truly agentless**, **native desktop** experience that combines:

* **Visual Server Management:** Drag-and-drop organization with multi-context awareness (VMs, containers, services).
* **No-Code Automation:** Visual task builder for common operations without writing scripts or YAML.
* **Native Performance:** A local application with no cloud dependency or recurring per-server costs.
* **Privacy-First:** No telemetry, no accounts required, all data stays local.

---

## 2. Target Audience

### Primary Personas

1. **Homelab Enthusiasts** (5-20 servers)
   - Running Plex, Home Assistant, Pi-hole, game servers, Docker hosts
   - Want visual Docker deployment without YAML
   - Need backup to S3/NAS, multi-proxy support (nginx, traefik, envoy)
   - Value: Manage dream homelab setup with ease

2. **Small Agencies** (30-40 client servers)
   - Managing client VPS across DigitalOcean, Vultr, Hetzner
   - Need organization separation per client
   - Require audit logs for compliance
   - Quick debugging access for 2am emergencies

3. **DevOps Teams**
   - Seeking simpler execution for common tasks without full Ansible playbooks
   - Need monitoring & alerting with OpenTelemetry
   - Want integrations: Slack, Mattermost, MS Teams, PagerDuty
   - Value transparency - show what's happening, don't hide complexity

4. **Privacy-Focused Users**
   - Avoiding cloud-based management tools
   - Require: No telemetry, no third-party data sharing, no required accounts
   - Deal-breakers: Default-on telemetry, any data leaving local machine

5. **MSPs** (Managed Service Providers)
   - Managing diverse client infrastructures (VMs, bare-metal, various providers)
   - Need organization = customer scope with complete separation
   - Require consolidated audit logs (who did what, when)
   - Must support any customer scenario

---

## 3. Functional Requirements

### 3.1 Multi-Context Server Dashboard

**Organization Hierarchy:**
* Organizations → Groups → Servers → Containers
* Labeling and tagging system for flexible organization
* Context switching between VM layer and container/service layer

**Server Organization:**
* Drag-and-drop interface to group servers by project, environment, or client
* Multi-tenant structure for agencies and MSPs

**Status Monitoring:**
* Real-time indicators for CPU, Memory, Disk usage
* Service status via SSH polling
* Server health score (single number showing overall health)

**Multi-Provider Support:**
* Native integration for AWS, DigitalOcean, Vultr, Hetzner, generic VPS
* Support for bare-metal machines and homelab setups
* DNS provider integration

**Credential Management:**
* Secure, local vault for SSH keys and passwords
* Certificate-based authentication (auto-switch from password to cert after initial registration)
* Store only key-pair certificates after initial setup

### 3.2 Visual Docker Container Management

**Container Lifecycle:**
* Visual container list with status indicators
* Start/stop/restart/remove without CLI
* View container logs in embedded terminal
* Shell access to running containers

**Deployment:**
* Docker-compose deployment UI
* Visual Docker deployment without writing YAML
* Support for K3s installation

**Container Context:**
* Manage containers as first-class citizens alongside VMs
* View which containers run on which servers
* Container resource usage (CPU, memory, network)

### 3.3 No-Code Configuration Management

**Visual Task Builder:**
* GUI for creating tasks (e.g., "Install Nginx", "Create User", "Update System")
* Drag-and-drop ordering of tasks across multiple servers

**Template Library:**
* Pre-built templates for common stacks (LEMP, Docker, Monitoring)
* Multi-proxy configuration templates: nginx, traefik, envoy
* Community template marketplace (future)

**Task Execution:**
* Script Runner with essential pre-defined tasks
* Command broadcast to server groups
* Scheduled tasks with local scheduler

### 3.4 Built-In Terminal & File Management

**SSH Terminal:**
* Embedded, multi-tabbed terminal emulator
* Command broadcast to multiple selected servers simultaneously

**SFTP Browser:**
* Visual file manager for drag-and-drop file transfer

**Snippet Library:**
* Save and reuse common terminal commands

### 3.5 Audit & Compliance

**Audit Logging:**
* Track who did what, when, on which server
* Filterable audit log viewer
* Export functionality (CSV, JSON) for compliance

**Security:**
* No telemetry by default (hard requirement)
* All data stored locally
* No third-party data sharing

### 3.6 Agentless Architecture

**Protocol Support:**
* SSH (Linux) - primary
* Future: WinRM for Windows, API calls for cloud providers

**Zero-Install:**
* No agents or scripts required on target servers
* All operations via SSH

**Data Storage:**
* SQLite (local default)
* PostgreSQL or MySQL (local or remote) for team synchronization

---

## 4. Non-Functional Requirements

### Cross-Platform
* Must run natively on Windows, macOS, and Linux
* macOS and Linux first, Windows to follow

### Security
* **Secure Credential Storage:** System-level keychain integration or AES-256 encryption
* **Certificate Management:** Auto-rotation of SSH certificates
* **No Telemetry:** Zero data sent to cloud without explicit consent
* **Local-First:** All user data stored on user's device

### Performance
* Fast startup time (<3 seconds)
* Low resource footprint
* Efficient SSH connection pooling for concurrent operations

### Privacy
* No required cloud accounts
* No data sharing with third parties
* Full offline functionality

### Transparency
* Show relevant information when needed
* Progressive disclosure - start simple, reveal complexity as needed
* Clear indication of what operations are being performed

---

## 5. Technical Architecture

### Frontend/Desktop Framework
**Wails** (Go + Web Tech)
* Reasoning: User prefers Go. Wails allows backend logic entirely in Go while using web technologies for UI. Lightweight, native-feeling application with system-level access (SSH, Keychain).

### Backend Core
**Go**
* Selected for high performance, excellent SSH concurrency handling, and single-binary compilation

### Database
Flexible abstraction layer supporting:
* **SQLite** (embedded) - default for single user
* **PostgreSQL** - for team synchronization
* **MySQL** - alternative for team synchronization

### Automation Engine
Custom Go-based task runner
* Future: Export to Ansible for portability

---

## 6. Product Scope

### MVP - Phase 1 (Core Value)

1. **Multi-Context Inventory Management**
   - Add/Edit/Delete servers (Linux only)
   - Organization → Groups → Servers hierarchy
   - Labels and tags
   - Credential storage with certificate-based auth

2. **SSH Terminal**
   - Functional multi-tabbed terminal
   - Command broadcast to server groups

3. **Server Health Dashboard**
   - CPU, Memory, Disk status
   - Service status indicators
   - Server health score

4. **Visual Docker Management**
   - Container list/detail views
   - Start/stop/restart/remove containers
   - View container logs
   - Shell into containers

5. **Script Runner**
   - 15 essential pre-defined tasks:
     - Update System
     - Restart Service (nginx, apache, mysql, postgres)
     - Install Docker
     - Deploy docker-compose stack
     - Create User
     - Configure Firewall Rule
     - Install nginx/traefik/envoy
     - Configure rate limiting
     - Backup to S3
     - Restore from backup

6. **Audit Logging**
   - Track all operations
   - Filterable log viewer
   - Export to CSV/JSON

7. **Platform Support**
   - macOS and Linux first
   - Windows to follow

### Growth Features - Phase 2

1. **Visual SFTP Browser**
   - Drag-and-drop file transfer
   - Directory sync

2. **Advanced Templates**
   - WordPress deployment
   - Full Docker Compose visual builder
   - K3s cluster setup

3. **Monitoring & Alerting** (Pro Feature)
   - OpenTelemetry-based metrics collection
   - Integrations: Slack, Mattermost, MS Teams, PagerDuty
   - Alert rules and routing

4. **Backup Orchestration**
   - S3-compatible storage
   - NAS backup/restore
   - Full application backup (config + data + state)

5. **Team Features** (Team License)
   - Shared vault via PostgreSQL/MySQL
   - Real-time presence
   - Role-based access control

### Vision Features - Phase 3+

1. **K8s Management Layer**
   - Manage nodes, deployments, PVCs
   - Network policies, daemonsets
   - Unified VM + K8s dashboard

2. **Task Recorder**
   - Record manual SSH actions
   - Convert to reusable tasks

3. **Template Marketplace**
   - Community-shared automation templates
   - Curated and verified templates

4. **Fleet Management**
   - Manage 50 servers as easily as 1
   - Batch operations with progress tracking

5. **Drift Detection**
   - Alert when server config changes unexpectedly
   - Compare current state to baseline

6. **Cloud/Web Companion** (Optional)
   - Remote access without compromising privacy
   - End-to-end encrypted sync

### Moonshots (Long-term Vision)

1. **AI Diagnostics** - "Why did my server crash?" with context-aware analysis
2. **Natural Language Commands** - "Update nginx on all production servers"
3. **Declare Desired State** - Infrastructure as code without the code
4. **Auto-Healing** - Detect issues and apply fixes automatically
5. **Compliance Presets** - One-click security hardening (HIPAA, SOC2, PCI-DSS)

---

## 7. User Experience Principles

### Visual Personality
* Clean, professional, minimal
* Dark mode by default (server admins work late)
* Information-dense but not cluttered

### Key Interactions
* Progressive disclosure - simple by default, power on demand
* Keyboard shortcuts for power users
* Visual feedback for all operations
* Contextual help integrated in UI

### Design Philosophy
* "Visual-first, code-second" - show the GUI, export to code if needed
* "Reveal complexity, don't hide it" - transparency builds trust
* "One click for common, few clicks for complex"

---

## 8. Monetization Strategy

### Free Tier
* Up to 5 servers
* All core features:
  - Multi-context management
  - SSH terminal with broadcast
  - Docker container management
  - Script runner (all 15 tasks)
  - Audit logging (local only)
* Local SQLite storage only
* Community support

### Pro License - $79 one-time or $8/month
* Unlimited servers
* Everything in Free, plus:
  - **Monitoring & Alerting**
    - OpenTelemetry metrics
    - Custom alert rules
    - Integrations (Slack, PagerDuty, etc.)
  - **Advanced Templates**
    - K3s setup
    - WordPress deployment
    - Custom template creation
  - **Backup Orchestration**
    - S3-compatible backup
    - Scheduled backups
    - Point-in-time restore
  - **Priority support**
  - **Early access** to new features

### Team License - $15/user/month
* Everything in Pro, plus:
  - **Shared Vault**
    - PostgreSQL/MySQL backend
    - Centralized credential management
  - **Multi-User Collaboration**
    - Role-based access control
    - Real-time presence
    - Activity feed
  - **Advanced Audit**
    - Centralized audit logs
    - Compliance reports
    - Retention policies
  - **SSO Integration** (SAML, OIDC)
  - **Dedicated support**

### Enterprise (Contact Sales)
* Everything in Team, plus:
  - On-premise deployment
  - Custom integrations
  - SLA guarantees
  - Training and onboarding

---

## 9. Success Criteria

### User Success
* Homelab users can deploy a Docker stack in under 5 minutes without writing YAML
* Agency owners can switch between client contexts in 2 clicks
* DevOps engineers trust ServerCraft for production operations
* Privacy users feel confident their data never leaves their machine

### Business Success
* 100 daily active users within 3 months of launch
* 10% free-to-Pro conversion rate
* 5% Pro-to-Team conversion rate
* Positive reviews citing "simplicity" and "power" together

### Technical Success
* <3 second startup time
* Zero data breaches or security incidents
* 99.9% operation success rate
* Support for 100+ concurrent server connections

---

## 10. Competitive Positioning

| Feature | Royal TS | Ansible | RunCloud | Portainer | ServerCraft |
|---------|----------|---------|----------|-----------|-------------|
| Agentless | ✓ | ✓ | ✗ | ✗ | ✓ |
| No-Code | ✗ | ✗ | ✓ | ✓ | ✓ |
| Desktop Native | ✓ | ✗ | ✗ | ✗ | ✓ |
| Docker Management | ✗ | ✓ | ✓ | ✓ | ✓ |
| Multi-Context | ✗ | ✗ | ✗ | ✗ | ✓ |
| Privacy-First | ✓ | ✓ | ✗ | ✗ | ✓ |
| One-Time Purchase | ✓ | ✓ | ✗ | ✗ | ✓ |

**Unique Position:** ServerCraft is the only tool that combines agentless architecture, no-code visual management, native desktop performance, Docker integration, and privacy-first design with a one-time purchase option.

---

## 11. Open Questions

1. Should ServerCraft support Windows servers (WinRM) in MVP or defer to Phase 2?
2. How to handle secrets/credentials for Docker deployments securely?
3. Should the template marketplace be curated or open?
4. How to balance "no-code simplicity" with "power user control"?
5. Is there a path to open-source core with paid enterprise features?

---

## 12. References

* Brainstorming Session Results (2025-11-23) - 65+ ideas across 4 techniques
* Competitive Analysis: Royal TS, Ansible, RunCloud, Portainer, Lens

---

_This PRD captures the vision for ServerCraft - an Infrastructure IDE that makes server management accessible without sacrificing power._

_Created through collaborative discovery between Geraldo Andrade and AI facilitator._
