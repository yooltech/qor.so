<?php

namespace App\Http\Requests\Notes;

use Illuminate\Foundation\Http\FormRequest;

class StoreNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content'      => ['required', 'string'],
            'title'        => ['nullable', 'string', 'max:255'],
            'format'       => ['sometimes', 'string', 'in:text,html,json'],
            'slug'         => ['nullable', 'string', 'max:100'],
            'password'     => ['nullable', 'string', 'max:255'],
            'expires_in'   => ['nullable', 'integer', 'min:1'],
            'expires_at'   => ['nullable', 'date'],
            'is_encrypted' => ['sometimes', 'boolean'],
        ];
    }
}
