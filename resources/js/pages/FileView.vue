<template>
  <div class="min-h-screen bg-background">
    <Navbar />

    <div class="px-6 py-12">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
      </div>

      <div v-else-if="error" class="text-center py-20 animate-fade-in">
        <p class="text-xl font-semibold text-foreground">File not found</p>
        <p class="mt-2 text-muted-foreground">This file may have been deleted, expired, or the link is invalid.</p>
        <router-link to="/" class="inline-block mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">
          Go Home
        </router-link>
      </div>

      <div v-else-if="file">
        <div v-if="isExpired" class="text-center py-20 animate-fade-in">
          <Clock class="w-10 h-10 mx-auto text-muted-foreground mb-4" />
          <p class="text-xl font-semibold text-foreground">File Expired</p>
          <p class="mt-2 text-muted-foreground">This file expired on {{ new Date(file.expires_at).toLocaleString() }}.</p>
          <router-link to="/" class="inline-block mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">
            Go Home
          </router-link>
        </div>

        <div v-else-if="isPasswordProtected" class="max-w-md mx-auto text-center py-20 animate-fade-in">
          <div class="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6">
            <Lock class="w-7 h-7 text-accent-foreground" />
          </div>
          <p class="text-xl font-semibold text-foreground">This file is protected</p>
          <p class="mt-2 text-muted-foreground text-sm">Enter the password to access this file.</p>
          <form @submit.prevent="handleUnlock" class="mt-6 flex gap-2 max-w-xs mx-auto">
            <input
              type="password"
              placeholder="Password"
              v-model="passwordInput"
              class="flex-1 px-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              autofocus
            />
            <button
              type="submit"
              :disabled="verifying || !passwordInput"
              class="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 disabled:opacity-50"
            >
              <Loader2 v-if="verifying" class="w-4 h-4 animate-spin" />
              <template v-else>Unlock</template>
            </button>
          </form>
        </div>

        <div v-else class="w-full max-w-4xl mx-auto animate-fade-in">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div class="flex items-center gap-3 flex-wrap">
              <div class="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <LucideImage v-if="isImage" class="w-5 h-5 text-accent-foreground" />
                <FileText v-else class="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p class="font-semibold text-foreground">{{ file.file_name }}</p>
                <div class="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{{ formatSize(file.file_size) }}</span>
                  <span>·</span>
                  <span class="flex items-center gap-1"><Eye class="w-3 h-3" /> {{ file.view_count || 0 }}</span>
                  <span v-if="file.expires_at">·</span>
                  <span v-if="file.expires_at">Expires {{ new Date(file.expires_at).toLocaleString() }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="copyLink"
                class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <Check v-if="copied" class="w-4 h-4" />
                <Copy v-else class="w-4 h-4" />
                <span class="hidden sm:inline">Link</span>
              </button>
              <button
                @click="handleDownload"
                class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <Download class="w-4 h-4" />
                <span class="hidden sm:inline">Download</span>
              </button>
              <button
                @click="handleDelete"
                :disabled="deleting"
                class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
              >
                <Trash2 class="w-4 h-4" />
                <span class="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

          <!-- Preview -->
          <div class="rounded-xl border bg-card overflow-hidden">
            <img v-if="isImage" :src="fileUrl" :alt="file.file_name" class="w-full max-h-[600px] object-contain bg-muted" />
            <iframe v-else-if="file.mime_type === 'application/pdf'" :src="fileUrl" class="w-full h-[600px]" :title="file.file_name"></iframe>
            <div v-else class="flex flex-col items-center justify-center py-20 text-center">
              <FileText class="w-16 h-16 text-muted-foreground mb-4" />
              <p class="text-foreground font-medium">{{ file.file_name }}</p>
              <p class="text-sm text-muted-foreground mt-1">{{ formatSize(file.file_size) }}</p>
              <button
                @click="handleDownload"
                class="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all"
              >
                <Download class="w-4 h-4" />
                Download File
              </button>
            </div>
          </div>

          <p class="mt-4 text-xs text-muted-foreground text-center font-mono">
            Uploaded {{ new Date(file.created_at).toLocaleString() }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  FileText, Loader2, Lock, Clock, Download, 
  Copy, Check, Trash2, Image as LucideImage, Eye 
} from 'lucide-vue-next';
import Navbar from '../components/Navbar.vue';
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const idOrSlug = route.params.idOrSlug;

const file = ref(null);
const loading = ref(true);
const error = ref(null);
const unlocked = ref(false);
const passwordInput = ref('');
const verifying = ref(false);
const copied = ref(false);
const deleting = ref(false);

const isPasswordProtected = computed(() => file.value?.password && !unlocked.value);
const isExpired = computed(() => file.value?.expires_at && new Date(file.value.expires_at) <= new Date());
const isImage = computed(() => file.value?.mime_type.startsWith('image/'));
const fileUrl = computed(() => file.value ? `/storage/${file.value.storage_path}` : '');

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

async function fetchFile() {
  loading.value = true;
  try {
    const response = await api.get(`/shared-files/${idOrSlug}`);
    file.value = response.data.data;
    
    // Auto-update URL to slug if accessed by ID
    if (file.value.slug && idOrSlug === file.value.id) {
      router.replace({ name: 'file-view', params: { idOrSlug: file.value.slug } });
    }
  } catch (err) {
    console.error(err);
    error.value = err;
  } finally {
    loading.value = false;
  }
}

async function handleUnlock() {
  verifying.value = true;
  try {
    const response = await api.get(`/files/${idOrSlug}`, {
      params: { password: passwordInput.value }
    });
    file.value = response.data.data;
    unlocked.value = true;
  } catch (err) {
    console.error(err);
    toast.error('Incorrect password');
  } finally {
    verifying.value = false;
  }
}

async function copyLink() {
  await navigator.clipboard.writeText(window.location.href);
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
}

function handleDownload() {
  const a = document.createElement('a');
  a.href = fileUrl.value;
  a.download = file.value?.file_name || 'download';
  a.target = '_blank';
  a.click();
}

async function handleDelete() {
  if (!confirm('Delete this file permanently?')) return;
  deleting.value = true;
  try {
    await api.delete(`/shared-files/${file.value.id}`);
    router.push('/');
  } catch (err) {
    console.error(err);
    alert('Failed to delete file');
  } finally {
    deleting.value = false;
  }
}

onMounted(fetchFile);
</script>
