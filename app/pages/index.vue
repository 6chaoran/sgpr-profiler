<script setup lang="ts">
const filters = reactive({ outcome: 'All outcomes', profile: 'All profiles' })

const outcomes = ['All outcomes', 'Approved', 'Pending', 'Unsuccessful']
const profiles = ['All profiles', 'Tech', 'Finance', 'Healthcare', 'Other']

const monthly = [
  { month: 'Mar', approved: 12, pending: 9, unsuccessful: 5 },
  { month: 'Apr', approved: 16, pending: 11, unsuccessful: 7 },
  { month: 'May', approved: 19, pending: 10, unsuccessful: 6 },
  { month: 'Jun', approved: 22, pending: 12, unsuccessful: 8 },
  { month: 'Jul', approved: 25, pending: 11, unsuccessful: 7 },
  { month: 'Aug', approved: 28, pending: 10, unsuccessful: 8 },
]

const profileRows = [
  { label: 'Technology', count: 44, rate: 68, wait: '7.2 mo', color: '#0f766e' },
  { label: 'Finance', count: 31, rate: 61, wait: '8.1 mo', color: '#3b82f6' },
  { label: 'Healthcare', count: 22, rate: 59, wait: '8.6 mo', color: '#8b5cf6' },
  { label: 'Other sectors', count: 45, rate: 51, wait: '9.4 mo', color: '#94a3b8' },
]

const factors = [
  { label: 'Monthly income', value: 76, note: 'Strong signal' },
  { label: 'Years in Singapore', value: 64, note: 'Meaningful signal' },
  { label: 'Application attempt', value: 48, note: 'Moderate signal' },
  { label: 'Age band', value: 35, note: 'Lower signal' },
]

useHead({
  title: 'PR Bench — Singapore PR application benchmark',
  meta: [{ name: 'description', content: 'Privacy-first, community-powered Singapore PR application benchmarks.' }],
})
</script>

<template>
  <main>
    <section class="hero shell">
      <div class="eyebrow"><span class="pulse" /> Community benchmark · Updated 10 Aug 2026</div>
      <h1>Make sense of your<br><em>PR journey.</em></h1>
      <p class="hero-copy">Anonymous, community-powered benchmarks for Singapore Permanent Residence applications.</p>
      <div class="hero-actions">
        <a href="#benchmarks" class="button primary">Explore benchmarks <span>→</span></a>
        <button class="button secondary">Contribute anonymously</button>
      </div>
      <div class="trust-row">
        <span>142 shared timelines</span><i /> <span>100% aggregated</span><i /> <span>No usernames shown</span>
      </div>
    </section>

    <section id="benchmarks" class="benchmark-wrap">
      <div class="shell">
        <div class="section-heading">
          <div><p class="kicker">COMMUNITY SNAPSHOT</p><h2>Singapore PR benchmarks</h2></div>
          <div class="filters">
            <label><span>OUTCOME</span><select v-model="filters.outcome"><option v-for="item in outcomes" :key="item">{{ item }}</option></select></label>
            <label><span>PROFILE</span><select v-model="filters.profile"><option v-for="item in profiles" :key="item">{{ item }}</option></select></label>
          </div>
        </div>

        <div class="metrics-grid">
          <article class="metric-card"><div class="metric-icon green">↗</div><p>APPROVAL RATE</p><strong>61<span>%</span></strong><small><b>+4.2%</b> vs previous period</small></article>
          <article class="metric-card"><div class="metric-icon blue">◷</div><p>MEDIAN WAIT TIME</p><strong>8.4<span> mo</span></strong><small>From application to outcome</small></article>
          <article class="metric-card"><div class="metric-icon violet">◎</div><p>APPLICATIONS</p><strong>142</strong><small>Across all shared records</small></article>
          <article class="metric-card"><div class="metric-icon amber">⌁</div><p>MOST COMMON PROFILE</p><strong class="profile-stat">Tech</strong><small>31% of contributors</small></article>
        </div>

        <div class="dashboard-grid">
          <article class="panel trend-panel">
            <div class="panel-head"><div><h3>Application outcomes</h3><p>Community records by reported month</p></div><div class="legend"><span class="approved">Approved</span><span class="pending">Pending</span><span class="unsuccessful">Unsuccessful</span></div></div>
            <div class="chart">
              <div v-for="row in monthly" :key="row.month" class="bar-col">
                <div class="bar-stack"><span class="bar approved-bar" :style="{height: `${row.approved * 4}px`}" /><span class="bar pending-bar" :style="{height: `${row.pending * 4}px`}" /><span class="bar unsuccessful-bar" :style="{height: `${row.unsuccessful * 4}px`}" /></div>
                <b>{{ row.month }}</b>
              </div>
            </div>
          </article>

          <article class="panel factors-panel">
            <div class="panel-head"><div><h3>Factors that stand out</h3><p>Relative association with reported outcomes</p></div></div>
            <div class="factor-list"><div v-for="factor in factors" :key="factor.label" class="factor"><div><b>{{ factor.label }}</b><span>{{ factor.note }}</span></div><div class="track"><i :style="{width: `${factor.value}%`}" /></div></div></div>
            <p class="caveat">Correlation is not causation. These patterns describe this community dataset only.</p>
          </article>

          <article class="panel profile-panel">
            <div class="panel-head"><div><h3>Profile comparison</h3><p>Aggregated by reported industry</p></div><button>View methodology ↗</button></div>
            <div class="table-head"><span>INDUSTRY</span><span>RECORDS</span><span>APPROVAL RATE</span><span>MEDIAN WAIT</span></div>
            <div v-for="row in profileRows" :key="row.label" class="table-row"><b><i :style="{background: row.color}" />{{ row.label }}</b><span>{{ row.count }}</span><span class="rate"><i><u :style="{width: `${row.rate}%`, background: row.color}" /></i>{{ row.rate }}%</span><strong>{{ row.wait }}</strong></div>
          </article>
        </div>
      </div>
    </section>

    <section class="privacy shell">
      <div class="shield">✓</div><div><p class="kicker">PRIVACY BY DESIGN</p><h2>Your story stays yours.</h2><p>We only display trends across groups. Individual submissions, usernames, and identifying details are never shown.</p></div>
      <div class="privacy-points"><span>✓ No public profiles</span><span>✓ Aggregated results only</span><span>✓ Minimum group thresholds</span></div>
    </section>
  </main>
</template>
