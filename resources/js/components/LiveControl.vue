<template>
  <div class="relative">
    <button
      @click="showModal = true"
      class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
      :class="isLive ? 'bg-primary text-primary-foreground animate-pulse' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'"
    >
      <Radio v-if="isLive" class="w-4 h-4" />
      <Share2 v-else class="w-4 h-4" />
      <span>{{ isLive ? 'Live Sharing' : 'Go Live' }}</span>
    </button>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" @click="showModal = false"></div>
      
      <div class="relative w-full max-w-md bg-card border rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold flex items-center gap-2">
              <Radio v-if="isLive" class="w-5 h-5 text-primary" />
              Live Share Note
            </h3>
            <button @click="showModal = false" class="p-2 hover:bg-secondary rounded-full transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Live Toggle -->
          <div class="flex items-center justify-between p-4 rounded-xl bg-secondary/30 mb-6">
            <div>
              <p class="text-sm font-semibold">Enable Live Collaboration</p>
              <p class="text-xs text-muted-foreground">Allow others to scan and request access.</p>
            </div>
            <button 
              @click="toggleLive"
              :disabled="toggling"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              :class="isLive ? 'bg-primary' : 'bg-muted'"
            >
              <span 
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="isLive ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>

          <template v-if="isLive">
            <!-- QR Code Section -->
            <div class="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl mb-6 bg-white dark:bg-zinc-900">
              <qrcode-vue :value="shareUrl" :size="160" level="H" class="mb-4" />
              <p class="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
                {{ shareUrl }}
              </p>
            </div>

            <!-- Permission Mode -->
            <div class="mb-6">
              <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Default Access Mode</label>
              <div class="grid grid-cols-2 gap-2">
                <button 
                  @click="updateDefaultPermission('view')"
                  class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all"
                  :class="localPermission === 'view' ? 'bg-primary/10 border-primary text-primary font-bold' : 'hover:bg-secondary'"
                >
                  <Eye class="w-4 h-4" /> View
                </button>
                <button 
                  @click="updateDefaultPermission('edit')"
                  class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all"
                  :class="localPermission === 'edit' ? 'bg-primary/10 border-primary text-primary font-bold' : 'hover:bg-secondary'"
                >
                  <Edit3 class="w-4 h-4" /> Edit
                </button>
              </div>
            </div>

            <!-- Connected Devices -->
            <div v-if="connections.length > 0" class="space-y-3">
              <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Device Requests</label>
              <div v-for="conn in connections" :key="conn.id" class="flex items-center justify-between p-3 rounded-xl border bg-secondary/10">
                <div class="flex items-center gap-3">
                  <Smartphone class="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p class="text-xs font-semibold">{{ conn.device_name || 'Anonymous Device' }}</p>
                    <p class="text-[10px] text-muted-foreground uppercase tracking-widest">{{ conn.status }} • {{ conn.permissions }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  <template v-if="conn.status === 'pending'">
                    <button 
                      @click="updateConn(conn.id, 'denied')"
                      class="p-1.5 rounded-lg text-destructive hover:bg-destructive/10"
                    >
                      <X class="w-4 h-4" />
                    </button>
                    <button 
                      @click="updateConn(conn.id, 'allowed')"
                      class="p-1.5 rounded-lg bg-primary text-primary-foreground hover:brightness-110"
                    >
                      <Check class="w-4 h-4" />
                    </button>
                  </template>
                  <template v-else-if="conn.status === 'allowed'">
                    <button 
                      @click="updateConn(conn.id, 'allowed', conn.permissions === 'view' ? 'edit' : 'view')"
                      class="text-[10px] font-bold px-2 py-1 rounded bg-secondary hover:bg-muted"
                    >
                      {{ conn.permissions === 'view' ? 'Set Edit' : 'Set View' }}
                    </button>
                    <button 
                      @click="updateConn(conn.id, 'denied')"
                      class="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 ml-1"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { Radio, Share2, X, Eye, Edit3, Smartphone, Check, Trash2 } from 'lucide-vue-next';
import api from '../services/api';
import { useNotifications } from '../stores/useNotifications';

const props = defineProps({
  note: { type: Object, required: true }
});

const toast = useNotifications();
const showModal = ref(false);
const toggling = ref(false);
const isLive = ref(props.note.is_live);
const localPermission = ref(props.note.live_permission || 'view');
const connections = ref(props.note.connections || []);

const shareUrl = computed(() => window.location.origin + '/' + (props.note.slug || props.note.id));

async function toggleLive() {
  toggling.value = true;
  try {
    const response = await api.post(`/notes/${props.note.id}/toggle-live`, {
      is_live: !isLive.value,
      live_permission: localPermission.value
    });
    isLive.value = response.data.data.is_live;
    connections.value = response.data.data.connections || [];
    toast.success(isLive.value ? 'Live sharing enabled' : 'Live sharing disabled');
  } catch (err) {
    toast.error('Failed to toggle live mode');
  } finally {
    toggling.value = false;
  }
}

async function updateDefaultPermission(perm) {
  localPermission.value = perm;
  if (!isLive.value) return;
  
  try {
    await api.post(`/notes/${props.note.id}/toggle-live`, {
      is_live: true,
      live_permission: perm
    });
    toast.success(`Default permission set to ${perm}`);
  } catch (err) {
    toast.error('Failed to update permission');
  }
}

async function updateConn(connId, status, permissions = null) {
  try {
    const payload = { status };
    if (permissions) payload.permissions = permissions;
    
    await api.put(`/notes/${props.note.id}/connections/${connId}`, payload);
    
    // Refresh connections locally
    const response = await api.get(`/notes/${props.note.id}`);
    connections.value = response.data.data.connections || [];
    
    toast.success('Connection updated');
  } catch (err) {
    toast.error('Failed to update connection');
  }
}

// TODO: Listen for new connection requests via Echo
</script>
