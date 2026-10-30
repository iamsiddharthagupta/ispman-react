<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'speed',
        'price',
        'duration',
        'vendor_name',
        'vendor_rate',
        'remarks',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'duration' => 'integer',
            'vendor_rate' => 'decimal:2',
            'status' => 'integer',
        ];
    }
}
