# ServerCraft - Epic Breakdown

**Author:** Geraldo Andrade
**Date:** 2025-11-23
**Version:** 1.0

---

## Overview

This document provides the complete epic and story breakdown for ServerCraft, decomposing the requirements from the [PRD](./prd.md) into implementable stories. Technical implementation details reference the [Architecture](./architecture.md) document.

**Total:** 6 Epics, 32 Stories

### Epic Summary

| Epic | Title | Stories | FRs Covered |
|------|-------|---------|-------------|
| 1 | Foundation & Project Setup | 5 | Infrastructure |
| 2 | Server Inventory Management | 8 | FR1-FR8 |
| 3 | SSH Terminal & Connectivity | 5 | FR18-FR20 |
| 4 | Docker Container Management | 6 | FR9-FR13 |
| 5 | Task Automation | 5 | FR14-FR17 |
| 6 | Audit & Compliance | 3 | FR21-FR23 |

---

## Functional Requirements Inventory

- FR1: Organizations → Groups → Servers → Containers hierarchy
- FR2: Labeling and tagging system
- FR3: Drag-and-drop server organization
- FR4: Real-time CPU/Memory/Disk monitoring
- FR5: Server health score
- FR6: Multi-provider support (AWS, DO, Vultr, Hetzner, generic)
- FR7: Certificate-based authentication with auto-upgrade
- FR8: Secure credential vault
- FR9: Container list with status indicators
- FR10: Container lifecycle (start/stop/restart/remove)
- FR11: Container logs in embedded terminal
- FR12: Shell access to containers
- FR13: Docker-compose deployment UI
- FR14: Visual task builder GUI
- FR15: Pre-built task templates (15 tasks)
- FR16: Command broadcast to server groups
- FR17: Scheduled tasks with local scheduler
- FR18: Multi-tabbed SSH terminal
- FR19: Command broadcast to multiple servers
- FR20: Snippet library
- FR21: Audit logging (who, what, when, where)
- FR22: Filterable audit log viewer
- FR23: Export to CSV/JSON

---

## FR Coverage Map

| FR | Epic | Stories |
|----|------|---------|
| FR1 | Epic 2 | 2.1, 2.2 |
| FR2 | Epic 2 | 2.3 |
| FR3 | Epic 2 | 2.2 |
| FR4 | Epic 2 | 2.7 |
| FR5 | Epic 2 | 2.8 |
| FR6 | Epic 2 | 2.4 |
| FR7 | Epic 2 | 2.5, 2.6 |
| FR8 | Epic 2 | 2.5 |
| FR9 | Epic 4 | 4.1 |
| FR10 | Epic 4 | 4.2 |
| FR11 | Epic 4 | 4.3 |
| FR12 | Epic 4 | 4.4 |
| FR13 | Epic 4 | 4.5, 4.6 |
| FR14 | Epic 5 | 5.3 |
| FR15 | Epic 5 | 5.1, 5.2 |
| FR16 | Epic 5 | 5.4 |
| FR17 | Epic 5 | 5.5 |
| FR18 | Epic 3 | 3.1, 3.2 |
| FR19 | Epic 3 | 3.4 |
| FR20 | Epic 3 | 3.5 |
| FR21 | Epic 6 | 6.1 |
| FR22 | Epic 6 | 6.2 |
| FR23 | Epic 6 | 6.3 |

---

## Epic 1: Foundation & Project Setup

**Goal:** Establish the development environment, core infrastructure, and foundational services that all subsequent epics depend on.

**User Value:** Development team can build features on a solid, consistent foundation with all core services ready.

---

### Story 1.1: Initialize Wails Project

As a **developer**,
I want **the project initialized with Wails and all dependencies**,
So that **I have a working development environment**.

**Acceptance Criteria:**

**Given** a fresh development machine with Go 1.21+ and Node 18+
**When** I run the project initialization commands
**Then** the Wails project is created with React-TS template

**And** all Go dependencies are installed (GORM, zap, go-keyring, x/crypto/ssh)
**And** all frontend dependencies are installed (Zustand, xterm.js, shadcn/ui, Tailwind)
**And** `wails dev` starts the application without errors
**And** hot reload works for both Go and React changes

**Prerequisites:** None (first story)

**Technical Notes:**
- Use `wails init -n servercraft -t react-ts`
- Follow Architecture section "Project Initialization" for exact commands
- Verify with `wails doctor` before starting
- Configure VS Code with recommended extensions

