<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
    <TransitionGroup 
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-for="n in notifications" 
        :key="n.id"
        class="pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border bg-card shadow-xl border-border/50 backdrop-blur-md animate-in fade-in slide-in-from-right-4"
        :class="{
          'border-emerald-500/30 bg-emerald-50/90 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300': n.type === 'success',
          'border-red-500/30 bg-red-50/90 text-red-900 dark:bg-red-950/40 dark:text-red-300': n.type === 'error',
          'border-primary/30 bg-accent/90 text-accent-foreground': n.type === 'info'
        }"
      >
        <div class="flex items-center gap-3">
          <CheckCircle2 v-if="n.type === 'success'" class="w-5 h-5 text-emerald-500" />
          <AlertCircle v-else-if="n.type === 'error'" class="w-5 h-5 text-red-500" />
          <Info v-else class="w-5 h-5 text-primary" />
          <span class="text-sm font-semibold">{{ n.message }}</span>
        </div>
        <button 
          @click.stop="remove(n.id)" 
          class="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
          title="Close"
        >
          <X class="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useNotifications } from '../stores/useNotifications';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next';

const { notifications, remove } = useNotifications();
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>
