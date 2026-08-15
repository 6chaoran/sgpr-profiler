// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  app: { head: { title: 'PRscope — Singapore PR Community Benchmark', meta: [
    { name: 'description', content: 'Explore Singapore PR waiting times and success rates for profiles like yours.' },
    { name: 'theme-color', content: '#fbfaf6' },
  ] } },
  fonts: {
    provider: 'local',
  },
  icon: {
    provider: 'none',
    clientBundle: {
      scan: true,
    },
  },
  runtimeConfig: {
    public: {
      firebase: {
        apiKey: 'AIzaSyBABCJoHV9hf3MlEmH_xB5eZax3OHWlcS0',
        appId: '1:452990261863:web:59983f7958ab6295dd92c2',
        authDomain: 'sgprapp.firebaseapp.com',
        databaseURL: 'https://sgprapp-default-rtdb.asia-southeast1.firebasedatabase.app',
        messagingSenderId: '452990261863',
        projectId: 'sgprapp',
        storageBucket: 'sgprapp.appspot.com',
      },
      firebaseDatabasePath: 'pr_records',
    },
  },
})
