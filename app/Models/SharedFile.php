<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class SharedFile extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'file_name', 'file_size', 'mime_type', 'storage_path',
        'user_id', 'slug', 'password_hash', 'expires_at', 'view_count'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
