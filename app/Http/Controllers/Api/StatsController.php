<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\SharedFile;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $totalNotes = Note::count();
        $totalFiles = SharedFile::count();
        
        $totalViews = (Note::sum('view_count') ?? 0) + (SharedFile::sum('view_count') ?? 0);
        $totalBytes = (Note::sum('size_bytes') ?? 0) + (SharedFile::sum('file_size') ?? 0);
        
        $notesToday = Note::whereDate('created_at', today())->count();
        $filesToday = SharedFile::whereDate('created_at', today())->count();

        return response()->json([
            'data' => [
                'total_notes' => (int) $totalNotes,
                'total_files' => (int) $totalFiles,
                'total_views' => (int) $totalViews,
                'total_bytes' => (int) $totalBytes,
                'items_today' => (int) ($notesToday + $filesToday),
            ]
        ]);
    }
}
