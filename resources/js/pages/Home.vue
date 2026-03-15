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
    <div v-if="isFileUploadEnabled()" class="max-w-4xl mx-auto px-6 mb-6">
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
    <div class="px-6 pb-1 flex-1 space-y-8">
      <div>
        <NoteEditor v-if="mode === 'note'" />
        <FileUploader v-else />
      </div>

      <!-- Recent Notes -->
      <div v-if="recentNotes.length > 0" class="max-w-4xl mx-auto animate-fade-in">
        <div class="flex items-center justify-between mb-4 border-b pb-2">
          <h2 class="text-sm font-semibold text-foreground flex items-center gap-2">
            <History class="w-4 h-4 text-primary" />
            Your Recent Notes
          </h2>
          <button @click="clearRecentNotes" class="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
            <Trash2 class="w-3 h-3" />
            Clear
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <router-link 
            v-for="note in recentNotes" 
            :key="note.id" 
            :to="`/${note.slug || note.id}`"
            class="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/50 transition-all group"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-primary">
                <FileText class="w-4 h-4" />
              </div>
              <div class="overflow-hidden">
                <p class="text-sm font-medium text-foreground truncate max-w-[150px]">{{ note.title || 'Untitled Note' }}</p>
                <p class="text-[10px] text-muted-foreground font-mono">/{{ note.slug || note.id.substring(0, 8) }}</p>
              </div>
            </div>
            <ArrowUpRight class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </router-link>
        </div>
      </div>

      <!-- Footer Stats -->
      <div class="max-w-4xl mx-auto">
        <PlatformStats />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  FileText, LayoutDashboard, LogIn, Upload, 
  ShieldCheck, Braces, Sun, Moon, History, Trash2, ArrowUpRight, Github
} from 'lucide-vue-next';
import NoteEditor from '../components/NoteEditor.vue';
import FileUploader from '../components/FileUploader.vue';
import PlatformStats from '../components/PlatformStats.vue';
import Navbar from '../components/Navbar.vue';
import api from '../services/api';
import { isFileUploadEnabled } from '../services/features';

const mode = ref('note');
const user = ref(null);
const isDark = ref(false);
const recentNotes = ref([]);

function loadRecentNotes() {
  recentNotes.value = JSON.parse(localStorage.getItem('recent_notes') || '[]');
}

function clearRecentNotes() {
  if (confirm('Clear your recent notes history?')) {
    localStorage.removeItem('recent_notes');
    recentNotes.value = [];
  }
}

onMounted(async () => {
  loadRecentNotes();
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
