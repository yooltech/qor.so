<template>
  <div class="min-h-screen bg-background">
    <Navbar />

    <div class="max-w-md mx-auto px-6 pt-20 animate-fade-in">
      <h1 class="text-3xl font-bold text-foreground text-center">
        {{ step === 1 ? "Sign In" : "Verify Code" }}
      </h1>
      <p class="mt-2 text-muted-foreground text-center">
        {{ step === 1 ? "Enter your email to receive a login code and link" : `Enter the code or click the button sent to ${form.email}` }}
      </p>

      <div class="mt-8 border-2 border-primary bg-primary/5 p-6 rounded-2xl flex flex-col items-center gap-4 text-center animate-fade-in shadow-lg">
        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldAlert class="h-6 w-6 text-primary" />
        </div>
        <div class="space-y-2">
          <p class="text-lg font-bold text-foreground">Important: Read Carefully</p>
          <p class="text-sm text-primary font-bold leading-relaxed px-4">
            KEEP YOUR EMAIL SAFE. IF YOU LOSE YOUR EMAIL, YOU WILL LOSE YOUR DATA.
          </p>
          <p class="text-xs text-muted-foreground leading-relaxed px-4">
            We use a password-less system. Your email is the <u>only</u> way to access your notes. We cannot recover your account.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
        <!-- Step 1: Email -->
        <div v-if="step === 1" class="relative group">
          <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="email"
            required
            placeholder="Enter your email address"
            v-model="form.email"
            class="w-full pl-11 pr-4 py-3.5 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
            autofocus
          />
        </div>

        <!-- Step 2: OTP -->
        <div v-else class="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div class="relative group">
            <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              required
              maxlength="6"
              placeholder="Enter 6-digit code"
              v-model="form.otp"
              class="w-full pl-11 pr-4 py-3.5 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm font-mono tracking-[0.5em] text-center"
              autofocus
            />
          </div>
          <p class="text-[10px] text-center text-muted-foreground uppercase tracking-widest px-4">
            Warning: This is the ONLY way to access your notes. Keep the email safe.
          </p>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          {{ step === 1 ? "Get Login Code" : "Verify & Sign In" }}
        </button>

        <button
          v-if="step === 2"
          type="button"
          @click="step = 1"
          class="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to email
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Loader2, Mail, Lock, ShieldAlert } from 'lucide-vue-next';
import Navbar from '../components/Navbar.vue';
import api from '../services/api';
import { useNotifications } from '../stores/useNotifications';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const step = ref(1);
const toast = useNotifications();

const form = ref({
  email: '',
  otp: ''
});

onMounted(async () => {
  // Check for magic link params
  const { email, expires, signature } = route.query;
  if (email && expires && signature && route.path.includes('/verify')) {
    loading.value = true;
    try {
      toast.info('Verifying magic link...');
      const response = await api.post('/auth/verify-magic-link', { email, expires, signature });
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('auth_user', JSON.stringify(response.data.data.user));
      toast.success('Login successful!');
      router.push('/');
    } catch (err) {
      toast.error('Invalid or expired login link');
      router.push('/login');
    } finally {
      loading.value = false;
    }
  }
});

const handleSubmit = async () => {
  loading.value = true;
  
  try {
    if (step.value === 1) {
      await api.post('/request-otp', { email: form.value.email });
      step.value = 2;
      toast.success('Login credentials sent to your email');
    } else {
      const response = await api.post('/verify-otp', { 
        email: form.value.email,
        otp: form.value.otp
      });
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('auth_user', JSON.stringify(response.data.data.user));
      toast.success('Welcome back!');
      router.push('/');
    }
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Authentication failed');
  } finally {
    loading.value = false;
  }
};
</script>
