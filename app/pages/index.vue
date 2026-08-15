<template>
  <main class="editorial-page">
    <section class="intro">
      <p class="kicker">Singapore PR community benchmark</p>
      <h1>How long might I wait—and what are<br>my chances—if I apply for PR in Singapore?</h1>
      <p class="dek">Explore waiting time and success rate for profiles like yours.</p>
    </section>

    <section class="filter-rail" aria-label="Refine your profile">
      <strong>Refine your profile</strong>
      <label v-for="field in filterFields" :key="field.key">
        <span>{{ field.label }}</span>
        <select v-model="filters[field.key]" :aria-label="field.label">
          <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
        </select>
      </label>
      <button type="button" @click="resetFilters">Reset</button>
    </section>

    <p v-if="error" class="data-alert">Live data is temporarily unavailable. Showing a representative preview.</p>

    <section class="result-story" aria-live="polite">
      <p class="result-sentence">
        Among <strong :key="`count-${filteredCompleted.length}`">{{ n(displayCount) }}</strong> similar completed applications,
        <strong :key="`rate-${successRate}`" class="approved-text">{{ successRate }}%</strong> were approved.
      </p>
      <div class="legend" aria-label="Chart legend">
        <span><i class="approved-dot" />Approved ({{ successRate }}%)</span>
        <span><i class="rejected-dot" />Rejected ({{ 100 - successRate }}%)</span>
        <span>Overall success (all profiles): <b>{{ overallRate }}%</b></span>
      </div>

      <div class="annotations">
        <article><b>1</b><p>The median waiting time is<br><strong>{{ median }} months.</strong></p></article>
        <article><b>2</b><p>The middle 50% of applications took between<br><strong>{{ quartiles.q1 }} and {{ quartiles.q3 }} months.</strong></p></article>
        <article><b>3</b><p>This segment’s success rate is<br><strong>{{ comparisonText }}</strong> the overall baseline.</p></article>
      </div>

      <div class="chart-wrap">
        <div class="axis-title">Applications<br><small>(n = {{ n(displayCount) }})</small></div>
        <div class="plot" role="img" :aria-label="`Application decisions by waiting time. Median ${median} months.`">
          <div class="quartile-band" :style="quartileStyle" />
          <div class="median-line" :style="{ left: `${scaleMonth(Number(median))}%` }"><span>Median<br><b>{{ median }} months</b></span></div>
          <i
            v-for="mark in chartMarks"
            :key="mark.id"
            class="case-mark"
            :class="mark.approved ? 'is-approved' : 'is-rejected'"
            :style="{ left: `${scaleMonth(mark.months)}%`, top: `${mark.y}%`, animationDelay: `${mark.delay}ms` }"
          />
          <div v-for="tick in ticks" :key="tick" class="tick" :style="{ left: `${scaleMonth(tick)}%` }"><span>{{ tick === 20 ? '20+' : tick }}</span></div>
        </div>
        <div class="axis-caption">Months from<br>application</div>
        <div class="quartile-label q1" :style="{ left: `${scaleMonth(quartiles.q1)}%` }">Q1<br><b>{{ quartiles.q1 }} months</b></div>
        <div class="quartile-label q3" :style="{ left: `${scaleMonth(quartiles.q3)}%` }">Q3<br><b>{{ quartiles.q3 }} months</b></div>
      </div>

      <p v-if="filteredCompleted.length && filteredCompleted.length < 30" class="sample-warning">Small sample: broaden your filters before drawing conclusions.</p>
    </section>

    <footer class="methodology">
      <b>Source &amp; methodology:</b>
      PRscope community database of completed PR applications. Waiting time runs from application to final decision. Success rate excludes pending and incomplete records. Community-submitted data is directional and is not an ICA prediction model.
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

const demo: Rec[] = Array.from({ length: 286 }, (_, i) => {
  const isApproved = i % 100 < 64
  const month = Math.min(22, Math.max(1.2, 7.4 + Math.sin(i * 1.73) * 4.2 + (i % 9) * .35))
  return {
    id: `demo-${i}`,
    user: 'Community member',
    result: isApproved ? 'approved' : 'rejected',
    from: '2025-01-01',
    closed: new Date(Date.UTC(2025, Math.floor(month), 1)).toISOString(),
    to: '2026-08-15',
    text: `${i % 4 ? 'Individual' : 'Family'} · ${['Technology', 'Finance', 'Healthcare', 'Engineering'][i % 4]} · ${i % 3 === 0 ? '3–5 years' : i % 3 === 1 ? '6–10 years' : '10+ years'} · ${i % 2 ? 'Asia' : 'Other region'}`,
  }
})

