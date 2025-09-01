<template>
    <div >
        <div class=" text-green-500 font-bold text-md lg:text-xl">SGPR Profiler <span
                class="text-gray-500 dark:text-white text-md lg:text-xl">| Singapore PR Profile Evaluator </span></div>
        <div>navigate your PR journey with confidence</div>
        <u-separator class="my-6">Recent records</u-separator>
        <div class="mt-3 flex flex-col gap-3">
            <u-card v-for="value in [1,2,3,4, 5, 6]" :key="value">
                <skeleton />
            </u-card>
        </div>
    </div>
</template>