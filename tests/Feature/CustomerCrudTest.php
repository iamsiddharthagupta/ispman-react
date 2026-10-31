<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CustomerCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_guests_cannot_access_customers(): void
    {
        $this->get(route('customers.index'))->assertRedirect('/login');
    }

    public function test_authenticated_users_can_create_view_update_and_delete_a_customer(): void
    {
        $this->actingAs(User::factory()->create());
        $plan = $this->createPlan();

        $this->get(route('customers.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Customers/Index')
                ->has('customers.data', 0));

        $this->get(route('customers.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Customers/Create')
                ->where('plans.0.id', $plan->id)
                ->where('plans.0.vendor_name', $plan->vendor_name));

        $this->post(route('customers.store'), [
            ...$this->validCustomerData(),
            'plan_id' => $plan->id,
        ])->assertRedirect(route('customers.index'));

        $customer = Customer::query()->firstOrFail();
        $this->assertSame('customer-01', $customer->username);
        $this->assertSame(1, $customer->status);
        $this->assertSame($plan->id, $customer->plan_id);
        $this->assertSame($plan->id, $customer->plan->id);

        $this->get(route('customers.show', $customer))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Customers/Show')
                ->where('customer.id', $customer->id)
                ->where('customer.plan.name', $plan->name));

        $this->get(route('customers.edit', $customer))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Customers/Edit')
                ->where('customer.id', $customer->id)
                ->where('customer.plan_id', $plan->id)
                ->where('plans.0.vendor_name', $plan->vendor_name)
                ->where('customer.plan.vendor_name', $plan->vendor_name));

        $this->put(route('customers.update', $customer), [
            ...$this->validCustomerData(),
            'username' => 'customer-02',
            'status' => 0,
            'plan_id' => null,
        ])->assertRedirect(route('customers.index'));

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'username' => 'customer-02',
            'status' => 0,
            'plan_id' => null,
        ]);

        $this->delete(route('customers.destroy', $customer))
            ->assertRedirect(route('customers.index'));

        $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
    }

    public function test_customer_fields_and_plan_are_validated(): void
    {
        $this->actingAs(User::factory()->create());
        Customer::create($this->validCustomerData());

        $this->post(route('customers.store'), [
            ...$this->validCustomerData(),
            'email' => 'not-an-email',
            'status' => 2,
            'plan_id' => 999,
        ])->assertSessionHasErrors(['username', 'email', 'status', 'plan_id']);
    }

    public function test_customer_username_can_remain_unchanged_when_updating(): void
    {
        $this->actingAs(User::factory()->create());
        $customer = Customer::create($this->validCustomerData());

        $this->put(route('customers.update', $customer), $this->validCustomerData())
            ->assertRedirect(route('customers.index'))
            ->assertSessionHasNoErrors();
    }

    public function test_customer_can_renew_a_plan_and_record_payments_against_the_renewal(): void
    {
        Carbon::setTestNow('2026-10-30 12:00:00');
        $this->actingAs(User::factory()->create());
        $customer = Customer::create($this->validCustomerData());
        $plan = $this->createPlan();

        $this->post(route('customers.renewals.store', $customer), [
            'plan_id' => $plan->id,
            'remarks' => 'Monthly renewal',
        ])->assertRedirect(route('customers.show', $customer));

        $order = $customer->orders()->firstOrFail();
        $this->assertSame($plan->id, $customer->fresh()->plan_id);
        $this->assertSame('Home Fiber', $order->plan_name);
        $this->assertSame('2026-10-30', $order->start_date->toDateString());
        $this->assertSame('2026-11-30', $order->end_date->toDateString());
        $this->assertSame('49.99', $order->due_amount);

        $this->get(route('customers.show', $customer))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Customers/Show')
                ->has('customer.orders', 1)
                ->where('customer.orders.0.order_number', $order->order_number)
                ->where('plans.0.id', $plan->id));

        $this->post(route('customers.payments.store', $customer), [
            'order_id' => $order->id,
            'paid_amount' => '20.00',
            'payment_date' => '2026-10-30',
            'mode' => 'Online',
            'remarks' => 'First instalment',
        ])->assertRedirect(route('customers.show', $customer));

        $this->assertDatabaseHas('payments', [
            'order_id' => $order->id,
            'due_amount' => '49.99',
            'paid_amount' => '20.00',
            'mode' => 'Online',
        ]);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'due_amount' => '29.99',
        ]);

        $this->post(route('customers.payments.store', $customer), [
            'order_id' => $order->id,
            'paid_amount' => '10.00',
            'payment_date' => '2026-10-30',
            'mode' => 'Cash',
        ])->assertRedirect(route('customers.show', $customer));

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('payments', 2);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'due_amount' => '19.99',
        ]);
        $this->get(route('customers.show', $customer))
            ->assertInertia(fn (Assert $page) => $page
                ->has('customer.orders', 1)
                ->has('customer.orders.0.payments', 2));

        $this->post(route('customers.payments.store', $customer), [
            'order_id' => $order->id,
            'paid_amount' => '100.00',
            'payment_date' => '2026-10-30',
            'mode' => 'Cash',
        ])->assertRedirect(route('customers.show', $customer));

        $this->assertDatabaseCount('payments', 3);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'due_amount' => '-80.01',
        ]);
    }

    public function test_advance_credit_is_applied_to_the_next_renewal(): void
    {
        Carbon::setTestNow('2026-10-30 12:00:00');
        $this->actingAs(User::factory()->create());
        $customer = Customer::create($this->validCustomerData());
        $plan = $this->createPlan();

        $this->post(route('customers.renewals.store', $customer), [
            'plan_id' => $plan->id,
        ])->assertRedirect(route('customers.show', $customer));
        $firstOrder = $customer->orders()->firstOrFail();

        $this->post(route('customers.payments.store', $customer), [
            'order_id' => $firstOrder->id,
            'paid_amount' => '49.99',
            'payment_date' => '2026-10-30',
            'mode' => 'Cash',
        ])->assertRedirect(route('customers.show', $customer));

        $this->post(route('customers.payments.store', $customer), [
            'order_id' => $firstOrder->id,
            'paid_amount' => '10.00',
            'payment_date' => '2026-10-30',
            'mode' => 'Cash',
        ])->assertRedirect(route('customers.show', $customer));

        $this->post(route('customers.renewals.store', $customer), [
            'plan_id' => $plan->id,
        ])->assertRedirect(route('customers.show', $customer));

        $nextOrder = $customer->orders()->latest('id')->firstOrFail();
        $this->assertSame('-10.00', $nextOrder->balance_adjustment);
        $this->assertSame('39.99', $nextOrder->due_amount);
        $this->assertDatabaseHas('orders', [
            'id' => $firstOrder->id,
            'due_amount' => '0.00',
        ]);
    }

    public function test_outstanding_balance_is_applied_to_the_next_renewal(): void
    {
        Carbon::setTestNow('2026-10-30 12:00:00');
        $this->actingAs(User::factory()->create());
        $customer = Customer::create($this->validCustomerData());
        $plan = $this->createPlan();

        $this->post(route('customers.renewals.store', $customer), [
            'plan_id' => $plan->id,
        ])->assertRedirect(route('customers.show', $customer));
        $firstOrder = $customer->orders()->firstOrFail();

        $this->post(route('customers.payments.store', $customer), [
            'order_id' => $firstOrder->id,
            'paid_amount' => '20.00',
            'payment_date' => '2026-10-30',
            'mode' => 'Cash',
        ])->assertRedirect(route('customers.show', $customer));

        $this->post(route('customers.renewals.store', $customer), [
            'plan_id' => $plan->id,
        ])->assertRedirect(route('customers.show', $customer));

        $nextOrder = $customer->orders()->latest('id')->firstOrFail();
        $this->assertSame('29.99', $nextOrder->balance_adjustment);
        $this->assertSame('79.98', $nextOrder->due_amount);
        $this->assertDatabaseHas('orders', [
            'id' => $firstOrder->id,
            'due_amount' => '0.00',
        ]);
    }

    public function test_renewal_starts_the_day_after_the_most_recent_renewal_ends(): void
    {
        Carbon::setTestNow('2026-10-30 12:00:00');
        $this->actingAs(User::factory()->create());
        $customer = Customer::create($this->validCustomerData());
        $plan = $this->createPlan();
        $customer->orders()->create([
            'order_number' => 'ORD-EXISTING-0001',
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-30',
            'plan_name' => $plan->name,
            'plan_speed' => $plan->speed,
            'plan_duration' => (string) $plan->duration,
            'plan_price' => $plan->price,
            'due_amount' => '0.00',
        ]);

        $this->post(route('customers.renewals.store', $customer), [
            'plan_id' => $plan->id,
        ])->assertRedirect(route('customers.show', $customer));

        $this->assertDatabaseHas('orders', [
            'order_number' => $customer->orders()->latest('id')->value('order_number'),
            'start_date' => '2026-10-31',
            'end_date' => '2026-11-30',
        ]);
    }

    public function test_renewal_uses_the_selected_start_date_and_calculates_its_end_date(): void
    {
        Carbon::setTestNow('2026-10-30 12:00:00');
        $this->actingAs(User::factory()->create());
        $customer = Customer::create($this->validCustomerData());
        $plan = $this->createPlan();

        $this->post(route('customers.renewals.store', $customer), [
            'plan_id' => $plan->id,
            'start_date' => '2026-11-15',
        ])->assertRedirect(route('customers.show', $customer));

        $order = $customer->orders()->firstOrFail();
        $this->assertSame('2026-11-15', $order->start_date->toDateString());
        $this->assertSame('2026-12-15', $order->end_date->toDateString());
    }

    public function test_monthly_renewal_uses_the_calendar_month_end_without_overflow(): void
    {
        Carbon::setTestNow('2028-01-31 12:00:00');
        $this->actingAs(User::factory()->create());
        $customer = Customer::create($this->validCustomerData());
        $plan = $this->createPlan();

        $this->post(route('customers.renewals.store', $customer), [
            'plan_id' => $plan->id,
        ])->assertRedirect(route('customers.show', $customer));

        $order = $customer->orders()->firstOrFail();
        $this->assertSame('2028-01-31', $order->start_date->toDateString());
        $this->assertSame('2028-02-29', $order->end_date->toDateString());

        $plan->update(['duration' => 2]);
        $this->post(route('customers.renewals.store', $customer), [
            'plan_id' => $plan->id,
        ])->assertRedirect(route('customers.show', $customer));

        $nextOrder = $customer->orders()->latest('id')->firstOrFail();
        $this->assertSame('2028-03-01', $nextOrder->start_date->toDateString());
        $this->assertSame('2028-05-01', $nextOrder->end_date->toDateString());
    }

    public function test_customer_cannot_record_payment_for_another_customers_order(): void
    {
        $this->actingAs(User::factory()->create());
        $customer = Customer::create($this->validCustomerData());
        $otherCustomer = Customer::create([
            ...$this->validCustomerData(),
            'username' => 'customer-02',
        ]);
        $plan = $this->createPlan();
        $order = $otherCustomer->orders()->create([
            'order_number' => 'ORD-OTHER-0001',
            'start_date' => '2026-10-30',
            'end_date' => '2026-11-29',
            'plan_name' => $plan->name,
            'plan_speed' => $plan->speed,
            'plan_duration' => (string) $plan->duration,
            'plan_price' => $plan->price,
            'due_amount' => $plan->price,
        ]);

        $this->post(route('customers.payments.store', $customer), [
            'order_id' => $order->id,
            'paid_amount' => '10.00',
            'payment_date' => '2026-10-30',
            'mode' => 'Cash',
        ])->assertSessionHasErrors('order_id');

        $this->assertDatabaseCount('payments', 0);
    }

    /**
     * @return array<string, int|string|null>
     */
    private function validCustomerData(): array
    {
        return [
            'username' => 'customer-01',
            'name' => 'Sam Customer',
            'phone' => '555-0101',
            'email' => 'sam@example.com',
            'address_line_1' => '1 Example Street',
            'address_line_2' => null,
            'address_area' => 'Central',
            'remarks' => null,
            'status' => 1,
            'plan_id' => null,
        ];
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
