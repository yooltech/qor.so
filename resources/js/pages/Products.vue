<template>
    <AppLayout>
        <Loading :active="loading" />
        
        <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
                <h1 class="text-xl font-semibold text-gray-900">Products</h1>
                <p class="mt-2 text-sm text-gray-700">A list of all the premium products available in NoteShare.</p>
            </div>
        </div>

        <div class="mt-8 flex flex-col">
            <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <table class="min-w-full divide-y divide-gray-300">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stock</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 bg-white">
                                <tr v-for="product in products" :key="product.id">
                                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ product.name }}</td>
                                    <td class="px-3 py-4 text-sm text-gray-500">{{ product.description }}</td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${{ product.price }}</td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ product.stock }}</td>
                                </tr>
                            </tbody>
                        </table>
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
const products = ref([]);

const fetchProducts = async () => {
    loading.value = true;
    try {
        const response = await api.get('/products');
        products.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch products', error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchProducts);
</script>
