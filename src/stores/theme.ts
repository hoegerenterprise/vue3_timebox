import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useTheme } from 'vuetify'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref<boolean>(
    localStorage.getItem('theme') === 'dark' ||
    (localStorage.getItem('theme') === null &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  )

  function toggleTheme(): void {
    isDark.value = !isDark.value
  }

  function setDark(value: boolean): void {
    isDark.value = value
  }

  watch(isDark, (val) => {
    localStorage.setItem('theme', val ? 'dark' : 'light')
  })

  return { isDark, toggleTheme, setDark }
})

// Composable to sync Pinia theme store with Vuetify
export function useVuetifyTheme() {
  const themeStore = useThemeStore()
  const vuetifyTheme = useTheme()

  watch(
    () => themeStore.isDark,
    (dark) => {
      vuetifyTheme.global.name.value = dark ? 'dark' : 'light'
    },
    { immediate: true }
  )

  return themeStore
}
