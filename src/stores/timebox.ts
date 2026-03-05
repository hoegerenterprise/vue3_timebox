import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Timebox, LinkedIssue, TimerState } from '@/types'

const STORAGE_KEY = 'timeboxes'

function generateId(): string {
  return `tb_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function loadFromStorage(): Timebox[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(timeboxes: Timebox[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timeboxes))
}

export const useTimeboxStore = defineStore('timebox', () => {
  const timeboxes = ref<Timebox[]>(loadFromStorage())

  const timer = ref<TimerState>({
    timeboxId: null,
    elapsed: 0,
    isRunning: false,
    startedAt: null,
  })

  let timerInterval: ReturnType<typeof setInterval> | null = null

  // Computed
  const activeTimeboxes = computed(() =>
    timeboxes.value.filter((tb: Timebox) => tb.status !== 'completed')
  )

  const completedTimeboxes = computed(() =>
    timeboxes.value.filter((tb: Timebox) => tb.status === 'completed')
  )

  const runningTimebox = computed(() =>
    timeboxes.value.find((tb: Timebox) => tb.id === timer.value.timeboxId) ?? null
  )

  const timerProgress = computed(() => {
    if (!runningTimebox.value) return 0
    const total = runningTimebox.value.duration * 60
    return Math.min((timer.value.elapsed / total) * 100, 100)
  })

  const timerRemaining = computed(() => {
    if (!runningTimebox.value) return 0
    const total = runningTimebox.value.duration * 60
    return Math.max(total - timer.value.elapsed, 0)
  })

  // Actions
  function createTimebox(data: Omit<Timebox, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'linkedIssues'>): Timebox {
    const now = new Date().toISOString()
    const timebox: Timebox = {
      ...data,
      id: generateId(),
      status: 'pending',
      linkedIssues: [],
      createdAt: now,
      updatedAt: now,
    }
    timeboxes.value.unshift(timebox)
    saveToStorage(timeboxes.value)
    return timebox
  }

  function updateTimebox(id: string, updates: Partial<Omit<Timebox, 'id' | 'createdAt'>>): void {
    const idx = timeboxes.value.findIndex((tb: Timebox) => tb.id === id)
    if (idx === -1) return
    const current = timeboxes.value[idx] as Timebox
    const merged: Timebox = {
      ...current,
      ...updates,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    }
    timeboxes.value[idx] = merged
    saveToStorage(timeboxes.value)
  }

  function deleteTimebox(id: string): void {
    if (timer.value.timeboxId === id) {
      stopTimer()
    }
    timeboxes.value = timeboxes.value.filter((tb: Timebox) => tb.id !== id)
    saveToStorage(timeboxes.value)
  }

  function linkIssue(timeboxId: string, issue: LinkedIssue): void {
    const tb = timeboxes.value.find((t: Timebox) => t.id === timeboxId)
    if (!tb) return
    const exists = tb.linkedIssues.some(
      (i: LinkedIssue) => i.id === issue.id && i.source === issue.source
    )
    if (!exists) {
      tb.linkedIssues.push(issue)
      tb.updatedAt = new Date().toISOString()
      saveToStorage(timeboxes.value)
    }
  }

  function unlinkIssue(timeboxId: string, issueId: string | number, source: 'github' | 'gitlab'): void {
    const tb = timeboxes.value.find((t: Timebox) => t.id === timeboxId)
    if (!tb) return
    tb.linkedIssues = tb.linkedIssues.filter(
      (i: LinkedIssue) => !(i.id === issueId && i.source === source)
    )
    tb.updatedAt = new Date().toISOString()
    saveToStorage(timeboxes.value)
  }

  function startTimer(timeboxId: string): void {
    if (timerInterval) clearInterval(timerInterval)

    const tb = timeboxes.value.find((t) => t.id === timeboxId)
    if (!tb) return

    timer.value = {
      timeboxId,
      elapsed: 0,
      isRunning: true,
      startedAt: Date.now(),
    }

    updateTimebox(timeboxId, { status: 'running', startTime: new Date().toISOString() })

    timerInterval = setInterval(() => {
      if (!timer.value.startedAt) return
      timer.value.elapsed = Math.floor((Date.now() - timer.value.startedAt) / 1000)

      const tb = runningTimebox.value
      if (tb && timer.value.elapsed >= tb.duration * 60) {
        completeTimer()
      }
    }, 1000)
  }

  function pauseTimer(): void {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    timer.value.isRunning = false
    if (timer.value.timeboxId) {
      updateTimebox(timer.value.timeboxId, { status: 'paused' })
    }
  }

  function resumeTimer(): void {
    if (!timer.value.timeboxId) return

    const elapsed = timer.value.elapsed
    timer.value.startedAt = Date.now() - elapsed * 1000
    timer.value.isRunning = true

    updateTimebox(timer.value.timeboxId, { status: 'running' })

    timerInterval = setInterval(() => {
      if (!timer.value.startedAt) return
      timer.value.elapsed = Math.floor((Date.now() - timer.value.startedAt) / 1000)

      const tb = runningTimebox.value
      if (tb && timer.value.elapsed >= tb.duration * 60) {
        completeTimer()
      }
    }, 1000)
  }

  function stopTimer(): void {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    if (timer.value.timeboxId) {
      updateTimebox(timer.value.timeboxId, { status: 'pending' })
    }
    timer.value = { timeboxId: null, elapsed: 0, isRunning: false, startedAt: null }
  }

  function completeTimer(): void {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    if (timer.value.timeboxId) {
      updateTimebox(timer.value.timeboxId, {
        status: 'completed',
        endTime: new Date().toISOString(),
      })
    }
    timer.value = { timeboxId: null, elapsed: 0, isRunning: false, startedAt: null }
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return {
    timeboxes,
    timer,
    activeTimeboxes,
    completedTimeboxes,
    runningTimebox,
    timerProgress,
    timerRemaining,
    createTimebox,
    updateTimebox,
    deleteTimebox,
    linkIssue,
    unlinkIssue,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    completeTimer,
    formatTime,
  }
})
