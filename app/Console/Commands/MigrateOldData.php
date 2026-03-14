<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Note;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;
use Illuminate\Support\Str;

class MigrateOldData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notes:migrate-old';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate historical note data from old_data directory into the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $directory = base_path('old_data');

        if (!File::exists($directory)) {
            $this->error("Directory not found: $directory");
            return 1;
        }

        $files = File::files($directory);
        $count = 0;

        foreach ($files as $file) {
            $filename = $file->getFilename();
            
            // Only process .txt files
            if (!str_ends_with($filename, '.txt')) {
                continue;
            }

            // Slug: strip _d.txt or .txt
            $slug = str_replace(['_d.txt', '.txt'], '', $filename);
            
            $content = File::get($file->getRealPath());
            
            // Title: first line or slug
            $lines = explode("\n", trim($content));
            $title = !empty($lines[0]) ? substr($lines[0], 0, 50) : $slug;

            // Creation date from file metadata
            $createdAt = Carbon::createFromTimestamp($file->getMTime());

            // Check for existing slug to avoid duplicates
            if (Note::where('slug', $slug)->exists()) {
                $this->warn("Skipping '$filename' - slug '$slug' already exists.");
                continue;
            }

            Note::create([
                'id' => (string) Str::uuid(),
                'title' => $title,
                'content' => $content,
                'format' => 'text',
                'slug' => $slug,
                'size_bytes' => strlen($content),
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            $this->info("Migrated: $filename -> /$slug");
            $count++;
        }

        $this->info("Successfully migrated $count notes.");
        return 0;
    }
}
