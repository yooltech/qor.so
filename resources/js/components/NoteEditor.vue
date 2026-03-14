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

      <div class="flex items-center gap-3">
        <button
          @click="showOptions = !showOptions"
          :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all', (showOptions || password || expiresIn || slug) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground']"
        >
          <Lock class="w-3.5 h-3.5" />
          Options
        </button>
        <span class="text-xs text-muted-foreground font-mono">{{ charCount }} chars · {{ lineCount }} lines</span>
      </div>
    </div>

    <!-- Options Panel -->
    <div v-if="showOptions" class="mb-3 rounded-xl border bg-card p-4 space-y-4 animate-fade-in">
      <div>
        <label class="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <Link2 class="w-3.5 h-3.5" /> Custom URL Slug
        </label>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground font-mono">/</span>
          <input type="text" placeholder="my-note" v-model="slug"
            @input="slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '')"
            class="flex-1 px-3 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <p class="text-xs text-muted-foreground mt-1">Leave empty for an auto-generated ID</p>
      </div>
      <div>
        <label class="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <Lock class="w-3.5 h-3.5" /> Password Protection
        </label>
        <input type="password" placeholder="Leave empty for no password" v-model="password"
          class="w-full px-3 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div>
        <label class="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          <Clock class="w-3.5 h-3.5" /> Expiration
        </label>
        <div class="flex flex-wrap gap-2">
          <button v-for="opt in EXPIRY_OPTIONS" :key="opt.label" @click="expiresIn = opt.value"
            :class="['px-3 py-1.5 rounded-lg text-sm font-medium transition-all', expiresIn === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80']">
            {{ opt.label }}
          </button>
        </div>
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
          <Lock class="w-3 h-3" /> Password set
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2,
  List, ListOrdered, CheckSquare, Code2,
  FileText, Braces, Save, Loader2, Link2, Lock, Clock
} from 'lucide-vue-next';
import api from '../services/api';
import { useRouter } from 'vue-router';

const props = defineProps({
  initialTitle:    { type: String,  default: '' },
  initialContent:  { type: String,  default: '' },
  initialFormat:   { type: String,  default: 'text' },
  initialSlug:     { type: String,  default: '' },
  initialExpiresIn:{ type: Number,  default: null },
  mode:            { type: String,  default: 'create' },
  saving:          { type: Boolean, default: false }
});

const emit = defineEmits(['save', 'cancel']);
const router = useRouter();

const title    = ref(props.initialTitle);
const slug     = ref(props.initialSlug);
const format   = ref(props.initialFormat === 'html' ? 'text' : props.initialFormat);
const jsonBody = ref(props.initialFormat === 'json' ? props.initialContent : '');
const password = ref('');
const expiresIn = ref(props.initialExpiresIn);
const showOptions = ref(false);

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
  ],
  editorProps: {
    attributes: { class: 'focus:outline-none min-h-[500px]' },
  },
});

const charCount = computed(() => {
  if (format.value === 'json') return jsonBody.value.length + title.value.length;
  return editor.value?.getText().length ?? 0;
});

const lineCount = computed(() => {
  if (format.value === 'json') return jsonBody.value.split('\n').length;
  return (editor.value?.getText() || '').split('\n').length;
});

const jsonLineCount = computed(() => jsonBody.value.split('\n').length);

const canSave = computed(() => {
  if (format.value === 'json') return title.value.trim().length > 0 || jsonBody.value.trim().length > 0;
  return !editor.value?.isEmpty;
});

function setFormat(newFormat) {
  if (format.value === newFormat) return;
  format.value = newFormat;
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
    password:   password.value || undefined,
    expires_in: expiresIn.value || undefined,
    slug:       slug.value || undefined,
  };

  if (props.mode === 'edit') {
    emit('save', data);
    return;
  }

  try {
    const response = await api.post('/notes', data);
    const note = response.data.data;
    router.push(`/${note.slug || note.id}`);
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || 'Failed to save note');
  }
}

onMounted(() => {
  if (props.mode === 'edit') {
    title.value     = props.initialTitle;
    slug.value      = props.initialSlug;
    expiresIn.value = props.initialExpiresIn;
    format.value    = props.initialFormat;

    let content = props.initialContent;
    
    // Robust cleaning: Strip the title if it appears at the very beginning of the content
    if (props.initialTitle && content) {
      // Create a regex to match either plain text title or the title inside common header tags (H1-H6, p, div)
      // We look for the title at the very start of the string, potentially preceded by common opening tags
      const escapedTitle = props.initialTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const titleRegex = new RegExp(`^\\s*(<[^>]+>)*\\s*${escapedTitle}\\s*(<\\/[^>]+>)*`, 'i');
      
      if (titleRegex.test(content)) {
        content = content.replace(titleRegex, '').trim();
        // Also strip any immediate leading line break or empty paragraph after removal
        content = content.replace(/^(<br>|<p>&nbsp;<\/p>|<\/h[1-6]>|<p><\/p>)/i, '').trim();
      }
    }

    if (props.initialFormat === 'json') {
      jsonBody.value = content;
    } else {
      editor.value?.commands.setContent(content);
    }
  }
});

onBeforeUnmount(() => {
  editor.value?.destroy();
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
