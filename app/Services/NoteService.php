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
        $id = (string) Str::uuid();

        // Handle slug uniqueness
        $slug = !empty($data['slug'])
            ? $this->generateUniqueSlug($data['slug'])
            : Str::lower(Str::random(8));
        // Lower text 

        $content = $data['content'];
        $isEncrypted = false;
        $password = $data['password'] ?? null;

        // If password is set, use it for encryption (Password-Keyed Encryption)
        if (!empty($password)) {
            $content = $this->encryptWithPassword($content, $password);
            $isEncrypted = true;
        }
        // Otherwise, use default encryption if user is logged in
        elseif ($userId) {
            $content = encrypt($content);
            $isEncrypted = true;
        }

        $expiresAt = null;
        if (!empty($data['expires_in'])) {
            $expiresAt = now()->addMinutes((int) $data['expires_in']);
        }

        $passwordHash = $password ? bcrypt($password) : null;

        return Note::create([
            'id' => $id,
            'user_id' => $userId,
            'content' => $content,
            'is_encrypted' => $isEncrypted,
            'size_bytes' => strlen($content),
            'expires_at' => $expiresAt,
            'slug' => $slug,
            'title' => $data['title'] ?? null,
            'format' => $data['format'] ?? 'text',
            'password_hash' => $passwordHash,
        ]);
    }

    protected function generateUniqueSlug(string $slug): string
    {
        $originalSlug = Str::slug($slug);
        $newSlug = $originalSlug;
        $counter = 1;

        while (Note::where('slug', $newSlug)->exists()) {
            $newSlug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $newSlug;
    }

    public function findNote(string $idOrSlug, ?string $password = null)
    {
        $note = Note::where('slug', $idOrSlug)
            ->orWhere('id', $idOrSlug)
            ->firstOrFail();

        // Check expiration
        if ($note->expires_at && $note->expires_at->isPast()) {
            abort(404, 'Note expired');
        }

        // Decrypt content
        if ($note->is_encrypted) {
            try {
                if ($note->password_hash) {
                    if ($password && password_verify($password, $note->password_hash)) {
                        $note->content = $this->decryptWithPassword($note->content, $password);
                    } else {
                        // Don't decrypt if no password or wrong password
                        $note->content = null;
                    }
                } else {
                    // Standard decryption for owned notes without passwords
                    $note->content = decrypt($note->content);
                }
            } catch (\Exception $e) {
                $note->content = null;
            }
        }

        return $note;
    }

    public function updateNote(Note $note, array $data)
    {
        $passwordChanged = array_key_exists('password', $data);
        $newPassword = $passwordChanged ? $data['password'] : null;

        // Handle slug uniqueness if changing
        if (!empty($data['slug']) && $data['slug'] !== $note->slug) {
            $data['slug'] = $this->generateUniqueSlug($data['slug']);
        }

        // Handle expiration
        if (array_key_exists('expires_in', $data)) {
            $data['expires_at'] = $data['expires_in'] 
                ? now()->addMinutes((int) $data['expires_in']) 
                : null;
            unset($data['expires_in']);
        }

        if (isset($data['content'])) {
            $content = $data['content'];

            // Determine encryption strategy
            if (!empty($newPassword)) {
                // Changing to a new password
                $data['content'] = $this->encryptWithPassword($content, $newPassword);
                $data['is_encrypted'] = true;
                $data['password_hash'] = bcrypt($newPassword);
            } elseif ($passwordChanged && empty($newPassword)) {
                // Removing password
                if ($note->user_id !== null) {
                    $data['content'] = encrypt($content);
                    $data['is_encrypted'] = true;
                } else {
                    $data['is_encrypted'] = false;
                }
                $data['password_hash'] = null;
            } elseif ($note->password_hash && !empty($data['current_password'])) {
                // Keeping existing password (re-encrypt with current password)
                $data['content'] = $this->encryptWithPassword($content, $data['current_password']);
                $data['is_encrypted'] = true;
            } elseif ($note->user_id !== null) {
                // Owned note, no password (use app key)
                $data['content'] = encrypt($content);
                $data['is_encrypted'] = true;
            }

            $data['size_bytes'] = strlen($data['content']);
            unset($data['password']);
            unset($data['current_password']);
        } elseif ($passwordChanged) {
            // Password change only (rare but possible)
            if (empty($newPassword)) {
                $data['password_hash'] = null;
                // If content was encrypted with old password, we MUST decrypt and re-encrypt or leave plain
                // But since content isn't provided here, we can't do much. 
                // However, in our editor, content is ALWAYS sent on save.
            } else {
                $data['password_hash'] = bcrypt($newPassword);
            }
            unset($data['password']);
        }

        $note->update($data);
        return $note;
    }

    protected function encryptWithPassword($value, $password)
    {
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
        $key = hash_pbkdf2('sha256', $password, config('app.key'), 10000, 32);
        $encrypted = openssl_encrypt($value, 'aes-256-cbc', $key, 0, $iv);
        return base64_encode($iv . $encrypted);
    }

    protected function decryptWithPassword($value, $password)
    {
        $data = base64_decode($value);
        $ivSize = openssl_cipher_iv_length('aes-256-cbc');
        $iv = substr($data, 0, $ivSize);
        $encrypted = substr($data, $ivSize);
        $key = hash_pbkdf2('sha256', $password, config('app.key'), 10000, 32);
        return openssl_decrypt($encrypted, 'aes-256-cbc', $key, 0, $iv);
    }

    public function deleteNote(Note $note)
    {
        $note->delete();
    }
}
