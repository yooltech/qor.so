<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notes\StoreNoteRequest;
use App\Http\Requests\Notes\UpdateNoteRequest;
use App\Models\Note;
use App\Models\NoteConnection;
use App\Events\NoteUpdated;
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
        $userId = auth('sanctum')->id(); // null for guests, works even without middleware
        $data = $request->validated();
        
        // Force live sharing off if disabled
        if (!env('NOTE_LIVE_ENABLED', true)) {
            $data['is_live'] = false;
        }

        $note = $this->noteService->createNote($data, $userId);
        return response()->json(['message' => 'Note created', 'data' => $note], 201);
    }

    public function show(Request $request, Note $note): JsonResponse
    {
        $password = $request->query('password');
        
        // Use the service to decrypt or handle expiration if needed
        // Since resolveRouteBinding already found the note, we just need to handle content
        $note = $this->noteService->prepareForView($note, $password);
        
        // Increment view count
        $note->increment('view_count');
        
        // The service now handles expiration and password protection internally
        return response()->json(['data' => $note]);
    }

    public function update(Request $request, Note $note): JsonResponse
    {
        // Unowned notes: anyone can edit
        // Owned notes: only the owner can edit
        if ($note->user_id !== null) {
            $authUser = auth('sanctum')->user();
            if (!$authUser || $authUser->id !== $note->user_id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        $validated = $request->validate([
            'content' => ['sometimes', 'string'],
            'title' => ['nullable', 'string', 'max:255'],
            'format' => ['sometimes', 'string', 'in:text,html,json'],
            'slug' => ['nullable', 'string', 'max:100'],
            'password' => ['nullable', 'string', 'max:255'],
            'current_password' => ['nullable', 'string'],
            'expires_in' => ['nullable', 'integer', 'min:1'],
            'is_live' => ['sometimes', 'boolean'],
            'live_permission' => ['sometimes', 'string', 'in:view,edit'],
        ]);

        // If note is protected, require current password to update anything
        if ($note->password_hash) {
            $currentPassword = $request->input('current_password');
            if (!$currentPassword || !password_verify($currentPassword, $note->password_hash)) {
                return response()->json(['message' => 'Invalid or missing current password'], 401);
            }
        }

        // Force live sharing off if disabled
        if (!env('NOTE_LIVE_ENABLED', true)) {
            $validated['is_live'] = false;
        }

        $updatedNote = $this->noteService->updateNote($note, $validated);
        return response()->json(['message' => 'Note updated', 'data' => $updatedNote]);
    }

    public function destroy(Note $note)
    {
        $this->noteService->deleteNote($note);
        return response()->json(['message' => 'Note deleted successfully']);
    }

    public function toggleLive(Note $note, Request $request)
    {
        if (!env('NOTE_LIVE_ENABLED', true)) {
            return response()->json(['message' => 'Live sharing is disabled'], 412);
        }

        $validated = $request->validate([
            'is_live' => 'required|boolean',
            'live_permission' => 'sometimes|string|in:view,edit',
        ]);

        $note->update($validated);
        
        if (!$note->is_live) {
            $note->connections()->delete();
        }

        return response()->json(['data' => $note->load('connections')]);
    }

    public function joinLive(Note $note, Request $request)
    {
        if (!env('NOTE_LIVE_ENABLED', true)) {
            return response()->json(['message' => 'Live sharing is disabled'], 412);
        }

        $validated = $request->validate([
            'device_id' => 'required|string',
            'device_name' => 'nullable|string',
        ]);

        $connection = $note->connections()->updateOrCreate(
            ['device_id' => $validated['device_id']],
            [
                'device_name' => $validated['device_name'],
                'status' => 'pending',
                'permissions' => 'view'
            ]
        );

        return response()->json(['data' => $connection]);
    }

    public function updateConnection(Note $note, NoteConnection $connection, Request $request)
    {
        $validated = $request->validate([
            'status' => 'sometimes|string|in:pending,allowed,denied',
            'permissions' => 'sometimes|string|in:view,edit',
        ]);

        $connection->update($validated);

        return response()->json(['data' => $connection]);
    }

    public function broadcastUpdate(Note $note, Request $request)
    {
        if (!env('NOTE_LIVE_ENABLED', true)) {
            return response()->json(['message' => 'Live sharing is disabled'], 412);
        }

        if (!$note->is_live) {
            return response()->json(['message' => 'Live sharing is not enabled for this note'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string',
            'device_id' => 'required|string',
        ]);

        // Authorization check
        if ($note->user_id !== null) {
            $isOwner = auth('sanctum')->id() === $note->user_id;
            $isAllowedGuest = $note->connections()
                ->where('device_id', $validated['device_id'])
                ->where('status', 'allowed')
                ->where('permissions', 'edit')
                ->exists();

            if (!$isOwner && !$isAllowedGuest) {
                return response()->json(['message' => 'Unauthorized to broadcast'], 403);
            }
        }

        \Log::info('Broadcasting update for note: ' . $note->id . ' from device: ' . $validated['device_id']);
        broadcast(new \App\Events\NoteUpdated($note, $validated['content'], $validated['device_id']))->toOthers();

        return response()->json(['status' => 'success']);
    }

    public function checkSlug(Request $request)
    {
        $validated = $request->validate([
            'slug' => 'required|string|min:3|max:100',
            'exclude_id' => 'sometimes|string'
        ]);

        $result = $this->noteService->checkSlugAvailability($validated['slug'], $validated['exclude_id'] ?? null);
        
        // Wait, I put the logic in AuthService but NoteService is also used here.
        // Let's check NoteService.
        return response()->json($result);
    }
}
