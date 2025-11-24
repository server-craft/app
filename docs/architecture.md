# ServerCraft - Architecture

## Executive Summary

ServerCraft is a cross-platform desktop application built with Wails (Go + React/TypeScript) that provides agentless server management through SSH. The architecture prioritizes concurrent connection handling, local-first data storage, and a modular design that separates SSH operations, Docker management, and task execution into distinct services.

## Project Initialization

First implementation story should execute:

```bash
wails init -n servercraft -t react-ts
```

This establishes the base architecture with:
- Wails v2.11.0 desktop framework
- React 18.x with TypeScript
- Vite build tooling
- Standard Wails project structure
- Auto-generated Go/JS bindings

After initialization, install additional dependencies:

```bash
# Frontend
cd frontend
npm install zustand @tanstack/react-query xterm xterm-addon-fit
npx shadcn-ui@latest init
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react

# Backend (from project root)
go get gorm.io/gorm
go get gorm.io/driver/sqlite
go get github.com/zalando/go-keyring
go get go.uber.org/zap
go get golang.org/x/crypto/ssh
go get github.com/stretchr/testify
```

## Decision Summary

| Category | Decision | Version | Affects | Rationale |
|----------|----------|---------|---------|-----------|
| Desktop Framework | Wails | 2.11.0 | All | Go backend preference, native performance |
| Frontend Framework | React | 18.x | All UI | Best ecosystem for terminal/dashboard components |
| Language | TypeScript | 5.x | Frontend | Type safety for complex state |
| State Management | Zustand | latest | Frontend | Minimal boilerplate, easiest implementation |
| UI Components | shadcn/ui | latest | All UI | Accessible, customizable, Tailwind-based |
| Styling | Tailwind CSS | 3.x | All UI | Utility-first, consistent design |
| Database ORM | GORM | latest | Data persistence | Most popular Go ORM, good migration support |
| SSH Client | golang.org/x/crypto/ssh | latest | SSH operations | Standard library, well-maintained |
| Terminal Emulator | xterm.js | latest | Terminal UI | Industry standard, full VT100 support |
| Credential Storage | go-keyring | latest | Security | Native OS keychain integration |
| Logging | zap | latest | All Go code | High performance structured logging |
| Go Testing | testify | latest | Backend tests | Assertions and mocking |
| React Testing | Vitest + RTL | latest | Frontend tests | Fast, React Testing Library compatible |

## Project Structure

