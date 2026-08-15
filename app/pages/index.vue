<template>
  <main class="infographic-page">
    <section class="infographic-hero">
      <h1>How long might I wait—and what are my chances—if I apply for PR in Singapore?</h1>
      <p>Explore waiting time and success rate for profiles like yours.</p>
      <p class="last-updated">
        <span aria-hidden="true" />
        Data last updated <time :datetime="lastUpdatedIso">{{ lastUpdatedLabel }}</time>
      </p>
    </section>

    <section class="refine-rail" aria-label="Profile segment filters">
      <strong>Refine your profile</strong>
      <label v-for="field in filterFields" :key="field.key">
        <span>{{ field.label }}</span>
        <select v-model="filters[field.key]" :aria-label="field.label">
          <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
        </select>
      </label>
      <button type="button" @click="resetFilters">Reset</button>
    </section>

    <p v-if="error" class="data-alert">Live data is temporarily unavailable. Showing a representative benchmark preview.</p>

    <section v-if="filteredCompleted.length" class="primary-story" aria-live="polite">
      <p class="result-sentence">Among <strong>{{ n(displayCount) }}</strong> similar completed applications, <strong>{{ successRate }}%</strong> were approved.</p>
      <div class="result-legend">
        <span><i class="approved-key" />Approved ({{ successRate }}%)</span>
        <span><i class="rejected-key" />Rejected ({{ 100 - successRate }}%)</span>
        <span>Overall success: <b>{{ overallRate }}%</b></span>
      </div>

      <div class="story-insights">
        <article><b>1</b><p>Median waiting time<strong>{{ median }} months</strong></p></article>
        <article><b>2</b><p>Middle 50% of decisions<strong>{{ quartiles.q1 }}–{{ quartiles.q3 }} months</strong></p></article>
        <article><b>3</b><p>Compared with overall<strong :class="{ negative: delta < 0 }">{{ deltaLabel }}</strong></p></article>
      </div>

      <WaitingTimeJitter
        :points="jitterPoints"
        :median="Number(median)"
        :q1="quartiles.q1"
        :q3="quartiles.q3"
      />
    </section>

    <p v-if="!filteredCompleted.length" class="sample-warning">No completed applications match this segment. Broaden your filters to see a reliable comparison.</p>
    <p v-else-if="filteredCompleted.length < 30" class="sample-warning">Small sample: broaden your filters before drawing conclusions.</p>

    <footer id="methodology" class="infographic-methodology">
      <b>Source &amp; methodology:</b> PRscope community database of completed PR applications. Waiting time runs from application to final decision. Success rate excludes pending and incomplete records. Community-submitted data is directional and is not an ICA prediction model.
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
const lastUpdatedTimestamp = computed(() => Math.max(...source.value.map(record => timestamp(record.to) || timestamp(record.closed))))
const lastUpdatedIso = computed(() => new Date(lastUpdatedTimestamp.value).toISOString().slice(0, 10))
const lastUpdatedLabel = computed(() => new Intl.DateTimeFormat('en-SG', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(lastUpdatedTimestamp.value))
const duration = (record: Rec) => {
  const start = timestamp(record.from)
  const end = timestamp(record.closed && record.closed !== 'None' ? record.closed : record.to)
  return start && end > start ? (end - start) / 2629800000 : 0
}
const profileText = (record: Rec) => normalise([record.text, record.applicationType, record.industry, record.yearsInSingapore, record.age, record.region].join(' '))
const hasAny = (text: string, values: string[]) => values.some(value => text.includes(value))
const chineseNumber = (value: string) => {
  const digits: Record<string, number> = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 }
  if (value === '十') return 10
  if (value.includes('十')) {
    const [tens, ones] = value.split('十')
    return (digits[tens] ?? 1) * 10 + (digits[ones] ?? 0)
  }
  return digits[value] ?? Number(value)
}
const firstNumber = (text: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return chineseNumber(match[1])
  }
  return null
}
const applicationCategory = (record: Rec) => {
  const text = profileText(record)
  if (hasAny(text, ['family', '夫妻', '全家', '一家', '三口', '四口', '两口', '二口', '带娃', '带孩子', '+dp', 'spouse'])) return 'Family'
  if (hasAny(text, ['individual', 'single', '单身', '个人申请', '独自申请', '未婚'])) return 'Individual'
  return null
}
const industryCategory = (record: Rec) => {
  const text = normalise(`${record.industry ?? ''} ${record.text ?? ''}`)
  if (hasAny(text, ['technology', ' tech', '互联网', '科技', '软件', '程序员', '计算机', '数据科学', '人工智能', ' it '])) return 'Technology'
  if (hasAny(text, ['finance', 'financial', 'fintech', '金融', '银行', '保险', '投行', '会计', '审计'])) return 'Finance'
  if (hasAny(text, ['healthcare', 'medical', 'pharma', '医疗', '医药', '医生', '护士', '生物'])) return 'Healthcare'
  if (hasAny(text, ['engineering', 'engineer', 'manufacturing', '工程', '制造', '半导体', '建筑', '机械', '电子'])) return 'Engineering'
  return record.industry?.trim() ? 'Other' : null
}
const tenureCategory = (record: Rec) => {
  const raw = normalise(record.yearsInSingapore)
  const text = `${raw} ${normalise(record.text)}`
  if (hasAny(raw, ['< 3', '<3'])) return '< 3 years'
  if (hasAny(raw, ['3–5', '3-5'])) return '3–5 years'
  if (hasAny(raw, ['6–10', '6-10'])) return '6–10 years'
  if (hasAny(raw, ['10+', '>10'])) return '10+ years'
  const years = firstNumber(text, [/(?:来新|在新|新加坡)(?:已)?\s*([0-9一二两三四五六七八九十]+)\s*年/, /([0-9一二两三四五六七八九十]+)\s*年(?:来新|在新|新加坡)/, /(?:tenure|years? in singapore)\D*([0-9]+)/])
  if (years === null || !Number.isFinite(years)) return null
  if (years < 3) return '< 3 years'
  if (years <= 5) return '3–5 years'
  if (years <= 10) return '6–10 years'
  return '10+ years'
}
const ageCategory = (record: Rec) => {
  const raw = normalise(record.age)
  if (hasAny(raw, ['20–29', '20-29'])) return '20–29'
  if (hasAny(raw, ['30–39', '30-39'])) return '30–39'
  if (hasAny(raw, ['40–49', '40-49'])) return '40–49'
  if (hasAny(raw, ['50+'])) return '50+'
  const age = firstNumber(`${raw} ${normalise(record.text)}`, [/(?:age|年龄)\D*([0-9]{2})/, /([0-9]{2})\s*岁/])
  if (age === null || age < 20) return null
  if (age < 30) return '20–29'
  if (age < 40) return '30–39'
  if (age < 50) return '40–49'
  return '50+'
}
const regionCategory = (record: Rec) => {
  const explicit = normalise(record.region)
  const text = `${explicit} ${normalise(record.text)}`
  if (hasAny(text, ['asia', '中国', '大陆', '香港', '台湾', '马来西亚', '印度', '印尼', '越南', '菲律宾', '日本', '韩国', 'china', 'malaysia', 'india', 'indonesia', 'vietnam', 'philippines', 'japan', 'korea'])) return 'Asia'
  if (hasAny(text, ['europe', '英国', '法国', '德国', '意大利', '西班牙', '荷兰', 'uk', 'british', 'france', 'germany'])) return 'Europe'
  if (hasAny(text, ['americas', '美国', '加拿大', '巴西', '墨西哥', 'usa', 'canada', 'brazil', 'mexico'])) return 'Americas'
  if (hasAny(text, ['australia', 'new zealand', 'middle east', 'africa', '澳洲', '澳大利亚', '新西兰', '中东', '非洲'])) return 'Other'
  return explicit ? 'Other' : null
}
const matches = (record: Rec) => {
  if (filters.applicantType !== 'All applicants' && applicationCategory(record) !== filters.applicantType) return false
  if (filters.industry !== 'All industries' && industryCategory(record) !== filters.industry) return false
  if (filters.tenure !== 'All tenures' && tenureCategory(record) !== filters.tenure) return false
  if (filters.age !== 'All ages' && ageCategory(record) !== filters.age) return false
  if (filters.region !== 'All regions' && regionCategory(record) !== filters.region) return false
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
const median = computed(() => percentile(activeDurations.value, .5).toFixed(1))
const quartiles = computed(() => ({ q1: Number(percentile(activeDurations.value, .25).toFixed(1)), q3: Number(percentile(activeDurations.value, .75).toFixed(1)) }))
const rateFor = (items: Rec[]) => Math.round(items.filter(isApproved).length / Math.max(1, items.length) * 100)
const successRate = computed(() => rateFor(activeData.value))
const overallRate = computed(() => rateFor(completed.value))
const displayCount = computed(() => filteredCompleted.value.length)
const delta = computed(() => successRate.value - overallRate.value)
const deltaLabel = computed(() => delta.value === 0 ? 'Same approval rate' : `${delta.value > 0 ? '+' : '−'}${Math.abs(delta.value)} percentage points`)
const jitterPoints = computed(() => activeData.value.slice(0, 180).map(record => ({ months: duration(record), approved: isApproved(record) })))

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
      applicationType: String(item.applicationType ?? item.application_type ?? item.applicationTypeLabel ?? ''),
      industry: String(item.industry ?? item.occupation ?? ''),
      yearsInSingapore: String(item.yearsInSingapore ?? item.local_tenure ?? ''),
      age: String(item.age ?? item.age_band ?? ''),
      region: String(item.region ?? item.nationality_region ?? item.nationality ?? item.country ?? ''),
    })) : []
    error.value = false
  }, () => { error.value = true })
  onBeforeUnmount(off)
})
</script>
