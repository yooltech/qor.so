<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserOtp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use App\Models\Note;

class AuthService
{
    public function sendOtp(string $email)
    {
        // 1. Generate a 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // 2. Store OTP in DB
        UserOtp::updateOrCreate(
            ['email' => $email],
            [
                'code' => $code,
                'expires_at' => Carbon::now()->addMinutes(15),
            ]
        );

        // 3. Generate a 15-min signed Magic Link
        $expires = now()->addMinutes(15);
        $signature = hash_hmac('sha256', "magic-login:{$email}:{$expires->timestamp}", config('app.key'));
        $magicLink = config('app.url') . "/login/verify?email=" . urlencode($email) . 
                      "&expires=" . $expires->timestamp . 
                      "&signature=" . $signature;

        // 4. Send UNIFIED email with BOTH code and link
        Mail::to($email)->send(new \App\Mail\OtpMail($code, $magicLink));
        
        return true;
    }

    public function verifyMagicLink(string $email, string $expires, string $signature)
    {
        // Verify expiration
        if (now()->timestamp > (int) $expires) {
            throw ValidationException::withMessages([
                'link' => ['This login link has expired.'],
            ]);
        }

        // Verify signature
        $expected = hash_hmac('sha256', "magic-login:{$email}:{$expires}", config('app.key'));
        
        if (!hash_equals($expected, $signature)) {
            throw ValidationException::withMessages([
                'link' => ['Invalid login link.'],
            ]);
        }

        // Valid link, find or create the user
        $user = User::firstOrCreate(
            ['email' => $email],
            ['name' => explode('@', $email)[0], 'password' => Hash::make(Str::random(16))]
        );

        return [
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ];
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
