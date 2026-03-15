<template>
  <div v-if="!stats" class="flex justify-center py-8">
    <Loader2 class="w-5 h-5 animate-spin text-muted-foreground" />
  </div>
  <div v-else class="border-t">
    <div class="max-w-4xl mx-auto px-6 py-10">
      <p class="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-6">
        Platform Stats
      </p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <StatItem :icon="FileText" label="Notes + Files" :value="(stats.total_notes + stats.total_files).toLocaleString()" />
        <StatItem :icon="Eye" label="Total Views" :value="stats.total_views.toLocaleString()" />
        <StatItem :icon="HardDrive" label="Data Stored" :value="formatBytes(stats.total_bytes)" />
        <StatItem :icon="TrendingUp" label="Today" :value="stats.items_today.toLocaleString()" />
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FileText, Eye, HardDrive, TrendingUp, Loader2 } from 'lucide-vue-next';
import StatItem from './StatItem.vue';
import api from '../services/api';

const stats = ref(null);

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
};

onMounted(async () => {
  try {
    const response = await api.get('/stats');
    stats.value = response.data.data;
  } catch (err) {
    console.error('Failed to load stats', err);
    // Fallback to zeros on error
    stats.value = { total_notes: 0, total_files: 0, total_views: 0, total_bytes: 0, items_today: 0 };
  }
});
</script>