```
servercraft/
├── build/                      # Wails build outputs
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── dashboard/     # Server health, status cards
│   │   │   │   ├── ServerCard.tsx
│   │   │   │   ├── HealthIndicator.tsx
│   │   │   │   ├── StatusGrid.tsx
│   │   │   │   └── index.ts
│   │   │   ├── terminal/      # xterm.js wrapper
│   │   │   │   ├── Terminal.tsx
│   │   │   │   ├── TerminalTabs.tsx
│   │   │   │   └── index.ts
│   │   │   ├── containers/    # Docker management UI
│   │   │   │   ├── ContainerList.tsx
│   │   │   │   ├── ContainerDetail.tsx
│   │   │   │   ├── ContainerLogs.tsx
│   │   │   │   └── index.ts
│   │   │   ├── inventory/     # Server/org/group tree
│   │   │   │   ├── OrgTree.tsx
│   │   │   │   ├── ServerList.tsx
│   │   │   │   ├── GroupPanel.tsx
│   │   │   │   └── index.ts
│   │   │   ├── tasks/         # Task runner UI
│   │   │   │   ├── TaskLibrary.tsx
│   │   │   │   ├── TaskRunner.tsx
│   │   │   │   └── index.ts
│   │   │   └── audit/         # Audit log viewer
│   │   │       ├── AuditLog.tsx
│   │   │       ├── AuditFilters.tsx
│   │   │       └── index.ts
│   │   ├── stores/            # Zustand stores
│   │   │   ├── servers.ts     # Server/org/group state
│   │   │   ├── containers.ts  # Docker container state
│   │   │   ├── terminal.ts    # Terminal sessions state
│   │   │   ├── tasks.ts       # Task execution state
│   │   │   └── ui.ts          # UI state (navigation, modals)
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useServerStatus.ts
│   │   │   ├── useSSHConnection.ts
│   │   │   └── useAuditLog.ts
│   │   ├── lib/               # Utilities
│   │   │   ├── wails.ts       # Wails binding wrappers
│   │   │   ├── utils.ts       # General utilities
│   │   │   └── constants.ts
│   │   ├── types/             # TypeScript types
│   │   │   ├── server.ts
│   │   │   ├── container.ts
│   │   │   ├── task.ts
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── components.json        # shadcn/ui config
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
├── internal/                   # Go private packages
│   ├── app/                   # Application core
│   │   ├── app.go            # Wails app struct
│   │   ├── bindings.go       # All exported methods for frontend
│   │   └── events.go         # Wails event emissions
│   ├── models/                # GORM models
│   │   ├── organization.go
│   │   ├── group.go
│   │   ├── server.go
│   │   ├── container.go
│   │   ├── credential.go
│   │   ├── task.go
│   │   ├── task_template.go
│   │   └── audit.go
│   ├── database/              # DB connection, migrations
│   │   ├── database.go
│   │   ├── migrations.go
│   │   └── seed.go
│   ├── ssh/                   # SSH client management
│   │   ├── pool.go           # Connection pool
│   │   ├── client.go         # SSH client wrapper
│   │   ├── session.go        # Interactive sessions
│   │   ├── executor.go       # Command execution
│   │   └── sftp.go           # File transfer
│   ├── docker/                # Docker over SSH
│   │   ├── service.go        # Docker service
│   │   ├── container.go      # Container operations
│   │   ├── compose.go        # Docker-compose operations
│   │   └── parser.go         # Parse docker CLI output
│   ├── tasks/                 # Task runner
│   │   ├── service.go        # Task service
│   │   ├── runner.go         # Task execution
│   │   ├── scheduler.go      # Scheduled tasks
│   │   └── templates/        # Pre-built task templates
│   │       ├── update_system.go
│   │       ├── install_docker.go
│   │       ├── restart_service.go
│   │       └── ...
│   ├── credentials/           # Vault & keyring
│   │   ├── service.go
│   │   ├── vault.go          # Encrypted local vault
│   │   └── keyring.go        # OS keychain integration
│   ├── audit/                 # Audit logging
│   │   ├── service.go
│   │   ├── logger.go
│   │   └── export.go         # CSV/JSON export
│   └── monitor/               # Server status polling
│       ├── service.go
│       ├── poller.go
│       └── metrics.go
├── pkg/                       # Public packages (if needed)
├── main.go                    # Entry point
├── wails.json                 # Wails config
├── go.mod
├── go.sum
└── README.md
```

## FR Category to Architecture Mapping

| PRD Section | Go Packages | React Components | DB Models | Key Bindings |
|-------------|-------------|------------------|-----------|--------------|
| 3.1 Multi-Context Dashboard | `models`, `monitor`, `database` | `inventory/*`, `dashboard/*` | `organizations`, `groups`, `servers` | `ListOrganizations`, `ListServers`, `GetServerStatus` |
| 3.2 Docker Management | `docker` | `containers/*` | `containers` | `ListContainers`, `StartContainer`, `GetContainerLogs` |
| 3.3 Task Builder | `tasks` | `tasks/*` | `tasks`, `task_templates` | `ListTasks`, `RunTask`, `GetTaskTemplates` |
| 3.4 Terminal & Files | `ssh` | `terminal/*` | - | `OpenTerminal`, `SendInput`, `CloseTerminal` |
| 3.5 Audit & Compliance | `audit` | `audit/*` | `audit_logs` | `GetAuditLogs`, `ExportAuditLogs` |
| 3.6 Credentials | `credentials` | - | `credentials` | `SaveCredential`, `GetCredential`, `DeleteCredential` |

## Technology Stack Details

### Core Technologies

**Go Backend (v1.21+)**
- Single binary compilation
- Excellent concurrency for SSH connection pool
- Native OS integration via Wails

**React Frontend (v18.x)**
- Concurrent rendering for smooth UI updates
- Suspense for loading states
- Server status updates via Wails events

**SQLite Database**
- Embedded, zero-config
- File: `~/.config/servercraft/servercraft.db`
- Migrations run on startup

### Integration Points

**1. Wails Bindings (Go → React)**
```go
// internal/app/bindings.go
func (a *App) ListServers(orgID string) Result[[]Server] {
    servers, err := a.serverService.List(orgID)
    if err != nil {
        return Result[[]Server]{Error: err.Error()}
    }
    return Result[[]Server]{Success: true, Data: servers}
}
```

