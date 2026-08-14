<template>
  <div class="px-6">
    <div class="text-md font-bold text-green-500 lg:text-xl">
      SGPR Profiler
      <span class="text-md text-gray-500 dark:text-white lg:text-xl">| Singapore PR Profile Evaluator</span>
    </div>
    <div>navigate your PR journey with confidence</div>

    <USeparator class="my-6">Recent records</USeparator>

    <UAlert
      v-if="loadError"
      class="mb-4"
      color="error"
      icon="i-lucide-circle-alert"
      title="Unable to load records"
      :description="loadError"
    />

    <div class="mt-3 flex flex-col gap-3">
      <template v-if="!dataLoaded">
        <UCard v-for="value in 6" :key="value">
          <AppSkeleton />
        </UCard>
      </template>

      <div v-else-if="records.length === 0 && !loadError" class="py-10 text-center text-gray-500">
        No records found.
      </div>

      <UCard v-for="rec in records" v-else :key="rec.id" variant="outline">
        <div class="flex flex-1 flex-col justify-between">
          <div class="flex items-center justify-between">
            <div class="font-bold">{{ rec.user }}</div>
            <div class="text-sm text-gray-500 dark:text-white">{{ rec.to }}</div>
          </div>
        </div>
        <UTimeline
          size="sm"
          class="mt-3 -mb-6 w-full"
          :default-value="0"
          reverse
          :color="resultColor(rec.result)"
          :items="timelineItems(rec)"
        />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onValue, ref as databaseRef } from 'firebase/database'

interface RecordValue {
  id: string
  user: string
  result: string
  from: string
  closed: string
  to: string
  text: string
}

const { $firebaseDatabase } = useNuxtApp()
const config = useRuntimeConfig()
const records = ref<RecordValue[]>([])
const dataLoaded = ref(false)
const loadError = ref('')

const normalizeRecord = (id: string, value: unknown): RecordValue | null => {
  if (!value || typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  return {
    id,
    user: String(record.user ?? record.name ?? 'Anonymous'),
    result: String(record.result ?? record.status ?? '等待'),
    from: String(record.apply_dt ?? record.from ?? record.createdAt ?? ''),
    closed: String(record.close_dt ?? ''),
    to: String(record.update_ts ?? record.to ?? record.updatedAt ?? ''),
    text: String(record.text ?? record.profile ?? record.description ?? ''),
  }
}

const resultColor = (result: string) =>
  result === '通过' ? 'success' : result === '等待' ? 'warning' : 'error'

const timelineItems = (record: RecordValue) => [
  { date: record.from, icon: 'i-lucide-code', description: record.text },
  {
    date: record.closed && record.closed !== 'None'
      ? record.closed.slice(0, 10)
      : record.to.slice(0, 10),
    icon: record.result === '通过'
      ? 'i-lucide-check-circle'
      : record.result === '等待'
        ? 'i-lucide-clock'
        : 'i-lucide-x-circle',
  },
]

onMounted(() => {
  const recordsReference = databaseRef($firebaseDatabase, config.public.firebaseDatabasePath)

  const unsubscribe = onValue(
    recordsReference,
    (snapshot) => {
      const value = snapshot.val() as Record<string, unknown> | null
      records.value = value
        ? Object.entries(value)
            .map(([id, record]) => normalizeRecord(id, record))
            .filter((record): record is RecordValue => record !== null)
            .sort((a, b) => b.to.localeCompare(a.to))
            .slice(0, 50)
        : []
      loadError.value = ''
      dataLoaded.value = true
    },
    (error) => {
      console.error('Firebase Realtime Database read failed:', error)
      loadError.value = error.code === 'PERMISSION_DENIED'
        ? 'Firebase denied this read. Allow authenticated/public reads for this path or add Firebase Authentication.'
        : error.message
      dataLoaded.value = true
    },
  )

  onBeforeUnmount(unsubscribe)
})
</script>
