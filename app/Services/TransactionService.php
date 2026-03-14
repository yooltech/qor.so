<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Str;

class TransactionService
{
    public function getAllForUser(int $userId)
    {
        return Transaction::where('user_id', $userId)->orderBy('created_at', 'desc')->get();
    }

    public function createTransaction(array $data, int $userId)
    {
        $data['user_id'] = $userId;
        $data['reference'] = 'TRX-' . strtoupper(Str::random(10));
        $data['status'] = 'completed';
        
        return Transaction::create($data);
    }
}
