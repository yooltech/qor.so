<template>
  <div class="w-full max-w-4xl mx-auto animate-fade-in">

    <!-- Top bar: Text/JSON toggle + Options + Stats -->
    <div class="flex items-center justify-between mb-3 flex-wrap gap-3">
      <div class="flex items-center gap-1 rounded-lg bg-secondary p-1">
        <button
          @click="setFormat('text')"
          :class="['flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all', (format === 'text' || format === 'html') ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']"
        >
          <FileText class="w-4 h-4" />
          Text
        </button>
        <button
          @click="setFormat('json')"
          :class="['flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all', format === 'json' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground']"
        >
          <Braces class="w-4 h-4" />
          JSON
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="showOptions = !showOptions; showLiveOptions = false"
          :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all border', (showOptions || password || expiresIn || slug) ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground hover:text-foreground border-transparent']"
        >
          <Settings2 class="w-3.5 h-3.5" />
          Options
        </button>
        <button
          v-if="isLiveEnabled()"
          @click="showLiveOptions = !showLiveOptions; showOptions = false"
          :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all border', (showLiveOptions || isLive) ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground hover:text-foreground border-transparent']"
        >
          <Radio class="w-3.5 h-3.5" />
          Live
        </button>
        <span class="hidden sm:inline w-px h-4 bg-border mx-1" />
        <span class="text-xs text-muted-foreground font-mono">{{ charCount }} chars · {{ lineCount }} lines</span>
      </div>
    </div>

    <!-- Options Panel -->
    <div v-if="showOptions" class="mb-3 rounded-xl border bg-card p-4 space-y-4 animate-fade-in shadow-sm">
      <div>
        <label class="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <Link2 class="w-3.5 h-3.5" /> Custom URL Slug
        </label>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground font-mono">/</span>
          <div class="relative flex-1">
            <input type="text" placeholder="my-note" v-model="slug"
              @input="slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '')"
              class="w-full px-3 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring" 
              :class="{'border-green-500/50': slugStatus === 'available', 'border-red-500/50': slugStatus === 'taken'}"
            />
            <!-- Availability Indicator -->
            <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
              <Loader2 v-if="slugStatus === 'checking'" class="w-3 h-3 animate-spin text-muted-foreground" />
              <Check v-else-if="slugStatus === 'available'" class="w-3.5 h-3.5 text-green-500" />
              <X v-else-if="slugStatus === 'taken'" class="w-3.5 h-3.5 text-red-500" />
            </div>
          </div>
          <button 
            type="button"
            @click="slug = generateRandomSlug()"
            class="p-2 rounded-lg border bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            title="Generate Random Slug"
          >
            <Dices class="w-4 h-4" />
          </button>
        </div>
        
        <!-- Suggestions -->
        <div v-if="slugStatus === 'taken' && slugSuggestions.length > 0" class="mt-2 animate-fade-in">
          <p class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1.5">Suggestions</p>
          <div class="flex flex-wrap gap-1.5">
            <button 
              v-for="s in slugSuggestions" 
              :key="s" 
              @click="slug = s"
              class="px-2 py-0.5 rounded border bg-secondary/50 text-[10px] font-mono hover:bg-primary/10 hover:border-primary/30 transition-all"
            >
              {{ s }}
            </button>
          </div>
        </div>
        <p class="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
          <Check v-if="slugStatus === 'available'" class="w-3 h-3 text-green-500" />
          <X v-else-if="slugStatus === 'taken'" class="w-3 h-3 text-red-500" />
          {{ slugStatus === 'available' ? 'Slug is available' : slugStatus === 'taken' ? 'Slug already taken' : 'Leave empty for an auto-generated ID' }}
        </p>
      </div>
      <div>
        <label class="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <Lock class="w-3.5 h-3.5" /> Password Protection
        </label>
        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <input :type="showPassword ? 'text' : 'password'" placeholder="Leave empty for no password" v-model="password"
              class="w-full px-3 py-2 pr-10 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <button 
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Eye v-if="!showPassword" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
          <button v-if="password" @click="password = ''" class="px-3 py-2 rounded-lg bg-secondary text-xs font-medium hover:bg-secondary/80">
            Clear
          </button>
        </div>
        <p v-if="props.initialPassword && !password" class="text-xs text-red-500 mt-1">Note: This will remove the password.</p>
      </div>
      <div>
        <label class="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <Clock class="w-3.5 h-3.5" /> Expiration
        </label>
        <div class="flex flex-wrap gap-2">
          <button v-for="opt in EXPIRY_OPTIONS" :key="opt.label" @click="expiresIn = opt.value"
            type="button"
            :class="['px-3 py-1.5 rounded-lg text-sm font-medium transition-all', expiresIn === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80']">
            {{ opt.label }}
          </button>
        </div>
        </div>
    </div>

    <!-- Live Share Panel -->
    <div v-if="isLiveEnabled() && showLiveOptions" class="mb-3 rounded-xl border bg-card p-4 space-y-4 animate-fade-in shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-primary">
          <Radio class="w-4 h-4 animate-pulse" v-if="isLive" />
          <Radio class="w-4 h-4" v-else />
          <span class="text-sm font-bold uppercase tracking-wider">Live Sharing Control</span>
        </div>
        <button 
          type="button"
          @click="isLive = !isLive"
          class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
          :class="isLive ? 'bg-primary' : 'bg-muted'"
        >
          <span 
            class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm"
            :class="isLive ? 'translate-x-5' : 'translate-x-0.5'"
          />
        </button>
      </div>
      
      <div v-if="isLive" class="space-y-4 animate-fade-in">
        <div>
          <label class="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Collaboration Permissions</label>
          <div class="grid grid-cols-2 gap-2">
            <button 
              type="button"
              @click="livePermission = 'view'"
              class="px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-2"
              :class="livePermission === 'view' ? 'bg-primary/10 border-primary text-primary font-bold' : 'hover:bg-secondary bg-background'"
            >
              <Eye class="w-3.5 h-3.5" /> View Only
            </button>
            <button 
              type="button"
              @click="livePermission = 'edit'"
              class="px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-2"
              :class="livePermission === 'edit' ? 'bg-primary/10 border-primary text-primary font-bold' : 'hover:bg-secondary bg-background'"
            >
              <CheckSquare class="w-3.5 h-3.5" /> Allow Edit
            </button>
          </div>
        </div>

        <!-- Live Share Info / QR Code -->
        <div v-if="slug || props.initialId" class="p-4 rounded-xl bg-secondary/30 border space-y-4 animate-fade-in">
          <div class="flex items-start gap-4">
            <div class="p-2.5 bg-white rounded-xl shadow-sm border shrink-0">
               <QrcodeVue :value="qrUrl" :size="90" level="H" render-as="svg" />
            </div>
            <div class="flex-1 min-w-0 flex flex-col justify-center py-1">
              <p class="text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Link2 class="w-3 h-3" /> Share Invitation
              </p>
              <div class="flex items-center gap-2 w-full">
                <div class="flex-1 px-2 py-1.5 rounded border bg-background font-mono text-[10px] text-muted-foreground truncate select-all">
                  {{ shareUrl }}
                </div>
                <button @click="copyShareLink" class="p-2 hover:bg-primary/20 bg-primary/10 text-primary rounded-lg transition-all active:scale-95 shrink-0" title="Copy Link">
                  <Check v-if="copied" class="w-3.5 h-3.5 text-green-500" />
                  <Copy v-else class="w-3.5 h-3.5" />
                </button>
              </div>
              <p class="text-[10px] text-muted-foreground/70 mt-3 leading-relaxed">
                Scan QR or copy link to invite collaborators. Real-time sync is active.
              </p>
            </div>
          </div>
        </div>
        <div v-else class="p-6 rounded-xl border border-dashed text-center space-y-2">
          <div class="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
            <Link2 class="w-4 h-4 text-muted-foreground" />
          </div>
          <p class="text-xs font-bold text-foreground">URL Slug Required</p>
          <p class="text-[10px] text-muted-foreground max-w-[200px] mx-auto mb-3">
            Please enter a <strong>Custom URL Slug</strong> or generate a random one to see your sharing info.
          </p>
          <button 
            @click="slug = generateRandomSlug()"
            class="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 transition-all shadow-sm"
          >
            <Dices class="w-3 h-3" />
            Generate Random Slug
          </button>
        </div>
      </div>
      <div v-else class="py-4 text-center">
        <p class="text-xs text-muted-foreground font-medium">Enable Live Sharing to collaborate in real-time with others.</p>
      </div>
    </div>

    <!-- Editor Card -->
    <div class="rounded-xl border bg-card overflow-hidden shadow-sm">
      <!-- Title Input -->
      <div class="px-6 pt-5 pb-0">
        <input 
          type="text" 
          v-model="title" 
          placeholder="Note Title (Optional)"
          class="w-full bg-transparent border-none text-2xl font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-0"
        />
        <div class="border-b mt-2 opacity-50"></div>
      </div>

      <!-- Formatting Toolbar (text/html mode) -->
      <div v-if="format === 'text' || format === 'html'" class="flex items-center gap-0.5 px-3 py-2 bg-secondary/20 flex-wrap">
        <!-- Headings -->
        <button @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="['toolbar-btn', editor?.isActive('heading', { level: 1 }) ? 'active' : '']" title="Heading 1">
          <Heading1 class="w-4 h-4" />
        </button>
        <button @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="['toolbar-btn', editor?.isActive('heading', { level: 2 }) ? 'active' : '']" title="Heading 2">
          <Heading2 class="w-4 h-4" />
        </button>

        <div class="w-px h-4 bg-border mx-1" />

        <!-- Text Formatting -->
        <button @click="editor?.chain().focus().toggleBold().run()"
          :class="['toolbar-btn', editor?.isActive('bold') ? 'active' : '']" title="Bold (⌘B)">
          <Bold class="w-4 h-4" />
        </button>
        <button @click="editor?.chain().focus().toggleItalic().run()"
          :class="['toolbar-btn', editor?.isActive('italic') ? 'active' : '']" title="Italic (⌘I)">
          <Italic class="w-4 h-4" />
        </button>
        <button @click="editor?.chain().focus().toggleUnderline().run()"
          :class="['toolbar-btn', editor?.isActive('underline') ? 'active' : '']" title="Underline (⌘U)">
          <UnderlineIcon class="w-4 h-4" />
        </button>

        <div class="w-px h-4 bg-border mx-1" />

        <!-- Lists -->
        <button @click="editor?.chain().focus().toggleBulletList().run()"
          :class="['toolbar-btn', editor?.isActive('bulletList') ? 'active' : '']" title="Bullet List">
          <List class="w-4 h-4" />
        </button>
        <button @click="editor?.chain().focus().toggleOrderedList().run()"
          :class="['toolbar-btn', editor?.isActive('orderedList') ? 'active' : '']" title="Numbered List">
          <ListOrdered class="w-4 h-4" />
        </button>
        <button @click="editor?.chain().focus().toggleTaskList().run()"
          :class="['toolbar-btn', editor?.isActive('taskList') ? 'active' : '']" title="Checklist">
          <CheckSquare class="w-4 h-4" />
        </button>

        <div class="w-px h-4 bg-border mx-1" />

        <!-- Code -->
        <button @click="editor?.chain().focus().toggleCodeBlock().run()"
          :class="['toolbar-btn', editor?.isActive('codeBlock') ? 'active' : '']" title="Code Block">
          <Code2 class="w-4 h-4" />
        </button>
      </div>

      <!-- Rich Text Area -->
      <div v-if="format === 'text' || format === 'html'" class="px-6 py-5 min-h-[360px]">
        <editor-content :editor="editor" class="focus:outline-none min-h-[360px] text-sm leading-7 text-foreground" />
      </div>

      <!-- JSON Area -->
      <div v-else class="relative overflow-hidden">
        <div class="flex">
          <div class="select-none py-4 pr-2 pl-4 text-right border-r bg-secondary/30 min-w-[3.5rem]">
            <div v-for="i in Math.max(jsonLineCount, 20)" :key="i" class="text-xs leading-6 text-muted-foreground font-mono">{{ i }}</div>
          </div>
          <textarea v-model="jsonBody" placeholder='{ "key": "value" }'
            class="flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-6 text-foreground placeholder:text-muted-foreground/50 focus:outline-none min-h-[360px]"
            spellcheck="false"></textarea>
        </div>
      </div>
    </div>

    <!-- Action bar -->
    <div class="mt-5 flex items-center justify-between">
      <div class="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <span v-if="slug" class="flex items-center gap-1 px-2 py-1 rounded bg-accent text-accent-foreground">
          <Link2 class="w-3 h-3" /> /{{ slug }}
        </span>
        <span v-if="password" class="flex items-center gap-1 px-2 py-1 rounded bg-accent text-accent-foreground">
          <Lock class="w-3 h-3" /> {{ props.initialPassword && !password ? 'Password will be removed' : 'Password set' }}
        </span>
        <span v-if="expiresIn" class="flex items-center gap-1 px-2 py-1 rounded bg-accent text-accent-foreground">
          <Clock class="w-3 h-3" /> Expires in {{ EXPIRY_OPTIONS.find(o => o.value === expiresIn)?.label }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button v-if="mode === 'edit'" @click="$emit('cancel')"
          class="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
          Cancel
        </button>
        <button @click="handleSave" :disabled="saving || !canSave"
          class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
          <Save v-else class="w-4 h-4" />
          {{ mode === 'edit' ? 'Update Note' : 'Save Note' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { 
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, 
  List, ListOrdered, CheckSquare, Code2, 
  FileText, Braces, Save, Loader2, Link2, Lock, Clock, Eye, EyeOff, Radio, Settings2, Copy, Dices
} from 'lucide-vue-next';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import QrcodeVue from 'qrcode.vue';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import api from '../services/api';
import echo from '../services/echo';
import { useRouter } from 'vue-router';
import { useNotifications } from '../stores/useNotifications';
import { isLiveEnabled } from '../services/features';

const props = defineProps({
  initialId:       { type: [String, Number], default: null },
  initialTitle:    { type: String,  default: '' },
  initialContent:  { type: String,  default: '' },
  initialFormat:   { type: String,  default: 'text' },
  initialSlug:     { type: String,  default: '' },
  initialExpiresIn:{ type: Number,  default: undefined },
  initialPassword: { type: String,  default: '' },
  initialIsLive:   { type: Boolean, default: false },
  initialLivePermission: { type: String, default: 'view' },
  mode:            { type: String,  default: 'create' },
  saving:          { type: Boolean, default: false }
});

const emit = defineEmits(['save', 'cancel']);
const router = useRouter();

const title    = ref(props.initialTitle);
const slug     = ref(props.initialSlug);
const format   = ref(props.initialFormat === 'html' ? 'text' : props.initialFormat);
const jsonBody = ref(props.initialFormat === 'json' ? props.initialContent : '');
const password = ref(props.initialPassword);
const expiresIn = ref(props.initialExpiresIn);
const isLive = ref(props.initialIsLive);
const livePermission = ref(props.initialLivePermission);
const showOptions = ref(false);
const showLiveOptions = ref(props.initialIsLive); // Auto open if live
const showPassword = ref(false);

function generateRandomSlug() {
  const adjs = ['cool', 'swift', 'bold', 'fast', 'smart', 'neat', 'epic', 'pure', 'vibe', 'easy'];
  const nouns = ['note', 'page', 'link', 'text', 'doc', 'share', 'pad', 'flow', 'grid', 'idea'];
  const res = adjs[Math.floor(Math.random() * adjs.length)] + '-' + 
              nouns[Math.floor(Math.random() * nouns.length)] + '-' + 
              Math.floor(1000 + Math.random() * 9000);
  return res;
}

watch(isLive, (val) => {
  if (val && !slug.value) {
    slug.value = generateRandomSlug();
  }
});

const deviceId = ref(localStorage.getItem('device_id') || Math.random().toString(36).substring(2, 11));
if (!localStorage.getItem('device_id')) localStorage.setItem('device_id', deviceId.value);

const isBroadcasting = ref(false);
const lastBroadcastedContent = ref('');
const copied = ref(false);
const toast = useNotifications();

const slugStatus = ref('idle'); // idle, checking, available, taken
const slugSuggestions = ref([]);
let slugTimer = null;

async function checkSlugAvailability() {
  if (!slug.value || slug.value.length < 3) {
    slugStatus.value = 'idle';
    slugSuggestions.value = [];
    return;
  }

  // If slug is same as initial slug, it's available (already ours)
  if (props.mode === 'edit' && slug.value === props.initialSlug) {
    slugStatus.value = 'available';
    slugSuggestions.value = [];
    return;
  }

  slugStatus.value = 'checking';
  clearTimeout(slugTimer);
  
  slugTimer = setTimeout(async () => {
    try {
      const response = await api.get('/notes/check-slug', {
        params: { 
          slug: slug.value,
          exclude_id: props.mode === 'edit' ? props.initialId : undefined
        }
      });
      
      slugStatus.value = response.data.available ? 'available' : 'taken';
      slugSuggestions.value = response.data.suggestions || [];
    } catch (err) {
      slugStatus.value = 'idle';
    }
  }, 500);
}

watch(slug, () => {
  checkSlugAvailability();
});

const EXPIRY_OPTIONS = [
  { label: 'Never',  value: null  },
  { label: '10 min', value: 10    },
  { label: '1 hour', value: 60    },
  { label: '1 day',  value: 1440  },
  { label: '1 week', value: 10080 },
];

const editor = useEditor({
  content: (props.initialFormat === 'text' || props.initialFormat === 'html') ? props.initialContent : '',
  extensions: [
    StarterKit.configure({
      bulletList:   { keepMarks: true, keepAttributes: false },
      orderedList:  { keepMarks: true, keepAttributes: false },
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Placeholder.configure({
      placeholder: 'Start writing...',
      showOnlyCurrent: true,
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
    }),
    Underline,
  ],
  editorProps: {
    attributes: { class: 'focus:outline-none min-h-[500px]' },
  },
  onUpdate: ({ editor }) => {
    const content = editor.getHTML();
    if (props.initialFormat === 'html' || props.initialFormat === 'text') {
      broadcastUpdate(content);
    }
  },
});

let broadcastTimer = null;
function broadcastUpdate(content) {
  // Only broadcast if in edit mode and probably live
  if (props.mode !== 'edit') return;
  if (content === lastBroadcastedContent.value) return;

  clearTimeout(broadcastTimer);
  broadcastTimer = setTimeout(async () => {
    isBroadcasting.value = true;
    try {
      if (!props.initialId) return;
      await api.post(`/notes/${props.initialId}/broadcast`, {
        content: content,
        device_id: deviceId.value
      });
      lastBroadcastedContent.value = content;
    } catch (err) {
      console.error('Broadcast failed', err);
    } finally {
      isBroadcasting.value = false;
    }
  }, 1000); // 1s debounce
}

function setupEcho() {
  if (!props.initialId) return;

  echo.channel(`note.${props.initialId}`)
    .listen('.updated', (e) => {
      if (e.deviceId !== deviceId.value) {
        if (editor.value && e.content !== editor.value.getHTML()) {
          editor.value.commands.setContent(e.content, false);
          lastBroadcastedContent.value = e.content;
        }
      }
    });
}

const charCount = computed(() => {
  if (format.value === 'json') return jsonBody.value.length + title.value.length;
  return editor.value?.getText().length ?? 0;
});

const lineCount = computed(() => {
  if (format.value === 'json') return jsonBody.value.split('\n').length;
  return (editor.value?.getText() || '').split('\n').length;
});

const jsonLineCount = computed(() => jsonBody.value.split('\n').length);

const shareUrl = computed(() => {
  const identifier = slug.value || props.initialSlug || props.initialId;
  if (!identifier) return '';
  
  // Use the API base URL meta tag to derive the app base URL
  const apiBase = document.querySelector('meta[name="api-base-url"]')?.getAttribute('content');
  if (apiBase) {
    const appBase = apiBase.replace(/\/api$/, '');
    return appBase + '/' + identifier;
  }

  return window.location.origin + '/' + identifier;
});

const qrUrl = computed(() => {
  // Add live=true to force joining if needed, or just link to the page
  return shareUrl.value;
});

const canSave = computed(() => {
  if (format.value === 'json') return title.value.trim().length > 0 || jsonBody.value.trim().length > 0;
  return !editor.value?.isEmpty;
});

function setFormat(newFormat) {
  if (format.value === newFormat) return;
  format.value = newFormat;
}

function copyShareLink() {
  navigator.clipboard.writeText(shareUrl.value);
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
  toast.success('Link copied to clipboard!');
}

async function handleSave() {
  let finalTitle   = title.value.trim() || undefined;
  let finalContent = '';

  if (format.value === 'json') {
    finalContent = jsonBody.value;
  } else {
    finalContent = editor.value.getHTML();
  }

  const data = {
    content:    finalContent,
    format:     format.value === 'json' ? 'json' : 'html',
    title:      finalTitle,
    password:   password.value, // Send as is (empty means remove if modified)
    current_password: props.initialPassword,
    slug:       slug.value || undefined,
    is_live:    isLive.value,
    live_permission: livePermission.value,
  };

  if (expiresIn.value !== undefined) {
    data.expires_in = expiresIn.value;
  }

  if (props.mode === 'edit') {
    emit('save', data);
    return;
  }

  try {
    const response = await api.post(props.mode === 'edit' ? `/notes/${window.location.pathname.split('/').pop()}` : '/notes', data);
    const note = response.data.data;
    
    // Guest Tracking: Save/Update localStorage if not logged in
    if (!localStorage.getItem('auth_token')) {
      const recentNotes = JSON.parse(localStorage.getItem('recent_notes') || '[]');
      const newEntry = {
        id: note.id,
        slug: note.slug,
        title: note.title || 'Untitled Note',
        created_at: note.created_at
      };
      
      // Remove existing entry (if editing) or duplicate
      const filtered = recentNotes.filter(n => n.id !== note.id);
      filtered.unshift(newEntry);
      
      // Keep only last 5
      localStorage.setItem('recent_notes', JSON.stringify(filtered.slice(0, 5)));
    }

    toast.success(props.mode === 'edit' ? 'Note updated successfully!' : 'Note saved successfully!');
    router.push(`/${note.slug || note.id}`);
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Failed to save note');
  }
}

onMounted(() => {

  if (props.mode === 'edit') {
    setupEcho();
  } else {
    // New Note logic
    let content = props.initialContent;
    
    // Robust cleaning: Strip the title if it appears at the very beginning of the content
    if (props.initialTitle && content) {
      const escapedTitle = props.initialTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const titleRegex = new RegExp(`^\\s*(<[^>]+>)*\\s*${escapedTitle}\\s*(<\\/[^>]+>)*`, 'i');
      
      if (titleRegex.test(content)) {
        content = content.replace(titleRegex, '').trim();
        content = content.replace(/^(<br>|<p>&nbsp;<\/p>|<\/h[1-6]>|<p><\/p>)/i, '').trim();
      }
    }

    if (props.initialFormat === 'json') {
      jsonBody.value = content;
    } else {
      setTimeout(() => {
        editor.value?.commands.setContent(content);
      }, 0);
    }
  }
});

onUnmounted(() => {
  if (editor.value) editor.value.destroy();
  if (props.initialId) echo.leave(`note.${props.initialId}`);
});
</script>

<style scoped>
.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  color: var(--muted-foreground);
  transition: background-color 0.15s, color 0.15s;
}
.toolbar-btn:hover {
  background-color: var(--secondary);
  color: var(--foreground);
}
.toolbar-btn.active {
  background-color: color-mix(in srgb, var(--primary) 12%, transparent);
  color: var(--primary);
}
</style>
