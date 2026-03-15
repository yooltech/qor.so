<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Note;
use App\Services\NoteService;
use Illuminate\Support\Facades\File;

class ReEncryptNotes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notes:re-encrypt';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Re-encrypt all note storage files with the new Triple-Method strategy';

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
        $this->info("Starting re-encryption for " . $notes->count() . " notes...");
        $count = 0;
        $errors = 0;

        foreach ($notes as $note) {
            $path = $this->noteService->getContentPath($note);
            
            if (!File::exists($path)) {
                $this->warn("Skipping note {$note->id} - File not found.");
                continue;
            }

            $rawContent = File::get($path);
            $decryptedContent = null;

            // Attempt to decrypt current file based on old rules
            try {
                if ($note->is_password_protected) {
                    // Password protected notes already use encryptWithPassword
                    // We can just keep them or re-encrypt to be safe, but they are already in the new format basically.
                    // However, we don't have the plain text password here. 
                    // So we skip them for re-encryption but ensure they stay protected.
                    $this->info("Note {$note->id} is password protected - Skipping re-encryption of file content.");
                    continue;
                } elseif ($note->is_encrypted) {
                    // Legacy account-protected notes used Laravel's encrypt()
                    $decryptedContent = decrypt($rawContent);
                } else {
                    // Plain text notes
                    $decryptedContent = $rawContent;
                }
            } catch (\Exception $e) {
                // Check if it's already in the new format (Email or Slug)
                // We can test this by trying to decrypt it with the expected key
                $key = ($note->user && $note->user->email) ? $note->user->email : $note->slug;
                try {
                    $decryptedContent = $this->noteService->decryptWithPassword($rawContent, $key);
                    $this->info("Note {$note->id} already in new format - Skipping.");
                    continue;
                } catch (\Exception $ex) {
                    $this->error("Failed to decrypt note {$note->id}: " . $e->getMessage());
                    $errors++;
                    continue;
                }
            }

            if ($decryptedContent === null) {
                continue;
            }

            // Determine NEW key
            $key = ($note->user && $note->user->email) ? $note->user->email : $note->slug;

            // Re-encrypt with new key
            $newEncryptedContent = $this->noteService->encryptWithPassword($decryptedContent, $key);

            // Save back to file
            File::put($path, $newEncryptedContent);
            
            // Mark as encrypted in DB (just in case it was false)
            $note->update(['is_encrypted' => true]);

            $this->info("Re-encrypted note: {$note->id}");
            $count++;
        }

        $this->info("Completed. Re-encrypted: $count, Errors: $errors");
        return $errors > 0 ? 1 : 0;
    }
}
