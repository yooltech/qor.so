<template>
  <div class="min-h-screen bg-background">
    <!-- Nav -->
    <Navbar>
      <template #actions>
        <div class="flex items-center gap-2">
          <router-link to="/" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
            + New
          </router-link>
          <router-link
            v-if="canEdit"
            :to="`/notes/${note.id}/edit`"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Pencil class="w-4 h-4" />
            <span class="hidden sm:inline">Edit</span>
          </router-link>
          
          <!-- Live Control (Owner) -->
          <LiveControl v-if="isLiveEnabled() && canEdit && note" :note="note" />

          <!-- Live Status (Guest) -->
          <div v-if="isLiveEnabled() && !canEdit && note?.is_live" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest animate-pulse">
            <Radio class="w-3 h-3" />
            Live
          </div>
        </div>
      </template>
    </Navbar>

    <div class="px-6 py-12">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-20 animate-fade-in">
        <FileText class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p class="text-xl font-semibold text-foreground">Note not found</p>
        <p class="mt-2 text-muted-foreground">This note may have been deleted, expired, or the link is invalid.</p>
        <router-link to="/" class="inline-block mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">
          Go Home
        </router-link>
      </div>

      <!-- Note loaded -->
      <div v-else-if="note" class="w-full max-w-4xl mx-auto">

        <!-- Expired -->
        <div v-if="isExpired" class="text-center py-20 animate-fade-in">
          <Clock class="w-10 h-10 mx-auto text-muted-foreground mb-4" />
          <p class="text-xl font-semibold text-foreground">Note Expired</p>
          <p class="mt-2 text-muted-foreground">This note expired on {{ new Date(note.expires_at).toLocaleString() }}.</p>
          <router-link to="/" class="inline-block mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">
            Go Home
          </router-link>
        </div>

        <!-- Password protected -->
        <div v-else-if="isPasswordProtected" class="max-w-md mx-auto text-center py-20 animate-fade-in">
          <div class="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6">
            <Lock class="w-7 h-7 text-accent-foreground" />
          </div>
          <p class="text-xl font-semibold text-foreground">This note is protected</p>
          <p class="mt-2 text-muted-foreground text-sm">Enter the password to view this note.</p>
          <div v-if="unlockError" class="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-shake">
            {{ unlockError }}
          </div>
          <form @submit.prevent="handleUnlock" class="mt-2 flex gap-2 max-w-xs mx-auto">
            <input
              type="password"
              placeholder="Password"
              v-model="passwordInput"
              class="flex-1 px-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              :class="{ 'border-destructive': unlockError }"
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

        <!-- Note content -->
        <div v-else class="animate-fade-in">
        <!-- Note card -->
        <div class="rounded-xl border bg-card overflow-hidden shadow-sm animate-fade-in">
          <!-- Action bar -->
          <div class="px-6 py-3 border-b bg-secondary/10 flex items-center justify-between gap-4 flex-wrap">
            <div class="flex items-center gap-2 text-[10px] text-muted-foreground  tracking-widest font-bold">
              <span v-if="note.expires_at" class="flex items-center gap-1 text-primary uppercase">
                <Clock class="w-3 h-3" /> Expires {{ new Date(note.expires_at).toLocaleDateString() }}
              </span>
              <span class="font-mono ">{{ note.title }}</span>
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="copyLink"
                class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                title="Copy Link"
              >
                <Check v-if="copied" class="w-4 h-4 text-primary" />
                <Copy v-else class="w-4 h-4" />
              </button>
              <button
                @click="copyContent"
                class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                title="Copy Content"
              >
                <ClipboardCopy class="w-4 h-4" />
              </button>
              <router-link
                v-if="canEdit"
                :to="`/notes/${note.id}/edit`"
                class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                title="Edit"
              >
                <Pencil class="w-4 h-4" />
              </router-link>
            </div>
          </div>

            <!-- Content: HTML rich text -->
            <div
              v-if="note.format === 'html' || note.format === 'text'"
              class="prose prose-neutral dark:prose-invert max-w-none px-8 py-6 text-foreground leading-7 tiptap"
              v-html="cleanedContent"
            />

            <!-- Content: JSON -->
            <div v-else-if="note.format === 'json'" class="flex">
              <div class="select-none py-4 pr-2 pl-4 text-right border-r bg-secondary/30 min-w-[3.5rem]">
                <div v-for="i in jsonLineCount" :key="i" class="text-xs leading-6 text-muted-foreground font-mono">{{ i }}</div>
              </div>
              <pre class="flex-1 p-4 font-mono text-sm leading-6 text-foreground overflow-x-auto whitespace-pre-wrap">{{ cleanedContent }}</pre>
            </div>

            <!-- Fallback -->
            <div v-else class="px-8 py-6 text-sm leading-7 text-foreground whitespace-pre-wrap">{{ cleanedContent }}</div>
          </div>

          <!-- Join Live Overlay (for guests on live notes) -->
          <div v-if="isLiveEnabled() && !canEdit && note?.is_live && !isAllowed" class="mt-6 p-8 bg-card border border-primary/20 rounded-2xl text-center shadow-lg animate-fade-in">
            <Smartphone class="w-10 h-10 mx-auto text-primary mb-4" />
            <h3 class="text-lg font-bold">Join Live Session</h3>
            <p class="text-sm text-muted-foreground mt-2 mb-6">This note is being shared live. Request access to see real-time updates.</p>
            
            <button 
              @click="joinLive"
              :disabled="joining"
              class="w-full max-w-xs mx-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Loader2 v-if="joining" class="w-4 h-4 animate-spin" />
              <span>Request Access</span>
            </button>
            <p v-if="joinStatus === 'pending'" class="mt-4 text-xs font-semibold text-primary animate-pulse">
              Waiting for owner to allow you...
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { FileText, Loader2, Lock, Clock, Copy, Check, ClipboardCopy, Pencil, Radio, Smartphone } from 'lucide-vue-next';
import api from '../services/api';
import Navbar from '../components/Navbar.vue';
import LiveControl from '../components/LiveControl.vue';
import echo from '../services/echo';
import { useNotifications } from '../stores/useNotifications';
import { isLiveEnabled } from '../services/features';

