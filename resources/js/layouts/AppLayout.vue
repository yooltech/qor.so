<template>
    <div class="min-h-screen bg-gray-100 flex flex-col">
        <Navbar>
            <template #actions>
                <div class="flex items-center gap-2">
                    <router-link 
                        to="/notes" 
                        class="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        active-class="bg-secondary text-foreground"
                    >
                        Notes
                    </router-link>
                    <router-link 
                        to="/files" 
                        class="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        active-class="bg-secondary text-foreground"
                    >
                        Files
                    </router-link>
                    <button @click="handleLogout" class="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                        Sign Out
                    </button>
                </div>
            </template>
        </Navbar>

        <main class="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
            <slot />
        </main>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import api from '../services/api';
import Navbar from '../components/Navbar.vue';

const router = useRouter();

const handleLogout = async () => {
    try {
        await api.post('/logout');
        localStorage.removeItem('auth_token');
        router.push('/login');
    } catch (error) {
        console.error('Logout failed', error);
        localStorage.removeItem('auth_token');
        router.push('/login');
    }
};
</script>
