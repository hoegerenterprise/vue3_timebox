import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { githubApi } from '@/api/github'
import type { GitHubIssue, GitHubRepo, GitHubConfig } from '@/types'

export const useGithubStore = defineStore('github', () => {
  const config = ref<GitHubConfig>({
    token: localStorage.getItem('github_token') ?? '',
    owner: localStorage.getItem('github_owner') ?? '',
    repo: localStorage.getItem('github_repo') ?? '',
  })

  const repos = ref<GitHubRepo[]>([])
  const issues = ref<GitHubIssue[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isTokenValid = ref(false)

  const selectedRepo = computed(() =>
    repos.value.find((r) => r.full_name === `${config.value.owner}/${config.value.repo}`) ?? null
  )

  const openIssues = computed(() => issues.value.filter((i) => i.state === 'open'))
  const closedIssues = computed(() => issues.value.filter((i) => i.state === 'closed'))

  async function saveConfig(newConfig: GitHubConfig): Promise<void> {
    config.value = { ...newConfig }
    localStorage.setItem('github_token', newConfig.token)
    localStorage.setItem('github_owner', newConfig.owner)
    localStorage.setItem('github_repo', newConfig.repo)

    if (newConfig.token) {
      isTokenValid.value = await githubApi.validateToken()
    }
  }

  async function fetchRepos(): Promise<void> {
    if (!config.value.owner) return
    isLoading.value = true
    error.value = null
    try {
      repos.value = await githubApi.getRepos(config.value.owner)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch repositories'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchIssues(state: 'open' | 'closed' | 'all' = 'open'): Promise<void> {
    if (!config.value.owner || !config.value.repo) return
    isLoading.value = true
    error.value = null
    try {
      issues.value = await githubApi.getIssues(config.value.owner, config.value.repo, state)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch issues'
    } finally {
      isLoading.value = false
    }
  }

  async function validateToken(): Promise<boolean> {
    isTokenValid.value = await githubApi.validateToken()
    return isTokenValid.value
  }

  function clearError(): void {
    error.value = null
  }

  return {
    config,
    repos,
    issues,
    isLoading,
    error,
    isTokenValid,
    selectedRepo,
    openIssues,
    closedIssues,
    saveConfig,
    fetchRepos,
    fetchIssues,
    validateToken,
    clearError,
  }
})
