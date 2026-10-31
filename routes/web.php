<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\PlanController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login')->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

    Route::get('/register', [AuthController::class, 'showRegistration'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () { return Inertia::render('Dashboard'); })->name('dashboard');
    Route::resource('plans', PlanController::class);
    Route::get('/renew-plan', [CustomerController::class, 'renewals'])->name('renew-plan.index');
    Route::post('/renew-plan/bulk', [CustomerController::class, 'bulkRenew'])->name('renew-plan.bulk');
    Route::post('/customers/{customer}/renewals', [CustomerController::class, 'renewPlan'])->name('customers.renewals.store');
    Route::post('/customers/{customer}/payments', [CustomerController::class, 'recordPayment'])->name('customers.payments.store');
    Route::resource('customers', CustomerController::class);
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});
