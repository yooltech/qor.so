<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" type="image/png" href="favicon.png">
        <meta name="api-base-url" content="{{ rtrim(config('app.url'), '/') }}/api">
        <meta name="feature-live-sharing" content="{{ env('NOTE_LIVE_ENABLED', true) ? 'true' : 'false' }}">
        <meta name="feature-file-upload" content="{{ env('FILE_UPLOAD_ENABLED', true) ? 'true' : 'false' }}">
        <title>qor.so — Fast, Secure Note Sharing</title>
        <meta name="description" content="qor.so is a lightweight, secure platform for sharing notes and files. No tracking, encrypted at rest, and built for speed.">
        <meta name="keywords" content="note sharing, pastebin, secure notes, encrypted sharing, qor.so, developer tools, code snippets">
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://qor.so/">
        <meta property="og:title" content="qor.so — Fast, Secure Note Sharing">
        <meta property="og:description" content="The fastest way to share notes and code snippets. Lightweight, secure, and encrypted.">
        <meta property="og:image" content="/og-image.png">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="https://qor.so/">
        <meta property="twitter:title" content="qor.so — Fast, Secure Note Sharing">
        <meta property="twitter:description" content="The fastest way to share notes and code snippets. Lightweight, secure, and encrypted.">
        <meta property="twitter:image" content="/og-image.png">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @endif
    </head>
    <body class="antialiased">
        <div id="app"></div>
    </body>
</html>
