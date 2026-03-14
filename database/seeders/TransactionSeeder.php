<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = \App\Models\User::all();
        
        foreach ($users as $user) {
            \App\Models\Transaction::create([
                'user_id' => $user->id,
                'amount' => rand(10, 100),
                'status' => 'completed',
                'reference' => 'TRX-' . strtoupper(\Illuminate\Support\Str::random(10)),
            ]);
        }
    }
}
