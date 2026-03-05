import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'
import { VCalendar } from 'vuetify/labs/VCalendar'

const lightTheme = {
  dark: false,
  colors: {
    primary: '#6750A4',
    secondary: '#625B71',
    accent: '#7D5260',
    background: '#FFFBFE',
    surface: '#FFFBFE',
    'surface-variant': '#E7E0EC',
    error: '#B3261E',
    warning: '#F9A825',
    info: '#0288D1',
    success: '#2E7D32',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-background': '#1C1B1F',
    'on-surface': '#1C1B1F',
  },
}

const darkTheme = {
  dark: true,
  colors: {
    primary: '#D0BCFF',
    secondary: '#CCC2DC',
    accent: '#EFB8C8',
    background: '#10002B',
    surface: '#1C1B1F',
    'surface-variant': '#49454F',
    error: '#F2B8B5',
    warning: '#FFD54F',
    info: '#4FC3F7',
    success: '#81C784',
    'on-primary': '#381E72',
    'on-secondary': '#332D41',
    'on-background': '#E6E1E5',
    'on-surface': '#E6E1E5',
  },
}

export const vuetify = createVuetify({
  components: { VCalendar },
  blueprint: md3,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
  },
  defaults: {
    VBtn: { variant: 'elevated', rounded: 'lg' },
    VCard: { rounded: 'xl' },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VSelect: { variant: 'outlined', density: 'comfortable' },
    VTextarea: { variant: 'outlined', density: 'comfortable' },
    VChip: { rounded: 'lg' },
  },
})
