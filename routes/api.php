<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/request-otp', [AuthController::class, 'requestOtp']);
// Public note routes (guests can create, view & edit unowned notes)
// Public note lookup routes
Route::get('/notes/{note}', [NoteController::class, 'show']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->name('login');

// Public stats
Route::get('/stats', [\App\Http\Controllers\Api\StatsController::class, 'index']);

// Public shared files viewing & creation
Route::get('/shared-files/{idOrSlug}', [\App\Http\Controllers\Api\SharedFileController::class, 'show']);
Route::post('/shared-files', [\App\Http\Controllers\Api\SharedFileController::class, 'store']); // Allow guest uploads

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::get('/users', [\App\Http\Controllers\Api\UserController::class, 'index']);

    // Protected Note Routes
    Route::get('notes/check-slug', [NoteController::class, 'checkSlug']);
    Route::get('notes', [NoteController::class, 'index']);
    Route::post('notes', [NoteController::class, 'store']);
    Route::put('notes/{note}', [NoteController::class, 'update']);
    Route::patch('notes/{note}', [NoteController::class, 'update']);
    Route::delete('notes/{note}', [NoteController::class, 'destroy']);
    
    // Live Sharing Routes
    Route::post('notes/{note}/toggle-live', [NoteController::class, 'toggleLive']);
    Route::post('notes/{note}/join-live', [NoteController::class, 'joinLive']);
    Route::put('notes/{note}/connections/{connection}', [NoteController::class, 'updateConnection']);
    Route::post('notes/{note}/broadcast', [NoteController::class, 'broadcastUpdate']);

    // Shared Files (auth-only: list, delete)
    Route::get('/shared-files', [\App\Http\Controllers\Api\SharedFileController::class, 'index']);
    Route::delete('/shared-files/{shared_file}', [\App\Http\Controllers\Api\SharedFileController::class, 'destroy']);

    // Products
    Route::get('/products', [ProductController::class, 'index']);

    // Transactions
    Route::get('/transactions', [TransactionController::class, 'index']);
});