---

### Story 1.2: Database Setup & Core Models

As a **developer**,
I want **SQLite database configured with all GORM models**,
So that **data persistence is ready for all features**.

**Acceptance Criteria:**

**Given** the initialized Wails project
**When** the application starts
**Then** SQLite database is created at `~/.config/servercraft/servercraft.db`

**And** all tables are auto-migrated: organizations, groups, servers, credentials, containers, tasks, task_templates, audit_logs
**And** indexes are created on frequently queried columns (org_id, group_id, server_id, created_at)
**And** database connection is available via dependency injection to all services

**Prerequisites:** Story 1.1

**Technical Notes:**
- Implement in `internal/database/database.go`
- Use GORM AutoMigrate for schema management
- Create config directory with 0700 permissions
- See Architecture "Data Architecture" for model definitions

---

### Story 1.3: SSH Connection Pool

As a **developer**,
I want **a connection pool managing SSH clients**,
So that **concurrent SSH operations are efficient and reliable**.

**Acceptance Criteria:**

**Given** the database is initialized
**When** an SSH connection is requested for a server
**Then** the pool returns an existing healthy connection or creates a new one

**And** connections are health-checked before reuse
**And** stale connections (>5 min idle) are closed and recreated
**And** pool supports 100+ concurrent connections
**And** connection failures are logged with server context

**Prerequisites:** Story 1.2

**Technical Notes:**
- Implement in `internal/ssh/pool.go`
- Use sync.Map for thread-safe connection storage
- Health check: send keepalive, verify response
- See Architecture "SSH Connection Pool Pattern"

---

### Story 1.4: Credential Storage Service

As a **developer**,
I want **secure credential storage using OS keychain**,
So that **SSH credentials are protected at rest**.

**Acceptance Criteria:**

**Given** the application is running
**When** credentials are saved for a server
**Then** they are stored in OS keychain (macOS Keychain, Linux Secret Service)

**And** if keychain unavailable, fall back to AES-256 encrypted vault
**And** credentials can be retrieved by server ID
**And** credentials can be deleted when server is removed
**And** no plaintext credentials are written to disk

**Prerequisites:** Story 1.2

**Technical Notes:**
- Implement in `internal/credentials/`
- Use go-keyring for OS keychain
- Vault encryption: AES-256-GCM with PBKDF2 key derivation
- Service name: "servercraft"

---

### Story 1.5: Logging & Audit Infrastructure

As a **developer**,
I want **structured logging and audit event capture**,
So that **all operations are traceable and debuggable**.

**Acceptance Criteria:**

**Given** the application is running
**When** any significant operation occurs
**Then** it is logged with structured fields (zap)

**And** audit events are captured to audit_logs table
**And** log levels are configurable (debug/info/warn/error)
**And** logs are written to `~/.config/servercraft/logs/`
**And** log rotation prevents unbounded growth

**Prerequisites:** Story 1.2

**Technical Notes:**
- Implement logging in `internal/app/app.go`
- Implement audit in `internal/audit/`
- See Architecture "Logging Strategy" for field standards
- Audit schema: id, server_id, user_id, action, details, result, created_at

---

## Epic 2: Server Inventory Management

**Goal:** Enable users to organize and manage their server infrastructure with a hierarchical structure supporting multi-tenancy.

**User Value:** Users can add servers, organize them by organization/group, and have secure credential management with real-time status visibility.

---

### Story 2.1: Organization CRUD

As a **user**,
I want **to create and manage organizations**,
So that **I can separate servers by client or project**.

**Acceptance Criteria:**

**Given** the application is running
**When** I create a new organization with a name
**Then** it appears in the organization list

**And** I can rename an organization
**And** I can delete an empty organization
**And** deleting an organization with groups shows confirmation warning
**And** organization names must be unique
**And** organization list shows count of groups/servers

**Prerequisites:** Story 1.5

**Technical Notes:**
- Bindings: `CreateOrganization`, `ListOrganizations`, `UpdateOrganization`, `DeleteOrganization`
- Store in `organizations` table
- Cascade delete to groups/servers with confirmation
- UI: Modal for create/edit, list with context menu

---

### Story 2.2: Group & Server Hierarchy

As a **user**,
I want **to create groups within organizations and add servers to groups**,
So that **I can organize servers logically**.

