<x-mail::message>
# Login Verification

Securely access your account or shared note using either of the methods below.

## Option 1: One-Time Code
Enter this 6-digit code on the login page:

<x-mail::panel>
<h1 style="text-align: center; letter-spacing: 5px; margin: 0; color: #000;">{{ $otp }}</h1>
</x-mail::panel>

@if($url)
## Option 2: Direct Access
Click the button below to sign in instantly without entering a code:

<x-mail::button :url="$url">
Login to {{ config('app.name') }}
</x-mail::button>
@endif

These credentials will expire in **15 minutes**.

If you didn't request this login, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
