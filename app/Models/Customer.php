<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'username',
        'name',
        'phone',
        'email',
        'address_line_1',
        'address_line_2',
        'address_area',
        'remarks',
        'status',
        'plan_id',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'integer',
            'plan_id' => 'integer',
        ];
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
