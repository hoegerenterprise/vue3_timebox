<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTimeboxStore } from '@/stores/timebox'
import TimeboxCard from '@/components/timebox/TimeboxCard.vue'
import TimeboxDialog from '@/components/timebox/TimeboxDialog.vue'
import LinkIssueDialog from '@/components/timebox/LinkIssueDialog.vue'
import TimerWidget from '@/components/timebox/TimerWidget.vue'
import type { Timebox, LinkedIssue } from '@/types'

const store = useTimeboxStore()

const showDialog = ref(false)
const editingTimebox = ref<Timebox | null>(null)
const showLinkDialog = ref(false)
const linkingTimeboxId = ref('')
const showCompleted = ref(false)
const deleteConfirmId = ref<string | null>(null)
const showDeleteConfirm = ref(false)

const displayedTimeboxes = computed(() =>
  showCompleted.value ? store.timeboxes : store.activeTimeboxes
)

function openCreate() {
  editingTimebox.value = null
  showDialog.value = true
}

function openEdit(tb: Timebox) {
  editingTimebox.value = tb
  showDialog.value = true
}

function openLinkIssue(timeboxId: string) {
  linkingTimeboxId.value = timeboxId
  showLinkDialog.value = true
}

function handleSave(data: { title: string; description: string; duration: number; color: string }) {
  if (editingTimebox.value) {
    store.updateTimebox(editingTimebox.value.id, data)
  } else {
    store.createTimebox(data)
  }
  editingTimebox.value = null
}

function handleDelete(id: string) {
  deleteConfirmId.value = id
  showDeleteConfirm.value = true
}

function confirmDelete() {
  if (deleteConfirmId.value) {
    store.deleteTimebox(deleteConfirmId.value)
    deleteConfirmId.value = null
    showDeleteConfirm.value = false
  }
}

function handleLinkIssue(issue: LinkedIssue) {
  store.linkIssue(linkingTimeboxId.value, issue)
}
</script>

<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center mb-6 flex-wrap gap-3">
      <div>
        <h1 class="text-h4 font-weight-bold">Timeboxes</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          {{ store.activeTimeboxes.length }} active ·
          {{ store.completedTimeboxes.length }} completed
        </p>
      </div>
      <v-spacer />
      <v-switch
        v-model="showCompleted"
        label="Show completed"
        hide-details
        density="compact"
        color="primary"
      />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">
        New Timebox
      </v-btn>
    </div>

    <!-- Active Timer Banner -->
    <v-expand-transition>
      <div v-if="store.runningTimebox" class="mb-6">
        <TimerWidget />
      </div>
    </v-expand-transition>

    <!-- Empty State -->
    <div v-if="!displayedTimeboxes.length" class="text-center py-16">
      <v-icon size="80" color="medium-emphasis" class="mb-4">mdi-timer-sand-empty</v-icon>
      <h3 class="text-h6 text-medium-emphasis mb-2">
        {{ showCompleted ? 'No completed timeboxes yet' : 'No active timeboxes' }}
      </h3>
      <p class="text-body-2 text-medium-emphasis mb-6">
        Create your first timebox to start focusing
      </p>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">
        Create Timebox
      </v-btn>
    </div>

    <!-- Grid -->
    <v-row v-else>
      <v-col
        v-for="tb in displayedTimeboxes"
        :key="tb.id"
        cols="12"
        sm="6"
        lg="4"
        xl="3"
      >
        <TimeboxCard
          :timebox="tb"
          @edit="openEdit"
          @delete="handleDelete"
          @link-issue="openLinkIssue"
        />
      </v-col>
    </v-row>

    <!-- FAB -->
    <v-fab
      icon="mdi-plus"
      color="primary"
      location="bottom end"
      app
      @click="openCreate"
    />

    <!-- Create/Edit Dialog -->
    <TimeboxDialog
      v-model="showDialog"
      :timebox="editingTimebox"
      @save="handleSave"
    />

    <!-- Link Issue Dialog -->
    <LinkIssueDialog
      v-model="showLinkDialog"
      :timebox-id="linkingTimeboxId"
      @link="handleLinkIssue"
    />

    <!-- Delete Confirm -->
    <v-dialog v-model="showDeleteConfirm" max-width="360">
      <v-card rounded="xl">
        <v-card-title class="pt-6 px-6">Delete Timebox?</v-card-title>
        <v-card-text class="px-6">This action cannot be undone.</v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn variant="text" @click="showDeleteConfirm = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
