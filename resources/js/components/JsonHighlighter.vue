<template>
  <pre
    class="font-mono text-sm leading-6 text-foreground whitespace-pre-wrap break-words"
    v-html="highlighted"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  content: String
});

const highlighted = computed(() => {
  let formatted;
  try {
    formatted = JSON.stringify(JSON.parse(props.content), null, 2);
  } catch {
    formatted = props.content;
  }

  // Simple syntax highlighting
  return formatted.replace(
    /("(?:\\.|[^"\\])*")\s*:/g,
    '<span class="text-accent-foreground font-semibold">$1</span>:'
  ).replace(
    /:\s*("(?:\\.|[^"\\])*")/g,
    ': <span class="text-primary">$1</span>'
  ).replace(
    /:\s*(true|false|null)\b/g,
    ': <span class="text-destructive">$1</span>'
  ).replace(
    /:\s*(-?\d+\.?\d*)/g,
    ': <span class="text-primary">$1</span>'
  );
});
</script>
