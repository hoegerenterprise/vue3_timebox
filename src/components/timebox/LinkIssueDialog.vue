<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGithubStore } from '@/stores/github'
import { useGitlabStore } from '@/stores/gitlab'
import type { LinkedIssue } from '@/types'

const props = defineProps<{
  modelValue: boolean
  timeboxId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  link: [issue: LinkedIssue]
}>()

const githubStore = useGithubStore()
const gitlabStore = useGitlabStore()

const tab = ref<'github' | 'gitlab'>('github')
const search = ref('')

const filteredGithubIssues = computed(() => {
  const q = search.value.toLowerCase()
  return githubStore.issues.filter(
    (i) => i.title.toLowerCase().includes(q) || String(i.number).includes(q)
  )
})

const filteredGitlabIssues = computed(() => {
  const q = search.value.toLowerCase()
  return gitlabStore.issues.filter(
    (i) => i.title.toLowerCase().includes(q) || String(i.iid).includes(q)
  )
})

onMounted(() => {
  if (!githubStore.issues.length && githubStore.config.owner && githubStore.config.repo) {
    githubStore.fetchIssues()
  }
  if (!gitlabStore.issues.length && gitlabStore.config.projectId) {
    gitlabStore.fetchIssues()
  }
})

function linkGithubIssue(issue: typeof githubStore.issues[0]) {
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
  emit('link', linked)
  emit('update:modelValue', false)
}

function linkGitlabIssue(issue: typeof gitlabStore.issues[0]) {
  const linked: LinkedIssue = {
    id: issue.id,
    title: issue.title,
    url: issue.web_url,
    source: 'gitlab',
    state: issue.state,
    labels: issue.labels,
    assignee: issue.assignee?.username,
    iid: issue.iid,
  }
  emit('link', linked)
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="600" @update:model-value="emit('update:modelValue', $event)">
    <v-card rounded="xl">
      <v-card-title class="pt-6 px-6">Link an Issue</v-card-title>

      <v-card-text class="px-6 pb-0">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search issues..."
          clearable
          class="mb-2"
        />

        <v-tabs v-model="tab" color="primary">
          <v-tab value="github">
            <v-icon start>mdi-github</v-icon>
            GitHub
            <v-badge
              v-if="githubStore.issues.length"
              :content="githubStore.issues.length"
              color="primary"
              inline
              class="ml-2"
            />
          </v-tab>
          <v-tab value="gitlab">
            <v-icon start>mdi-gitlab</v-icon>
            GitLab
            <v-badge
              v-if="gitlabStore.issues.length"
              :content="gitlabStore.issues.length"
              color="error"
              inline
              class="ml-2"
            />
          </v-tab>
        </v-tabs>
      </v-card-text>

      <v-window v-model="tab">
        <!-- GitHub Tab -->
        <v-window-item value="github">
          <v-card-text style="max-height: 360px; overflow-y: auto;">
            <div v-if="!githubStore.config.owner || !githubStore.config.repo" class="text-center py-6 text-medium-emphasis">
              <v-icon size="48" class="mb-2">mdi-github</v-icon>
              <p>Configure GitHub in Settings first</p>
            </div>
            <v-progress-circular v-else-if="githubStore.isLoading" indeterminate class="d-block mx-auto my-6" />
            <div v-else-if="!filteredGithubIssues.length" class="text-center py-6 text-medium-emphasis">
              No issues found
            </div>
            <v-list v-else density="compact">
              <v-list-item
                v-for="issue in filteredGithubIssues"
                :key="issue.id"
                :subtitle="`#${issue.number} · ${issue.state}`"
                :title="issue.title"
                rounded="lg"
                @click="linkGithubIssue(issue)"
              >
                <template #prepend>
                  <v-icon :color="issue.state === 'open' ? 'success' : 'error'" size="18">
                    {{ issue.state === 'open' ? 'mdi-circle-outline' : 'mdi-check-circle' }}
                  </v-icon>
                </template>
                <template #append>
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip
                      v-for="label in issue.labels.slice(0, 2)"
                      :key="label.name"
                      :color="`#${label.color}`"
                      size="x-small"
                    >{{ label.name }}</v-chip>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-window-item>

        <!-- GitLab Tab -->
        <v-window-item value="gitlab">
          <v-card-text style="max-height: 360px; overflow-y: auto;">
            <div v-if="!gitlabStore.config.projectId" class="text-center py-6 text-medium-emphasis">
              <v-icon size="48" class="mb-2">mdi-gitlab</v-icon>
              <p>Configure GitLab in Settings first</p>
            </div>
            <v-progress-circular v-else-if="gitlabStore.isLoading" indeterminate class="d-block mx-auto my-6" />
            <div v-else-if="!filteredGitlabIssues.length" class="text-center py-6 text-medium-emphasis">
              No issues found
            </div>
            <v-list v-else density="compact">
              <v-list-item
                v-for="issue in filteredGitlabIssues"
                :key="issue.id"
                :subtitle="`#${issue.iid} · ${issue.state}`"
                :title="issue.title"
                rounded="lg"
                @click="linkGitlabIssue(issue)"
              >
                <template #prepend>
                  <v-icon :color="issue.state === 'opened' ? 'success' : 'error'" size="18">
                    {{ issue.state === 'opened' ? 'mdi-circle-outline' : 'mdi-check-circle' }}
                  </v-icon>
                </template>
                <template #append>
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip
                      v-for="label in issue.labels.slice(0, 2)"
                      :key="label"
                      size="x-small"
                    >{{ label }}</v-chip>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-window-item>
      </v-window>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="text" @click="emit('update:modelValue', false)">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
