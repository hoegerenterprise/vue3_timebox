import axios from 'axios'
import type { GitHubIssue, GitHubRepo } from '@/types'

const githubClient = axios.create({
  baseURL: import.meta.env.VITE_GITHUB_API_BASE as string,
  headers: {
    'Accept': 'application/vnd.github+json',
  },
})

githubClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('github_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const githubApi = {
  async getRepos(owner: string): Promise<GitHubRepo[]> {
    const { data } = await githubClient.get<GitHubRepo[]>(`/users/${owner}/repos`, {
      params: { per_page: 100, sort: 'updated' },
    })
    return data
  },

  async getOrgRepos(org: string): Promise<GitHubRepo[]> {
    const { data } = await githubClient.get<GitHubRepo[]>(`/orgs/${org}/repos`, {
      params: { per_page: 100, sort: 'updated' },
    })
    return data
  },

  async searchRepos(query: string): Promise<GitHubRepo[]> {
    const { data } = await githubClient.get<{ items: GitHubRepo[] }>(`/search/repositories`, {
      params: { q: query, per_page: 20 },
    })
    return data.items
  },

  async getIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubIssue[]> {
    const { data } = await githubClient.get<GitHubIssue[]>(`/repos/${owner}/${repo}/issues`, {
      params: { state, per_page: 100 },
    })
    return data
  },

  async getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    const { data } = await githubClient.get<GitHubIssue>(`/repos/${owner}/${repo}/issues/${issueNumber}`)
    return data
  },

  async validateToken(): Promise<boolean> {
    try {
      await githubClient.get('/user')
      return true
    } catch {
      return false
    }
  },
}
