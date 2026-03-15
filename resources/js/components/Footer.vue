<template>
  <footer class="border-t py-8 mt-auto bg-background/50 backdrop-blur-sm">
    <div class="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
          <img :src="config.asset('logo.png')" alt="qor.so" class="w-4 h-4 rounded-sm" />
        </div>
        <span class="text-xs font-semibold text-foreground tracking-tight">qor.so</span>
        <span class="text-[10px] px-1.5 py-0.5 rounded bg-foreground/5 font-mono">{{ config.appVersion }}</span>
        <span class="text-[10px]">&copy; {{ new Date().getFullYear() }}</span>
      </div>
      
      <div class="flex items-center gap-4 sm:gap-6 flex-wrap justify-center sm:justify-end">
        <router-link to="/about" class="text-[10px] font-medium hover:text-primary transition-colors">About</router-link>
        <router-link to="/faq" class="text-[10px] font-medium hover:text-primary transition-colors">FAQ</router-link>
        <router-link to="/terms" class="text-[10px] font-medium hover:text-primary transition-colors">Terms</router-link>
        <div class="h-4 w-px bg-border hidden sm:block"></div>
        <a href="https://github.com/yooltech/qor.so" target="_blank" class="text-[10px] font-medium hover:text-primary transition-colors flex items-center gap-1.5">
          <Github class="w-3.5 h-3.5" />
          GitHub
        </a>
        <div class="h-4 w-px bg-border hidden sm:block"></div>
        <p class="text-[10px] hidden sm:block">
          Built by <a href="https://github.com/yooltech" target="_blank" class="font-bold hover:text-primary transition-colors">Yooltech</a>
        </p>
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-secondary font-bold uppercase tracking-widest">Open Source</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Github } from 'lucide-vue-next';
import config from '../services/config';
</script>
