<template>
  <main class="benchmark-page">
    <section class="hero">
      <div>
        <h1>How long and how likely:<br>Outcomes for your profile</h1>
        <p>Benchmarks are based on completed Singapore PR applications<br>from the PRscope community.</p>
      </div>
      <aside>
        <b>About the data</b>
        <p>Community-shared PR outcomes completed between January 2021 and June 2026. Data as of August 15, 2026.</p>
      </aside>
    </section>

    <section class="profile-filters" aria-label="Profile segment filters">
      <label v-for="field in filterFields" :key="field.key">
        <span>{{ field.label }}</span>
        <select v-model="filters[field.key]" :aria-label="field.label">
          <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
        </select>
      </label>
      <button type="button" @click="resetFilters">
        <UIcon name="i-lucide-rotate-ccw" /> Reset
      </button>
    </section>

    <div class="segment-summary" aria-live="polite">
      <span><i />Your selected profile segment</span>
      <b>{{ n(displayCount) }} completed applications</b>
    </div>

    <p v-if="error" class="data-alert">Live data is temporarily unavailable. Showing a representative benchmark preview.</p>

    <section v-if="filteredCompleted.length" class="data-section waiting-section">
      <header class="section-intro">
        <span>1. Waiting time to decision</span>
        <p>Distribution of decision waiting time in months for completed applications in your selected segment.</p>
        <dl>
          <dt>Median (middle point)</dt>
          <dd>{{ median }} months</dd>
        </dl>
      </header>

      <div class="dotplot" role="img" :aria-label="`Waiting-time distribution. Median ${median} months.`">
        <div class="median-marker" :style="{ left: `${scaleMonth(Number(median))}%` }">
          <span>Median waiting time<br><b>{{ median }} months</b></span>
        </div>
        <div class="middle-range" :style="rangeStyle">
          <span>Middle 50% of cases<br><b>{{ quartiles.q1 }}–{{ quartiles.q3 }} months</b></span>
        </div>
        <div class="eighty-marker" :style="{ left: `${scaleMonth(eightyPercent)}%` }">
          <span>80% of cases decided within<br><b>{{ eightyPercent }} months or less</b></span>
        </div>
        <i
          v-for="mark in waitingMarks"
          :key="mark.id"
          class="wait-mark"
          :style="{ left: `${scaleMonth(mark.months)}%`, bottom: `${mark.row * 8 + 16}px`, animationDelay: `${mark.delay}ms` }"
        />
        <div v-for="tick in ticks" :key="tick" class="month-tick" :style="{ left: `${scaleMonth(tick)}%` }">
          <span>{{ tick === 30 ? '30+' : tick }}</span>
        </div>
        <strong>Waiting time (months)</strong>
      </div>
    </section>

    <section v-if="filteredCompleted.length" class="data-section success-section">
      <header class="section-intro">
        <span>2. Success rate</span>
        <p>Share of completed applications in your segment that were approved.</p>
      </header>

      <div class="rate-comparison" aria-label="Selected profile and overall success-rate comparison">
        <div class="rate-headings" aria-hidden="true">
          <span>Approved {{ successRate }}%</span>
          <span>Rejected {{ 100 - successRate }}%</span>
        </div>
        <div class="rate-row">
          <span>Your selected segment<small>({{ n(displayCount) }} completed)</small></span>
          <div class="rate-bar">
            <i class="approved-bar" :style="{ width: `${successRate}%` }"><b>{{ successRate }}%</b></i>
            <i class="rejected-bar"><b>{{ 100 - successRate }}%</b></i>
          </div>
        </div>
        <div class="rate-row">
          <span>Overall (all completed cases)<small>({{ n(overallCount) }} completed)</small></span>
          <div class="rate-bar">
            <i class="approved-bar overall" :style="{ width: `${overallRate}%` }"><b>{{ overallRate }}%</b></i>
            <i class="rejected-bar overall"><b>{{ 100 - overallRate }}%</b></i>
          </div>
        </div>
        <p class="rate-delta" :class="{ negative: delta < 0 }">{{ comparisonText }} overall ({{ successRate }}% vs {{ overallRate }}%)</p>
      </div>
    </section>

    <p v-if="!filteredCompleted.length" class="sample-warning">No completed applications match this segment. Broaden your filters to see a reliable comparison.</p>
    <p v-else-if="filteredCompleted.length < 30" class="sample-warning">Small sample: broaden your filters before drawing conclusions.</p>

    <footer id="methodology" class="methodology">
      <UIcon name="i-lucide-file-text" />
      <p><b>Methodology</b><br>Waiting time is measured from application submission to final decision. Success rate is the share approved among completed applications. Pending, withdrawn, and incomplete records are excluded. Community-submitted data is directional and is not an ICA prediction model.</p>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { onValue, ref as dbRef } from 'firebase/database'

