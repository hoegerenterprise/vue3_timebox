<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useThemeStore } from '@/stores/theme'
import { useTimeboxStore } from '@/stores/timebox'
import TimerWidget from '@/components/timebox/TimerWidget.vue'

const themeStore = useThemeStore()
const vuetifyTheme = useTheme()
const timeboxStore = useTimeboxStore()
const drawer = ref(true)

watch(
  () => themeStore.isDark,
  (dark) => { vuetifyTheme.global.name.value = dark ? 'dark' : 'light' },
  { immediate: true }
)

const navItems = [
  { title: 'Timeboxes', icon: 'mdi-timer-outline', to: '/timeboxes' },
  { title: 'GitHub Issues', icon: 'mdi-github', to: '/github' },
  { title: 'GitLab Issues', icon: 'mdi-gitlab', to: '/gitlab' },
  { title: 'Settings', icon: 'mdi-cog-outline', to: '/settings' },
]

onMounted(() => {
  vuetifyTheme.global.name.value = themeStore.isDark ? 'dark' : 'light'
})
</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" :width="240" elevation="2">
      <v-list-item
        prepend-icon="mdi-timer-sand"
        title="Timebox"
        subtitle="Time management"
        nav
        class="py-4"
      />
      <v-divider />

      <v-list density="compact" nav class="mt-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          rounded="lg"
          active-color="primary"
        />
      </v-list>

      <template #append>
        <v-divider />
        <div class="pa-3">
          <TimerWidget v-if="timeboxStore.runningTimebox" compact />
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar elevation="0" border="b">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>
        <router-link to="/" class="text-decoration-none text-high-emphasis">
          Timebox App
        </router-link>
      </v-app-bar-title>
      <template #append>
        <v-btn
          :icon="themeStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="text"
          @click="themeStore.toggleTheme"
        />
      </template>
    </v-app-bar>

    <v-main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>
  </v-app>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