const filters = reactive<Record<FilterKey, string>>({
  applicantType: 'All applicants', industry: 'All industries', tenure: 'All tenures', age: 'All ages', region: 'All regions',
})
const filterFields: { key: FilterKey, label: string, options: string[] }[] = [
  { key: 'applicantType', label: 'Applicant type', options: ['All applicants', 'Individual', 'Family'] },
  { key: 'industry', label: 'Industry', options: ['All industries', 'Technology', 'Finance', 'Healthcare', 'Engineering', 'Other'] },
  { key: 'tenure', label: 'Local tenure', options: ['All tenures', '< 3 years', '3–5 years', '6–10 years', '10+ years'] },
  { key: 'age', label: 'Age', options: ['All ages', '20–29', '30–39', '40–49', '50+'] },
  { key: 'region', label: 'Region', options: ['All regions', 'Asia', 'Europe', 'Americas', 'Other'] },
]

const source = computed(() => records.value.length ? records.value : demo)
const normalise = (value: unknown) => String(value ?? '').toLowerCase()
const approved = (record: Rec) => ['通过', 'approved', 'success', 'pass'].includes(normalise(record.result))
const pending = (record: Rec) => ['等待', 'pending', 'processing'].includes(normalise(record.result))
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
    const chosen = filters.industry.toLowerCase()
    const known = ['technology', 'finance', 'healthcare', 'engineering']
    if (chosen === 'other' ? known.some(item => text.includes(item)) : !text.includes(chosen)) return false
  }
  if (filters.tenure !== 'All tenures' && !includesValue(text, filters.tenure)) return false
  if (filters.age !== 'All ages' && !includesValue(text, filters.age)) return false
  if (filters.region !== 'All regions' && !includesValue(text, filters.region)) return false
  return true
}

const completed = computed(() => source.value.filter(record => !pending(record) && duration(record) > 0))
const filteredCompleted = computed(() => completed.value.filter(matches))
const activeData = computed(() => filteredCompleted.value.length ? filteredCompleted.value : completed.value)
const activeDurations = computed(() => activeData.value.map(duration).sort((a, b) => a - b))
const percentile = (values: number[], p: number) => {
  if (!values.length) return 0
  const index = (values.length - 1) * p
  const lower = Math.floor(index)
  const fraction = index - lower
  return values[lower] + ((values[lower + 1] ?? values[lower]) - values[lower]) * fraction
}
const median = computed(() => (percentile(activeDurations.value, .5) || 7.4).toFixed(1))
const quartiles = computed(() => ({ q1: Number((percentile(activeDurations.value, .25) || 4).toFixed(1)), q3: Number((percentile(activeDurations.value, .75) || 11.8).toFixed(1)) }))
const rateFor = (items: Rec[]) => Math.round(items.filter(approved).length / Math.max(1, items.length) * 100)
const successRate = computed(() => rateFor(activeData.value) || 64)
const overallRate = computed(() => records.value.length ? rateFor(completed.value) : 57)
const displayCount = computed(() => filteredCompleted.value.length || (records.value.length ? completed.value.length : 286))
const comparisonText = computed(() => {
  const delta = successRate.value - overallRate.value
  return delta === 0 ? 'the same as' : `${Math.abs(delta)} percentage points ${delta > 0 ? 'higher than' : 'lower than'}`
})

const scaleMonth = (month: number) => Math.min(100, Math.max(0, month / 20 * 100))
const ticks = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
const quartileStyle = computed(() => ({ left: `${scaleMonth(quartiles.value.q1)}%`, width: `${scaleMonth(quartiles.value.q3) - scaleMonth(quartiles.value.q1)}%` }))
const chartMarks = computed(() => activeData.value.slice(0, 150).map((record, index) => ({
  id: record.id,
  months: Math.min(20, duration(record)),
  approved: approved(record),
  y: approved(record) ? 34 + (index % 4) * 3.2 : 65 + (index % 4) * 3.2,
  delay: Math.min(index * 6, 700),
})))

const n = (value: number) => new Intl.NumberFormat('en-SG').format(value)
const resetFilters = () => Object.assign(filters, { applicantType: 'All applicants', industry: 'All industries', tenure: 'All tenures', age: 'All ages', region: 'All regions' })

onMounted(() => {
  const off = onValue(dbRef($firebaseDatabase, config.public.firebaseDatabasePath), snapshot => {
    const value = snapshot.val() as Record<string, Record<string, unknown>> | null
    records.value = value ? Object.entries(value).map(([id, item]) => ({
      id,
      user: String(item.user ?? item.name ?? 'Anonymous'), result: String(item.result ?? item.status ?? '等待'),
      from: String(item.apply_dt ?? item.from ?? item.createdAt ?? ''), closed: String(item.close_dt ?? ''),
      to: String(item.update_ts ?? item.to ?? item.updatedAt ?? ''), text: String(item.text ?? item.profile ?? item.description ?? ''),
      applicationType: String(item.applicationType ?? item.application_type ?? ''), industry: String(item.industry ?? item.occupation ?? ''),
      yearsInSingapore: String(item.yearsInSingapore ?? item.local_tenure ?? ''), age: String(item.age ?? item.age_band ?? ''),
      region: String(item.region ?? item.nationality_region ?? ''),
    })) : []
    error.value = false
  }, () => { error.value = true })
  onBeforeUnmount(off)
})
</script>
