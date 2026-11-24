
export default defineNuxtConfig({
  compatibilityDate: '2026-11-24',

  devtools: {
    enabled: true
  },

  modules: [
    'vuetify-nuxt-module'
  ],

  css: [
    '~/assets/css/main.css',
    '@mdi/font/css/materialdesignicons.css'
  ],

  runtimeConfig: {
    public: {
      firebaseApiKey: '',
      firebaseAuthDomain: '',
      firebaseDatabaseURL: '',
      firebaseProjectId: '',
      firebaseStorageBucket: '',
      firebaseMessagingSenderId: '',
      firebaseAppId: ''
    }
  },

  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light',
        themes: {
          light: {
            colors: {
              primary: '#168C72',
              secondary: '#145C4B',
              background: '#F5F8F6',
              surface: '#FFFFFF',
              success: '#2E9D69',
              error: '#DC5252',
              warning: '#E6A23C'
            }
          }
        }
      }
    }
  }
})
