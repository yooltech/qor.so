<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Note;
use App\Services\NoteService;
use Illuminate\Support\Str;

class MigrateContentToStorage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notes:migrate-to-storage';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Move note content from database to structured local storage';

    protected NoteService $noteService;

    public function __construct(NoteService $noteService)
    {
        parent::__construct();
        $this->noteService = $noteService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $notes = Note::all();
        $this->info("Found {$notes->count()} notes to migrate.");
        $count = 0;

        foreach ($notes as $note) {
            // Only migrate if file doesn't exist yet (idempotent)
            if (\Illuminate\Support\Facades\File::exists($this->noteService->getContentPath($note))) {
                $this->warn("Skipping note {$note->id} - content already exists in storage.");
                continue;
            }

            // Get original content from DB
            $content = $note->content;

            if (empty($content)) {
                continue;
            }

            // Save to file
            $this->noteService->saveContentToFile($note, $content);



            $this->info("Migrated note: {$note->id}");
            $count++;
        }

        $this->info("Successfully migrated $count notes to storage.");
        return 0;
    }
}
