<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Note extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'content', 'format', 'title', 'user_id', 
        'password_hash', 'expires_at', 'slug', 'is_encrypted', 
        'size_bytes', 'view_count'
    ];
    
    protected $casts = [
        'expires_at' => 'datetime',
        'is_encrypted' => 'boolean',
    ];

    protected $hidden = [
        'password_hash'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
