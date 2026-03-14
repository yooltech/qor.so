<template>
    <div v-if="active" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="flex flex-col items-center">
            <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="mt-4 text-white font-medium">{{ message || 'Loading...' }}</p>
        </div>
    </div>
</template>

<script setup>
defineProps({
    active: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        default: ''
    }
});
</script>

<style scoped>
.border-primary {
    border-color: #3b82f6; /* Blue-500 */
    border-top-color: transparent;
}
</style>
