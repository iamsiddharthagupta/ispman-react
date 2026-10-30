<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Plan;
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
            'plans' => Plan::query()->orderBy('name')->get(['id', 'name', 'vendor_name']),
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
                'plan:id,name',
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
            'remarks' => ['nullable', 'string'],
        ]);
        $plan = Plan::query()->findOrFail($validated['plan_id']);

        DB::transaction(function () use ($customer, $plan, $validated) {
            $lockedCustomer = Customer::query()
                ->whereKey($customer->id)
                ->lockForUpdate()
                ->firstOrFail();
            $latestEndDate = $lockedCustomer->orders()
                ->orderByDesc('end_date')
                ->orderByDesc('id')
                ->value('end_date');
            $startDate = $latestEndDate
                ? Carbon::parse($latestEndDate)->addDay()
                : Carbon::today();

            $lockedCustomer->orders()->create([
                'order_number' => 'ORD-'.Str::upper(Str::random(12)),
                'start_date' => $startDate->toDateString(),
                'end_date' => $startDate->copy()->addMonthsNoOverflow($plan->duration)->toDateString(),
                'plan_name' => $plan->name,
                'plan_speed' => $plan->speed,
                'plan_duration' => (string) $plan->duration,
                'plan_price' => $plan->price,
                'due_amount' => $plan->price,
                'remarks' => $validated['remarks'] ?? null,
            ]);

            $lockedCustomer->update(['plan_id' => $plan->id]);
        });

        return redirect()->route('customers.show', $customer);
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

            if ($paidCents > $dueCents) {
                throw ValidationException::withMessages([
                    'paid_amount' => 'The payment cannot exceed the outstanding due.',
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
}
