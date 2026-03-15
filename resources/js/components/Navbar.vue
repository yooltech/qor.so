<template>
  <nav class="border-b transition-colors duration-300 bg-background">
    <div class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
      <router-link to="/" class="flex items-center gap-2.5 group">
        <div class="p-1 rounded-lg bg-emerald-500/10 transition-transform group-hover:scale-110">
          <img src="/chs/noteshare-express/logo.png" alt="qor.so" class="w-7 h-7 rounded-md object-cover" />
        </div>
        <span class="font-bold text-xl tracking-tight text-foreground">qor.so</span>
      </router-link>

      <div class="flex items-center gap-2">
        <!-- Theme Toggle -->
        <button
          @click="toggleTheme"
          class="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
          :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <Sun v-if="isDark" class="w-4 h-4 animate-in fade-in zoom-in duration-300" />
          <Moon v-else class="w-4 h-4 animate-in fade-in zoom-in duration-300" />
        </button>

        <!-- Slot for contextual actions -->
        <slot name="actions">
          <router-link
            v-if="user"
            to="/dashboard"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LayoutDashboard class="w-4 h-4" />
            <span class="hidden sm:inline">MyDesk</span>
          </router-link>
          <router-link
            v-else
            to="/login"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogIn class="w-4 h-4" />
            <span class="hidden sm:inline">Sign In</span>
          </router-link>
        </slot>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Sun, Moon, LayoutDashboard, LogIn } from 'lucide-vue-next';
import api from '../services/api';

const isDark = ref(false);
const user = ref(null);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

onMounted(async () => {
  // Initialize theme
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  } else {
    isDark.value = false;
    document.documentElement.classList.remove('dark');
  }

  // Initialize user
  const token = localStorage.getItem('auth_token');
  if (token) {
    try {
      const response = await api.get('/user');
      user.value = response.data.data;
    } catch (err) {
      console.error('Failed to fetch user', err);
      localStorage.removeItem('auth_token');
    }
  }
});
</script>
