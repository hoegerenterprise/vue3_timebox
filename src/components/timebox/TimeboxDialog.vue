<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Timebox } from '@/types'

const props = defineProps<{
  modelValue: boolean
  timebox?: Timebox | null
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  save: [data: { title: string; description: string; duration: number; color: string }]
}>()

const COLORS = [
  '#6750A4', '#625B71', '#7D5260',
  '#0288D1', '#2E7D32', '#F9A825',
  '#B71C1C', '#00838F', '#4527A0',
]

const form = ref({
  title: '',
  description: '',
  duration: 25,
  color: '#6750A4',
})

const valid = ref(false)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.value = {
        title: props.timebox?.title ?? '',
        description: props.timebox?.description ?? '',
        duration: props.timebox?.duration ?? 25,
        color: props.timebox?.color ?? '#6750A4',
      }
    }
  }
)

function save() {
  emit('save', { ...form.value })
  emit('update:modelValue', false)
}

function close() {
  emit('update:modelValue', false)
}

const rules = {
  title: [(v: string) => !!v?.trim() || 'Title is required'],
  duration: [
    (v: number) => v >= 1 || 'Min 1 minute',
    (v: number) => v <= 480 || 'Max 480 minutes',
  ],
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="480" @update:model-value="emit('update:modelValue', $event)">
    <v-card rounded="xl">
      <v-card-title class="pt-6 px-6">
        {{ timebox ? 'Edit Timebox' : 'New Timebox' }}
      </v-card-title>

      <v-card-text class="px-6">
        <v-form v-model="valid" @submit.prevent="save">
          <v-text-field
            v-model="form.title"
            label="Title"
            :rules="rules.title"
            autofocus
            class="mb-3"
          />

          <v-textarea
            v-model="form.description"
            label="Description (optional)"
            rows="3"
            auto-grow
            class="mb-3"
          />

          <v-text-field
            v-model.number="form.duration"
            label="Duration (minutes)"
            type="number"
            :rules="rules.duration"
            min="1"
            max="480"
            class="mb-4"
          />

          <div class="mb-2 text-body-2 text-medium-emphasis">Color</div>
          <div class="d-flex flex-wrap gap-2 mb-2">
            <div
              v-for="color in COLORS"
              :key="color"
              class="color-swatch"
              :style="{ backgroundColor: color, outline: form.color === color ? '3px solid white' : 'none', outlineOffset: '2px' }"
              @click="form.color = color"
            />
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="text" @click="close">Cancel</v-btn>
        <v-btn color="primary" :disabled="!valid" @click="save">
          {{ timebox ? 'Save' : 'Create' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
.color-swatch:hover {
  transform: scale(1.15);
}
</style>
