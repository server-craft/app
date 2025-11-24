# ServerCraft - UX Design Specification

**Author:** Geraldo Andrade
**Date:** 2025-11-23
**Version:** 1.0

---

## Executive Summary

This document defines the user experience design for ServerCraft, a cross-platform desktop application for SSH-based server management. The design prioritizes efficiency and productivity for power users managing complex server hierarchies.

---

## Project Vision

### What We're Building

**ServerCraft** - Desktop server management app that makes switching between organizations effortless while providing deep visibility into a 5-level hierarchy:

**Organization → Groups → Servers → Kubernetes/Docker → Applications**

### Target Users

1. **Homelab Enthusiasts** (5-20 servers) - Visual Docker deployment without YAML
2. **Small Agencies** (30-40 client servers) - Organization separation per client
3. **DevOps Teams** - Simpler task execution than Ansible
4. **Privacy-Focused Users** - No cloud dependencies
5. **MSPs** - Managing diverse client infrastructures

### Core Experience

**Switching across organizations must be effortless** - one click to jump between clients/projects with immediate context awareness.

### Desired Emotional Response

**Efficient and productive** - Users should feel like they're getting things done quickly without friction. The UI should be information-dense but not cluttered, professional and tool-like.

---

## Inspiration Analysis

### Royal TS
- Tree navigation for server hierarchy
- Command palette + keyboard shortcuts
- Tabbed interface with keyboard broadcasting
- Power-user focused, dense information

### Termius
- Clean, sleek interface with multi-tab + split-view
- Command palette for quick task switching
- Groups and tags for organization
- Cross-platform consistency

### Grafana
- Panel-based layouts with visual hierarchy
- Z-pattern scanning (top-left = important)
- Template variables to prevent sprawl
- Drill-down hierarchies
- Color for emphasis on key metrics

### Patterns Applied to ServerCraft

| Pattern | Source | Application |
|---------|--------|-------------|
| Tree navigation | Royal TS | Org → Group → Server hierarchy |
| Command palette | Royal TS, Termius | Quick org switching, keyboard power users |
| Multi-tab + split-view | Termius | Terminal sessions |
| Panel-based dashboard | Grafana | Server status overview |
| Visual hierarchy | Grafana | Health scores, critical metrics top-left |
| Tags/labels | Termius | Server filtering |

---

## Design System

### Foundation

**Design System:** shadcn/ui
- Accessible, customizable components
- Tailwind CSS integration
- Dark mode support
- Consistent design tokens

### Color Theme: Midnight Forge

**Personality:** Technical, Modern, Bold

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | Purple | `#a855f7` | Main actions, selected states, links |
| Background | Near Black | `#09090b` | App background |
| Surface | Dark Zinc | `#27272a` | Cards, panels, inputs |
| Border | Zinc | `#3f3f46` | Dividers, input borders |
| Text | White | `#fafafa` | Primary text |
| Muted | Gray | `#a1a1aa` | Secondary text, placeholders |
| Success | Green | `#22c55e` | Online status, success messages |
| Error | Red | `#ef4444` | Offline status, errors |
| Warning | Amber | `#f59e0b` | High resource usage, warnings |

**Rationale:** Technical, modern feel like VS Code/GitHub. Appeals to DevOps engineers and developers. Bold purple accent stands out from traditional blue enterprise tools.

### Typography

**Font Family:** System fonts (SF Pro, Segoe UI, Roboto)
- Heading: Semi-bold (600)
- Body: Regular (400)
- Code/Terminal: JetBrains Mono or SF Mono

**Type Scale:**
- h1: 24px / 32px line-height
- h2: 20px / 28px
- h3: 16px / 24px
- body: 14px / 20px
- small: 12px / 16px
- tiny: 10px / 14px

### Spacing

**Base unit:** 4px

**Scale:**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

---

## Layout & Navigation

### Primary Layout: Hybrid (Sidebar Tree + Command Palette)

```
┌─────────────────────────────────────────────────────┐
│ [Org Dropdown ▼]  Search...  [Cmd+K]    [Settings]  │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  Sidebar     │     Main Content Area                │
│  Tree        │                                      │
│              │     - Dashboard                      │
│  □ Org 1     │     - Server Detail                  │
│    ├ Group   │     - Terminal Tabs                  │
│    │ └ Srv   │                                      │
│    └ Group   │                                      │
│  □ Org 2     │                                      │
│              │                                      │
├──────────────┴──────────────────────────────────────┤
│ Status Bar: Connection status, notifications        │
└─────────────────────────────────────────────────────┘
```

### Navigation Components

**Org Switcher Dropdown**
- Location: Top-left header
- Shows: Current org name + chevron
- Click: Opens dropdown with all orgs
- Keyboard: Cmd+K then type org name

**Sidebar Tree**
- Collapsible hierarchy (Org → Group → Server → K8s/Docker → App)
- Single-click: Show detail in main content
- Icons indicate type (server, container, pod)
- Status dots show online/offline
- Collapse/expand with chevrons
- Can hide entire sidebar (toggle or Cmd+B)

