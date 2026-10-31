<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $this->actingAs($user = User::factory()->create());

        $this->get('/dashboard')->assertOk();
    }

    public function test_dashboard_metrics_and_monthly_charts_use_customer_order_and_payment_data(): void
    {
        Carbon::setTestNow('2026-10-31 12:00:00');
        $this->actingAs(User::factory()->create());
        $plan = Plan::create([
            'name' => 'Home Fiber',
            'speed' => '100 Mbps',
            'price' => '100.00',
            'duration' => 1,
            'vendor_name' => 'Fiber Vendor',
            'vendor_rate' => '25.00',
            'status' => 1,
        ]);
        $active = $this->createDashboardCustomer($plan, 'active-customer', '2026-11-30', '2026-10-01', '40.00');
        $lapsed = $this->createDashboardCustomer($plan, 'lapsed-customer', '2026-09-30', '2026-09-01', '20.00');
        $recentlyExpired = $this->createDashboardCustomer($plan, 'recent-customer', '2026-10-30', '2026-10-10', '10.00');

        $active->orders()->firstOrFail()->payments()->create([
            'due_amount' => '100.00',
            'paid_amount' => '100.00',
            'payment_date' => '2026-10-31',
            'mode' => 'Cash',
        ]);
        $lapsed->orders()->firstOrFail()->payments()->create([
            'due_amount' => '60.00',
            'paid_amount' => '60.00',
            'payment_date' => '2026-10-30',
            'mode' => 'Online',
        ]);

        $this->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('metrics.activeCustomers', 1)
                ->where('metrics.inactiveCustomers', 1)
                ->where('metrics.todayPayments', 100)
                ->where('metrics.newCustomers', 2)
                ->where('monthlyData.11.month', '2026-10')
                ->where('monthlyData.11.payments', 160)
                ->where('monthlyData.11.vendorRate', 50)
                ->where('monthlyData.11.customers', 2));
    }

    private function createDashboardCustomer(
        Plan $plan,
        string $username,
        string $endDate,
        string $createdAt,
        string $vendorRate,
    ): Customer {
        $customer = Customer::create([
            'username' => $username,
            'name' => $username,
            'phone' => '555-0101',
            'address_line_1' => '1 Example Street',
            'address_area' => 'Central',
            'status' => 1,
            'plan_id' => $plan->id,
        ]);
        $customer->forceFill([
            'created_at' => Carbon::parse($createdAt),
            'updated_at' => Carbon::parse($createdAt),
        ])->saveQuietly();
        $order = $customer->orders()->create([
            'order_number' => 'ORD-'.strtoupper(str_replace('-', '', $username)),
            'start_date' => Carbon::parse($endDate)->subMonthNoOverflow()->toDateString(),
            'end_date' => $endDate,
            'plan_name' => $plan->name,
            'plan_speed' => $plan->speed,
            'plan_duration' => (string) $plan->duration,
            'plan_price' => $plan->price,
            'vendor_rate' => $vendorRate,
            'due_amount' => $plan->price,
        ]);
        $order->forceFill([
            'created_at' => Carbon::parse($createdAt),
            'updated_at' => Carbon::parse($createdAt),
        ])->saveQuietly();

        return $customer;
    }
}
