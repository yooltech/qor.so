<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            ['name' => 'Premium Note Pack', 'description' => 'A pack of 100 premium notes', 'price' => 19.99, 'stock' => 50],
            ['name' => 'Cloud Storage 50GB', 'description' => 'Additional storage for your files', 'price' => 9.99, 'stock' => 100],
            ['name' => 'End-to-End Encryption', 'description' => 'Secure your notes with advanced encryption', 'price' => 5.00, 'stock' => 500],
        ];

        foreach ($products as $product) {
            \App\Models\Product::create($product);
        }
    }
}
