<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTimeboxStore } from '@/stores/timebox'
import TimerWidget from '@/components/timebox/TimerWidget.vue'

const route = useRoute()
const router = useRouter()
const store = useTimeboxStore()

const timebox = computed(() =>
  store.timeboxes.find((tb) => tb.id === route.params.id) ?? null
)

const isRunning = computed(() => store.timer.timeboxId === timebox.value?.id)

function back() {
  router.push('/timeboxes')
}
</script>

<template>
  <v-container class="pa-6" max-width="800">
    <v-btn
      prepend-icon="mdi-arrow-left"
      variant="text"
      class="mb-4"
      @click="back"
    >
      Back
    </v-btn>

    <div v-if="!timebox" class="text-center py-16">
      <v-icon size="64" color="medium-emphasis">mdi-alert-circle-outline</v-icon>
      <p class="mt-4 text-medium-emphasis">Timebox not found</p>
    </div>

    <template v-else>
      <div class="d-flex align-center gap-3 mb-6 flex-wrap">
        <div :style="{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: timebox.color }" />
        <h1 class="text-h4 font-weight-bold">{{ timebox.title }}</h1>
        <v-chip :color="timebox.status === 'completed' ? 'primary' : timebox.status === 'running' ? 'success' : 'grey'" label>
          {{ timebox.status }}
        </v-chip>
      </div>

      <v-row>
        <v-col cols="12" md="7">
          <v-card rounded="xl" class="mb-4">
            <v-card-title class="pt-4 px-5">Details</v-card-title>
            <v-card-text class="px-5">
              <div class="d-flex gap-4 mb-4">
                <div>
                  <div class="text-caption text-medium-emphasis">Duration</div>
                  <div class="text-body-1 font-weight-medium">{{ timebox.duration }} min</div>
                </div>
                <div v-if="timebox.startTime">
                  <div class="text-caption text-medium-emphasis">Started</div>
                  <div class="text-body-1 font-weight-medium">{{ new Date(timebox.startTime).toLocaleString() }}</div>
                </div>
                <div v-if="timebox.endTime">
                  <div class="text-caption text-medium-emphasis">Completed</div>
                  <div class="text-body-1 font-weight-medium">{{ new Date(timebox.endTime).toLocaleString() }}</div>
                </div>
              </div>
              <p v-if="timebox.description" class="text-body-2">{{ timebox.description }}</p>
            </v-card-text>
          </v-card>

          <!-- Linked Issues -->
          <v-card rounded="xl">
            <v-card-title class="pt-4 px-5">
              Linked Issues ({{ timebox.linkedIssues.length }})
            </v-card-title>
            <v-card-text class="px-5">
              <div v-if="!timebox.linkedIssues.length" class="text-center py-4 text-medium-emphasis text-body-2">
                No issues linked
              </div>
              <v-list v-else density="compact">
                <v-list-item
                  v-for="issue in timebox.linkedIssues"
                  :key="`${issue.source}-${issue.id}`"
                  :href="issue.url"
                  target="_blank"
                  :subtitle="issue.source + ' · ' + issue.state"
                  :title="issue.title"
                  rounded="lg"
                >
                  <template #prepend>
                    <v-icon :color="issue.source === 'github' ? 'default' : 'error'" size="20">
                      {{ issue.source === 'github' ? 'mdi-github' : 'mdi-gitlab' }}
                    </v-icon>
                  </template>
                  <template #append>
                    <v-btn
                      icon="mdi-link-off"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click.prevent="store.unlinkIssue(timebox.id, issue.id, issue.source)"
                    />
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="5">
          <div v-if="isRunning" class="mb-4">
            <TimerWidget />
          </div>
          <v-card v-else-if="timebox.status !== 'completed'" rounded="xl">
            <v-card-text class="pa-5 text-center">
              <v-btn
                color="success"
                size="large"
                prepend-icon="mdi-play"
                block
                @click="store.startTimer(timebox.id)"
              >
                Start Timer
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>
