import { getApp, getApps, initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const app = getApps().length ? getApp() : initializeApp(config.public.firebase)

  return {
    provide: {
      firebaseDatabase: getDatabase(app),
    },
  }
})
