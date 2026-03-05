<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGithubStore } from '@/stores/github'
import { useTimeboxStore } from '@/stores/timebox'
import type { GitHubIssue, LinkedIssue } from '@/types'

const githubStore = useGithubStore()
const timeboxStore = useTimeboxStore()

const search = ref('')
const stateFilter = ref<'open' | 'closed' | 'all'>('open')
const linkMenuIssue = ref<GitHubIssue | null>(null)
const linkMenuX = ref(0)
const linkMenuY = ref(0)
const showLinkMenu = ref(false)
const notificationText = ref('')
const notificationColor = ref('success')
const showNotification = ref(false)

const configured = computed(
  () => !!githubStore.config.owner && !!githubStore.config.repo
)

const filteredIssues = computed(() => {
  const q = search.value.toLowerCase()
  return githubStore.issues.filter((i) =>
    i.title.toLowerCase().includes(q) ||
    i.labels.some((l) => l.name.toLowerCase().includes(q)) ||
    String(i.number).includes(q)
  )
})

onMounted(() => {
  if (configured.value && !githubStore.issues.length) {
    githubStore.fetchIssues(stateFilter.value)
  }
})

async function refresh() {
  await githubStore.fetchIssues(stateFilter.value)
}

async function onStateChange() {
  await githubStore.fetchIssues(stateFilter.value)
}

function openLinkMenu(event: MouseEvent, issue: GitHubIssue) {
  linkMenuIssue.value = issue
  linkMenuX.value = event.clientX
  linkMenuY.value = event.clientY
  showLinkMenu.value = true
}

function linkToTimebox(timeboxId: string) {
  if (!linkMenuIssue.value) return
  const issue = linkMenuIssue.value
  const linked: LinkedIssue = {
    id: issue.id,
    title: issue.title,
    url: issue.html_url,
    source: 'github',
    state: issue.state,
    labels: issue.labels.map((l) => l.name),
    assignee: issue.assignee?.login,
    number: issue.number,
  }
  timeboxStore.linkIssue(timeboxId, linked)
  showLinkMenu.value = false
  notificationText.value = 'Issue linked to timebox!'
  notificationColor.value = 'success'
  showNotification.value = true
}
</script>

