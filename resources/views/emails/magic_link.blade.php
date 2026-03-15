<x-mail::message>
# Login Request

You requested a magic link to log in to your account. Click the button below to sign in instantly.

<x-mail::button :url="$url">
Login to {{ config('app.name') }}
</x-mail::button>

This link will expire in **15 minutes**.

If you didn't request this login link, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
