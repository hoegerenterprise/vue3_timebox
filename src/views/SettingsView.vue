<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useGithubStore } from '@/stores/github'
import { useGitlabStore } from '@/stores/gitlab'
import { useThemeStore } from '@/stores/theme'

const githubStore = useGithubStore()
const gitlabStore = useGitlabStore()
const themeStore = useThemeStore()

const githubForm = reactive({
  token: githubStore.config.token,
  owner: githubStore.config.owner,
  repo: githubStore.config.repo,
})

const gitlabForm = reactive({
  token: gitlabStore.config.token,
  projectId: String(gitlabStore.config.projectId),
})

const githubSaving = ref(false)
const gitlabSaving = ref(false)
const githubSnack = ref(false)
const githubSnackText = ref('')
const gitlabSnack = ref(false)
const gitlabSnackText = ref('')

const showGithubToken = ref(false)
const showGitlabToken = ref(false)

const gitlabProjectSearch = ref('')
const gitlabSearchLoading = ref(false)

async function saveGithub() {
  githubSaving.value = true
  try {
    await githubStore.saveConfig({
      token: githubForm.token,
      owner: githubForm.owner,
      repo: githubForm.repo,
    })
    githubSnackText.value = 'GitHub settings saved!'
    githubSnack.value = true
    if (githubForm.owner && githubForm.repo) {
      await githubStore.fetchIssues()
    }
  } catch {
    githubSnackText.value = 'Failed to save settings'
    githubSnack.value = true
  } finally {
    githubSaving.value = false
  }
}

async function saveGitlab() {
  gitlabSaving.value = true
  try {
    await gitlabStore.saveConfig({
      token: gitlabForm.token,
      projectId: gitlabForm.projectId,
    })
    gitlabSnackText.value = 'GitLab settings saved!'
    gitlabSnack.value = true
    if (gitlabForm.projectId) {
      await gitlabStore.fetchIssues()
    }
  } catch {
    gitlabSnackText.value = 'Failed to save settings'
    gitlabSnack.value = true
  } finally {
    gitlabSaving.value = false
  }
}

async function searchGitlabProjects() {
  if (!gitlabProjectSearch.value.trim()) return
  gitlabSearchLoading.value = true
  await gitlabStore.searchProjects(gitlabProjectSearch.value)
  gitlabSearchLoading.value = false
}

function selectGitlabProject(project: typeof gitlabStore.projects[0]) {
  gitlabForm.projectId = String(project.id)
  gitlabStore.currentProject = project
}
</script>

