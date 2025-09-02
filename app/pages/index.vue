<template>
    <div class="px-6">
        <div class=" text-green-500 font-bold text-md lg:text-xl">SGPR Profiler <span
                class="text-gray-500 dark:text-white text-md lg:text-xl">| Singapore PR Profile Evaluator </span></div>
        <div>navigate your PR journey with confidence</div>
        <u-separator class="my-6">Recent records</u-separator>
        <div class="mt-3 flex flex-col gap-3">
            <u-card v-for="rec in records" v-if="dataLoaded" :key="rec.text" variant="outline">
                    <div class="flex-1 flex-col justify-between">
                    <div class="flex justify-between items-center">
                        <div class="font-bold">{{ rec.user }}</div>
                        <div class="text-sm text-gray-500 dark:text-white">{{ rec.to }}</div>
                    </div>
                    <!-- <div>{{ rec.text }}</div> -->
                </div>
                    <div>
                        <u-timeline size="sm" class="w-full mt-3 -mb-6" :default-value="0"
                            reverse
                            :color="rec.result === '通过' ? 'success' : (rec.result === '等待' ? 'warning' : 'error')"
                            :items="[{ date: rec.from, icon: 'i-lucide-code', description: rec.text },
                                     { date: rec.to.slice(0, 10), icon: rec.result === '通过' ? 'i-lucide-check-circle' : (rec.result === '等待' ? 'i-lucide-clock' : 'i-lucide-x-circle')}]">
                        </u-timeline>
                    </div>
                
            </u-card>
            <u-card v-for="value in [1, 2, 3, 4, 5, 6]" :key="value" v-else>
                <skeleton />
            </u-card>
        </div>
    </div>
</template>
<script setup>
const records = ref([])
const dataLoaded = ref(false)

onMounted(() => {
    console.log("mounted")
    records.value = [
        { user: "漂流过新的小男孩", result: "等待", from: "2025-08-09", to: "2025-08-10 14:09", text: "马来西亚人 23岁 月薪3.4k 来新3年 第一次申请， 最近听闻好多人都过了" },
        { user: "龙龙", result: "杯具", from: "2025-08-06", to: "2025-08-08 22:07", text: "中国人 30岁 月薪8k 来新5年 第二次申请， 这次被拒了， 听说是因为工资不够" },
        { user: "帅帅的申请者", result: "通过", from: "2025-08-07", to: "2025-08-07 15:13", text: "中国人 28岁 月薪6k 来新4年 第一次申请， 朋友介绍的这个工具， 希望能帮我通过" },
        { user: "to帅帅的申请者", result: "通过", from: "2025-08-30", to: "2025-08-07 13:28", text: "中国人 28岁 月薪6k 来新4年 第一次申请， 朋友介绍的这个工具， 希望能帮我通过" },
    ]
    dataLoaded.value = true

})

</script>