<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center mb-6 flex-wrap gap-3">
      <div>
        <h1 class="text-h4 font-weight-bold d-flex align-center gap-2">
          <v-icon>mdi-github</v-icon> GitHub Issues
        </h1>
        <p v-if="githubStore.config.owner && githubStore.config.repo" class="text-body-2 text-medium-emphasis mt-1">
          {{ githubStore.config.owner }}/{{ githubStore.config.repo }}
        </p>
      </div>
      <v-spacer />
      <v-chip
        v-if="githubStore.isTokenValid"
        color="success"
        prepend-icon="mdi-check-circle"
        label
      >
        Connected
      </v-chip>
      <v-btn
        :loading="githubStore.isLoading"
        icon="mdi-refresh"
        variant="text"
        :disabled="!configured"
        @click="refresh"
      />
      <v-btn to="/settings" variant="outlined" prepend-icon="mdi-cog-outline" size="small">
        Settings
      </v-btn>
    </div>

    <!-- Not configured state -->
    <div v-if="!configured" class="text-center py-16">
      <v-icon size="80" color="medium-emphasis" class="mb-4">mdi-github</v-icon>
      <h3 class="text-h6 text-medium-emphasis mb-2">Not configured</h3>
      <p class="text-body-2 text-medium-emphasis mb-6">
        Configure your GitHub token and repository in Settings
      </p>
      <v-btn color="primary" to="/settings" prepend-icon="mdi-cog">Go to Settings</v-btn>
    </div>

    <template v-else>
      <!-- Filters -->
      <v-card rounded="xl" class="mb-5" elevation="1">
        <v-card-text class="d-flex align-center gap-3 flex-wrap py-3">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search issues"
            clearable
            hide-details
            density="compact"
            style="max-width: 300px"
          />
          <v-btn-toggle v-model="stateFilter" mandatory density="compact" @update:model-value="onStateChange">
            <v-btn value="open" size="small">Open</v-btn>
            <v-btn value="closed" size="small">Closed</v-btn>
            <v-btn value="all" size="small">All</v-btn>
          </v-btn-toggle>
          <v-spacer />
          <span class="text-caption text-medium-emphasis">
            {{ filteredIssues.length }} issues
          </span>
        </v-card-text>
      </v-card>

      <!-- Error -->
      <v-alert
        v-if="githubStore.error"
        type="error"
        rounded="lg"
        class="mb-4"
        closable
        @click:close="githubStore.clearError"
      >
        {{ githubStore.error }}
      </v-alert>

      <!-- Loading -->
      <div v-if="githubStore.isLoading" class="text-center py-12">
        <v-progress-circular indeterminate size="48" />
      </div>

      <!-- Issues list -->
      <v-card v-else-if="filteredIssues.length" rounded="xl" elevation="1">
        <v-list lines="two">
          <template v-for="(issue, idx) in filteredIssues" :key="issue.id">
            <v-list-item
              :href="issue.html_url"
              target="_blank"
              rounded="0"
            >
              <template #prepend>
                <v-icon
                  :color="issue.state === 'open' ? 'success' : 'default'"
                  size="20"
                  class="mr-2"
                >
                  {{ issue.state === 'open' ? 'mdi-circle-outline' : 'mdi-check-circle-outline' }}
                </v-icon>
              </template>

              <v-list-item-title class="font-weight-medium">
                {{ issue.title }}
                <span class="text-medium-emphasis font-weight-regular">#{{ issue.number }}</span>
              </v-list-item-title>
              <v-list-item-subtitle>
                <div class="d-flex align-center gap-1 mt-1 flex-wrap">
                  <v-chip
                    v-for="label in issue.labels"
                    :key="label.name"
                    :color="`#${label.color}`"
                    size="x-small"
                    label
                  >{{ label.name }}</v-chip>
                  <span v-if="issue.assignee" class="text-caption ml-2">
                    @{{ issue.assignee.login }}
                  </span>
                </div>
              </v-list-item-subtitle>

              <template #append>
                <v-btn
                  icon="mdi-link-plus"
                  size="small"
                  variant="text"
                  @click.prevent="openLinkMenu($event, issue)"
                />
              </template>
            </v-list-item>
            <v-divider v-if="idx < filteredIssues.length - 1" />
          </template>
        </v-list>
      </v-card>

      <div v-else class="text-center py-12 text-medium-emphasis">
        <v-icon size="48" class="mb-2">mdi-inbox-outline</v-icon>
        <p>No issues found</p>
      </div>
    </template>

    <!-- Link to Timebox context menu -->
    <v-menu v-model="showLinkMenu" :target="[linkMenuX, linkMenuY]" :close-on-content-click="false">
      <v-card rounded="xl" min-width="200">
        <v-card-title class="text-body-1 pt-3 px-4">Link to Timebox</v-card-title>
        <v-list density="compact" max-height="300" style="overflow-y: auto;">
          <v-list-item
            v-if="!timeboxStore.activeTimeboxes.length"
            title="No active timeboxes"
            disabled
          />
          <v-list-item
            v-for="tb in timeboxStore.activeTimeboxes"
            :key="tb.id"
            :title="tb.title"
            rounded="lg"
            @click="linkToTimebox(tb.id)"
          >
            <template #prepend>
              <div :style="{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: tb.color, marginRight: '8px' }" />
            </template>
          </v-list-item>
        </v-list>
        <v-card-actions class="px-3 pb-3">
          <v-btn size="small" variant="text" @click="showLinkMenu = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>

    <!-- Notification -->
    <v-snackbar v-model="showNotification" :color="notificationColor" timeout="3000" location="bottom end">
      {{ notificationText }}
    </v-snackbar>
  </v-container>
</template>
