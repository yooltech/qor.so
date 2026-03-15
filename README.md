# qor.so — Fast, Secure Note & File Sharing

qor.so is a lightweight, high-performance web platform built with Laravel and Vue.js for instant, secure sharing of notes, code snippets, and files. It's designed for speed, privacy, and zero-friction collaboration.

<p align="center">
  <img src="https://github.com/yooltech/qor.so/raw/main/public/logo.png" width="120" alt="qor.so logo">
</p>

## 📸 Screenshots

<p align="center">
  <img src="https://github.com/yooltech/qor.so/raw/main/public/screenshoot.png" width="900" alt="qor.so screenshot">
</p>

## 🚀 Key Features

- **Instant Sharing**: Paste text or upload files and get a shareable URL immediately. No registration required for basic sharing.
- **Live Collaboration**: Enable "Live Mode" to sync content in real-time across devices using Laravel Reverb.
- **Secure Encryption**: Notes are fully encrypted when you use password protection or an email account.
- **Auto-Expiration**: Set notes to expire after a specific time (10m, 1h, 1d, etc.) to keep your data ephemeral.
- **Custom Slugs & Suggestions**: Create short, memorable URLs. If your choice is taken, the system suggests unique variants.
- **Dark Mode**: Fully supports system-based or manual dark/light mode switching.
- **Branded Experience**: Consistently branded with a premium UI, integrated logo, and dedicated static pages (About, FAQ, Terms).

## 🛠️ Tech Stack

- **Backend**: Laravel 11.x (PHP 8.2+)
- **Frontend**: Vue.js 3.5+ with Vite 7
- **Styling**: Tailwind CSS 4.x (Vibrant, modern aesthetics)
- **Real-time**: Laravel Reverb + Laravel Echo
- **Icons**: Lucide Vue Next
- **Editor**: TipTap Editor with rich extensions (Placeholder, Task List, Underline)

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

You can toggle core features and page sections via your `.env` file:
- `NOTE_LIVE_ENABLED=true/false` - Enable/Disable real-time collaboration.
- `FILE_UPLOAD_ENABLED=true/false` - Enable/Disable file sharing.
- `ABOUT_SHOW_ROADMAP=true/false` - Show/hide the Workspace Roadmap on the About page.
- `ABOUT_SHOW_TEAM=true/false` - Show/hide the "Meet the Team" section.
- `ABOUT_SHOW_TECH=true/false` - Show/hide the Technology Stack section.
- `ABOUT_SHOW_OPEN_SOURCE=true/false` - Show/hide the Open Source/GitHub section.

## 🗺️ Roadmap: The Ultimate Workspace

We are evolving qor.so into a comprehensive collaborative workspace:

### 1. Advanced Live Collaboration Notes
- **Interactive Todo Lists**: Real-time synchronized task lists within notes.
- **Live Cursors**: See where collaborators are typing instantly.
- **Session Management**: Allow/Deny connected devices with specific permissions (View/Edit).

### 2. Workspace Management
- **Note Folder Management**: Organize your workspace with nested folders, icons, and colors.
- **Whiteboard**: A real-time synchronized drawing canvas for visual brainstorming.
- **Bookmarks**: Save and categorize external links with rich metadata previews.

### 3. Meetings & AI
- **Video Meetings**: Integrated high-quality video calling.
- **AI Summary**: Automated transcriptions and summaries of your meetings and long notes.

### 4. Cross-Platform
- **Mobile Apps**: Native iOS and Android applications built with Capacitor for productivity on the move.

## 📄 License

Open source under the [MIT License](LICENSE).

---
Built with ❤️ by [yooltech](https://github.com/yooltech)
