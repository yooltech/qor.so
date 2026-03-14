<template>
    <AppLayout>
        <Loading :active="loading" />
        
        <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
                <h1 class="text-xl font-semibold text-gray-900">Storage</h1>
                <p class="mt-2 text-sm text-gray-700">Upload and share files securely.</p>
            </div>
            <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button @click="triggerUpload" class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto">
                    Upload File
                </button>
                <input type="file" ref="fileInput" class="hidden" @change="handleFileUpload">
            </div>
        </div>

        <div class="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
            <ul v-if="files.length > 0" class="divide-y divide-gray-200">
                <li v-for="file in files" :key="file.id">
                    <div class="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <span class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {{ file.mime_type.split('/')[1]?.toUpperCase().substring(0, 3) || 'FILE' }}
                                </span>
                            </div>
                            <div class="ml-4">
                                <h4 class="text-sm font-medium text-gray-900">{{ file.file_name }}</h4>
                                <p class="text-sm text-gray-500">{{ (file.file_size / 1024 / 1024).toFixed(2) }} MB</p>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button @click="deleteFile(file.id)" class="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                        </div>
                    </div>
                </li>
            </ul>
            <div v-else class="px-4 py-12 text-center text-gray-500">
                No files uploaded yet.
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
const files = ref([]);
const fileInput = ref(null);

const fetchFiles = async () => {
    loading.value = true;
    try {
        const response = await api.get('/shared-files');
        files.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch files', error);
    } finally {
        loading.value = false;
    }
};

const triggerUpload = () => fileInput.value.click();

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    loading.value = true;
    const formData = new FormData();
    formData.append('file', file);

    try {
        await api.post('/shared-files', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        await fetchFiles();
    } catch (error) {
        console.error('Upload failed', error);
    } finally {
        loading.value = false;
        event.target.value = ''; // Reset input
    }
};

const deleteFile = async (id) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    loading.value = true;
    try {
        await api.delete(`/shared-files/${id}`);
        await fetchFiles();
    } catch (error) {
        console.error('Failed to delete file', error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchFiles);
</script>
