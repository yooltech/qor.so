<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserOtp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AuthService
{
    public function sendOtp(string $email)
    {
        // Generate a 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store in DB, expiring in 15 minutes
        UserOtp::updateOrCreate(
            ['email' => $email],
            [
                'code' => $code,
                'expires_at' => Carbon::now()->addMinutes(15),
            ]
        );

        // For now, we log it. In a real app, this would send an email.
        \Log::info("OTP for {$email}: {$code}");
        
        return true;
    }

    public function verifyOtp(string $email, string $code)
    {
        $otp = UserOtp::where('email', $email)
            ->where('code', $code)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$otp) {
            throw ValidationException::withMessages([
                'otp' => ['The provided code is invalid or has expired.'],
            ]);
        }

        // OTP is valid, find or create the user
        $user = User::firstOrCreate(
            ['email' => $email],
            ['name' => explode('@', $email)[0], 'password' => Hash::make(Str::random(16))]
        );

        // Delete the used OTP
        $otp->delete();

        return [
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ];
    }

    public function logout(User $user)
    {
        $user->tokens()->delete();
    }
}