**2. Wails Events (Go → React, async)**
```go
// Emit server status updates
runtime.EventsEmit(a.ctx, "server:status", ServerStatus{
    ServerID: id,
    CPU:      cpuPercent,
    Memory:   memPercent,
    Online:   true,
})
```

```typescript
// Listen in React
useEffect(() => {
  EventsOn("server:status", (status: ServerStatus) => {
    updateServerStatus(status);
  });
}, []);
```

**3. SSH Connection Pool**
```go
// Shared across docker, tasks, terminal, monitor
type Pool struct {
    connections sync.Map  // serverID -> *ssh.Client
    config      PoolConfig
}
```

## Novel Pattern Designs

### 1. Multi-Context Navigation Pattern

**Purpose:** Enable seamless navigation between Organization → Group → Server → Container contexts

**Components:**
- `NavigationStore` (Zustand) - tracks current context
- `ContextBreadcrumb` - shows hierarchy path
- `ContextActions` - scopes actions to current level

**Data Flow:**
```
User clicks Server →
  NavigationStore.setContext('server', serverID) →
    Dashboard shows server metrics →
      Container list shows server's containers →
        Actions menu shows server-level operations
```

**Implementation Guide:**
```typescript
// stores/navigation.ts
interface NavigationState {
  contextStack: ContextItem[];
  activeOrg: string | null;
  activeGroup: string | null;
  activeServer: string | null;
  activeContainer: string | null;

  pushContext: (type: ContextType, id: string) => void;
  popContext: () => void;
  resetToOrg: (orgId: string) => void;
}
```

### 2. Agentless Docker Management Pattern

**Purpose:** Manage Docker containers without daemon API access, using only SSH

**Components:**
- `DockerService` (Go) - wraps docker CLI commands
- `DockerParser` - parses CLI output to structs
- `ContainerStore` (React) - caches container state

**Data Flow:**
```
React calls ListContainers(serverID) →
  Go executes `docker ps --format json` via SSH →
    Parse JSON output to []Container →
      Return to React →
        Update ContainerStore
```

**Implementation Guide:**
```go
// internal/docker/service.go
func (s *Service) ListContainers(serverID string) ([]Container, error) {
    output, err := s.ssh.Execute(serverID,
        `docker ps -a --format '{"id":"{{.ID}}","name":"{{.Names}}","status":"{{.Status}}","image":"{{.Image}}"}'`)
    if err != nil {
        return nil, fmt.Errorf("docker ps failed: %w", err)
    }
    return s.parser.ParseContainerList(output)
}
```

### 3. SSH Connection Pool Pattern

**Purpose:** Efficiently manage 100+ concurrent SSH connections with auto-reconnect

**Components:**
- `Pool` - manages connection lifecycle
- `HealthChecker` - validates connections before use
- `ConnectionMetrics` - tracks connection stats

**Implementation Guide:**
```go
// internal/ssh/pool.go
type Pool struct {
    connections sync.Map
    maxIdle     time.Duration
    logger      *zap.Logger
}

func (p *Pool) Get(serverID string, cred Credential) (*ssh.Client, error) {
    // Check existing connection
    if conn, ok := p.connections.Load(serverID); ok {
        client := conn.(*ssh.Client)
        if p.isHealthy(client) {
            return client, nil
        }
        client.Close()
        p.connections.Delete(serverID)
    }

    // Create new connection
    client, err := p.dial(cred)
    if err != nil {
        return nil, err
    }

    p.connections.Store(serverID, client)
    return client, nil
}
```

## Implementation Patterns

These patterns ensure consistent implementation across all components:

### API Response Format
```go
// All Wails bindings return this structure
type Result[T any] struct {
    Success bool   `json:"success"`
    Data    T      `json:"data,omitempty"`
    Error   string `json:"error,omitempty"`
}

// Usage
func (a *App) GetServer(id string) Result[Server] {
    server, err := a.serverService.Get(id)
    if err != nil {
        return Result[Server]{Error: err.Error()}
    }
    return Result[Server]{Success: true, Data: server}
}
```

### Service Pattern (Go)
```go
// Every internal package exposes a Service
type Service struct {
    db     *gorm.DB
    ssh    *ssh.Pool
    logger *zap.Logger
}

func NewService(db *gorm.DB, ssh *ssh.Pool, logger *zap.Logger) *Service {
    return &Service{db: db, ssh: ssh, logger: logger}
}
```

