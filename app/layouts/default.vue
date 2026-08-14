<template>
    <div class="flex flex-col">
        <div
            class="sticky top-0 z-50 flex h-16 border-b border-default bg-default/75 px-4 backdrop-blur"
        >
            <div class="flex h-full items-center gap-x-1 font-bold text-green-500">
                <u-icon name="i-flag-sg-4x3" class="size-6" />
                SGPR Profiler
                <u-badge variant="outline" class="rounded-full" size="sm">v0.0.1</u-badge>
            </div>
            <div class="ml-auto flex h-full items-center gap-x-2 text-green-500">
                <u-modal v-model="searchOpen" title="Search" placement="top">
                    <u-icon name="i-lucide-search" class="size-5" />
                    <template #body>
                        <search-modal />
                    </template>
                    <template #footer>
                        <div class="ml-auto">
                            <u-button>Search</u-button>
                        </div>
                    </template>
                </u-modal>
                <u-icon name="i-lucide-languages" class="size-5" />
                <u-icon name="i-lucide-menu" class="size-5" />
            </div>
        </div>

        <div class="mt-3 pb-19">
            <slot />
        </div>

        <div
            class="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around
                border-t border-default bg-default/75 backdrop-blur"
        >
            <p class="flex flex-col items-center text-xs font-bold text-green-500">
                <u-icon name="i-lucide-house" class="size-5" />
                Home
            </p>
            <p class="flex flex-col items-center text-xs font-bold text-gray-500">
                <u-icon name="i-lucide-search" class="size-5" />
                Search
            </p>
            <p class="flex flex-col items-center text-xs font-bold text-gray-500">
                <u-icon name="i-lucide-lightbulb" class="size-5" />
                Insights
            </p>
        </div>
    </div>
</template>

<script setup>
const searchOpen = ref(false)
</script>
