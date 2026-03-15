<template>
    <div id="app" class="min-h-screen flex flex-col">
        <router-view class="flex-1"></router-view>
        <Footer />
        <ToastNotifier />
    </div>
</template>

<script setup>
import ToastNotifier from './components/ToastNotifier.vue';
import Footer from './components/Footer.vue';
</script>

