<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Nav -->
    <Navbar />

    <!-- Hero -->
    <div class="max-w-4xl mx-auto px-6 pt-16 pb-8 text-center">
      <h1 class="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
        Save it. Share it.
        <span class="text-primary">Instantly.</span>
      </h1>
      <p class="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
        Paste text, JSON, or upload files — get a shareable link. No signup required.
      </p>
      
      <div v-if="user" class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
        <ShieldCheck class="w-4 h-4" />
        Your notes are encrypted at rest
      </div>
      <p v-else class="mt-3 text-xs text-muted-foreground">
        <router-link to="/login" class="text-primary hover:underline">Sign in</router-link> to encrypt your notes automatically
      </p>
    </div>

    <!-- Mode toggle -->
    <div class="max-w-4xl mx-auto px-6 mb-6">
      <div class="flex items-center gap-1 rounded-lg bg-secondary p-1 w-fit mx-auto">
        <button
          @click="mode = 'note'"
          :class="['flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all', mode === 'note' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']"
        >
          <Braces class="w-4 h-4" />
          Note
        </button>
        <button
          @click="mode = 'file'"
          :class="['flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all', mode === 'file' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']"
        >
          <Upload class="w-4 h-4" />
          File
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="px-6 pb-20 flex-1">
      <NoteEditor v-if="mode === 'note'" />
      <FileUploader v-else />
    </div>

    <!-- Footer Stats -->
    <PlatformStats />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  FileText, LayoutDashboard, LogIn, Upload, 
  ShieldCheck, Braces, Sun, Moon 
} from 'lucide-vue-next';
import NoteEditor from '../components/NoteEditor.vue';
import FileUploader from '../components/FileUploader.vue';
import PlatformStats from '../components/PlatformStats.vue';
import Navbar from '../components/Navbar.vue';
import api from '../services/api';

const mode = ref('note');
const user = ref(null);
const isDark = ref(false);

onMounted(async () => {
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