**Acceptance Criteria:**

**Given** an organization exists
**When** I create a group within it
**Then** the group appears nested under the organization

**And** I can create servers within a group
**And** I can drag-and-drop servers between groups
**And** I can drag-and-drop groups between organizations
**And** the tree view shows Organization → Group → Server hierarchy
**And** empty groups can be deleted
**And** groups with servers show deletion confirmation

**Prerequisites:** Story 2.1

**Technical Notes:**
- Bindings: `CreateGroup`, `ListGroups`, `CreateServer`, `MoveServer`, `MoveGroup`
- UI: Tree component with drag-and-drop (react-dnd or similar)
- Store group_id on server, org_id on group
- Optimistic UI updates with rollback on error

---

### Story 2.3: Labels & Tags

As a **user**,
I want **to add labels/tags to servers**,
So that **I can filter and find servers quickly**.

**Acceptance Criteria:**

**Given** a server exists
**When** I add labels to it (e.g., "production", "database", "nginx")
**Then** labels are saved and displayed on the server

**And** I can filter the server list by label
**And** I can search by label text
**And** labels support autocomplete from existing labels
**And** I can remove labels from servers
**And** label colors are auto-assigned or customizable

**Prerequisites:** Story 2.2

**Technical Notes:**
- Store labels as JSON array in servers table
- Bindings: `UpdateServerLabels`, `GetAllLabels`
- UI: Tag input component with autocomplete
- Filter: client-side for <100 servers, server-side query for more

---

### Story 2.4: Add Server with Connection Details

As a **user**,
I want **to add a new server with host, port, and credentials**,
So that **I can connect to and manage it**.

**Acceptance Criteria:**

**Given** a group exists
**When** I add a new server with name, host, port, username, and password/key
**Then** the server is created and credentials are stored securely

**And** port defaults to 22 if not specified
**And** I can choose auth method: password, private key, or key file
**And** private key can be pasted or loaded from file
**And** connection is tested before saving (optional)
**And** server appears in the group with "unknown" status initially

**Prerequisites:** Story 2.2, Story 1.4

**Technical Notes:**
- Bindings: `CreateServer`, `TestConnection`
- Store credentials via credential service (Story 1.4)
- UI: Multi-step form or modal with auth method tabs
- Validate host format, port range (1-65535)

---

### Story 2.5: Credential Vault Management

As a **user**,
I want **to view and update stored credentials**,
So that **I can rotate passwords or keys when needed**.

**Acceptance Criteria:**

**Given** a server has stored credentials
**When** I open credential management for that server
**Then** I can see the auth method and update credentials

**And** passwords are masked by default with reveal toggle
**And** I can change auth method (password → key)
**And** updating credentials re-tests connection
**And** old credentials are securely deleted after update

**Prerequisites:** Story 2.4

**Technical Notes:**
- Bindings: `GetCredentialInfo` (returns auth method, not secrets), `UpdateCredential`
- UI: Credential panel in server detail view
- Never return plaintext secrets to frontend except for edit

---

### Story 2.6: Certificate-Based Auth Auto-Upgrade

As a **user**,
I want **automatic upgrade from password to certificate auth**,
So that **my servers use more secure authentication**.

**Acceptance Criteria:**

**Given** a server uses password authentication
**When** I connect successfully for the first time
**Then** I'm offered to upgrade to certificate-based auth

**And** accepting generates an SSH key pair
**And** public key is deployed to server's authorized_keys
**And** password is removed from local storage
**And** subsequent connections use the certificate
**And** I can manually trigger re-enrollment if needed

**Prerequisites:** Story 2.5

**Technical Notes:**
- Generate ed25519 key pair
- Deploy via: `ssh-copy-id` equivalent over existing connection
- Store private key in credential vault
- Bindings: `UpgradeToCertAuth`, `ReenrollCertificate`

---

### Story 2.7: Real-Time Server Status

As a **user**,
I want **to see live CPU, memory, and disk usage for my servers**,
So that **I can monitor their health at a glance**.

**Acceptance Criteria:**

**Given** servers are added to my inventory
**When** the dashboard is visible
**Then** server status updates every 30 seconds

**And** status shows: online/offline, CPU %, memory %, disk %
**And** offline servers show last-seen timestamp
**And** status indicators use color coding (green/yellow/red)
**And** I can manually refresh a server's status
**And** polling pauses for servers not visible in viewport

