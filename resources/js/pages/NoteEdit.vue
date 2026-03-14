<template>
  <div class="min-h-screen bg-background">
    <!-- Nav -->
    <Navbar>
      <template #actions>
        <router-link to="/" class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Plus class="w-4 h-4" />
          <span class="hidden sm:inline">New Note</span>
        </router-link>
      </template>
    </Navbar>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-32">
      <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
    </div>

    <!-- Forbidden -->
    <div v-else-if="forbidden" class="text-center py-32">
      <Lock class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <p class="text-xl font-semibold text-foreground">You can't edit this note</p>
      <p class="mt-2 text-muted-foreground">This note belongs to another user.</p>
      <router-link to="/" class="inline-block mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">
        Go Home
      </router-link>
    </div>

    <!-- Password protected (New Security) -->
    <div v-else-if="note && note.is_protected && !unlocked" class="max-w-md mx-auto text-center py-20 animate-fade-in">
      <div class="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6">
        <LockIcon class="w-7 h-7 text-accent-foreground" />
      </div>
      <p class="text-xl font-semibold text-foreground">This note is protected</p>
      <p class="mt-2 text-muted-foreground text-sm">Enter the password to edit this note.</p>
      <div v-if="unlockError" class="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-shake">
        {{ unlockError }}
      </div>
      <form @submit.prevent="handleUnlock" class="mt-4 flex gap-2 max-w-xs mx-auto">
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
          :disabled="verifyingUnlock || !passwordInput"
          class="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 disabled:opacity-50"
        >
          <Loader2 v-if="verifyingUnlock" class="w-4 h-4 animate-spin" />
          <template v-else>Unlock</template>
        </button>
      </form>
    </div>

    <div v-else-if="note" class="max-w-4xl mx-auto px-6 py-10">
      <NoteEditor
        :initial-title="note.title || ''"
        :initial-content="note.content || ''"
        :initial-format="note.format || 'text'"
        :initial-slug="note.slug || ''"
        :initial-password="unlocked ? passwordInput : ''"
        mode="edit"
        :saving="saving"
        @save="handleUpdate"
        @cancel="router.push(`/${note.slug || note.id}`)"
      />

      <!-- Delete Action -->
      <div class="mt-12 pt-8 border-t border-destructive/10">
        <div v-if="!confirmingDelete" class="flex items-center justify-between p-6 rounded-2xl bg-destructive/5 border border-destructive/10">
          <div>
            <h3 class="text-sm font-semibold text-destructive">Danger Zone</h3>
            <p class="text-xs text-muted-foreground mt-1">Once you delete a note, there is no going back. Please be certain.</p>
          </div>
          <button 
            @click="confirmingDelete = true"
            class="px-4 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all flex items-center gap-2"
          >
            <Trash2 class="w-4 h-4" />
            Delete Note
          </button>
        </div>
        
        <div v-else class="flex items-center justify-between p-6 rounded-2xl bg-destructive text-destructive-foreground animate-shake">
          <div>
            <h3 class="text-sm font-semibold">Are you absolutely sure?</h3>
            <p class="text-xs opacity-90 mt-1">This action is permanent and cannot be undone.</p>
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="confirmingDelete = false"
              class="px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
            <button 
              @click="handleDelete"
              :disabled="deleting"
              class="px-4 py-2 rounded-xl text-sm font-bold bg-white text-destructive hover:bg-white/90 transition-all flex items-center gap-2"
            >
              <Loader2 v-if="deleting" class="w-4 h-4 animate-spin" />
              <template v-else>Yes, Delete</template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Loader2, Lock as LockIcon, Plus, Trash2 } from 'lucide-vue-next';
import api from '../services/api';
import NoteEditor from '../components/NoteEditor.vue';
import Navbar from '../components/Navbar.vue';
import { useNotifications } from '../stores/useNotifications';

const route = useRoute();
const router = useRouter();
const toast = useNotifications();
const id = route.params.id;

const note = ref(null);
const loading = ref(true);
const saving = ref(false);
const forbidden = ref(false);
const unlocked = ref(false);
const passwordInput = ref('');
const verifyingUnlock = ref(false);
const unlockError = ref(null);
const confirmingDelete = ref(false);
const deleting = ref(false);

onMounted(async () => {
  try {
    const response = await api.get(`/notes/${id}`);
    note.value = response.data.data;
  } catch (err) {
    console.error(err);
    if (err.response?.status === 404) {
      router.push('/');
    }
  } finally {
    loading.value = false;
  }
});

async function handleUnlock() {
  unlockError.value = null;
  verifyingUnlock.value = true;
  try {
    const response = await api.get(`/notes/${id}`, {
      params: { password: passwordInput.value }
    });
    
    if (response.data.data.is_protected && !response.data.data.content) {
      unlockError.value = 'Incorrect password.';
    } else {
      note.value = response.data.data;
      unlocked.value = true;
      toast.success('Note unlocked for editing');
    }
  } catch (err) {
    console.error(err);
    unlockError.value = 'Incorrect password.';
  } finally {
    verifyingUnlock.value = false;
  }
}

async function handleUpdate(data) {
  saving.value = true;
  try {
    const response = await api.put(`/notes/${id}`, data);
    const updatedNote = response.data.data;
    toast.success('Note updated successfully!');
    router.push(`/${updatedNote.slug || updatedNote.id}`);
  } catch (err) {
    console.error(err);
    if (err.response?.status === 403) {
      forbidden.value = true;
    } else {
      toast.error(err.response?.data?.message || 'Failed to update note');
    }
  } finally {
    saving.value = false;
  }
}

async function handleDelete() {
  deleting.value = true;
  try {
    await api.delete(`/notes/${id}`);
    
    // Also remove from guest recents if present
    const recentNotes = JSON.parse(localStorage.getItem('recent_notes') || '[]');
    const filtered = recentNotes.filter(n => n.id !== id && n.slug !== note.value.slug);
    localStorage.setItem('recent_notes', JSON.stringify(filtered));
    
    toast.success('Note deleted permanently');
    router.push('/');
  } catch (err) {
    console.error(err);
    toast.error('Failed to delete note');
    confirmingDelete.value = false;
  } finally {
    deleting.value = false;
  }
}
</script>