interface Rec {
  id: string
  user: string
  result: string
  from: string
  closed: string
  to: string
  text: string
  applicationType?: string
  industry?: string
  yearsInSingapore?: string | number
  age?: string | number
  region?: string
}

type FilterKey = 'applicantType' | 'industry' | 'tenure' | 'age' | 'region'

const { $firebaseDatabase } = useNuxtApp()
const config = useRuntimeConfig()
const records = ref<Rec[]>([])
const error = ref(false)

const demo: Rec[] = Array.from({ length: 286 }, (_, index) => {
  const approved = index % 100 < 64
  const month = Math.min(29, Math.max(1.5, 7.4 + Math.sin(index * 1.73) * 4.4 + (index % 11) * .42))
  const industries = ['Technology', 'Finance', 'Healthcare', 'Engineering']
  const tenures = ['3–5 years', '6–10 years', '10+ years']
  const ages = ['20–29', '30–39', '40–49', '50+']
  return {
    id: `demo-${index}`,
    user: 'Community member',
    result: approved ? 'approved' : 'rejected',
    from: '2025-01-01',
    closed: new Date(Date.UTC(2025, Math.floor(month), 1)).toISOString(),
    to: '2026-08-15',
    text: `${index % 4 ? 'Individual' : 'Family'} · ${industries[index % industries.length]} · ${tenures[index % tenures.length]} · ${ages[index % ages.length]} · ${index % 2 ? 'Asia' : 'Other'}`,
  }
})

const filters = reactive<Record<FilterKey, string>>({ applicantType: 'All applicants', industry: 'All industries', tenure: 'All tenures', age: 'All ages', region: 'All regions' })
const filterFields: { key: FilterKey, label: string, options: string[] }[] = [
  { key: 'applicantType', label: 'Application type', options: ['All applicants', 'Individual', 'Family'] },
  { key: 'industry', label: 'Industry', options: ['All industries', 'Technology', 'Finance', 'Healthcare', 'Engineering', 'Other'] },
  { key: 'tenure', label: 'Years in Singapore', options: ['All tenures', '< 3 years', '3–5 years', '6–10 years', '10+ years'] },
  { key: 'age', label: 'Age band', options: ['All ages', '20–29', '30–39', '40–49', '50+'] },
  { key: 'region', label: 'Region', options: ['All regions', 'Asia', 'Europe', 'Americas', 'Other'] },
]

const source = computed(() => records.value.length ? records.value : demo)
const normalise = (value: unknown) => String(value ?? '').toLowerCase()
const isApproved = (record: Rec) => ['通过', 'approved', 'success', 'pass'].includes(normalise(record.result))
const isPending = (record: Rec) => ['等待', 'pending', 'processing'].includes(normalise(record.result))
const timestamp = (value: string) => Date.parse(value) || 0
const duration = (record: Rec) => {
  const start = timestamp(record.from)
  const end = timestamp(record.closed && record.closed !== 'None' ? record.closed : record.to)
  return start && end > start ? (end - start) / 2629800000 : 0
}
const haystack = (record: Rec) => normalise([record.text, record.applicationType, record.industry, record.yearsInSingapore, record.age, record.region].join(' '))
const includesValue = (text: string, value: string) => text.includes(value.toLowerCase()) || text.includes(value.toLowerCase().replace('–', '-'))
const matches = (record: Rec) => {
  const text = haystack(record)
  if (filters.applicantType !== 'All applicants' && !includesValue(text, filters.applicantType)) return false
  if (filters.industry !== 'All industries') {
    const selected = filters.industry.toLowerCase()
    const known = ['technology', 'finance', 'healthcare', 'engineering']
    if (selected === 'other' ? known.some(item => text.includes(item)) : !text.includes(selected)) return false
  }
  if (filters.tenure !== 'All tenures' && !includesValue(text, filters.tenure)) return false
  if (filters.age !== 'All ages' && !includesValue(text, filters.age)) return false
  if (filters.region !== 'All regions' && !includesValue(text, filters.region)) return false
  return true
}

