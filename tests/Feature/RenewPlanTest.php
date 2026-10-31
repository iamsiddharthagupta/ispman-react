<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RenewPlanTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_renewal_page_only_lists_active_customers_expiring_within_five_days(): void
    {
        Carbon::setTestNow('2026-10-30 12:00:00');
        $this->actingAs(User::factory()->create());
        $plan = $this->createPlan();
        $expiresToday = $this->createCustomer('customer-today', $plan, '2026-10-30');
        $expiresInFiveDays = $this->createCustomer('customer-five-days', $plan, '2026-11-04');
        $this->createCustomer('customer-six-days', $plan, '2026-11-05');
        $this->createCustomer('customer-expired', $plan, '2026-10-29');
        $this->createCustomer('customer-inactive', $plan, '2026-10-30', 0);

        $this->get(route('renew-plan.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('RenewPlan/Index')
                ->has('customers.data', 2)
                ->where('customers.data.0.id', $expiresToday->id)
                ->where('customers.data.0.remaining_days', 0)
                ->where('customers.data.1.id', $expiresInFiveDays->id)
                ->where('customers.data.1.remaining_days', 5)
                ->where('customers.total', 2));
    }

    public function test_bulk_renewal_renews_all_selected_customers_with_their_assigned_plan(): void
    {
        Carbon::setTestNow('2026-10-30 12:00:00');
        $this->actingAs(User::factory()->create());
        $plan = $this->createPlan();
        $firstCustomer = $this->createCustomer('customer-first', $plan, '2026-10-30');
        $secondCustomer = $this->createCustomer('customer-second', $plan, '2026-11-02');

        $this->post(route('renew-plan.bulk'), [
            'customer_ids' => [$firstCustomer->id, $secondCustomer->id],
        ])->assertRedirect(route('renew-plan.index'))
            ->assertSessionHas('success', 'Successfully renewed 2 customer plans.');

        $this->assertDatabaseCount('orders', 4);
        $this->assertDatabaseHas('orders', [
            'customer_id' => $firstCustomer->id,
            'start_date' => '2026-10-31',
            'plan_name' => $plan->name,
        ]);
        $this->assertDatabaseHas('orders', [
            'customer_id' => $secondCustomer->id,
            'start_date' => '2026-11-03',
            'plan_name' => $plan->name,
        ]);
    }

    public function test_bulk_renewal_rejects_customers_that_are_no_longer_eligible(): void
    {
        Carbon::setTestNow('2026-10-30 12:00:00');
        $this->actingAs(User::factory()->create());
        $plan = $this->createPlan();
        $expiredCustomer = $this->createCustomer('customer-expired', $plan, '2026-10-29');

        $this->post(route('renew-plan.bulk'), [
            'customer_ids' => [$expiredCustomer->id],
        ])->assertSessionHasErrors('customer_ids');

        $this->assertDatabaseCount('orders', 1);
    }

    private function createCustomer(string $username, Plan $plan, string $endDate, int $status = 1): Customer
    {
        $customer = Customer::create([
            'username' => $username,
            'name' => $username,
            'phone' => '555-0101',
            'email' => null,
            'address_line_1' => '1 Example Street',
            'address_line_2' => null,
            'address_area' => 'Central',
            'remarks' => null,
            'status' => $status,
            'plan_id' => $plan->id,
        ]);
        $customer->orders()->create([
            'order_number' => 'ORD-'.strtoupper(str_replace('-', '', $username)),
            'start_date' => Carbon::parse($endDate)->subMonthNoOverflow()->toDateString(),
            'end_date' => $endDate,
            'plan_name' => $plan->name,
            'plan_speed' => $plan->speed,
            'plan_duration' => (string) $plan->duration,
            'plan_price' => $plan->price,
            'due_amount' => $plan->price,
        ]);

        return $customer;
    }

    private function createPlan(): Plan
    {
        return Plan::create([
            'name' => 'Home Fiber',
            'speed' => '100 Mbps',
            'price' => '49.99',
            'duration' => 1,
            'vendor_name' => 'Fiber Vendor',
            'vendor_rate' => '25.00',
            'remarks' => null,
            'status' => 1,
        ]);
    }
}
