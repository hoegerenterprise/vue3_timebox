import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { gitlabApi } from '@/api/gitlab'
import type { GitLabIssue, GitLabProject, GitLabConfig } from '@/types'

export const useGitlabStore = defineStore('gitlab', () => {
  const config = ref<GitLabConfig>({
    token: localStorage.getItem('gitlab_token') ?? '',
    projectId: localStorage.getItem('gitlab_project_id') ?? '',
  })

  const projects = ref<GitLabProject[]>([])
  const issues = ref<GitLabIssue[]>([])
  const currentProject = ref<GitLabProject | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isTokenValid = ref(false)

  const openIssues = computed(() => issues.value.filter((i) => i.state === 'opened'))
  const closedIssues = computed(() => issues.value.filter((i) => i.state === 'closed'))

  async function saveConfig(newConfig: GitLabConfig): Promise<void> {
    config.value = { ...newConfig }
    localStorage.setItem('gitlab_token', newConfig.token)
    localStorage.setItem('gitlab_project_id', String(newConfig.projectId))

    if (newConfig.token) {
      isTokenValid.value = await gitlabApi.validateToken()
    }

    if (newConfig.projectId) {
      try {
        currentProject.value = await gitlabApi.getProject(newConfig.projectId)
      } catch {
        currentProject.value = null
      }
    }
  }

  async function searchProjects(query: string): Promise<void> {
    if (!query.trim()) return
    isLoading.value = true
    error.value = null
    try {
      projects.value = await gitlabApi.searchProjects(query)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to search projects'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchIssues(state: 'opened' | 'closed' | 'all' = 'opened'): Promise<void> {
    if (!config.value.projectId) return
    isLoading.value = true
    error.value = null
    try {
      issues.value = await gitlabApi.getIssues(config.value.projectId, state)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch issues'
    } finally {
      isLoading.value = false
    }
  }

  async function validateToken(): Promise<boolean> {
    isTokenValid.value = await gitlabApi.validateToken()
    return isTokenValid.value
  }

  function clearError(): void {
    error.value = null
  }

  return {
    config,
    projects,
    issues,
    currentProject,
    isLoading,
    error,
    isTokenValid,
    openIssues,
    closedIssues,
    saveConfig,
    searchProjects,
    fetchIssues,
    validateToken,
    clearError,
  }
})