**Prerequisites:** Story 2.4, Story 1.3

**Technical Notes:**
- Implement in `internal/monitor/poller.go`
- SSH commands: `uptime`, `free -m`, `df -h`
- Emit via Wails events: `server:status`
- Parse output to structured metrics
- Use worker pool for concurrent polling

---

### Story 2.8: Server Health Score

As a **user**,
I want **a single health score (0-100) for each server**,
So that **I can quickly identify servers needing attention**.

**Acceptance Criteria:**

**Given** a server has status metrics
**When** the dashboard displays
**Then** a health score is calculated and shown

**And** score factors: CPU (<80% = good), memory (<85% = good), disk (<90% = good), uptime
**And** score is color-coded: green (80-100), yellow (50-79), red (0-49)
**And** hovering shows breakdown of score factors
**And** servers can be sorted by health score

**Prerequisites:** Story 2.7

**Technical Notes:**
- Calculate in frontend from status metrics
- Formula: weighted average (CPU 30%, Memory 30%, Disk 30%, Uptime 10%)
- Penalties for high utilization decrease score
- Store in Zustand, recalculate on status update

---

## Epic 3: SSH Terminal & Connectivity

**Goal:** Provide a fully functional SSH terminal experience with tabs, command broadcast, and saved snippets.

**User Value:** Users can connect to servers, run commands, broadcast to multiple servers, and save frequently used commands.

---

### Story 3.1: Single Server Terminal

As a **user**,
I want **to open an SSH terminal to a server**,
So that **I can run commands interactively**.

**Acceptance Criteria:**

**Given** a server is in my inventory
**When** I click "Terminal" on a server
**Then** a terminal tab opens with SSH connection

**And** terminal uses xterm.js with full VT100 support
**And** I can type commands and see output
**And** terminal supports colors, cursor movement, vim/nano
**And** Ctrl+C sends interrupt signal
**And** terminal resizes with window
**And** connection errors show clear message

**Prerequisites:** Epic 2 complete

**Technical Notes:**
- Implement terminal session in `internal/ssh/session.go`
- Use xterm.js with fit addon
- Bindings: `OpenTerminal`, `SendTerminalInput`, `CloseTerminal`
- Stream output via Wails events: `terminal:output`

---

### Story 3.2: Multi-Tab Terminal

As a **user**,
I want **multiple terminal tabs open simultaneously**,
So that **I can work on several servers at once**.

**Acceptance Criteria:**

**Given** a terminal is open
**When** I open another terminal (same or different server)
**Then** it opens in a new tab

**And** tabs show server name and can be renamed
**And** I can switch between tabs with keyboard shortcuts (Cmd/Ctrl+1-9)
**And** closing a tab terminates the SSH session
**And** tabs can be reordered by dragging
**And** "Close all" and "Close others" options available

**Prerequisites:** Story 3.1

**Technical Notes:**
- Store sessions in terminal Zustand store
- Each tab has unique session ID
- UI: Tab bar component with close buttons
- Keyboard shortcuts: register globally in app

---

### Story 3.3: Terminal Session Persistence

As a **user**,
I want **terminal sessions to reconnect if connection drops**,
So that **I don't lose my work on network issues**.

**Acceptance Criteria:**

**Given** a terminal session is active
**When** the SSH connection drops temporarily
**Then** the terminal shows "Reconnecting..." message

**And** automatic reconnection is attempted (3 retries, exponential backoff)
**And** successful reconnection resumes the session
**And** failed reconnection shows option to retry or close
**And** terminal scrollback is preserved during reconnection

**Prerequisites:** Story 3.2

**Technical Notes:**
- Detect connection loss via SSH keepalive failure
- Reconnect using stored credentials
- Re-establish PTY session
- Show connection status indicator in tab

---

### Story 3.4: Command Broadcast

As a **user**,
I want **to send a command to multiple servers at once**,
So that **I can update or check many servers quickly**.

**Acceptance Criteria:**

**Given** multiple servers are selected
**When** I enter broadcast mode and type a command
**Then** the command executes on all selected servers

**And** output from each server is shown in split view or tabs
**And** I can see which servers succeeded/failed
**And** broadcast can be cancelled mid-execution
**And** results can be copied or exported

**Prerequisites:** Story 3.2

**Technical Notes:**
- Bindings: `BroadcastCommand`
- Execute concurrently with goroutines
- Return aggregated results: `map[serverID]Result`
- UI: Multi-pane view or tabbed output

