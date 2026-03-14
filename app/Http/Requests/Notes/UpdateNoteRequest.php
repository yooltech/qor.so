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
            'is_encrypted' => ['sometimes', 'boolean'],
        ];
    }
}