const completed = computed(() => source.value.filter(record => !isPending(record) && duration(record) > 0))
const filteredCompleted = computed(() => completed.value.filter(matches))
const activeData = computed(() => filteredCompleted.value)
const activeDurations = computed(() => activeData.value.map(duration).sort((a, b) => a - b))
const percentile = (values: number[], point: number) => {
  if (!values.length) return 0
  const index = (values.length - 1) * point
  const lower = Math.floor(index)
  const fraction = index - lower
  return values[lower] + ((values[lower + 1] ?? values[lower]) - values[lower]) * fraction
}
const median = computed(() => (percentile(activeDurations.value, .5) || 7.4).toFixed(1))
const quartiles = computed(() => ({ q1: Number((percentile(activeDurations.value, .25) || 4.1).toFixed(1)), q3: Number((percentile(activeDurations.value, .75) || 11.8).toFixed(1)) }))
const eightyPercent = computed(() => Number((percentile(activeDurations.value, .8) || 15.7).toFixed(1)))
const rateFor = (items: Rec[]) => Math.round(items.filter(isApproved).length / Math.max(1, items.length) * 100)
const successRate = computed(() => rateFor(activeData.value) || 64)
const overallRate = computed(() => records.value.length ? rateFor(completed.value) : 57)
const displayCount = computed(() => filteredCompleted.value.length)
const overallCount = computed(() => records.value.length ? completed.value.length : 4912)
const delta = computed(() => successRate.value - overallRate.value)
const comparisonText = computed(() => delta.value === 0 ? 'The same as' : `${delta.value > 0 ? '+' : '−'}${Math.abs(delta.value)} percentage points ${delta.value > 0 ? 'higher than' : 'lower than'}`)

const scaleMonth = (month: number) => Math.min(100, Math.max(0, month / 30 * 100))
const ticks = Array.from({ length: 16 }, (_, index) => index * 2)
const rangeStyle = computed(() => ({ left: `${scaleMonth(quartiles.value.q1)}%`, width: `${scaleMonth(quartiles.value.q3) - scaleMonth(quartiles.value.q1)}%` }))
const waitingMarks = computed(() => {
  const buckets = new Map<number, number>()
  return activeData.value.slice(0, 180).map((record, index) => {
    const months = Math.min(30, duration(record))
    const bucket = Math.round(months)
    const row = buckets.get(bucket) ?? 0
    buckets.set(bucket, row + 1)
    return { id: record.id, months, row: Math.min(row, 13), delay: Math.min(index * 5, 650) }
  })
})

const n = (value: number) => new Intl.NumberFormat('en-SG').format(value)
const resetFilters = () => Object.assign(filters, { applicantType: 'All applicants', industry: 'All industries', tenure: 'All tenures', age: 'All ages', region: 'All regions' })

onMounted(() => {
  const off = onValue(dbRef($firebaseDatabase, config.public.firebaseDatabasePath), snapshot => {
    const value = snapshot.val() as Record<string, Record<string, unknown>> | null
    records.value = value ? Object.entries(value).map(([id, item]) => ({
      id,
      user: String(item.user ?? item.name ?? 'Anonymous'),
      result: String(item.result ?? item.status ?? '等待'),
      from: String(item.apply_dt ?? item.from ?? item.createdAt ?? ''),
      closed: String(item.close_dt ?? ''),
      to: String(item.update_ts ?? item.to ?? item.updatedAt ?? ''),
      text: String(item.text ?? item.profile ?? item.description ?? ''),
      applicationType: String(item.applicationType ?? item.application_type ?? ''),
      industry: String(item.industry ?? item.occupation ?? ''),
      yearsInSingapore: String(item.yearsInSingapore ?? item.local_tenure ?? ''),
      age: String(item.age ?? item.age_band ?? ''),
      region: String(item.region ?? item.nationality_region ?? ''),
    })) : []
    error.value = false
  }, () => { error.value = true })
  onBeforeUnmount(off)
})
</script>
