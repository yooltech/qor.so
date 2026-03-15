<?php
use App\Models\Note;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$notes = Note::orderBy('created_at', 'desc')->limit(10)->get(['id', 'slug', 'title']);
echo "Checking last 10 notes:\n";
foreach ($notes as $note) {
    echo "ID: {$note->id} | Slug: [{$note->slug}] | Title: {$note->title}\n";
}