### Store Pattern (React)
```typescript
// Zustand store with actions
interface ServerStore {
  servers: Server[];
  loading: boolean;
  error: string | null;

  fetchServers: (orgId: string) => Promise<void>;
  addServer: (server: Server) => Promise<void>;
  updateServer: (id: string, data: Partial<Server>) => Promise<void>;
  deleteServer: (id: string) => Promise<void>;
}

export const useServerStore = create<ServerStore>((set, get) => ({
  servers: [],
  loading: false,
  error: null,

  fetchServers: async (orgId) => {
    set({ loading: true, error: null });
    const result = await ListServers(orgId);
    if (result.success) {
      set({ servers: result.data, loading: false });
    } else {
      set({ error: result.error, loading: false });
    }
  },
  // ... other actions
}));
```

### Component Pattern (React)
```typescript
// Functional component with hooks
interface ServerCardProps {
  server: Server;
  onSelect: (id: string) => void;
}

export function ServerCard({ server, onSelect }: ServerCardProps) {
  const status = useServerStatus(server.id);

  return (
    <Card onClick={() => onSelect(server.id)}>
      <CardHeader>
        <CardTitle>{server.name}</CardTitle>
        <HealthIndicator status={status} />
      </CardHeader>
      <CardContent>
        {/* ... */}
      </CardContent>
    </Card>
  );
}
```

## Consistency Rules

### Naming Conventions

**Go:**
- Exported functions: `PascalCase` (`ListServers`, `GetContainer`)
- Private functions: `camelCase` (`parseOutput`, `dialSSH`)
- JSON tags: `snake_case` (`server_id`, `created_at`)
- Files: `snake_case.go` (`connection_pool.go`)

**React/TypeScript:**
- Components: `PascalCase` (`ServerCard.tsx`)
- Functions/variables: `camelCase` (`fetchServers`, `serverList`)
- Types/interfaces: `PascalCase` (`ServerStatus`, `ContainerInfo`)
- Files: `PascalCase.tsx` for components, `camelCase.ts` for utilities

**Database:**
- Tables: `snake_case` plural (`servers`, `audit_logs`, `task_templates`)
- Columns: `snake_case` (`server_id`, `created_at`, `is_active`)
- Indexes: `idx_{table}_{column}` (`idx_servers_org_id`)

### Code Organization

**Go packages:**
- One service per package
- `service.go` contains main Service struct
- Related functions in separate files by concern

**React components:**
- Co-locate tests: `Component.test.tsx`
- Barrel exports via `index.ts`
- Shared UI in `components/ui/`

### Error Handling

**Go:**
```go
// Wrap errors with context
if err != nil {
    return Result[T]{
        Error: fmt.Sprintf("failed to %s: %v", operation, err),
    }
}

// Log with structured fields
s.logger.Error("ssh connection failed",
    zap.String("server_id", serverID),
    zap.Error(err),
)
```

**React:**
```typescript
// Handle Result type
const result = await GetServer(id);
if (!result.success) {
    toast.error(result.error);
    return;
}
// Use result.data
```

### Logging Strategy

**Format:** Structured JSON via zap

**Levels:**
- `Debug` - SSH commands, query details
- `Info` - User actions, connections
- `Warn` - Recoverable errors, retries
- `Error` - Failures requiring attention

**Standard fields:**
```go
logger.Info("action completed",
    zap.String("server_id", serverID),
    zap.String("action", "container_start"),
    zap.String("user", userID),
    zap.Duration("duration", elapsed),
)
```

## Data Architecture

### Entity Relationships

```
Organization (1) ─── (*) Group (1) ─── (*) Server (1) ─── (*) Container
                                              │
                                              └─── (*) Credential

Server (1) ─── (*) AuditLog
Server (1) ─── (*) Task
```

### Core Models

```go
// internal/models/organization.go
type Organization struct {
    ID        string    `gorm:"primaryKey" json:"id"`
    Name      string    `json:"name"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
    Groups    []Group   `gorm:"foreignKey:OrgID" json:"groups,omitempty"`
}

