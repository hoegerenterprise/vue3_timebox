import axios from 'axios'
import type { GitLabIssue, GitLabProject } from '@/types'

const gitlabClient = axios.create({
  baseURL: import.meta.env.VITE_GITLAB_API_BASE as string,
})

gitlabClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('gitlab_token')
  if (token) {
    config.headers['PRIVATE-TOKEN'] = token
  }
  return config
})

export const gitlabApi = {
  async searchProjects(query: string): Promise<GitLabProject[]> {
    const { data } = await gitlabClient.get<GitLabProject[]>('/projects', {
      params: { search: query, per_page: 20, membership: true },
    })
    return data
  },

  async getProject(projectId: string | number): Promise<GitLabProject> {
    const { data } = await gitlabClient.get<GitLabProject>(`/projects/${encodeURIComponent(String(projectId))}`)
    return data
  },

  async getIssues(projectId: string | number, state: 'opened' | 'closed' | 'all' = 'opened'): Promise<GitLabIssue[]> {
    const { data } = await gitlabClient.get<GitLabIssue[]>(`/projects/${encodeURIComponent(String(projectId))}/issues`, {
      params: { state, per_page: 100 },
    })
    return data
  },

  async getIssue(projectId: string | number, iid: number): Promise<GitLabIssue> {
    const { data } = await gitlabClient.get<GitLabIssue>(`/projects/${encodeURIComponent(String(projectId))}/issues/${iid}`)
    return data
  },

  async validateToken(): Promise<boolean> {
    try {
      await gitlabClient.get('/user')
      return true
    } catch {
      return false
    }
  },
}
