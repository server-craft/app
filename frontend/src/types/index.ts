// ServerCraft Type Definitions

// Organization hierarchy
export interface Organization {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  groups?: Group[];
}

export interface Group {
  id: string;
  org_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  servers?: Server[];
}

export interface Server {
  id: string;
  group_id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  auth_method: 'password' | 'key' | 'certificate';
  labels: string[];
  last_seen?: string;
  created_at: string;
  updated_at: string;
}

// Container types
export interface Container {
  id: string;
  server_id: string;
  name: string;
  image: string;
  status: string;
  ports: string[];
  created: string;
  cpu_percent?: number;
  memory_percent?: number;
}

// Task types
export interface Task {
  id: string;
  server_id: string;
  template_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  output: string;
  created_at: string;
  completed_at?: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: TaskParameter[];
}

export interface TaskParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  required: boolean;
  default?: string;
  options?: string[];
  description: string;
}

// Server status
export interface ServerStatus {
  server_id: string;
  online: boolean;
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  health_score: number;
  timestamp: string;
}

// Audit types
export interface AuditLog {
  id: string;
  server_id: string;
  user_id: string;
  action: string;
  details: string;
  result: 'success' | 'failure';
  created_at: string;
}

export interface AuditFilter {
  server_id?: string;
  action?: string;
  result?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

// API Response wrapper
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Terminal types
export interface TerminalSession {
  id: string;
  server_id: string;
  server_name: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
}
