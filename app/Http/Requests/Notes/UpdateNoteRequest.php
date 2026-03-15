<?php

namespace App\Http\Requests\Notes;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['sometimes', 'required', 'string'],
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'format' => ['sometimes', 'string'],
            'expires_at' => ['sometimes', 'nullable', 'date'],
            'expires_in' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'is_encrypted' => ['sometimes', 'boolean'],
            'is_live' => ['sometimes', 'boolean'],
            'live_permission' => ['sometimes', 'string', 'in:view,edit'],
            'slug' => ['nullable', 'string', 'max:100'],
            'password' => ['nullable', 'string', 'max:255'],
        ];
    }
}
