<?php

namespace App\Services;

use App\Models\SharedFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SharedFileService
{
    public function getAllForUser(int $userId)
    {
        return SharedFile::where('user_id', $userId)->orderBy('created_at', 'desc')->get();
    }

    public function uploadFile(UploadedFile $file, array $data, ?int $userId)
    {
        $path = $file->store('shared-files', 'public');

        return SharedFile::create([
            'id' => (string) Str::uuid(),
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'storage_path' => $path,
            'user_id' => $userId,
            'slug' => $data['slug'] ?? null,
            'password_hash' => $data['password_hash'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
        ]);
    }

    public function findByIdOrSlug(string $idOrSlug)
    {
        return SharedFile::where('id', $idOrSlug)
            ->orWhere('slug', $idOrSlug)
            ->first();
    }

    public function incrementViewCount(SharedFile $file)
    {
        $file->increment('view_count');
    }

    public function deleteFile(SharedFile $file)
    {
        Storage::disk('public')->delete($file->storage_path);
        $file->delete();
    }
}
