<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/request-otp', [AuthController::class, 'requestOtp']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);

// Public note routes (guests can create, view & edit unowned notes)
Route::post('/notes', [NoteController::class, 'store']);
Route::get('/notes/{note}', [NoteController::class, 'show']);
Route::put('/notes/{note}', [NoteController::class, 'update']);
Route::patch('/notes/{note}', [NoteController::class, 'update']);

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

    // Notes (auth-only: list, delete)
    Route::get('/notes', [NoteController::class, 'index']);
    Route::delete('/notes/{note}', [NoteController::class, 'destroy']);

    // Shared Files (auth-only: list, delete)
    Route::get('/shared-files', [\App\Http\Controllers\Api\SharedFileController::class, 'index']);
    Route::delete('/shared-files/{shared_file}', [\App\Http\Controllers\Api\SharedFileController::class, 'destroy']);

    // Products
    Route::get('/products', [ProductController::class, 'index']);

    // Transactions
    Route::get('/transactions', [TransactionController::class, 'index']);
});