const route = useRoute();
const idOrSlug = route.params.idOrSlug;

const isLoggedIn = computed(() => !!localStorage.getItem('auth_token'));
const currentUserId = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('auth_user') || 'null');
    return user?.id ?? null;
  } catch { return null; }
});
const note = ref(null);
const loading = ref(true);
const error = ref(null);
const unlocked = ref(false);
const passwordInput = ref('');
const verifying = ref(false);
const copied = ref(false);
const unlockError = ref(null);
const toast = useNotifications();

const deviceId = ref(localStorage.getItem('device_id') || Math.random().toString(36).substring(2, 11));
if (!localStorage.getItem('device_id')) localStorage.setItem('device_id', deviceId.value);

const joining = ref(false);
const joinStatus = ref('none'); // none, pending, allowed
const isAllowed = computed(() => canEdit.value || joinStatus.value === 'allowed');

const isPasswordProtected = computed(() => note.value?.is_protected && !unlocked.value);
const isExpired = computed(() => note.value?.expires_at && new Date(note.value.expires_at) <= new Date());
const jsonLineCount = computed(() => (note.value?.content || '').split('\n').length);

const cleanedContent = computed(() => {
  if (!note.value || !note.value.content) return '';
  let content = note.value.content;
  
  if (note.value.title) {
    // Robust cleaning: Strip title from beginning of content
    const escapedTitle = note.value.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const titleRegex = new RegExp(`^\\s*(<[^>]+>)*\\s*${escapedTitle}\\s*(<\\/[^>]+>)*`, 'i');
    
    if (titleRegex.test(content)) {
      content = content.replace(titleRegex, '').trim();
      // Also strip common leading formatting tags that might follow the title
      content = content.replace(/^(<br>|<p>&nbsp;<\/p>|<\/h[1-6]>|<p><\/p>)/i, '').trim();
    }
  }
  return content;
});

// Anyone can edit a guest note (no owner); only the owner can edit their own note
const canEdit = computed(() => {
  if (!note.value) return false;
  if (!note.value.user_id) return true;          // no owner — anyone can edit
  return currentUserId.value === note.value.user_id; // owner only
});

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

async function fetchNote() {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get(`/notes/${idOrSlug}`);
    note.value = response.data.data;
  } catch (err) {
    console.error(err);
    error.value = err;
  } finally {
    loading.value = false;
    if (note.value?.is_live) setupEcho();
  }
}

function setupEcho() {
  if (!note.value) return;
  
  echo.channel(`note.${note.value.id}`)
    .listen('.updated', (e) => {
      console.log('Real-time update received', e);
      // Removed deviceId check here so viewers always see updates, even in same browser tabs
      note.value.content = e.content;
    });

  // Also listen for permission updates if we are in pending state
  if (joinStatus.value === 'pending') {
    // This could also be done via polling for simplicity in a guest environment 
    // but better if we had a per-device private channel.
    // For now, let's poll every 5 seconds if pending.
    const poll = setInterval(async () => {
       if (joinStatus.value !== 'pending') { clearInterval(poll); return; }
       try {
         const resp = await api.get(`/notes/${idOrSlug}`);
         const conn = resp.data.data.connections?.find(c => c.device_id === deviceId.value);
         if (conn?.status === 'allowed') {
           joinStatus.value = 'allowed';
           toast.success('Access granted! Content is now syncing live.');
           clearInterval(poll);
         }
       } catch {}
    }, 5000);
  }
}

async function joinLive() {
  joining.value = true;
  try {
    const resp = await api.post(`/notes/${note.value.id}/join-live`, {
      device_id: deviceId.value,
      device_name: navigator.userAgent.substring(0, 30) // Simple name
    });
    joinStatus.value = 'pending';
    toast.success('Request sent to owner');
  } catch (err) {
    toast.error('Failed to send request');
  } finally {
    joining.value = false;
  }
}

onUnmounted(() => {
  if (note.value) echo.leave(`note.${note.value.id}`);
});

async function handleUnlock() {
  unlockError.value = null; // Clear prev error
  verifying.value = true;
  try {
    const response = await api.get(`/notes/${idOrSlug}`, {
      params: { password: passwordInput.value }
    });

    // If backend returns data but content is null, and it's protected, it means it's still locked
    if (response.data.data.is_protected && !response.data.data.content) {
      unlockError.value = 'Incorrect password. Please try again.';
      passwordInput.value = '';
    } else {
      note.value = response.data.data;
      unlocked.value = true;
    }
  } catch (err) {
    console.error(err);
    if (err.response?.status === 401) {
      unlockError.value = 'Incorrect password. Please try again.';
    } else {
      unlockError.value = err.response?.data?.message || 'Failed to unlock note';
    }
    passwordInput.value = '';
  } finally {
    verifying.value = false;
  }
}

async function copyLink() {
  await navigator.clipboard.writeText(window.location.href);
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
}

async function copyContent() {
  const text = note.value?.content || '';
  const plain = text.replace(/<[^>]*>/g, ''); // strip HTML tags
  await navigator.clipboard.writeText(plain);
}

watch(() => note.value?.is_live, (val) => {
  if (val) setupEcho();
  else if (note.value) echo.leave(`note.${note.value.id}`);
});

onMounted(fetchNote);
</script>
