<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $today = Carbon::today();
        $currentMonthStart = $today->copy()->startOfMonth();
        $chartStart = $currentMonthStart->copy()->subMonths(11);
        $chartEnd = $currentMonthStart->copy()->addMonth();

        $months = collect(range(0, 11))
            ->map(function (int $offset) use ($chartStart) {
                $month = $chartStart->copy()->addMonths($offset);

                return [
                    'month' => $month->format('Y-m'),
                    'label' => $month->format('M'),
                    'payments' => 0.0,
                    'vendorRate' => 0.0,
                    'customers' => 0,
                ];
            });

        $paymentTotals = DB::table('payments')
            ->selectRaw($this->monthExpression('payment_date').' as month, SUM(paid_amount) as total')
            ->whereBetween('payment_date', [$chartStart->toDateString(), $chartEnd->copy()->subDay()->toDateString()])
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $vendorRateTotals = DB::table('orders')
            ->join('customers', 'customers.id', '=', 'orders.customer_id')
            ->join('plans', 'plans.id', '=', 'customers.plan_id')
            ->selectRaw($this->monthExpression('orders.created_at').' as month, SUM(COALESCE(orders.vendor_rate, plans.vendor_rate, 0)) as total')
            ->where('orders.created_at', '>=', $chartStart)
            ->where('orders.created_at', '<', $chartEnd)
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $customerTotals = DB::table('customers')
            ->selectRaw($this->monthExpression('created_at').' as month, COUNT(*) as total')
            ->where('created_at', '>=', $chartStart)
            ->where('created_at', '<', $chartEnd)
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $chartData = $months->map(function (array $month) use ($paymentTotals, $vendorRateTotals, $customerTotals) {
            $key = $month['month'];
            return [
                ...$month,
                'payments' => (float) ($paymentTotals->get($key)?->total ?? 0),
                'vendorRate' => (float) ($vendorRateTotals->get($key)?->total ?? 0),
                'customers' => (int) ($customerTotals->get($key)?->total ?? 0),
            ];
        });

        return Inertia::render('Dashboard', [
            'metrics' => [
                'activeCustomers' => Customer::query()
                    ->where('status', 1)
                    ->whereHas('latestOrder', fn ($query) => $query->whereDate('end_date', '>=', $today->toDateString()))
                    ->count(),
                'inactiveCustomers' => Customer::query()
                    ->whereHas('latestOrder', fn ($query) => $query->whereDate('end_date', '<=', $today->copy()->subMonth()->toDateString()))
                    ->count(),
                'todayPayments' => (float) DB::table('payments')
                    ->whereDate('payment_date', $today->toDateString())
                    ->sum('paid_amount'),
                'newCustomers' => Customer::query()
                    ->where('created_at', '>=', $currentMonthStart)
                    ->where('created_at', '<', $currentMonthStart->copy()->addMonth())
                    ->count(),
            ],
            'monthlyData' => $chartData->values(),
        ]);
    }

    private function monthExpression(string $column): string
    {
        return match (DB::connection()->getDriverName()) {
            'mysql', 'mariadb' => "DATE_FORMAT({$column}, '%Y-%m')",
            'pgsql' => "TO_CHAR({$column}, 'YYYY-MM')",
            'sqlite' => "strftime('%Y-%m', {$column})",
            'sqlsrv' => "FORMAT({$column}, 'yyyy-MM')",
            default => throw new RuntimeException('Monthly dashboard aggregation is unsupported for the configured database driver.'),
        };
    }
}
