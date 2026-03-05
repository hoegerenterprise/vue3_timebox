import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/timeboxes',
    },
    {
      path: '/timeboxes',
      name: 'timeboxes',
      component: () => import('@/views/TimeboxView.vue'),
      meta: { title: 'Timeboxes' },
    },
    {
      path: '/timeboxes/:id',
      name: 'timebox-detail',
      component: () => import('@/views/TimeboxDetailView.vue'),
      meta: { title: 'Timebox Detail' },
    },
    {
      path: '/github',
      name: 'github',
      component: () => import('@/views/GithubView.vue'),
      meta: { title: 'GitHub Issues' },
    },
    {
      path: '/gitlab',
      name: 'gitlab',
      component: () => import('@/views/GitlabView.vue'),
      meta: { title: 'GitLab Issues' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { title: 'Settings' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/timeboxes',
    },
  ],
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — Timebox` : 'Timebox'
})

export default router
