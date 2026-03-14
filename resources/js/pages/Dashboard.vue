<template>
  <div class="min-h-screen bg-background">
    <Navbar>
      <template #actions>
        <div class="flex items-center gap-2">
          <router-link
            to="/profile"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <User class="w-4 h-4" />
            <span class="hidden sm:inline">Profile</span>
          </router-link>
          <router-link
            to="/"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Plus class="w-4 h-4" />
            <span class="hidden sm:inline">New Note</span>
          </router-link>
          <button
            @click="handleSignOut"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut class="w-4 h-4" />
            <span class="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </template>
    </Navbar>

    <div class="max-w-5xl mx-auto px-6 py-10 animate-fade-in">
      <div v-if="loadingUser" class="flex justify-center py-20">
        <Loader2 class="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
      <template v-else>
        <h1 class="text-3xl font-bold text-foreground">Dashboard</h1>
        <p class="mt-1 text-muted-foreground text-sm">
          {{ notes.length }} note{{ notes.length !== 1 ? "s" : "" }} · {{ files.length }} file{{ files.length !== 1 ? "s" : "" }}
        </p>

        <!-- Search -->
        <div class="mt-6 relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes and files..."
            v-model="search"
            class="w-full pl-10 pr-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        <!-- Custom Tabs -->
        <div class="mt-6">
          <div class="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg w-fit mb-6">
            <button
              @click="activeTab = 'notes'"
              :class="['flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all', activeTab === 'notes' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']"
            >
              <FileText class="w-4 h-4" />
              Notes ({{ notes.length }})
            </button>
            <button
              @click="activeTab = 'files'"
              :class="['flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all', activeTab === 'files' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']"
            >
              <Upload class="w-4 h-4" />
              Files ({{ files.length }})
            </button>
          </div>

          <!-- Notes Tab Content -->
          <div v-if="activeTab === 'notes'">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div class="rounded-xl border bg-card p-4">
                <div class="flex items-center gap-2 text-muted-foreground mb-1">
                  <FileText class="w-4 h-4" />
                  <span class="text-xs font-medium">Total Notes</span>
                </div>
                <p class="text-2xl font-bold text-foreground">{{ notes.length }}</p>
              </div>
              <div class="rounded-xl border bg-card p-4">
                <div class="flex items-center gap-2 text-muted-foreground mb-1">
                  <Eye class="w-4 h-4" />
                  <span class="text-xs font-medium">Total Views</span>
                </div>
                <p class="text-2xl font-bold text-foreground">{{ totalNoteViews }}</p>
              </div>
              <div class="rounded-xl border bg-card p-4">
                <div class="flex items-center gap-2 text-muted-foreground mb-1">
                  <HardDrive class="w-4 h-4" />
                  <span class="text-xs font-medium">Storage Used</span>
                </div>
                <p class="text-2xl font-bold text-foreground">{{ formatBytes(totalNoteBytes) }}</p>
              </div>
              <div class="rounded-xl border bg-card p-4">
                <div class="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp class="w-4 h-4" />
                  <span class="text-xs font-medium">Most Viewed</span>
                </div>
                <p class="text-2xl font-bold text-foreground">{{ maxNoteViews }}</p>
              </div>
            </div>

            <div v-if="notesLoading" class="flex justify-center py-20">
              <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
            <div v-else-if="filteredNotes.length === 0" class="text-center py-20">
              <p class="text-muted-foreground">
                {{ search ? "No notes match your search" : "No notes yet" }}
              </p>
              <router-link
                v-if="!search"
                to="/"
                class="inline-block mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
              >
                Create Your First Note
              </router-link>
            </div>
            <div v-else class="space-y-3">
              <div v-for="note in filteredNotes" :key="note.id" class="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                      <span class="px-2 py-0.5 rounded bg-accent text-accent-foreground text-xs font-semibold uppercase">
                        {{ note.format }}
                      </span>
                      <span class="text-xs text-muted-foreground font-mono">
                        {{ note.size_bytes.toLocaleString() }} bytes
                      </span>
                      <span class="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        <Eye class="w-3 h-3" />
                        {{ (note.view_count || 0).toLocaleString() }}
                      </span>
                      <span v-if="note.slug" class="text-xs text-primary font-mono">/{{ note.slug }}</span>
                    </div>
                    <pre class="font-mono text-sm text-foreground truncate max-w-full">
                      {{ note.content.slice(0, 120) }}{{ note.content.length > 120 ? "..." : "" }}
                    </pre>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <router-link
                      :to="`/${note.slug || note.id}`"
                      class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="View"
                    >
                      <ExternalLink class="w-4 h-4" />
                    </router-link>
                    <button
                      @click="deleteNote(note.id)"
                      class="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Files Tab Content -->
          <div v-if="activeTab === 'files'">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div class="rounded-xl border bg-card p-4">
                <div class="flex items-center gap-2 text-muted-foreground mb-1">
                  <File class="w-4 h-4" />
                  <span class="text-xs font-medium">Total Files</span>
                </div>
                <p class="text-2xl font-bold text-foreground">{{ files.length }}</p>
              </div>
              <div class="rounded-xl border bg-card p-4">
                <div class="flex items-center gap-2 text-muted-foreground mb-1">
                  <Eye class="w-4 h-4" />
                  <span class="text-xs font-medium">Total Views</span>
                </div>
                <p class="text-2xl font-bold text-foreground">{{ totalFileViews }}</p>
              </div>
              <div class="rounded-xl border bg-card p-4">
                <div class="flex items-center gap-2 text-muted-foreground mb-1">
                  <HardDrive class="w-4 h-4" />
                  <span class="text-xs font-medium">Storage Used</span>
                </div>
                <p class="text-2xl font-bold text-foreground">{{ formatBytes(totalFileBytes) }}</p>
              </div>
              <div class="rounded-xl border bg-card p-4">
                <div class="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp class="w-4 h-4" />
                  <span class="text-xs font-medium">Largest File</span>
                </div>
                <p class="text-2xl font-bold text-foreground">{{ maxFileSize }}</p>
              </div>
            </div>

            <div v-if="filesLoading" class="flex justify-center py-20">
              <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
            <div v-else-if="filteredFiles.length === 0" class="text-center py-20">
              <p class="text-muted-foreground">
                {{ search ? "No files match your search" : "No files uploaded yet" }}
              </p>
              <router-link
                v-if="!search"
                to="/"
                class="inline-block mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
              >
                Upload Your First File
              </router-link>
            </div>
            <div v-else class="space-y-3">
              <div v-for="file in filteredFiles" :key="file.id" class="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                      <File class="w-4 h-4 text-muted-foreground" />
                      <span class="text-sm font-medium text-foreground truncate">
                        {{ file.file_name }}
                      </span>
                      <span v-if="file.slug" class="text-xs text-primary font-mono">/{{ file.slug }}</span>
                    </div>
                    <div class="flex items-center gap-3 mt-1 flex-wrap">
                      <span class="px-2 py-0.5 rounded bg-accent text-accent-foreground text-xs font-semibold uppercase">
                        {{ file.mime_type.split('/').pop() }}
                      </span>
                      <span class="text-xs text-muted-foreground font-mono">
                        {{ formatBytes(file.file_size) }}
                      </span>
                      <span class="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        <Eye class="w-3 h-3" />
                        {{ (file.view_count || 0).toLocaleString() }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <router-link
                      :to="`/file/${file.slug || file.id}`"
                      class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="View"
                    >
                      <ExternalLink class="w-4 h-4" />
                    </router-link>
                    <button
                      @click="deleteFile(file.id)"
                      class="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  FileText, Search, Trash2, ExternalLink, Loader2, LogOut, Plus,
  Eye, HardDrive, TrendingUp, User, Upload, File
} from 'lucide-vue-next';
import api from '../services/api';
import Navbar from '../components/Navbar.vue';

