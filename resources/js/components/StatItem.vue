<template>
  <div class="text-center">
    <div class="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
      <component :is="icon" class="w-3.5 h-3.5" />
      <span class="text-xs font-medium">{{ label }}</span>
    </div>
    <p class="text-xl font-bold text-foreground">{{ value }}</p>
  </div>
</template>

<script setup>
defineProps({
  icon: Object,
  value: String,
  label: String
});
</script>
