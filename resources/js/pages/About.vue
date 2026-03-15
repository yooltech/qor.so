<template>
  <div class="min-h-screen bg-background flex flex-col">
    <Navbar />
    
    <main class="flex-1 px-6 py-20">
      <div class="max-w-3xl mx-auto space-y-12 animate-fade-in">
        <!-- Hero Section -->
        <div class="text-center space-y-4">
          <div class="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <img :src="config.asset('logo.png')" alt="qor.so" class="w-12 h-12 rounded-lg" />
          </div>
          <h1 class="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            About qor.so
          </h1>
          <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
            A fast, secure, and ephemeral note sharing platform designed for modern collaboration.
          </p>
        </div>

        <!-- Mission -->
        <div class="grid gap-8 sm:grid-cols-2">
          <div class="p-8 rounded-3xl bg-card border shadow-sm space-y-4">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Zap class="w-5 h-5" />
            </div>
            <h3 class="text-lg font-bold">Absolute Speed</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">
              No registration required. Just start typing and share instantly. Everything is optimized for a zero-friction experience.
            </p>
          </div>
          <div class="p-8 rounded-3xl bg-card border shadow-sm space-y-4">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <h3 class="text-lg font-bold">Secure Encryption</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">
              When you use password protection or an email account, your notes are fully encrypted. Your privacy is our priority.
            </p>
          </div>
        </div>

        <!-- Roadmap / Upcoming Features -->
        <div v-if="config.features.aboutRoadmap" class="space-y-8">
          <h2 class="text-2xl font-bold tracking-tight text-center">Developing the Ultimate Workspace</h2>
          <div class="grid gap-6 sm:grid-cols-3">
            <div class="p-6 rounded-2xl bg-card border shadow-sm space-y-3">
              <ListTodo class="w-6 h-6 text-primary" />
              <h3 class="font-bold">Todo Lists & Tasks</h3>
              <p class="text-xs text-muted-foreground">Manage your daily tasks and to-dos directly alongside your notes.</p>
            </div>
            <div class="p-6 rounded-2xl bg-card border shadow-sm space-y-3">
              <Presentation class="w-6 h-6 text-primary" />
              <h3 class="font-bold">Whiteboard</h3>
              <p class="text-xs text-muted-foreground">Visual collaboration with a real-time synchronized drawing canvas.</p>
            </div>
            <div class="p-6 rounded-2xl bg-card border shadow-sm space-y-3">
              <Video class="w-6 h-6 text-primary" />
              <h3 class="font-bold">Video Meeting + AI</h3>
              <p class="text-xs text-muted-foreground">High-quality video calls with AI-powered meeting summaries.</p>
            </div>
            <div class="p-6 rounded-2xl bg-card border shadow-sm space-y-3">
              <Bookmark class="w-6 h-6 text-primary" />
              <h3 class="font-bold">Bookmarks</h3>
              <p class="text-xs text-muted-foreground">Save and organize important links with rich meta previews.</p>
            </div>
            <div class="p-6 rounded-2xl bg-card border shadow-sm space-y-3">
              <FolderTree class="w-6 h-6 text-primary" />
              <h3 class="font-bold">Folder Management</h3>
              <p class="text-xs text-muted-foreground">Keep your workspace organized with nested folders and tags.</p>
            </div>
            <div class="p-6 rounded-2xl bg-card border shadow-sm space-y-3">
              <Smartphone class="w-6 h-6 text-primary" />
              <h3 class="font-bold">Mobile Apps</h3>
              <p class="text-xs text-muted-foreground">Native iOS and Android apps for productivity on the go.</p>
            </div>
          </div>
        </div>

        <!-- Contributors Section -->
        <div v-if="config.features.aboutTeam" class="space-y-8">
          <div class="text-center space-y-2">
            <h2 class="text-2xl font-bold tracking-tight">Meet the Team</h2>
            <p class="text-sm text-muted-foreground">The incredible people who help make qor.so better every day.</p>
          </div>
          
          <div class="flex flex-wrap justify-center gap-6">
            <div v-if="loadingContributors" class="flex items-center gap-2 text-muted-foreground animate-pulse">
              <Github class="w-4 h-4 animate-spin" />
              <span class="text-sm">Fetching team members...</span>
            </div>
            
            <a 
              v-for="contributor in contributors" 
              :key="contributor.id"
              :href="contributor.html_url"
              target="_blank"
              class="group relative flex flex-col items-center gap-3 p-4 rounded-2xl bg-card border shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
            >
              <img 
                :src="contributor.avatar_url" 
                :alt="contributor.login"
                class="w-16 h-16 rounded-full border-2 border-background shadow-sm transition-transform group-hover:scale-105"
              />
              <div class="text-center">
                <span class="block text-sm font-bold text-foreground">{{ contributor.login }}</span>
                <span class="block text-[10px] text-muted-foreground">{{ contributor.contributions }} contributions</span>
              </div>
              
              <!-- External Link Icon -->
              <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Github class="w-3 h-3 text-muted-foreground" />
              </div>
            </a>
          </div>

          <div v-if="config.features.aboutOpenSource" class="text-center">
            <a 
              href="https://github.com/yooltech/qor.so" 
              target="_blank"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <Github class="w-4 h-4" />
              Join the Community on GitHub
            </a>
          </div>
        </div>

        <!-- Technology -->
        <div v-if="config.features.aboutTech" class="space-y-8">
          <h2 class="text-2xl font-bold tracking-tight">The Technology</h2>
          <div class="prose prose-neutral dark:prose-invert max-w-none">
            <p>
              qor.so is built on a modern high-performance stack to ensure reliability and real-time capabilities:
            </p>
            <ul>
              <li><strong>Frontend:</strong> Vue 3, Vite, and Tailwind CSS 4 for a fluid, responsive UI.</li>
              <li><strong>Backend:</strong> Laravel for a robust and secure API foundation.</li>
              <li><strong>Real-time:</strong> Laravel Reverb for ultra-low latency WebSocket synchronization.</li>
              <li><strong>Storage:</strong> Ephemeral databases and file systems with automatic cleanup.</li>
            </ul>
          </div>
        </div>

        <!-- Open Source -->
        <div v-if="config.features.aboutOpenSource" class="p-8 rounded-3xl bg-primary text-primary-foreground space-y-6">
          <div class="flex items-center gap-3">
            <Github class="w-8 h-8" />
            <h2 class="text-2xl font-black tracking-tight">Open Source</h2>
          </div>
          <p class="text-lg opacity-90 leading-relaxed">
            We believe in transparency. qor.so is fully open source. You can audit the code, contribute to its development, or even host your own instance.
          </p>
          <div class="flex flex-wrap gap-4">
            <a href="https://github.com/yooltech/qor.so" target="_blank" class="px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-all flex items-center gap-2">
              <Github class="w-4 h-4" />
              View Repository
            </a>
            <a href="https://github.com/yooltech" target="_blank" class="px-6 py-3 rounded-xl bg-black/20 text-white font-bold hover:bg-black/30 transition-all flex items-center gap-2 border border-white/20">
              Built by Yooltech
            </a>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import { 
  Zap, 
  ShieldCheck, 
  Github, 
  ListTodo, 
  Presentation, 
  Video, 
  Bookmark, 
  FolderTree, 
  Smartphone 
} from 'lucide-vue-next';
import config from '../services/config';

const contributors = ref([]);
const loadingContributors = ref(true);

onMounted(async () => {
  try {
    const response = await fetch('https://api.github.com/repos/yooltech/qor.so/contributors');
    if (response.ok) {
      const data = await response.json();
      // Filter out bots
      contributors.value = data.filter(c => 
        c.type !== 'Bot'
      );
    }
  } catch (error) {
    console.error('Failed to fetch contributors:', error);
  } finally {
    loadingContributors.value = false;
  }
});
</script>
