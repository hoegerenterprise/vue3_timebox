<script setup lang="ts">
import { computed } from 'vue'
import { useTimeboxStore } from '@/stores/timebox'

defineProps<{ compact?: boolean }>()

const store = useTimeboxStore()

const remaining = computed(() => store.formatTime(store.timerRemaining))
const progress = computed(() => store.timerProgress)
</script>

<template>
  <v-card v-if="store.runningTimebox" :variant="compact ? 'tonal' : 'elevated'" rounded="xl">
    <v-card-text :class="compact ? 'pa-3' : 'pa-4'">
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-caption text-medium-emphasis text-truncate" style="max-width: 140px">
          {{ store.runningTimebox.title }}
        </span>
        <v-chip
          :color="store.timer.isRunning ? 'success' : 'warning'"
          size="x-small"
          label
        >
          {{ store.timer.isRunning ? 'Running' : 'Paused' }}
        </v-chip>
      </div>

      <div class="timer-display text-h5 font-weight-bold text-center mb-2">
        {{ remaining }}
      </div>

      <v-progress-linear
        :model-value="progress"
        :color="store.runningTimebox.color || 'primary'"
        rounded
        height="4"
        class="mb-2"
      />

      <div class="d-flex gap-2 justify-center">
        <v-btn
          v-if="store.timer.isRunning"
          icon="mdi-pause"
          size="small"
          variant="tonal"
          color="warning"
          @click="store.pauseTimer"
        />
        <v-btn
          v-else
          icon="mdi-play"
          size="small"
          variant="tonal"
          color="success"
          @click="store.resumeTimer"
        />
        <v-btn
          icon="mdi-stop"
          size="small"
          variant="tonal"
          color="error"
          @click="store.stopTimer"
        />
        <v-btn
          icon="mdi-check"
          size="small"
          variant="tonal"
          color="primary"
          @click="store.completeTimer"
        />
      </div>
    </v-card-text>
  </v-card>
</template>
