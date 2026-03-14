<?php

namespace App\Http\Requests\Files;

use Illuminate\Foundation\Http\FormRequest;

class StoreFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:51200'], // 50MB limit
            'password_hash' => ['nullable', 'string'],
            'expires_at' => ['nullable', 'date'],
            'slug' => ['nullable', 'string', 'unique:shared_files,slug'],
        ];
    }
}