---

### Story 3.5: Snippet Library

As a **user**,
I want **to save and reuse common commands**,
So that **I don't have to remember or retype them**.

**Acceptance Criteria:**

**Given** I have a command I use frequently
**When** I save it as a snippet with name and optional description
**Then** it appears in my snippet library

**And** I can insert a snippet into the active terminal
**And** snippets can have variables (e.g., `{{filename}}`) that prompt for input
**And** I can edit and delete snippets
**And** snippets can be organized by category/tags
**And** I can search snippets by name or content

**Prerequisites:** Story 3.1

**Technical Notes:**
- Store in local SQLite table: `snippets`
- Bindings: `CreateSnippet`, `ListSnippets`, `InsertSnippet`
- Variable syntax: `{{varname}}` - show prompt before insertion
- UI: Sidebar panel or modal for snippet management

---

## Epic 4: Docker Container Management

**Goal:** Enable visual management of Docker containers across all servers without requiring agents.

**User Value:** Users can view, control, and deploy Docker containers using a GUI instead of CLI commands.

---

### Story 4.1: Container List View

As a **user**,
I want **to see all containers on a server**,
So that **I know what's running and their status**.

**Acceptance Criteria:**

**Given** a server has Docker installed
**When** I view the server's containers
**Then** I see a list of all containers (running and stopped)

**And** each container shows: name, image, status, ports, created date
**And** running containers show CPU/memory usage
**And** I can filter by status (running/stopped/all)
**And** I can search by container name
**And** list refreshes every 30 seconds

**Prerequisites:** Story 2.7

**Technical Notes:**
- Implement in `internal/docker/service.go`
- SSH command: `docker ps -a --format json`
- Parse JSON output to Container structs
- Bindings: `ListContainers`
- See Architecture "Agentless Docker Management Pattern"

---

### Story 4.2: Container Lifecycle Controls

As a **user**,
I want **to start, stop, restart, and remove containers**,
So that **I can manage container state without CLI**.

**Acceptance Criteria:**

**Given** a container is displayed
**When** I click a lifecycle action button
**Then** the action executes and status updates

**And** start/stop/restart show loading state during execution
**And** remove shows confirmation dialog
**And** remove can optionally delete volumes
**And** errors show clear message (e.g., "port already in use")
**And** actions are logged to audit

**Prerequisites:** Story 4.1

**Technical Notes:**
- Bindings: `StartContainer`, `StopContainer`, `RestartContainer`, `RemoveContainer`
- SSH commands: `docker start/stop/restart/rm`
- Emit audit event for each action
- UI: Action buttons on container row, context menu

---

### Story 4.3: Container Logs Viewer

As a **user**,
I want **to view container logs**,
So that **I can debug issues without SSH**.

**Acceptance Criteria:**

**Given** a container exists
**When** I click "View Logs"
**Then** a panel shows the container's stdout/stderr

**And** I can choose tail size (100, 500, 1000, all)
**And** I can follow logs in real-time (tail -f equivalent)
**And** logs support search/filter
**And** timestamps can be shown/hidden
**And** logs can be copied or downloaded

**Prerequisites:** Story 4.1

**Technical Notes:**
- Bindings: `GetContainerLogs`, `StreamContainerLogs`
- SSH command: `docker logs --tail N` or `docker logs -f`
- Stream via Wails events for follow mode
- UI: Log viewer with ANSI color support

---

### Story 4.4: Container Shell Access

As a **user**,
I want **to open a shell inside a container**,
So that **I can debug or inspect the container**.

**Acceptance Criteria:**

**Given** a running container
**When** I click "Shell"
**Then** a terminal opens with shell inside the container

**And** shell uses /bin/sh or /bin/bash if available
**And** terminal has full interactive support
**And** exit command closes the shell session
**And** shell session is separate from server terminal tabs

**Prerequisites:** Story 4.1, Story 3.1

**Technical Notes:**
- Bindings: `OpenContainerShell`
- SSH + docker exec: `docker exec -it {container} /bin/sh`
- Reuse terminal component from Epic 3
- Tab title: "container-name (shell)"

---

### Story 4.5: Docker Compose Deployment

As a **user**,
I want **to deploy a docker-compose stack**,
So that **I can run multi-container applications easily**.

**Acceptance Criteria:**

