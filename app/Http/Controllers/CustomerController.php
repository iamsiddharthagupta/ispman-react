<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function renewals(Request $request): Response
    {
        $today = Carbon::today();
        $lastEligibleDate = $today->copy()->addDays(5);
        $customers = Customer::query()
            ->with([
                'plan:id,name',
                'latestOrder',
            ])
            ->where('status', 1)
            ->whereHas('plan', fn ($query) => $query->where('status', 1))
            ->whereHas('latestOrder', fn ($query) => $query->whereBetween('end_date', [
                $today->toDateString(),
                $lastEligibleDate->toDateString(),
            ]))
            ->addSelect([
                'renewal_end_date' => Order::query()
                    ->select('end_date')
                    ->whereColumn('customer_id', 'customers.id')
                    ->orderByDesc('end_date')
                    ->orderByDesc('id')
                    ->limit(1),
            ])
            ->orderBy('renewal_end_date')
            ->paginate(15)
            ->withQueryString();

        $customers->through(function (Customer $customer) use ($today) {
            $customer->setAttribute(
                'remaining_days',
                (int) $today->diffInDays(Carbon::parse($customer->latestOrder->end_date), false)
            );

            return $customer;
        });

        return Inertia::render('RenewPlan/Index', [
            'customers' => $customers,
        ]);
    }

    /**
     * Search customers for the navbar.
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
        ]);
        $term = $validated['q'];

        $customers = Customer::query()
            ->where(function ($query) use ($term) {
                $query->where('name', 'like', "%{$term}%")
                    ->orWhere('username', 'like', "%{$term}%")
                    ->orWhere('phone', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%");
            })
            ->orderBy('name')
            ->limit(8)
            ->get(['id', 'name', 'username', 'phone', 'email']);

        return response()->json($customers);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $sorting = $request->validate([
            'sort' => ['nullable', 'in:username,name,phone,email,status,created_at'],
            'direction' => ['nullable', 'in:asc,desc'],
        ]);
        $sort = $sorting['sort'] ?? 'created_at';
        $direction = $sorting['direction'] ?? 'desc';

        return Inertia::render('Customers/Index', [
            'customers' => Customer::query()
                ->with('plan:id,name')
                ->orderBy($sort, $direction)
                ->paginate(15)
                ->withQueryString(),
            'sorting' => [
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Customers/Create', [
            'plans' => Plan::query()->orderBy('name')->where('status', 1)->get(['id', 'name', 'vendor_name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Customer::create($request->validate($this->rules()));

        return redirect()->route('customers.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer): Response
    {
        return Inertia::render('Customers/Show', [
            'customer' => $customer->load([
                'plan:id,name,status',
                'orders' => fn ($query) => $query->with('payments')->latest(),
            ]),
            'plans' => Plan::query()
                ->where('status', 1)
                ->orderBy('name')
                ->get(['id', 'name', 'speed', 'price', 'duration']),
        ]);
    }

    public function renewPlan(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'plan_id' => ['required', 'integer', Rule::exists('plans', 'id')->where('status', 1)],
            'start_date' => ['nullable', 'date_format:Y-m-d'],
            'remarks' => ['nullable', 'string'],
        ]);
        $plan = Plan::query()->findOrFail($validated['plan_id']);

        DB::transaction(function () use ($customer, $plan, $validated) {
            $lockedCustomer = Customer::query()
                ->whereKey($customer->id)
                ->lockForUpdate()
                ->firstOrFail();
            $this->createRenewal(
                $lockedCustomer,
                $plan,
                $validated['remarks'] ?? null,
                $validated['start_date'] ?? null,
            );
        });

        return redirect()->route('customers.show', $customer);
    }

    public function bulkRenew(Request $request)
    {
        $validated = $request->validate([
            'customer_ids' => ['required', 'array', 'min:1', 'max:100'],
            'customer_ids.*' => ['required', 'integer', 'distinct', 'exists:customers,id'],
        ]);
        $customerIds = $validated['customer_ids'];
        $renewedCount = count($customerIds);

        DB::transaction(function () use ($customerIds) {
            $customers = Customer::query()
                ->whereIn('id', $customerIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();
            $today = Carbon::today();
            $lastEligibleDate = $today->copy()->addDays(5);
            $renewals = [];

            if ($customers->count() !== count($customerIds)) {
                throw ValidationException::withMessages([
                    'customer_ids' => 'One or more selected customers are no longer available.',
                ]);
            }

            foreach ($customers as $customer) {
                $latestOrder = $customer->orders()
                    ->lockForUpdate()
                    ->orderByDesc('end_date')
                    ->orderByDesc('id')
                    ->first();

                if (
                    $customer->status !== 1
                    || ! $latestOrder
                    || Carbon::parse($latestOrder->end_date)->lt($today)
                    || Carbon::parse($latestOrder->end_date)->gt($lastEligibleDate)
                ) {
                    throw ValidationException::withMessages([
                        'customer_ids' => 'One or more selected customers are no longer eligible for renewal.',
                    ]);
                }

                $plan = Plan::query()
                    ->whereKey($customer->plan_id)
                    ->where('status', 1)
                    ->lockForUpdate()
                    ->first();

                if (! $plan) {
                    throw ValidationException::withMessages([
                        'customer_ids' => 'One or more selected customers no longer have an active plan.',
                    ]);
                }

                $renewals[] = [$customer, $plan];
            }

            foreach ($renewals as [$customer, $plan]) {
                $this->createRenewal($customer, $plan, null);
            }
        });

        return redirect()
            ->route('renew-plan.index')
            ->with('success', "Successfully renewed {$renewedCount} customer plans.");
    }

    public function recordPayment(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'order_id' => ['required', 'integer', Rule::exists('orders', 'id')->where('customer_id', $customer->id)],
            'paid_amount' => ['required', 'numeric', 'decimal:0,2', 'min:0'],
            'payment_date' => ['required', 'date'],
            'mode' => ['required', Rule::in(['Cash', 'Online', 'Cheque'])],
            'remarks' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($customer, $validated) {
            $order = $customer->orders()
                ->whereKey($validated['order_id'])
                ->lockForUpdate()
                ->firstOrFail();
            $dueCents = $this->moneyToCents($order->due_amount);
            $paidCents = $this->moneyToCents($validated['paid_amount']);

            if ($paidCents === 0) {
                throw ValidationException::withMessages([
                    'paid_amount' => 'Enter a payment amount.',
                ]);
            }

            $latestOrderId = $customer->orders()
                ->orderByDesc('end_date')
                ->orderByDesc('id')
                ->value('id');

            if ($order->id !== $latestOrderId && $dueCents <= 0) {
                throw ValidationException::withMessages([
                    'order_id' => 'Payments can only be added to an older renewal with an outstanding balance.',
                ]);
            }

            $order->payments()->create([
                'due_amount' => number_format($dueCents / 100, 2, '.', ''),
                'paid_amount' => number_format($paidCents / 100, 2, '.', ''),
                'payment_date' => $validated['payment_date'],
                'mode' => $validated['mode'],
                'remarks' => $validated['remarks'] ?? null,
            ]);

            $order->update([
                'due_amount' => number_format(($dueCents - $paidCents) / 100, 2, '.', ''),
            ]);
        });

        return redirect()->route('customers.show', $customer);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Customer $customer): Response
    {
        return Inertia::render('Customers/Edit', [
            'customer' => $customer->load('plan:id,name,vendor_name'),
            'plans' => Plan::query()->orderBy('name')->get(['id', 'name', 'vendor_name']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        $customer->update($request->validate($this->rules($customer)));

        return redirect()->route('customers.index');
    }

    public function updateStatus(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'status' => ['required', 'integer', 'in:0,1'],
        ]);
        $customer->update(['status' => $validated['status']]);

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();

        return redirect()->route('customers.index');
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function rules(?Customer $customer = null): array
    {
        return [
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique('customers', 'username')->ignore($customer?->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'address_area' => ['required', 'string', 'max:255'],
            'remarks' => ['nullable', 'string'],
            'status' => ['required', 'integer', 'in:0,1'],
            'plan_id' => ['nullable', 'integer', 'exists:plans,id'],
        ];
    }

    private function moneyToCents(string|int|float $amount): int
    {
        return (int) round((float) $amount * 100);
    }

    private function createRenewal(Customer $customer, Plan $plan, ?string $remarks, ?string $startDate = null): void
    {
        $existingOrders = $customer->orders()
            ->lockForUpdate()
            ->orderByDesc('end_date')
            ->orderByDesc('id')
            ->get();
        $latestOrder = $existingOrders->first();
        $balanceAdjustmentCents = $existingOrders->sum(
            fn (Order $order) => $this->moneyToCents($order->due_amount)
        );
        $renewalStartDate = $startDate
            ? Carbon::parse($startDate)
            : ($latestOrder ? Carbon::parse($latestOrder->end_date)->addDay() : Carbon::today());
        $renewalDueCents = $this->moneyToCents($plan->price) + $balanceAdjustmentCents;

        $customer->orders()->create([
            'order_number' => 'ORD-'.Str::upper(Str::random(12)),
            'start_date' => $renewalStartDate->toDateString(),
            'end_date' => $renewalStartDate->copy()->addMonthsNoOverflow($plan->duration)->toDateString(),
            'plan_name' => $plan->name,
            'plan_speed' => $plan->speed,
            'plan_duration' => (string) $plan->duration,
            'plan_price' => $plan->price,
            'vendor_rate' => $plan->vendor_rate,
            'balance_adjustment' => number_format($balanceAdjustmentCents / 100, 2, '.', ''),
            'due_amount' => number_format($renewalDueCents / 100, 2, '.', ''),
            'remarks' => $remarks,
        ]);

        foreach ($existingOrders as $existingOrder) {
            if ($this->moneyToCents($existingOrder->due_amount) !== 0) {
                $existingOrder->update(['due_amount' => '0.00']);
            }
        }

        $customer->update(['plan_id' => $plan->id]);
    }
}