const router = useRouter();
const loadingUser = ref(true);
const notesLoading = ref(true);
const filesLoading = ref(true);
const notes = ref([]);
const files = ref([]);
const search = ref('');
const activeTab = ref('notes');

const totalNoteViews = computed(() => notes.value.reduce((sum, n) => sum + (n.view_count || 0), 0).toLocaleString());
const totalNoteBytes = computed(() => notes.value.reduce((sum, n) => sum + n.size_bytes, 0));
const maxNoteViews = computed(() => notes.value.length > 0 ? Math.max(...notes.value.map(n => n.view_count || 0)).toLocaleString() : "0");

const totalFileViews = computed(() => files.value.reduce((sum, f) => sum + (f.view_count || 0), 0).toLocaleString());
const totalFileBytes = computed(() => files.value.reduce((sum, f) => sum + (f.file_size || 0), 0));
const maxFileSize = computed(() => files.value.length > 0 ? formatBytes(Math.max(...files.value.map(f => f.file_size || 0))) : "0 B");

const filteredNotes = computed(() => notes.value.filter(n => 
  n.content.toLowerCase().includes(search.value.toLowerCase()) || 
  (n.title && n.title.toLowerCase().includes(search.value.toLowerCase()))
));

const filteredFiles = computed(() => files.value.filter(f => 
  f.file_name.toLowerCase().includes(search.value.toLowerCase())
));

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

async function fetchData() {
  try {
    const [notesRes, filesRes] = await Promise.all([
      api.get('/notes'),
      api.get('/shared-files')
    ]);
    notes.value = notesRes.data.data;
    files.value = filesRes.data.data;
  } catch (err) {
    console.error(err);
  } finally {
    notesLoading.value = false;
    filesLoading.value = false;
    loadingUser.value = false;
  }
}

async function handleSignOut() {
  try {
    await api.post('/logout');
    localStorage.removeItem('auth_token');
    router.push('/');
  } catch (err) {
    console.error(err);
    localStorage.removeItem('auth_token');
    router.push('/');
  }
}

import { useNotifications } from '../stores/useNotifications';
const toast = useNotifications();

async function deleteNote(id) {
  if (!confirm('Are you sure you want to delete this note?')) return;
  try {
    await api.delete(`/notes/${id}`);
    notes.value = notes.value.filter(n => n.id !== id);
    toast.success('Note deleted');
  } catch (err) {
    console.error(err);
    toast.error('Failed to delete note');
  }
}

async function deleteFile(id) {
  if (!confirm('Are you sure you want to delete this file?')) return;
  try {
    await api.delete(`/files/${id}`);
    files.value = files.value.filter(f => f.id !== id);
    toast.success('File deleted');
  } catch (err) {
    console.error(err);
    toast.error('Failed to delete file');
  }
}

onMounted(fetchData);
</script>
