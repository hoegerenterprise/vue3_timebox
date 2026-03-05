<script setup lang="ts">
import { computed } from 'vue'
import { useTimeboxStore } from '@/stores/timebox'
import type { Timebox } from '@/types'

const props = defineProps<{ timebox: Timebox }>()
const emit = defineEmits<{
  edit: [timebox: Timebox]
  delete: [id: string]
  'link-issue': [timeboxId: string]
}>()

const store = useTimeboxStore()

const statusColor = computed(() => {
  const map: Record<string, string> = {
    pending: 'grey',
    running: 'success',
    paused: 'warning',
    completed: 'primary',
  }
  return map[props.timebox.status] ?? 'grey'
})

const statusIcon = computed(() => {
  const map: Record<string, string> = {
    pending: 'mdi-clock-outline',
    running: 'mdi-play-circle',
    paused: 'mdi-pause-circle',
    completed: 'mdi-check-circle',
  }
  return map[props.timebox.status] ?? 'mdi-clock-outline'
})

const isRunning = computed(() =>
  store.timer.timeboxId === props.timebox.id
)

const progress = computed(() => {
  if (!isRunning.value) return 0
  return store.timerProgress
})

function startOrResume() {
  if (isRunning.value && store.timer.isRunning) {
    store.pauseTimer()
  } else if (isRunning.value && !store.timer.isRunning) {
    store.resumeTimer()
  } else {
    store.startTimer(props.timebox.id)
  }
}
</script>

<template>
  <v-card rounded="xl" elevation="2" class="h-100" :style="{ borderLeft: `4px solid ${timebox.color}` }">
    <v-card-title class="d-flex align-center gap-2 pt-4 pb-1">
      <v-icon :color="statusColor" :icon="statusIcon" size="20" />
      <span class="text-truncate flex-grow-1">{{ timebox.title }}</span>
      <v-chip :color="statusColor" size="x-small" label class="ml-auto">
        {{ timebox.status }}
      </v-chip>
    </v-card-title>

    <v-card-text>
      <p v-if="timebox.description" class="text-body-2 text-medium-emphasis mb-3">
        {{ timebox.description }}
      </p>

      <div class="d-flex align-center gap-4 mb-3">
        <div class="d-flex align-center gap-1">
          <v-icon size="16" color="medium-emphasis">mdi-clock-outline</v-icon>
          <span class="text-caption text-medium-emphasis">{{ timebox.duration }} min</span>
        </div>
        <div v-if="timebox.linkedIssues.length" class="d-flex align-center gap-1">
          <v-icon size="16" color="medium-emphasis">mdi-link-variant</v-icon>
          <span class="text-caption text-medium-emphasis">{{ timebox.linkedIssues.length }} issue(s)</span>
        </div>
      </div>

      <!-- Timer progress when running -->
      <div v-if="isRunning" class="mb-3">
        <div class="d-flex justify-space-between text-caption mb-1">
          <span class="timer-display font-weight-bold">{{ store.formatTime(store.timerRemaining) }}</span>
          <span class="text-medium-emphasis">{{ Math.round(progress) }}%</span>
        </div>
        <v-progress-linear
          :model-value="progress"
          :color="timebox.color"
          rounded
          height="6"
        />
      </div>

      <!-- Linked Issues -->
      <div v-if="timebox.linkedIssues.length" class="d-flex flex-wrap gap-1 mb-2">
        <v-chip
          v-for="issue in timebox.linkedIssues.slice(0, 3)"
          :key="`${issue.source}-${issue.id}`"
          size="x-small"
          :prepend-icon="issue.source === 'github' ? 'mdi-github' : 'mdi-gitlab'"
          :href="issue.url"
          target="_blank"
          clickable
        >
          {{ issue.title.slice(0, 20) }}{{ issue.title.length > 20 ? '…' : '' }}
        </v-chip>
        <v-chip v-if="timebox.linkedIssues.length > 3" size="x-small" variant="text">
          +{{ timebox.linkedIssues.length - 3 }} more
        </v-chip>
      </div>
    </v-card-text>

    <v-card-actions class="pt-0 px-4 pb-3">
      <v-btn
        v-if="timebox.status !== 'completed'"
        :icon="isRunning && store.timer.isRunning ? 'mdi-pause' : 'mdi-play'"
        :color="isRunning && store.timer.isRunning ? 'warning' : 'success'"
        size="small"
        variant="tonal"
        @click="startOrResume"
      />
      <v-btn
        v-if="isRunning"
        icon="mdi-stop"
        color="error"
        size="small"
        variant="tonal"
        @click="store.stopTimer"
      />
      <v-btn
        v-if="timebox.status !== 'completed'"
        icon="mdi-check"
        color="primary"
        size="small"
        variant="tonal"
        @click="store.completeTimer"
      />
      <v-spacer />
      <v-btn
        icon="mdi-link-plus"
        size="small"
        variant="text"
        @click="emit('link-issue', timebox.id)"
      />
      <v-btn
        icon="mdi-pencil"
        size="small"
        variant="text"
        @click="emit('edit', timebox)"
      />
      <v-btn
        icon="mdi-delete"
        size="small"
        variant="text"
        color="error"
        @click="emit('delete', timebox.id)"
      />
    </v-card-actions>
  </v-card>
</template>
