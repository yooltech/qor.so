<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class NoteConnection extends Model
{
    use HasUuids;

    protected $fillable = [
        'note_id', 'device_id', 'device_name', 'status', 'permissions'
    ];

    public function note()
    {
        return $this->belongsTo(Note::class);
    }
}