<template>
  <v-container class="pa-6" max-width="720">
    <h1 class="text-h4 font-weight-bold mb-6">Settings</h1>

    <!-- Theme -->
    <v-card rounded="xl" class="mb-6" elevation="1">
      <v-card-title class="pt-5 px-6">Appearance</v-card-title>
      <v-card-text class="px-6 pb-6">
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="text-body-1 font-weight-medium">Dark Mode</div>
            <div class="text-body-2 text-medium-emphasis">Toggle between light and dark theme</div>
          </div>
          <v-switch
            :model-value="themeStore.isDark"
            color="primary"
            hide-details
            @update:model-value="themeStore.setDark($event as boolean)"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- GitHub Settings -->
    <v-card rounded="xl" class="mb-6" elevation="1">
      <v-card-title class="pt-5 px-6 d-flex align-center gap-2">
        <v-icon>mdi-github</v-icon>
        GitHub Configuration
        <v-chip
          v-if="githubStore.isTokenValid"
          color="success"
          size="x-small"
          label
          class="ml-2"
        >
          Connected
        </v-chip>
      </v-card-title>

      <v-card-text class="px-6">
        <v-text-field
          v-model="githubForm.token"
          label="Personal Access Token"
          :type="showGithubToken ? 'text' : 'password'"
          :append-inner-icon="showGithubToken ? 'mdi-eye-off' : 'mdi-eye'"
          placeholder="ghp_..."
          hint="Needs repo and read:user scopes"
          persistent-hint
          class="mb-4"
          @click:append-inner="showGithubToken = !showGithubToken"
        />

        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="githubForm.owner"
              label="Owner (user or org)"
              placeholder="e.g. octocat"
              hint="GitHub username or organization name"
              persistent-hint
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="githubForm.repo"
              label="Repository"
              placeholder="e.g. my-project"
              hint="Repository name"
              persistent-hint
            />
          </v-col>
        </v-row>

        <v-alert type="info" variant="tonal" rounded="lg" class="mt-4" density="compact">
          API calls are proxied via <code>/api/github</code> → <code>https://api.github.com</code>
        </v-alert>
      </v-card-text>

      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn
          color="primary"
          :loading="githubSaving"
          prepend-icon="mdi-content-save"
          @click="saveGithub"
        >
          Save GitHub Config
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- GitLab Settings -->
    <v-card rounded="xl" elevation="1">
      <v-card-title class="pt-5 px-6 d-flex align-center gap-2">
        <v-icon color="error">mdi-gitlab</v-icon>
        GitLab Configuration
        <v-chip
          v-if="gitlabStore.isTokenValid"
          color="success"
          size="x-small"
          label
          class="ml-2"
        >
          Connected
        </v-chip>
      </v-card-title>

      <v-card-text class="px-6">
        <v-text-field
          v-model="gitlabForm.token"
          label="Personal Access Token"
          :type="showGitlabToken ? 'text' : 'password'"
          :append-inner-icon="showGitlabToken ? 'mdi-eye-off' : 'mdi-eye'"
          placeholder="glpat-..."
          hint="Needs api scope"
          persistent-hint
          class="mb-4"
          @click:append-inner="showGitlabToken = !showGitlabToken"
        />

        <!-- Project ID field -->
        <v-text-field
          v-model="gitlabForm.projectId"
          label="Project ID"
          placeholder="e.g. 12345678"
          hint="Numeric GitLab project ID"
          persistent-hint
          class="mb-4"
        />

        <!-- Project Search -->
        <div class="text-body-2 text-medium-emphasis mb-2">Or search for a project:</div>
        <div class="d-flex gap-2 align-start mb-2">
          <v-text-field
            v-model="gitlabProjectSearch"
            label="Search projects"
            density="compact"
            hide-details
            clearable
            @keyup.enter="searchGitlabProjects"
          />
          <v-btn
            :loading="gitlabSearchLoading"
            icon="mdi-magnify"
            variant="tonal"
            @click="searchGitlabProjects"
          />
        </div>

        <v-list v-if="gitlabStore.projects.length" density="compact" class="mb-2" rounded="lg">
          <v-list-item
            v-for="project in gitlabStore.projects"
            :key="project.id"
            :title="project.name_with_namespace"
            :subtitle="`ID: ${project.id}`"
            rounded="lg"
            @click="selectGitlabProject(project)"
          >
            <template #append>
              <v-icon v-if="gitlabForm.projectId === String(project.id)" color="primary">
                mdi-check-circle
              </v-icon>
            </template>
          </v-list-item>
        </v-list>

        <div v-if="gitlabStore.currentProject" class="mb-2">
          <v-chip color="error" prepend-icon="mdi-gitlab" label>
            {{ gitlabStore.currentProject.name_with_namespace }}
          </v-chip>
        </div>

        <v-alert type="info" variant="tonal" rounded="lg" class="mt-4" density="compact">
          API calls are proxied via <code>/api/gitlab</code> → <code>https://gitlab.com/api/v4</code>
        </v-alert>
      </v-card-text>

      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn
          color="primary"
          :loading="gitlabSaving"
          prepend-icon="mdi-content-save"
          @click="saveGitlab"
        >
          Save GitLab Config
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Snackbars -->
    <v-snackbar v-model="githubSnack" timeout="3000" location="bottom end" color="success">
      {{ githubSnackText }}
    </v-snackbar>
    <v-snackbar v-model="gitlabSnack" timeout="3000" location="bottom end" color="success">
      {{ gitlabSnackText }}
    </v-snackbar>
  </v-container>
</template>
