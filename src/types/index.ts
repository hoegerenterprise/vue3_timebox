// Timebox types
export interface Timebox {
  id: string
  title: string
  description: string
  duration: number // in minutes
  startTime?: string
  endTime?: string
  status: 'pending' | 'running' | 'paused' | 'completed'
  linkedIssues: LinkedIssue[]
  color: string
  createdAt: string
  updatedAt: string
}

export interface LinkedIssue {
  id: string | number
  title: string
  url: string
  source: 'github' | 'gitlab'
  state: string
  labels: string[]
  assignee?: string
  number?: number
  iid?: number
}

// GitHub types
export interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  html_url: string
  labels: Array<{ name: string; color: string }>
  assignee: { login: string } | null
  created_at: string
  updated_at: string
}

export interface GitHubRepo {
  id: number
  full_name: string
  name: string
  owner: { login: string }
  description: string | null
  private: boolean
}

export interface GitHubConfig {
  token: string
  owner: string
  repo: string
}

// GitLab types
export interface GitLabIssue {
  id: number
  iid: number
  title: string
  description: string | null
  state: 'opened' | 'closed'
  web_url: string
  labels: string[]
  assignee: { username: string } | null
  created_at: string
  updated_at: string
}

export interface GitLabProject {
  id: number
  name: string
  name_with_namespace: string
  path_with_namespace: string
  description: string | null
  visibility: string
}

export interface GitLabConfig {
  token: string
  projectId: string | number
}

// Timer state
export interface TimerState {
  timeboxId: string | null
  elapsed: number // seconds
  isRunning: boolean
  startedAt: number | null // timestamp
}

// App settings
export interface AppSettings {
  defaultDuration: number
  showCompletedTimeboxes: boolean
  githubConfig: GitHubConfig
  gitlabConfig: GitLabConfig
}
