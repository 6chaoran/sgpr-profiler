// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  nitro: {
    firebase: {
      gen: 2,
      httpsOptions: {
        region: 'asia-east1',
        maxInstances: 1,
      },
      nodeVersion: '20'
    },
  },
})