**Command Palette**
- Trigger: Cmd+K (Mac) / Ctrl+K (Windows/Linux)
- Search: Orgs, servers, apps, commands, tasks
- Recent items shown by default
- Keyboard navigation with arrows + Enter

**Breadcrumb**
- Shows current context path
- Each segment clickable to navigate up
- Example: `Acme Corp / Production / web-01 / Docker / nginx`

---

## User Journeys

### Journey 1: Switch Organization

**Goal:** Jump from current org to different client's servers

**Flow:**
1. Click org dropdown in header (shows "Acme Corp ▼")
2. Dropdown shows list of all orgs with search
3. Click "Beta Inc" or type to filter
4. Sidebar tree updates to show Beta Inc hierarchy
5. Main content shows Beta Inc dashboard

**Alternative (Keyboard):**
1. Press Cmd+K
2. Type "Beta"
3. Select "Beta Inc" from results
4. Press Enter

**Feedback:**
- Loading spinner while fetching org data
- Sidebar animates to new tree
- Toast: "Switched to Beta Inc"

---

### Journey 2: Connect to Server Terminal

**Goal:** Open SSH terminal to specific server

**Flow:**
1. Navigate tree: Org → Group → Server
2. Single-click server in tree
3. Server detail panel appears in main content (status, containers, metrics)
4. Click "Terminal" button (or press Enter)
5. New terminal tab opens in main content
6. SSH connection establishes
7. Terminal ready for input

**Feedback:**
- Click: Server row highlights
- Terminal button shows loading state
- Connection status in tab: "Connecting..." → "Connected"
- Error: Toast with retry option

---

### Journey 3: View Container Status

**Goal:** Check status of Docker containers on a server

**Flow:**
1. Navigate to server (via tree or Cmd+K)
2. Single-click server to show detail
3. Detail panel shows "Containers" tab
4. Container list displays: name, image, status, CPU/memory
5. Click container for detail (logs, shell, restart)

**Container Actions:**
- Start/Stop/Restart: Icon buttons with confirmation
- Logs: Opens in split panel or modal
- Shell: Opens terminal tab into container

---

### Journey 4: Run Task on Multiple Servers

**Goal:** Update system packages on all production servers

**Flow:**
1. Navigate to group containing target servers
2. Click "Tasks" in toolbar
3. Select task template "Update System"
4. Multi-select servers or choose "All in group"
5. Review and click "Run Task"
6. Progress panel shows per-server status
7. Completion summary with success/failure count

**Feedback:**
- Progress bar per server
- Live output streaming
- Success: Green checkmark
- Failure: Red X with error details
- Toast: "Task completed: 5 succeeded, 1 failed"

---

## Component Specifications

### Server Card (Dashboard)

**Purpose:** Show server health at a glance in dashboard grid

**Anatomy:**
- Server name (bold)
- Status indicator (dot: green/red/yellow)
- Health score (0-100 with color)
- Quick metrics: CPU, Memory, Disk (small bars or percentages)
- Container count badge

**States:**
- Default: Normal display
- Hover: Slight elevation, highlight border
- Selected: Purple border
- Offline: Muted colors, red status dot
- Loading: Skeleton placeholder

**Interactions:**
- Single-click: Select and show detail
- Double-click: Open terminal
- Right-click: Context menu (Terminal, Tasks, Edit, Delete)

---

### Terminal Tab

**Purpose:** SSH terminal session with xterm.js

**Anatomy:**
- Tab: Server name + close button
- Terminal area: Full xterm.js instance
- Status bar: Connection status, latency

**States:**
- Connecting: "Connecting to server..."
- Connected: Green indicator, ready for input
- Disconnected: Red indicator, "Reconnect" button
- Error: Error message with retry option

**Interactions:**
- Click tab: Switch to this terminal
- Cmd+W: Close terminal tab
- Cmd+1-9: Switch to tab by number
- Right-click tab: Close, Close Others, Close All

---

### Command Palette

**Purpose:** Quick navigation and command execution

**Anatomy:**
- Search input (auto-focused)
- Results list with icons
- Keyboard hints (↑↓ to navigate, Enter to select)

**Sections:**
- Recent (last 5 items)
- Servers (matching search)
- Organizations
- Tasks
- Commands (Settings, Help, etc.)

**States:**
- Empty: Show recent items
- Typing: Filter results in real-time
- No results: "No matches found"
- Loading: Spinner in results area

---

## UX Pattern Decisions

### Button Hierarchy

| Type | Style | Usage |
|------|-------|-------|
| Primary | Solid purple (`#a855f7`) | Main action per screen |
| Secondary | Outline purple | Alternative actions |
| Ghost | Transparent, gray text | Tertiary actions, cancel |
| Destructive | Solid red (`#ef4444`) | Delete, disconnect |

### Feedback Patterns

**Toast Notifications:**
- Position: Top-right
- Auto-dismiss: 5 seconds (success/info), manual (error)
- Types: Success (green), Error (red), Warning (amber), Info (blue)

