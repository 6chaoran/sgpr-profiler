<template>
    <div class="flex flex-col">
        <!-- header -->
        <div class="flex sticky bg-default/75 backdrop-blur border-b border-default top-0 z-50 
            h-16 px-4">
            <div class="flex items-center h-full text-green-500 font-bold gap-x-1">
                <u-icon name="flag:sg-4x3" class="size-6" /> SGPR Profiler
                <u-badge variant="outline" class="rounded-full" size="sm">v0.0.1</u-badge>
            </div>
            <div class="flex items-center h-full ml-auto text-green-500 gap-x-2">
                <u-modal title="Search" v-model="searchOpen" placement="top" >
                    <u-icon name="heroicons-solid:search" v-model="searchOpen" class="size-5"></u-icon>
                    <template #body>
                        <search-modal />
                    </template> 
                    <template #footer>
                        <div class="ml-auto">
                            <u-button>Search</u-button>
                        </div>
                    </template>
                </u-modal>
                <u-icon name="ic:outline-translate" class="size-5"></u-icon>
                <u-icon name="heroicons:bars-3" class="size-5"></u-icon>
            </div>
        </div>


        <div class="mt-3 pb-19">
            <NuxtPage />
        </div>
        <!-- footer  -->
        <div class="fixed z-50 bottom-0 left-0 w-full h-16 flex items-center
         border-t border-default justify-around bg-default/75 backdrop-blur">
            <p class="flex flex-col items-center text-green-500 text-xs font-bold"><u-icon name="heroicons:home"
                    class="size-5" />Home</p>
            <p class="flex flex-col items-center text-gray-500 text-xs font-bold"><u-icon
                    name="heroicons:magnifying-glass" class="size-5" />Search</p>
            <p class="flex flex-col items-center text-gray-500 text-xs font-bold"><u-icon name="heroicons:light-bulb"
                    class="size-5" />Insights</p>
        </div>
    </div>
</template>
<script setup>
const searchOpen = ref(false)
</script>