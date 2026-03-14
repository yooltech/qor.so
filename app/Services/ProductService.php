<?php

namespace App\Services;

use App\Models\Product;

class ProductService
{
    public function getAll()
    {
        return Product::all();
    }

    public function createProduct(array $data)
    {
        return Product::create($data);
    }
}
