# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ServerCraft** is a cross-platform desktop application (Windows, macOS, Linux) for SSH-based server management and visual configuration management. It's designed as "Royal TS meets Ansible with a no-code interface."

## Technology Stack

- **Desktop Framework:** Wails (Go backend + Web frontend)
- **Backend:** Go
- **Database:** SQLite (default), with abstraction for PostgreSQL/MySQL
- **Automation Engine:** Custom Go-based task runner

## Build Commands

*Note: Build commands will be available once the Wails project is initialized.*

```bash
# Wails typical commands (once project exists)
wails dev          # Development mode with hot reload
wails build        # Build for production
wails generate     # Generate bindings
```

## Architecture

### Planned Structure (from PRD)

- **Agentless SSH-based** communication with target servers
- **Local credential vault** with AES-256 encryption or system keychain
- **No cloud dependency** - fully offline capable
- **Flexible database abstraction** for team sync features

### MVP Scope (Phase 1)

1. Server inventory management (Linux only)
2. SSH terminal with tabs
3. Basic dashboard with uptime/ping status
4. Script runner with 10 pre-defined tasks
5. Multi-server command broadcast

## Development Workflow

This project uses the **BMAD Method** (BMad Method Module) for AI-driven agile development. Available workflows via slash commands:

### Key Workflows

- `/bmad:bmm:workflows:workflow-init` - Initialize project workflow
- `/bmad:bmm:workflows:prd` - Product requirements workflow
- `/bmad:bmm:workflows:architecture` - Architecture design
- `/bmad:bmm:workflows:create-epics-and-stories` - Break PRD into stories
- `/bmad:bmm:workflows:dev-story` - Execute development stories
- `/bmad:bmm:workflows:sprint-planning` - Sprint management

### Available Agents

- **pm** - Product Manager
- **architect** - System Architect
- **dev** - Developer
- **tea** - Test Engineer
- **analyst** - Business Analyst
- **sm** - Scrum Master
- **ux-designer** - UX Designer

Load agents via: `/bmad:bmm:agents:<agent-name>`

## Project Documentation

- `docs/prd.md` - Product Requirements Document
- `.bmad/` - BMAD Method configuration and workflows
