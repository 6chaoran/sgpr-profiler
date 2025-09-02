<template>
    <div class="w-full">
          <UTextarea v-model="value" class="w-full" placeholder="Type your profile ..."/>
    </div>
</template>
<script setup>
const value = ref('')
</script>