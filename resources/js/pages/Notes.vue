<template>
    <AppLayout>
        <Loading :active="loading" />
        
        <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
                <h1 class="text-xl font-semibold text-gray-900">Notes</h1>
                <p class="mt-2 text-sm text-gray-700">Manage your secret notes and snippets.</p>
            </div>
            <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button @click="showModal = true" class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto">
                    New Note
                </button>
            </div>
        </div>

        <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="note in notes" :key="note.id" class="bg-white overflow-hidden shadow rounded-lg border hover:shadow-md transition-shadow">
                <div class="px-4 py-5 sm:p-6">
                    <h3 class="text-lg font-medium text-gray-900 truncate">{{ note.title || 'Untitled Note' }}</h3>
                    <p class="mt-2 text-sm text-gray-500 line-clamp-3">{{ note.content }}</p>
                    <div class="mt-4 flex justify-between items-center">
                        <span class="text-xs text-gray-400">{{ new Date(note.created_at).toLocaleDateString() }}</span>
                        <div class="space-x-2">
                            <button @click="deleteNote(note.id)" class="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Simple Modal (New Note) -->
        <div v-if="showModal" class="fixed inset-0 z-10 overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div>
                        <h3 class="text-lg font-medium leading-6 text-gray-900">Create New Note</h3>
                        <div class="mt-4 space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Title</label>
                                <input v-model="newNote.title" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Content</label>
                                <textarea v-model="newNote.content" rows="4" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <button @click="createNote" type="button" class="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm">Create</button>
                        <button @click="showModal = false" type="button" class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:col-start-1 sm:text-sm">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import AppLayout from '../layouts/AppLayout.vue';
import Loading from '../components/Loading.vue';

const loading = ref(true);
const notes = ref([]);
const showModal = ref(false);
const newNote = ref({ title: '', content: '' });

const fetchNotes = async () => {
    loading.value = true;
    try {
        const response = await api.get('/notes');
        notes.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch notes', error);
    } finally {
        loading.value = false;
    }
};

const createNote = async () => {
    loading.value = true;
    try {
        await api.post('/notes', newNote.value);
        newNote.value = { title: '', content: '' };
        showModal.value = false;
        await fetchNotes();
    } catch (error) {
        console.error('Failed to create note', error);
    } finally {
        loading.value = false;
    }
};

const deleteNote = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    loading.value = true;
    try {
        await api.delete(`/notes/${id}`);
        await fetchNotes();
    } catch (error) {
        console.error('Failed to delete note', error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchNotes);
</script>
