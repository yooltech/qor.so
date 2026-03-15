<template>
  <div class="min-h-screen bg-background flex flex-col">
    <Navbar />
    
    <main class="flex-1 px-6 py-20">
      <div class="max-w-3xl mx-auto space-y-12 animate-fade-in">
        <div class="text-center space-y-4">
          <h1 class="text-4xl font-black tracking-tight text-foreground">
            Frequently Asked Questions
          </h1>
          <p class="text-xl text-muted-foreground">
            Everything you need to know about qor.so.
          </p>
        </div>

        <div class="space-y-4">
          <div v-for="(item, index) in faqs" :key="index" class="group border rounded-2xl bg-card overflow-hidden transition-all hover:border-primary/50">
            <button 
              @click="toggle(index)"
              class="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
            >
              <span class="font-bold text-foreground">{{ item.question }}</span>
              <ChevronDown 
                class="w-5 h-5 text-muted-foreground transition-transform duration-300" 
                :class="{ 'rotate-180': openItems.includes(index) }"
              />
            </button>
            <div 
              v-show="openItems.includes(index)" 
              class="px-6 pb-5 text-sm text-muted-foreground leading-relaxed animate-fade-in"
            >
              <div v-html="item.answer" />
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="text-center p-8 rounded-3xl bg-secondary/30 border border-dashed border-primary/20">
          <p class="text-sm font-medium mb-4">Still have questions?</p>
          <a href="https://github.com/yooltech/qor.so/issues" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-110 transition-all">
            <MessageCircle class="w-4 h-4" />
            Join the Discussion
          </a>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Navbar from '../components/Navbar.vue';
import { ChevronDown, MessageCircle } from 'lucide-vue-next';

const openItems = ref([0]); // Default open first item

const toggle = (index) => {
  if (openItems.value.includes(index)) {
    openItems.value = openItems.value.filter(i => i !== index);
  } else {
    openItems.value.push(index);
  }
};

const faqs = [
  {
    question: "Is qor.so really free?",
    answer: "Yes! qor.so is an open-source project and is completely free to use. There are no hidden fees or premium tiers."
  },
  {
    question: "How long do my notes stay live?",
    answer: "You control the lifespan of every note. You can set them to expire in as little as 10 minutes or keep them 'forever'. For guest users, we recommend setting an expiration to keep the platform clean."
  },
  {
    question: "Is my data encrypted?",
    answer: "When you use password protection or an email account, your notes are fully encrypted. Your privacy is our priority. Even notes created without a password or account are protected using a unique slug-based key, ensuring that no content is ever stored in plain text on our servers."
  },
  {
    question: "How does Live Sharing work?",
    answer: "When you enable Live Sharing, a WebSocket connection is established. This allow multiple people to view and (if permitted) edit the note simultaneously. All changes are synchronized in real-time."
  },
  {
    question: "Do I need an account?",
    answer: "No. You can create and share notes as a guest. Accounts are only needed if you want to manage your notes across different devices permanently."
  }
];
</script>
