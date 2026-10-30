<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $sorting = $request->validate([
            'sort' => ['nullable', 'in:name,speed,price,duration,vendor_name,status'],
            'direction' => ['nullable', 'in:asc,desc'],
        ]);
        $sort = $sorting['sort'] ?? 'created_at';
        $direction = $sorting['direction'] ?? 'desc';

        return Inertia::render('Plans/Index', [
            'plans' => Plan::query()->orderBy($sort, $direction)->paginate(15)->withQueryString(),
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
        return Inertia::render('Plans/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Plan::create($request->validate($this->rules()));

        return redirect()->route('plans.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Plan $plan): Response
    {
        return Inertia::render('Plans/Show', [
            'plan' => $plan,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Plan $plan): Response
    {
        return Inertia::render('Plans/Edit', [
            'plan' => $plan,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Plan $plan)
    {
        $plan->update($request->validate($this->rules()));

        return redirect()->route('plans.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Plan $plan)
    {
        $plan->delete();

        return redirect()->route('plans.index');
    }

    /**
     * Get the validation rules for a plan.
     *
     * @return array<string, list<string>>
     */
    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'speed' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'duration' => ['required', 'integer', 'min:1'],
            'vendor_name' => ['required', 'string', 'max:255'],
            'vendor_rate' => ['nullable', 'numeric', 'min:0'],
            'remarks' => ['nullable', 'string'],
            'status' => ['required', 'integer', 'in:0,1'],
        ];
    }
}