**Inline Messages:**
- Form validation errors below fields
- Section-level errors at top of form

**Loading States:**
- Quick actions (<2s): Spinner
- Tasks/deployments: Progress bar with percentage
- Initial load: Skeleton screens

### Form Patterns

- Labels: Above input
- Required fields: Asterisk (*)
- Validation: On blur + on submit
- Error display: Inline below field (red text)
- Help text: Gray caption below input

### Modal Patterns

**Sizes:**
- Small: Confirmations, simple forms
- Medium: Multi-field forms, settings
- Large: Complex workflows, logs viewer

**Behavior:**
- Click outside: Closes (except destructive actions)
- Escape key: Closes
- Focus: Trapped within modal
- Scroll: Modal content scrolls, not page

### Confirmation Patterns

**Standard Delete (server, container):**
- Modal: "Delete server 'web-01'?"
- Buttons: Cancel (ghost), Delete (destructive)

**Critical Delete (organization, group with servers):**
- Modal with warning icon
- Type resource name to confirm
- Buttons: Cancel (ghost), Delete (destructive, disabled until name typed)

### Empty States

**First use:**
- Friendly illustration
- Clear CTA: "Add your first server"
- Brief explanation of what to do

**No results:**
- "No servers match your filter"
- Suggestion to adjust filters

**Cleared content:**
- Undo option for recent deletions (30 seconds)

---

## Responsive Strategy

### Platform: Desktop (Wails)

**Screen Sizes:**

| Size | Width | Adaptations |
|------|-------|-------------|
| Minimum | 1024px | Sidebar collapsed by default |
| Standard | 1280px | Sidebar visible, single content panel |
| Optimal | 1440px+ | Sidebar visible, split-view terminal |
| Large | 1920px+ | Wide content, comfortable density |

### Adaptations

**Below 1280px:**
- Sidebar auto-collapses (toggle to show)
- Command palette becomes primary navigation

**Terminal Split-View:**
- Requires 1440px+ for side-by-side
- Below: Tabs only (no split)

**Always Available:**
- Command palette (Cmd+K)
- Keyboard shortcuts
- Org dropdown

---

## Accessibility

### Compliance Target: WCAG 2.1 Level AA

### Requirements

**Visual:**
- Color contrast: 4.5:1 minimum for text
- Focus indicators: 2px purple outline on all interactive elements
- Don't rely on color alone: Icons + color for status

**Keyboard:**
- All features accessible via keyboard
- Logical tab order
- Skip links for main content
- Shortcuts documented and customizable

**Screen Readers:**
- ARIA labels on icon-only buttons
- Live regions for status updates
- Meaningful link text
- Form labels properly associated

**Motor:**
- Touch targets: 44x44px minimum
- No time-limited interactions (except optional auto-dismiss toasts)
- Adequate spacing between clickable elements

### Testing Strategy

- Automated: axe DevTools, Lighthouse
- Manual: Keyboard-only navigation testing
- Screen reader: VoiceOver (Mac), NVDA (Windows)

---

## Visual Assets

### Deliverables Created

1. **Color Theme Visualizer:** `docs/ux-color-themes.html`
   - 4 theme options with live component examples
   - Chosen: Theme 2 (Midnight Forge)

### Additional Assets (to be created)

- High-fidelity mockups (Figma)
- Icon set (Lucide icons recommended)
- Illustration style for empty states

---

## Implementation Notes

### For Developers

**Component Priority:**
1. Sidebar tree navigation
2. Command palette (Cmd+K)
3. Server card with status
4. Terminal tabs with xterm.js
5. Org switcher dropdown

**State Management:**
- Navigation context in Zustand store
- Server status via Wails events
- Terminal sessions as separate store

**Keyboard Shortcuts:**
- Cmd+K: Command palette
- Cmd+B: Toggle sidebar
- Cmd+T: New terminal to selected server
- Cmd+W: Close current tab
- Cmd+1-9: Switch tabs

### For Designers

**Design Tokens:**
- Export Tailwind config with theme colors
- Document all spacing and typography tokens
- Create component variants in Figma

---

## Summary

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Design System | shadcn/ui | Accessible, Tailwind-based, customizable |
| Color Theme | Midnight Forge (Purple) | Technical, modern, stands out from competitors |
| Layout | Hybrid sidebar + command palette | Visual browsing + keyboard power users |
| Org Switching | Dropdown in header | Explicit, always visible |
| Server Navigation | Single-click to detail | Safe, see info before connecting |
| Feedback | Toasts + inline | Contextual awareness |
| Accessibility | WCAG 2.1 AA | Professional standard |

### Design Principles

1. **Efficient** - Minimize clicks, maximize keyboard shortcuts
2. **Information-dense** - Show what matters, hide what doesn't
3. **Consistent** - Same patterns everywhere
4. **Accessible** - Works for everyone
5. **Professional** - Tool-like, not toy-like

---

_Generated by BMAD UX Design Workflow_
_Date: 2025-11-23_
_For: Geraldo Andrade_
