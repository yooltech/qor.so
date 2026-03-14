<?php

namespace App\Services;

use App\Models\Note;
use Illuminate\Support\Str;

class NoteService
{
    public function getAllForUser(int $userId)
    {
        return Note::where('user_id', $userId)->orderBy('created_at', 'desc')->get();
    }

    public function createNote(array $data, ?int $userId)
    {
        $data['id'] = (string) Str::uuid();
        $data['user_id'] = $userId;
        
        // Encrypt content if user is logged in
        if ($userId) {
            $data['content'] = encrypt($data['content']);
            $data['is_encrypted'] = true;
        } else {
            $data['is_encrypted'] = false;
        }
        
        $data['size_bytes'] = strlen($data['content'] ?? '');

        // Convert expires_in (minutes) to expires_at timestamp
        if (!empty($data['expires_in'])) {
            $data['expires_at'] = now()->addMinutes((int)$data['expires_in']);
        }
        unset($data['expires_in']);

        // Generate a short slug if not provided
        if (empty($data['slug'])) {
            $data['slug'] = Str::random(8);
        }

        return Note::create($data);
    }

    public function findNote(string $idOrSlug)
    {
        // Try by slug first, then fall back to UUID primary key
        $note = Note::where('slug', $idOrSlug)
            ->orWhere('id', $idOrSlug)
            ->firstOrFail();

        // Decrypt content if it's encrypted
        if ($note->is_encrypted) {
            try {
                $note->content = decrypt($note->content);
            } catch (\Exception $e) {
                // Keep as is if decryption fails (e.g. wrong key)
            }
        }

        return $note;
    }

    public function updateNote(Note $note, array $data)
    {
        if (isset($data['content'])) {
            // Re-encrypt if it was already encrypted or if user owns it
            if ($note->is_encrypted || $note->user_id !== null) {
                $data['content'] = encrypt($data['content']);
                $data['is_encrypted'] = true;
            }
            $data['size_bytes'] = strlen($data['content']);
        }
        $note->update($data);
        return $note;
    }

    public function deleteNote(Note $note)
    {
        $note->delete();
    }
}
