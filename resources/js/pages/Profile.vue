<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Navbar -->
    <Navbar>
      <template #actions>
        <router-link
          to="/dashboard"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <LayoutDashboard class="w-4 h-4" />
          <span class="hidden sm:inline">Dashboard</span>
        </router-link>
      </template>
    </Navbar>

    <div class="max-w-lg mx-auto px-6 py-16 animate-fade-in">
      <h1 class="text-3xl font-bold text-foreground text-center mb-8">My Profile</h1>

      <div v-if="loading" class="flex justify-center py-10">
        <Loader2 class="w-8 h-8 animate-spin text-muted-foreground" />
      </div>

      <template v-else>
        <!-- Avatar -->
        <div class="flex justify-center mb-8">
          <div class="relative">
            <img
              v-if="user.avatar_url"
              :src="user.avatar_url"
              alt="Avatar"
              class="w-24 h-24 rounded-2xl object-cover border-2 border-border"
            />
            <div v-else class="w-24 h-24 rounded-2xl bg-accent flex items-center justify-center border-2 border-border">
              <UserIcon class="w-10 h-10 text-accent-foreground" />
            </div>
            <div class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Camera class="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <!-- Email (Editable) -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-foreground">Login Email</label>
              <span class="text-[10px] font-bold text-primary uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded">Critical</span>
            </div>
            <div class="relative group">
              <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                v-model="form.email"
                placeholder="Recovery email"
                class="w-full pl-11 pr-4 py-3.5 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm font-mono"
              />
            </div>
            <div class="mt-3 border border-yellow-500/20 bg-yellow-500/5 p-4 rounded-xl flex gap-3">
              <ShieldAlert class="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <p class="text-[11px] text-muted-foreground leading-relaxed">
                <strong class="text-yellow-500">Warning:</strong> This is your primary login method. If you change it, you must use the <em class="text-foreground">new email</em> to sign in next time. Keep it safe to avoid data loss.
              </p>
            </div>
          </div>

          <!-- Display Name -->
          <div>
            <label class="text-sm font-medium text-foreground mb-1.5 block">Display Name</label>
            <input
              type="text"
              v-model="form.display_name"
              placeholder="Your name"
              class="w-full px-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          <!-- Avatar URL -->
          <div>
            <label class="text-sm font-medium text-foreground mb-1.5 block">Avatar URL</label>
            <input
              type="url"
              v-model="form.avatar_url"
              placeholder="https://example.com/avatar.jpg"
              class="w-full px-4 py-3 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          <button
            @click="updateProfile"
            :disabled="updating"
            class="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Loader2 v-if="updating" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            Save Profile
          </button>
        </div>

        <p class="mt-8 text-center text-xs text-muted-foreground font-mono">
          Member since {{ new Date(user.created_at).toLocaleDateString() }}
        </p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FileText, Loader2, User as UserIcon, Save, Camera, LayoutDashboard, ShieldAlert, Mail } from 'lucide-vue-next';
import Navbar from '../components/Navbar.vue';
import api from '../services/api';

const user = ref(null);
const loading = ref(true);
const updating = ref(false);

const form = ref({
  display_name: '',
  avatar_url: ''
});

async function fetchUser() {
  try {
    const response = await api.get('/user');
    user.value = response.data.data;
    form.value.email = user.value.email || '';
    form.value.display_name = user.value.display_name || user.value.name || '';
    form.value.avatar_url = user.value.avatar_url || '';
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

import { useNotifications } from '../stores/useNotifications';
const toast = useNotifications();

async function updateProfile() {
  updating.value = true;
  try {
    const response = await api.put('/user/profile', form.value);
    user.value = response.data.data;
    toast.success('Profile updated!');
  } catch (err) {
    console.error(err);
    toast.error('Failed to update profile');
  } finally {
    updating.value = false;
  }
}

onMounted(fetchUser);
</script>
