<template>
  <div class="min-h-screen bg-background flex flex-col">
    <Navbar />
    
    <main class="flex-1 px-6 py-20">
      <div class="max-w-3xl mx-auto space-y-12 animate-fade-in">
        <div class="space-y-4">
          <h1 class="text-4xl font-black tracking-tight text-foreground">
            Terms & Privacy
          </h1>
          <p class="text-muted-foreground">
            Last updated: March 15, 2026
          </p>
        </div>

        <div class="prose prose-neutral dark:prose-invert max-w-none space-y-12">
          <!-- Terms of Service -->
          <section>
            <h2 class="text-2xl font-bold">1. Terms of Service</h2>
            <p>
              By using qor.so, you agree to the following terms. This platform is provided "as is" for the temporary sharing of text and files.
            </p>
            <ul>
              <li>You are responsible for the content you share.</li>
              <li>You must not use the platform for illegal activities.</li>
              <li>Content is ephemeral and may be deleted at any time based on the selected expiration policy.</li>
              <li>We do not guarantee permanent storage or availability of any shared content.</li>
            </ul>
          </section>

          <!-- Privacy Policy -->
          <section>
            <h2 class="text-2xl font-bold">2. Privacy Policy</h2>
            <p>
              Your privacy is our priority. qor.so is designed to collect as little data as possible.
            </p>
            <h3>What we store:</h3>
            <ul>
              <li><strong>Notes & Files:</strong> The content you upload, which is automatically deleted after your specified time.</li>
              <li><strong>No Tracking:</strong> We do not use persistent tracking cookies or analytics that identify individual users.</li>
              <li><strong>Device IDs:</strong> Temporary device identifiers are used for Live Sharing permission management and are not linked to real-world identities.</li>
            </ul>
          </section>

          <!-- Encryption -->
          <section>
            <h2 class="text-2xl font-bold">3. Security & Encryption</h2>
            <p>
              When you use password protection or an email account, your notes are fully encrypted.
            </p>
            <p>
              While we strive for the highest security standards, please do not use this platform to share highly sensitive medical, financial, or state-secret level information.
            </p>
          </section>

          <section class="pt-8 border-t">
            <p class="text-sm text-muted-foreground italic">
              Questions? Visit our <router-link to="/about" class="underline hover:text-primary">About</router-link> page or check out our <a href="https://github.com/yooltech/qor.so" class="underline hover:text-primary">GitHub</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue';
</script>
