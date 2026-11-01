<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
        ]);
        $search = trim($filters['search'] ?? '');

        return Inertia::render('CollectPayment/Index', [
            'orders' => Order::query()
                ->with('customer:id,name,username,phone')
                ->where('due_amount', '>', 0)
                ->when($search !== '', function ($query) use ($search) {
                    $query->whereHas('customer', function ($customerQuery) use ($search) {
                        $customerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('username', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
                })
                ->orderByDesc('end_date')
                ->orderByDesc('id')
                ->paginate(15)
                ->withQueryString(),
            'search' => $search,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'payments' => ['required', 'array', 'min:1', 'max:100'],
            'payments.*.order_id' => ['required', 'integer', 'distinct', 'exists:orders,id'],
            'payments.*.paid_amount' => ['required', 'numeric', 'decimal:0,2', 'min:0.01'],
            'payment_date' => ['required', 'date_format:Y-m-d'],
            'mode' => ['required', Rule::in(['Cash', 'Online', 'Cheque'])],
            'remarks' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated) {
            $entries = collect($validated['payments'])->keyBy('order_id');
            $orders = Order::query()
                ->whereIn('id', $entries->keys())
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            if ($orders->count() !== $entries->count()) {
                throw ValidationException::withMessages([
                    'payments' => 'One or more selected renewals are no longer available.',
                ]);
            }

            foreach ($entries as $orderId => $entry) {
                /** @var Order|null $order */
                $order = $orders->get($orderId);

                if (! $order || $this->moneyToCents($order->due_amount) <= 0) {
                    throw ValidationException::withMessages([
                        'payments' => 'One or more selected renewals no longer have an outstanding balance. Refresh and try again.',
                    ]);
                }

                $dueCents = $this->moneyToCents($order->due_amount);
                $paidCents = $this->moneyToCents($entry['paid_amount']);

                $order->payments()->create([
                    'due_amount' => $this->formatMoney($dueCents),
                    'paid_amount' => $this->formatMoney($paidCents),
                    'payment_date' => $validated['payment_date'],
                    'mode' => $validated['mode'],
                    'remarks' => $validated['remarks'] ?? null,
                ]);

                $order->update([
                    'due_amount' => $this->formatMoney($dueCents - $paidCents),
                ]);
            }
        });

        return redirect()->route('collect-payment.index');
    }

    private function moneyToCents(string|int|float $amount): int
    {
        return (int) round((float) $amount * 100);
    }

    private function formatMoney(int $amount): string
    {
        return number_format($amount / 100, 2, '.', '');
    }
}
