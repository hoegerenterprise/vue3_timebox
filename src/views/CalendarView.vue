<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTimeboxStore } from '@/stores/timebox'
import type { Timebox } from '@/types'

const timeboxStore = useTimeboxStore()
const router = useRouter()

const viewMode = ref<'month' | 'week' | 'day'>('week')
const currentDate = ref(new Date())

// Timeboxes that have been started (have a startTime) → shown on calendar
const calendarEvents = computed(() =>
  timeboxStore.timeboxes
    .filter((tb: Timebox) => !!tb.startTime)
    .map((tb: Timebox) => {
      const start = new Date(tb.startTime!)
      const end = tb.endTime
        ? new Date(tb.endTime)
        : new Date(start.getTime() + tb.duration * 60 * 1000)
      return { id: tb.id, title: tb.title, start, end, color: tb.color }
    })
)

// Pending timeboxes with no startTime → shown in side panel
const unscheduled = computed(() =>
  timeboxStore.timeboxes.filter((tb: Timebox) => !tb.startTime && tb.status !== 'completed')
)

const statusColor: Record<string, string> = {
  pending: 'grey',
  running: 'success',
  paused: 'warning',
  completed: 'info',
}

function onEventClick(event: { id: string }) {
  router.push(`/timeboxes/${event.id}`)
}

function prevPeriod() {
  const d = new Date(currentDate.value)
  if (viewMode.value === 'month') d.setMonth(d.getMonth() - 1)
  else if (viewMode.value === 'week') d.setDate(d.getDate() - 7)
  else d.setDate(d.getDate() - 1)
  currentDate.value = d
}

function nextPeriod() {
  const d = new Date(currentDate.value)
  if (viewMode.value === 'month') d.setMonth(d.getMonth() + 1)
  else if (viewMode.value === 'week') d.setDate(d.getDate() + 7)
  else d.setDate(d.getDate() + 1)
  currentDate.value = d
}

function goToday() {
  currentDate.value = new Date()
}

const periodLabel = computed(() => {
  const d = currentDate.value
  if (viewMode.value === 'month') {
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  if (viewMode.value === 'week') {
    const start = new Date(d)
    start.setDate(d.getDate() - d.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
})
</script>

<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <v-row align="center" class="mb-3">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Calendar</h1>
      </v-col>
      <v-col cols="auto" class="d-flex align-center gap-2">
        <v-btn variant="tonal" size="small" rounded="lg" @click="goToday">Today</v-btn>
        <v-btn icon="mdi-chevron-left" variant="text" size="small" @click="prevPeriod" />
        <span class="text-body-1 font-weight-medium" style="min-width:220px; text-align:center">
          {{ periodLabel }}
        </span>
        <v-btn icon="mdi-chevron-right" variant="text" size="small" @click="nextPeriod" />
        <v-btn-toggle v-model="viewMode" mandatory density="compact" rounded="lg" class="ml-2">
          <v-btn value="month" size="small">Month</v-btn>
          <v-btn value="week" size="small">Week</v-btn>
          <v-btn value="day" size="small">Day</v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <v-row>
      <!-- Calendar -->
      <v-col cols="12" md="9">
        <v-card elevation="1" rounded="xl" class="overflow-hidden">
          <v-calendar
            v-model="currentDate"
            :events="calendarEvents"
            :view-mode="viewMode"
          >
            <template #event="{ event }">
              <div
                class="calendar-event pa-1 rounded text-caption font-weight-medium"
                :style="{ backgroundColor: event.color, color: '#fff', cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }"
                @click="onEventClick(event)"
              >
                {{ event.title }}
              </div>
            </template>
          </v-calendar>
        </v-card>
      </v-col>

      <!-- Unscheduled sidebar -->
      <v-col cols="12" md="3">
        <v-card elevation="1" rounded="xl" class="pa-4">
          <div class="text-subtitle-2 font-weight-bold mb-1">Unscheduled</div>
          <div class="text-caption text-medium-emphasis mb-3">
            Timeboxes not yet started
          </div>

          <div v-if="unscheduled.length === 0" class="text-caption text-medium-emphasis text-center py-4">
            All timeboxes are scheduled.
          </div>

          <v-list v-else density="compact" class="pa-0">
            <v-list-item
              v-for="tb in unscheduled"
              :key="tb.id"
              :to="`/timeboxes/${tb.id}`"
              rounded="lg"
              class="mb-1"
            >
              <template #prepend>
                <v-avatar :color="tb.color" size="28">
                  <v-icon icon="mdi-timer-outline" size="16" color="white" />
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2">{{ tb.title }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">{{ tb.duration }} min</v-list-item-subtitle>
              <template #append>
                <v-chip :color="statusColor[tb.status]" size="x-small" label>
                  {{ tb.status }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- Legend -->
        <v-card elevation="1" rounded="xl" class="pa-4 mt-3">
          <div class="text-subtitle-2 font-weight-bold mb-2">Status Legend</div>
          <div v-for="(color, status) in statusColor" :key="status" class="d-flex align-center gap-2 mb-1">
            <v-icon :color="color" icon="mdi-circle" size="12" />
            <span class="text-caption text-capitalize">{{ status }}</span>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