**Given** I have a docker-compose.yml file
**When** I paste or upload the compose file and click Deploy
**Then** the stack is deployed to the selected server

**And** compose file is validated before deployment
**And** deployment shows real-time progress/logs
**And** I can specify project name and .env variables
**And** deployment errors show clear messages
**And** deployed stack appears in container list

**Prerequisites:** Story 4.2

**Technical Notes:**
- Bindings: `DeployCompose`
- Upload compose file to server temp directory
- SSH: `docker-compose -f /tmp/xxx.yml up -d`
- Stream deployment output via events
- Clean up temp file after deployment

---

### Story 4.6: Visual Compose Editor (Stretch)

As a **user**,
I want **to create docker-compose files visually**,
So that **I don't need to know YAML syntax**.

**Acceptance Criteria:**

**Given** I want to deploy containers
**When** I use the visual compose builder
**Then** I can add services with form fields

**And** I can configure: image, ports, volumes, environment
**And** service dependencies can be defined
**And** preview shows generated YAML
**And** YAML can be exported/saved
**And** common templates are available (WordPress, LEMP, etc.)

**Prerequisites:** Story 4.5

**Technical Notes:**
- Frontend-only component
- Generate YAML from form state
- Use Monaco editor for YAML preview
- Templates stored as JSON/YAML in assets

---

## Epic 5: Task Automation

**Goal:** Enable no-code task execution with pre-built templates and scheduling.

**User Value:** Users can run common server tasks without writing scripts, broadcast commands to groups, and schedule recurring tasks.

---

### Story 5.1: Task Template Library

As a **user**,
I want **a library of pre-built task templates**,
So that **I can run common operations without scripting**.

**Acceptance Criteria:**

**Given** I want to perform a common task
**When** I open the task library
**Then** I see 15 pre-built task templates

**And** templates include: Update System, Restart Service, Install Docker, Deploy Compose, Create User, Configure Firewall, Install nginx/traefik/envoy, Configure rate limiting, Backup to S3, Restore from backup
**And** each template has description and required parameters
**And** templates are categorized (System, Docker, Web Server, Backup)
**And** I can search/filter templates

**Prerequisites:** Story 1.5

**Technical Notes:**
- Implement templates in `internal/tasks/templates/`
- Each template: Go struct with Execute method
- Store template metadata in task_templates table
- Bindings: `GetTaskTemplates`

---

### Story 5.2: Task Execution

As a **user**,
I want **to run a task template on a server**,
So that **I can perform operations with one click**.

**Acceptance Criteria:**

**Given** I select a task template
**When** I configure parameters and click Run
**Then** the task executes on the selected server

**And** I see real-time progress and output
**And** task can be cancelled mid-execution
**And** success/failure is clearly indicated
**And** task execution is logged to audit
**And** I can run same task on multiple servers sequentially or in parallel

**Prerequisites:** Story 5.1

**Technical Notes:**
- Bindings: `RunTask`
- Execute template via SSH commands
- Stream output via Wails events: `task:progress`
- Store task history in tasks table
- Concurrent execution with worker pool

---

### Story 5.3: Task Parameter Forms

As a **user**,
I want **clear parameter forms for tasks**,
So that **I know what inputs are required**.

**Acceptance Criteria:**

**Given** I select a task template
**When** the task requires parameters
**Then** a form shows with labeled input fields

**And** required vs optional fields are indicated
**And** fields have appropriate types (text, select, checkbox)
**And** fields have validation (e.g., port range, path format)
**And** fields can have default values
**And** help text explains each parameter

**Prerequisites:** Story 5.2

**Technical Notes:**
- Templates define parameter schema (JSON Schema or custom)
- Frontend generates form from schema
- Validate before submission
- Pass params to RunTask binding

---

### Story 5.4: Group Task Broadcast

As a **user**,
I want **to run a task on all servers in a group**,
So that **I can update many servers at once**.

**Acceptance Criteria:**

**Given** I select a task template
**When** I choose a group as target
**Then** the task runs on all servers in that group

**And** I see progress for each server
**And** results show success/failure per server
**And** failing servers don't stop other executions
**And** I can retry failed servers
**And** results can be exported

**Prerequisites:** Story 5.2

**Technical Notes:**
- Bindings: `RunTaskOnGroup`
- Execute concurrently with configurable parallelism
- Aggregate results by server
- UI: Progress grid showing all servers

