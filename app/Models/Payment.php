<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'due_amount',
        'paid_amount',
        'payment_date',
        'adjustment',
        'mode',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'due_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'payment_date' => 'date:Y-m-d',
            'adjustment' => 'decimal:2',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