// internal/models/server.go
type Server struct {
    ID           string     `gorm:"primaryKey" json:"id"`
    GroupID      string     `gorm:"index" json:"group_id"`
    Name         string     `json:"name"`
    Host         string     `json:"host"`
    Port         int        `json:"port"`
    Username     string     `json:"username"`
    AuthMethod   string     `json:"auth_method"` // password, key, certificate
    Labels       []string   `gorm:"serializer:json" json:"labels"`
    LastSeen     *time.Time `json:"last_seen"`
    CreatedAt    time.Time  `json:"created_at"`
    UpdatedAt    time.Time  `json:"updated_at"`
}

// internal/models/audit.go
type AuditLog struct {
    ID        string    `gorm:"primaryKey" json:"id"`
    ServerID  string    `gorm:"index" json:"server_id"`
    UserID    string    `json:"user_id"`
    Action    string    `json:"action"`
    Details   string    `gorm:"type:text" json:"details"`
    Result    string    `json:"result"` // success, failure
    CreatedAt time.Time `gorm:"index" json:"created_at"`
}
```

### Database Configuration

```go
// internal/database/database.go
func Initialize(configDir string) (*gorm.DB, error) {
    dbPath := filepath.Join(configDir, "servercraft.db")

    db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
        Logger: logger.Default.LogMode(logger.Silent),
    })
    if err != nil {
        return nil, err
    }

    // Auto-migrate
    err = db.AutoMigrate(
        &models.Organization{},
        &models.Group{},
        &models.Server{},
        &models.Credential{},
        &models.Container{},
        &models.Task{},
        &models.TaskTemplate{},
        &models.AuditLog{},
    )

    return db, err
}
```

## API Contracts

### Wails Binding Signatures

```go
// Server Management
func (a *App) ListOrganizations() Result[[]Organization]
func (a *App) CreateOrganization(name string) Result[Organization]
func (a *App) ListServers(groupID string) Result[[]Server]
func (a *App) CreateServer(server Server) Result[Server]
func (a *App) TestConnection(serverID string) Result[bool]

// Docker Management
func (a *App) ListContainers(serverID string) Result[[]Container]
func (a *App) StartContainer(serverID, containerID string) Result[bool]
func (a *App) StopContainer(serverID, containerID string) Result[bool]
func (a *App) GetContainerLogs(serverID, containerID string, tail int) Result[string]

// Terminal
func (a *App) OpenTerminal(serverID string) Result[string] // returns sessionID
func (a *App) SendTerminalInput(sessionID string, input string) Result[bool]
func (a *App) CloseTerminal(sessionID string) Result[bool]

// Tasks
func (a *App) GetTaskTemplates() Result[[]TaskTemplate]
func (a *App) RunTask(serverID string, templateID string, params map[string]string) Result[string]

// Audit
func (a *App) GetAuditLogs(filter AuditFilter) Result[[]AuditLog]
func (a *App) ExportAuditLogs(filter AuditFilter, format string) Result[string] // returns file path
```

### Event Contracts

```typescript
// Server status updates
interface ServerStatusEvent {
  server_id: string;
  online: boolean;
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  timestamp: string;
}

// Task progress
interface TaskProgressEvent {
  task_id: string;
  server_id: string;
  progress: number; // 0-100
  status: 'running' | 'completed' | 'failed';
  output: string;
}

// Terminal output
interface TerminalOutputEvent {
  session_id: string;
  data: string; // raw terminal output
}
```

## Security Architecture

### Credential Storage

**Strategy:** Hybrid approach using OS keychain + encrypted vault

```go
// Try OS keychain first, fall back to encrypted vault
func (s *Service) GetCredential(serverID string) (*Credential, error) {
    // Try keychain
    if secret, err := keyring.Get("servercraft", serverID); err == nil {
        return s.decrypt(secret)
    }

    // Fall back to vault
    return s.vault.Get(serverID)
}
```

**Vault encryption:** AES-256-GCM with key derived from master password

### SSH Security

- Support key-based and certificate-based auth
- Auto-rotate from password to certificate after first connection
- Verify host keys (known_hosts)
- No password storage after certificate setup

### Data Protection

- All credentials encrypted at rest
- No telemetry or external connections
- Audit log for all sensitive operations
- Config directory permissions: 0700

## Performance Considerations

### SSH Connection Pool

- Max idle connections per server: 2
- Connection timeout: 30 seconds
- Keep-alive interval: 60 seconds
- Health check before reuse

### Status Polling

- Default interval: 30 seconds
- Adaptive: slower for offline servers
- Concurrent polling with worker pool
- Cancel on server removal

### Frontend Optimization

- Virtualized lists for large server counts
- Debounced search/filter
- Lazy load container details
- Memoized status calculations

### Database

- Index on frequently queried columns
- Batch audit log inserts
- Periodic vacuum for SQLite
- Connection pool for PostgreSQL (team mode)

## Deployment Architecture

### Desktop Distribution

**macOS:**
- `.app` bundle
- DMG installer
- Code signing required for distribution
- Notarization for Gatekeeper

**Linux:**
- AppImage (recommended)
- `.deb` package
- `.rpm` package

**Windows:**
- NSIS installer
- Code signing recommended
- Auto-update support

### Build Commands

```bash
# Development
wails dev