---

### Story 5.5: Scheduled Tasks

As a **user**,
I want **to schedule tasks to run automatically**,
So that **backups and updates happen without manual intervention**.

**Acceptance Criteria:**

**Given** I've configured a task
**When** I set a schedule (daily, weekly, or cron expression)
**Then** the task runs automatically at scheduled times

**And** I can view upcoming scheduled executions
**And** I can disable/enable schedules
**And** missed schedules (app closed) run on next startup
**And** schedule history shows past executions
**And** failed scheduled tasks trigger notification

**Prerequisites:** Story 5.2

**Technical Notes:**
- Implement scheduler in `internal/tasks/scheduler.go`
- Use cron library for schedule parsing
- Store schedules in database
- Check and run due tasks on app startup
- Bindings: `CreateSchedule`, `ListSchedules`, `DeleteSchedule`

---

## Epic 6: Audit & Compliance

**Goal:** Provide comprehensive audit logging for all operations to support compliance and troubleshooting.

**User Value:** Users can track all actions performed, filter and search audit logs, and export for compliance reporting.

---

### Story 6.1: Audit Event Capture

As a **system**,
I want **all significant actions logged to audit**,
So that **there's a complete record of operations**.

**Acceptance Criteria:**

**Given** any operation occurs (CRUD, SSH, task, container action)
**When** the operation completes (success or failure)
**Then** an audit event is recorded

**And** audit includes: timestamp, action, server_id, details, result
**And** audit captures: server add/edit/delete, credential changes, terminal commands, task executions, container actions
**And** audit is written atomically (no partial records)
**And** sensitive data (passwords) is never logged

**Prerequisites:** Story 1.5

**Technical Notes:**
- Implement in `internal/audit/logger.go`
- Call audit.Log() from all services
- Insert to audit_logs table
- Actions enum: SERVER_CREATE, CREDENTIAL_UPDATE, TASK_RUN, etc.
- Async insert to avoid blocking operations

---

### Story 6.2: Audit Log Viewer

As a **user**,
I want **to view and filter audit logs**,
So that **I can review what happened and when**.

**Acceptance Criteria:**

**Given** audit events have been captured
**When** I open the audit log viewer
**Then** I see a paginated list of audit events

**And** I can filter by: date range, server, action type, result
**And** I can search by details text
**And** events show expandable details
**And** list is sorted by newest first by default
**And** I can sort by any column

**Prerequisites:** Story 6.1

**Technical Notes:**
- Bindings: `GetAuditLogs` with filter parameters
- Pagination: limit/offset with total count
- UI: Data table with filter sidebar
- Index on created_at for efficient range queries

---

### Story 6.3: Audit Export

As a **user**,
I want **to export audit logs to CSV or JSON**,
So that **I can provide compliance reports or analyze externally**.

**Acceptance Criteria:**

**Given** audit logs exist
**When** I click Export with current filters
**Then** a file is generated and downloaded

**And** I can choose format: CSV or JSON
**And** export respects current filters (only exports matching records)
**And** export includes all fields
**And** large exports show progress indicator
**And** exported file has descriptive filename with date range

**Prerequisites:** Story 6.2

**Technical Notes:**
- Implement in `internal/audit/export.go`
- Bindings: `ExportAuditLogs`
- Stream large exports to temp file
- Return file path for frontend to trigger download
- Filename: `servercraft-audit-{start}-{end}.{format}`

---

## Summary

### Epic Breakdown Statistics

- **Total Epics:** 6
- **Total Stories:** 32
- **Foundation Stories:** 5
- **Feature Stories:** 27

### FR Coverage Verification

✅ All 23 Functional Requirements are covered by at least one story.

### Implementation Sequence

1. **Epic 1** - Foundation (required for all)
2. **Epic 2** - Server Inventory (core functionality)
3. **Epic 3** - SSH Terminal (builds on inventory)
4. **Epic 4** - Docker Management (builds on SSH)
5. **Epic 5** - Task Automation (builds on SSH)
6. **Epic 6** - Audit (captures all actions)

### Context Status

- ✅ PRD requirements incorporated
- ✅ Architecture technical decisions incorporated
- ○ UX Design not yet created (stories can be enhanced later)

---

_For implementation: Use the `dev-story` workflow to implement individual stories from this epic breakdown._

_This document will be updated after UX Design workflow to incorporate interaction details and mockup references._
