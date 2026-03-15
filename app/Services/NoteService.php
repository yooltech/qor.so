<?php

namespace App\Services;

use App\Models\Note;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class NoteService
{
    public function getAllForUser(int $userId)
    {
        $notes = Note::with('user')->where('user_id', $userId)->orderBy('created_at', 'desc')->get();
        
        foreach ($notes as $note) {
            // If it's NOT password protected, we can show a snippet to the owner
            if (!$note->is_password_protected) {
                $content = $this->loadContentFromFile($note);
                if ($content) {
                    // Transparent decryption for the owner
                    $key = $note->user && $note->user->email ? $note->user->email : $note->slug;
                    
                    try {
                        $decrypted = $this->decryptWithPassword($content, $key);
                        $note->content = Str::limit(strip_tags($decrypted), 200);
                    } catch (\Exception $e) {
                        $note->content = "[Decryption Error]";
                    }
                } else {
                    $note->content = '';
                }
            } else {
                $note->content = '';
            }
        }

        return $notes;
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
        $password = $data['password'] ?? null;

        // Determine Encryption Key
        // 1. Password (priority)
        // 2. Email (if logged in)
        // 3. Slug (fallback)
        if (!empty($password)) {
            $key = $password;
        } else {
            $user = $userId ? \App\Models\User::find($userId) : null;
            $key = ($user && $user->email) ? $user->email : $slug;
        }

        $content = $this->encryptWithPassword($content, $key);
        $isEncrypted = true;

        $expiresAt = null;
        if (!empty($data['expires_in'])) {
            $expiresAt = now()->addMinutes((int) $data['expires_in']);
        }

        $passwordHash = $password ? bcrypt($password) : null;

        $note = Note::create([
            'id' => $id,
            'user_id' => $userId,
            'content' => '', // Total privacy: no content in DB
            'is_encrypted' => $isEncrypted,
            'size_bytes' => strlen($content),
            'expires_at' => $expiresAt,
            'slug' => $slug,
            'title' => $data['title'] ?? null,
            'format' => $data['format'] ?? 'text',
            'password_hash' => $passwordHash,
        ]);

        $this->saveContentToFile($note, $content);

        return $note;
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

        return $this->prepareForView($note, $password);
    }

    public function prepareForView(Note $note, ?string $password = null): Note
    {
        // Check expiration
        if ($note->expires_at && $note->expires_at->isPast()) {
            abort(404, 'Note expired');
        }

        // Load content from file if exists, otherwise fallback to DB
        $note->content = $this->loadContentFromFile($note) ?? $note->content;

        // Decrypt content
        if ($note->is_encrypted) {
            try {
                if ($note->is_password_protected) {
                    if ($password && password_verify($password, $note->password_hash)) {
                        $note->content = $this->decryptWithPassword($note->content, $password);
                        $note->is_protected = false;
                    } else {
                        $note->content = null;
                        $note->is_protected = true;
                    }
                } else {
                    // Transparent decryption: Email key or Slug key
                    $key = ($note->user && $note->user->email) ? $note->user->email : $note->slug;
                    $note->content = $this->decryptWithPassword($note->content, $key);
                    $note->is_protected = false;
                }
            } catch (\Exception $e) {
                $note->content = null;
                $note->is_protected = true;
            }
        } else {
            $note->is_protected = false;
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

        $content = $data['content'] ?? $this->loadContentFromFile($note);
        $slugChanged = (!empty($data['slug']) && $data['slug'] !== $note->slug);
        
        if (isset($data['content']) || $slugChanged || $passwordChanged) {
            // Determine Encryption Key
            if (!empty($newPassword)) {
                $key = $newPassword;
                $data['password_hash'] = bcrypt($newPassword);
            } else {
                // Determine existing key or new fallback key
                $user = $note->user_id ? \App\Models\User::find($note->user_id) : null;
                $key = ($user && $user->email) ? $user->email : ($data['slug'] ?? $note->slug);
                
                if ($passwordChanged) {
                    $data['password_hash'] = null;
                }
            }

            // If we are here because of a slug/password change but DON'T have new content,
            // we must decrypt with the OLD key first.
            if (!isset($data['content']) && ($slugChanged || $passwordChanged)) {
                // Determine OLD key
                $oldKey = $note->is_password_protected ? ($data['current_password'] ?? null) : (($note->user && $note->user->email) ? $note->user->email : $note->slug);
                
                if ($oldKey) {
                    try {
                        $content = $this->decryptWithPassword($content, $oldKey);
                    } catch (\Exception $e) {
                        // If it fails, we might be stuck, but this is a safety net
                    }
                }
            }

            if ($content) {
                $encryptedContent = $this->encryptWithPassword($content, $key);
                $data['is_encrypted'] = true;
                $data['size_bytes'] = strlen($encryptedContent);
                $this->saveContentToFile($note, $encryptedContent);
            }
            
            // Keeping DB content empty for total privacy
            $data['content'] = '';

            unset($data['password']);
            unset($data['current_password']);
        }

        $note->update($data);
        return $note;
    }

    public function encryptWithPassword($value, $password)
    {
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
        $key = hash_pbkdf2('sha256', $password, config('app.key'), 10000, 32);
        $encrypted = openssl_encrypt($value, 'aes-256-cbc', $key, 0, $iv);
        return base64_encode($iv . $encrypted);
    }

    public function decryptWithPassword($value, $password)
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
        $path = $this->getContentPath($note);
        if (File::exists($path)) {
            File::delete($path);
        }
        $note->delete();
    }

    public function saveContentToFile(Note $note, string $content)
    {
        $path = $this->getContentPath($note);
        $directory = dirname($path);

        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        File::put($path, $content);
    }

    public function loadContentFromFile(Note $note): ?string
    {
        $path = $this->getContentPath($note);

        if (File::exists($path)) {
            return File::get($path);
        }

        return null;
    }

    public function getContentPath(Note $note): string
    {
        $dateFolder = $note->created_at->format('m-Y');
        
        if ($note->user_id) {
            $base = "notes/users/{$note->user_id}/{$dateFolder}";
        } else {
            $base = "notes/guests/{$dateFolder}";
        }

        $filename = "{$note->id}.txt";
        
        return storage_path("app/{$base}/{$filename}");
    }

    public function checkSlugAvailability(string $slug, ?string $excludeId = null)
    {
        // Standardize slug
        $slug = Str::slug($slug);
        
        // Reserved keywords (routes we don't want to shadow)
        $reserved = ['login', 'register', 'profile', 'dashboard', 'notes', 'files', 'auth', 'api', 'verify'];
        if (in_array($slug, $reserved)) {
            return [
                'available' => false,
                'suggestions' => [
                    $slug . '-' . rand(100, 999),
                    $slug . '-' . rand(100, 999),
                    $slug . '-' . rand(100, 999)
                ]
            ];
        }

        $query = Note::where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $isAvailable = !$query->exists();
        $suggestions = [];

        if (!$isAvailable) {
            // Generate 3 unique suggestions
            for ($i = 1; $i <= 3; $i++) {
                $suffix = rand(100, 999);
                $suggested = $slug . '-' . $suffix;
                // Double check if suggestion is taken
                if (!Note::where('slug', $suggested)->exists()) {
                    $suggestions[] = $suggested;
                }
            }
        }

        return [
            'available' => $isAvailable,
            'suggestions' => $suggestions
        ];
    }
}
