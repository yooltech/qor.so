<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Files\StoreFileRequest;
use App\Models\SharedFile;
use App\Services\SharedFileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SharedFileController extends Controller
{
    protected SharedFileService $fileService;

    public function __construct(SharedFileService $fileService)
    {
        $this->fileService = $fileService;
    }

    public function index(Request $request): JsonResponse
    {
        $files = $this->fileService->getAllForUser($request->user()->id);
        return response()->json(['data' => $files]);
    }

    public function store(StoreFileRequest $request): JsonResponse
    {
        if (!env('FILE_UPLOAD_ENABLED', true)) {
            return response()->json(['message' => 'File uploading is disabled'], 412);
        }

        $userId = $request->user()?->id;
        $file = $this->fileService->uploadFile($request->file('file'), $request->validated(), $userId);
        return response()->json(['message' => 'File uploaded successfully', 'data' => $file], 201);
    }

    public function show(string $idOrSlug, Request $request): JsonResponse
    {
        $file = $this->fileService->findByIdOrSlug($idOrSlug);

        if (!$file) {
            return response()->json(['message' => 'File not found'], 404);
        }

        // If accessed by ID but has a slug, suggest a redirect or handle it in frontend
        // We'll return the slug so the frontend can update the URL
        if ($file->password_hash) {
            $providedPassword = $request->query('password');
            if (!$providedPassword || !password_verify($providedPassword, $file->password_hash)) {
                // Return partial data to indicate it's protected
                return response()->json([
                    'data' => [
                        'id' => $file->id,
                        'file_name' => $file->file_name,
                        'password' => true, // Indicate password required
                        'expires_at' => $file->expires_at,
                    ]
                ]);
            }
        }

        // Increment view count
        $this->fileService->incrementViewCount($file);

        return response()->json(['data' => $file]);
    }

    public function destroy(SharedFile $shared_file): JsonResponse
    {
        $this->fileService->deleteFile($shared_file);
        return response()->json(['message' => 'File deleted successfully']);
    }
}
