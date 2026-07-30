import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const lightTheme = {
  dark: false,
  colors: {
    background: '#f5f7fa',
    surface: '#ffffff',
    'surface-variant': '#f0f2f5',
    primary: '#1976D2',
    'primary-darken-1': '#1565C0',
    secondary: '#424242',
    accent: '#FF6F00',
    error: '#D32F2F',
    info: '#0288D1',
    success: '#2E7D32',
    warning: '#ED6C02',
    'on-background': '#212121',
    'on-surface': '#212121',
    'on-surface-variant': '#424242',
    'border-color': '#e0e0e0',
  },
}

const darkTheme = {
  dark: true,
  colors: {
    background: '#0a0f1a',
    surface: '#111827',
    'surface-variant': '#1a2236',
    primary: '#64B5F6',
    'primary-darken-1': '#42A5F5',
    secondary: '#B0BEC5',
    accent: '#FFB74D',
    error: '#EF5350',
    info: '#4FC3F7',
    success: '#66BB6A',
    warning: '#FFA726',
    'on-background': '#ECEFF1',
    'on-surface': '#ECEFF1',
    'on-surface-variant': '#B0BEC5',
    'border-color': '#263040',
  },
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
  },
  defaults: {
    VCard: {
      elevation: 2,
      rounded: 'lg',
    },
    VBtn: {
      rounded: 'lg',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VDataTable: {
      hover: true,
    },
  },
})
