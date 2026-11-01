<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PasswordController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

    Route::get('/register', [AuthController::class, 'showRegistration'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::resource('customers', CustomerController::class);
    Route::resource('plans', PlanController::class);
    Route::get('/renew-plan', [CustomerController::class, 'renewals'])->name('renew-plan.index');
    Route::patch('/plans/{plan}/status', [PlanController::class, 'updateStatus'])->name('plans.status.update');
    Route::post('/renew-plan/bulk', [CustomerController::class, 'bulkRenew'])->name('renew-plan.bulk');
    Route::get('/collect-payment', [PaymentController::class, 'index'])->name('collect-payment.index');
    Route::post('/collect-payment', [PaymentController::class, 'store'])->name('collect-payment.store');
    Route::post('/customers/{customer}/renewals', [CustomerController::class, 'renewPlan'])->name('customers.renewals.store');
    Route::post('/customers/{customer}/payments', [CustomerController::class, 'recordPayment'])->name('customers.payments.store');
    Route::get('/customers/search', [CustomerController::class, 'search'])->name('customers.search');
    Route::patch('/customers/{customer}/status', [CustomerController::class, 'updateStatus'])->name('customers.status.update');
    Route::get('/settings/password', [PasswordController::class, 'edit'])->name('settings.password.edit');
    Route::put('/settings/password', [PasswordController::class, 'update'])->name('settings.password.update');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});
