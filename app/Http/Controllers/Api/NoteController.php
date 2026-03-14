<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notes\StoreNoteRequest;
use App\Http\Requests\Notes\UpdateNoteRequest;
use App\Models\Note;
use App\Services\NoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    protected NoteService $noteService;

    public function __construct(NoteService $noteService)
    {
        $this->noteService = $noteService;
    }

    public function index(Request $request): JsonResponse
    {
        $notes = $this->noteService->getAllForUser($request->user()->id);
        return response()->json(['data' => $notes]);
    }

    public function store(StoreNoteRequest $request): JsonResponse
    {
        $userId = $request->user()?->id; // null for guests
        $note = $this->noteService->createNote($request->validated(), $userId);
        return response()->json(['message' => 'Note created', 'data' => $note], 201);
    }

    public function show(string $id): JsonResponse
    {
        $note = $this->noteService->findNote($id);
        return response()->json(['data' => $note]);
    }

    public function update(Request $request, Note $note): JsonResponse
    {
        // Unowned notes: anyone can edit
        // Owned notes: only the owner can edit
        if ($note->user_id !== null) {
            $authUser = $request->user();
            if (!$authUser || $authUser->id !== $note->user_id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        $validated = $request->validate([
            'content'  => ['sometimes', 'string'],
            'title'    => ['nullable', 'string', 'max:255'],
            'format'   => ['sometimes', 'string', 'in:text,html,json'],
            'slug'     => ['nullable', 'string', 'max:100'],
            'password' => ['nullable', 'string', 'max:255'],
        ]);

        $updatedNote = $this->noteService->updateNote($note, $validated);
        return response()->json(['message' => 'Note updated', 'data' => $updatedNote]);
    }

    public function destroy(Note $note): JsonResponse
    {
        $this->noteService->deleteNote($note);
        return response()->json(['message' => 'Note deleted']);
    }
}
