# qor.so — Fast, Secure Note & File Sharing

qor.so is a lightweight, high-performance web platform built with Laravel and Vue.js for instant, secure sharing of notes, code snippets, and files.

![Brand Logo](https://github.com/yooltech/qor.so/raw/main/public/logo.png)

## 🚀 Key Features

- **Instant Sharing**: Paste text or upload files and get a shareable URL immediately.
- **Live Collaboration**: Enable "Live Mode" to sync content in real-time across devices using Laravel Reverb.
- **Secure by Design**:
  - **Password Protection**: Lock notes with a custom password.
  - **Encrypted at Rest**: Notes are encrypted using AES-256 for authenticated users.
  - **Auto-Expiration**: Set notes to expire after a specific time (10m, 1h, 1d, etc.).
- **Guest Friendly**: No signup required for basic sharing. Recent notes are stored locally for guest convenience.
- **Custom Slugs**: Create short, memorable URLs for your shared content.
- **Dark Mode**: Fully supports system-based or manual dark/light mode switching.

## 🛠️ Tech Stack

- **Backend**: Laravel 11.x
- **Frontend**: Vue.js 3.x with Vite
- **Styling**: Tailwind CSS 4.x
- **Real-time**: Laravel Reverb + Laravel Echo
- **Icons**: Lucide Vue Next
- **Editor**: TipTap Editor

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yooltech/qor.so.git
   cd qor.so
   ```

2. **Install dependencies**:
   ```bash
   composer install
   npm install
   ```

3. **Environment Setup**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database & Storage**:
   ```bash
   php artisan migrate
   php artisan storage:link
   ```

5. **Start Servers**:
   ```bash
   # Start the Reverb server for live sharing
   php artisan reverb:start
   
   # Start the development server
   npm run dev
   ```

## 🔐 Feature Controls

You can toggle core features via your `.env` file:
- `NOTE_LIVE_ENABLED=true/false` - Enable/Disable real-time collaboration.
- `FILE_UPLOAD_ENABLED=true/false` - Enable/Disable file sharing.

## 📄 License

Open source under the [MIT License](LICENSE).

---
Built with ❤️ by [yooltech](https://github.com/yooltech)
