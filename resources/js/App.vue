<template>
    <div id="app">
        <router-view></router-view>
        <ToastNotifier />
    </div>
</template>

<script setup>
import ToastNotifier from './components/ToastNotifier.vue';
</script>

