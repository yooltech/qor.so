<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function requestOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $this->authService->sendOtp($data['email']);

        return response()->json([
            'message' => 'OTP sent successfully',
        ]);
    }

    public function requestMagicLink(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $this->authService->sendMagicLink($data['email']);

        return response()->json([
            'message' => 'Magic link sent successfully',
        ]);
    }

    public function verifyMagicLink(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'expires' => 'required|string',
            'signature' => 'required|string',
        ]);

        $result = $this->authService->verifyMagicLink($data['email'], $data['expires'], $data['signature']);

        return response()->json([
            'message' => 'Login successful',
            'data' => $result,
        ]);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $result = $this->authService->verifyOtp($data['email'], $data['otp']);

        return response()->json([
            'message' => 'Login successful',
            'data' => $result,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'avatar_url' => 'nullable|url|max:2048',
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $user,
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user(),
        ]);
    }
}
