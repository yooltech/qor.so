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

    <!-- Editor -->
    <div v-else-if="note" class="max-w-4xl mx-auto px-6 py-10">
      <NoteEditor
        :initial-title="note.title || ''"
        :initial-content="note.content || ''"
        :initial-format="note.format || 'text'"
        :initial-slug="note.slug || ''"
        mode="edit"
        :saving="saving"
        @save="handleUpdate"
        @cancel="router.push(`/${note.slug || note.id}`)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FileText, Loader2, Lock } from 'lucide-vue-next';
import api from '../services/api';
import NoteEditor from '../components/NoteEditor.vue';
import Navbar from '../components/Navbar.vue';
import { Plus } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const note    = ref(null);
const loading = ref(true);
const saving  = ref(false);
const forbidden = ref(false);

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

  async function handleUpdate(data) {
  saving.value = true;
  try {
    const response = await api.put(`/notes/${id}`, data);
    const updatedNote = response.data.data;
    router.push(`/${updatedNote.slug || updatedNote.id}`);
  } catch (err) {
    console.error(err);
    if (err.response?.status === 403) {
      forbidden.value = true;
    } else {
      alert(err.response?.data?.message || 'Failed to update note');
    }
  } finally {
    saving.value = false;
  }
}
</script>