# Production builds
wails build -platform darwin/amd64
wails build -platform darwin/arm64
wails build -platform linux/amd64
wails build -platform windows/amd64
```

### Configuration Directory

```
~/.config/servercraft/          # Linux/macOS
%APPDATA%\servercraft\          # Windows
├── servercraft.db              # SQLite database
├── config.json                 # App settings
├── known_hosts                 # SSH host keys
└── logs/                       # Application logs
```

## Development Environment

### Prerequisites

- Go 1.21+
- Node.js 18+
- Wails CLI v2.11.0
- Platform-specific:
  - macOS: Xcode Command Line Tools
  - Linux: `libgtk-3-dev libwebkit2gtk-4.0-dev`
  - Windows: WebView2 runtime

### Setup Commands

```bash
# Install Wails CLI
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# Verify installation
wails doctor

# Initialize project
wails init -n servercraft -t react-ts

# Install dependencies
cd servercraft
go mod tidy
cd frontend && npm install

# Run in development
wails dev
```

### IDE Configuration

**VS Code extensions:**
- Go (golang.go)
- ESLint
- Tailwind CSS IntelliSense
- Prettier

**Settings:**
```json
{
  "go.lintTool": "golangci-lint",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[go]": {
    "editor.defaultFormatter": "golang.go"
  }
}
```

## Architecture Decision Records (ADRs)

### ADR-001: Wails over Electron

**Decision:** Use Wails (Go + Web) instead of Electron

**Context:** Need cross-platform desktop app with native performance

**Rationale:**
- Go backend aligns with user preference
- Smaller binary size (~10MB vs ~150MB Electron)
- Better performance, lower memory usage
- Native OS integration (keychain, notifications)

**Consequences:**
- Smaller community than Electron
- Fewer pre-built components
- Must handle Go/JS binding complexity

### ADR-002: SQLite as Default Database

**Decision:** Use SQLite for single-user, PostgreSQL option for teams

**Context:** Need local-first storage with team sync option

**Rationale:**
- Zero configuration for users
- Single file backup/restore
- Sufficient performance for expected scale
- PostgreSQL upgrade path for team features

**Consequences:**
- Some query limitations vs PostgreSQL
- Must handle migration between DBs for team upgrade

### ADR-003: Agentless Docker Management

**Decision:** Manage Docker via SSH commands, not Docker API

**Context:** Core value prop is agentless - no installation on servers

**Rationale:**
- Maintains agentless promise
- Works with any Docker installation
- No firewall/port configuration needed
- Simpler security model

**Consequences:**
- Must parse CLI output (less reliable than API)
- Some operations slower than direct API
- Limited to CLI-available operations

### ADR-004: Zustand for State Management

**Decision:** Use Zustand instead of Redux or Jotai

**Context:** Need state management for complex UI with minimal boilerplate

**Rationale:**
- Simplest API, minimal boilerplate
- No providers/context needed
- TypeScript support excellent
- Easy to understand and maintain

**Consequences:**
- Less structured than Redux (team discipline needed)
- Smaller ecosystem of middleware

### ADR-005: Certificate-Based Authentication Strategy

**Decision:** Auto-upgrade from password to certificate auth after first connection

**Context:** Security best practice while maintaining ease of use

**Rationale:**
- Passwords never stored long-term
- Certificates can be rotated
- Better audit trail
- Aligns with enterprise security requirements

**Consequences:**
- More complex credential management
- Must handle certificate renewal
- User education needed

---

_Generated by BMAD Decision Architecture Workflow_
_Date: 2025-11-23_
_For: Geraldo Andrade_
