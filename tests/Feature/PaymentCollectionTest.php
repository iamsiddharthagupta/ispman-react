<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PaymentCollectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_payment_collection(): void
    {
        $this->get(route('collect-payment.index'))->assertRedirect('/login');
        $this->post(route('collect-payment.store'))->assertRedirect('/login');
    }

    public function test_collection_page_lists_only_outstanding_renewals_and_supports_search(): void
    {
        $this->actingAs(User::factory()->create());
        $plan = $this->createPlan();
        $customer = $this->createCustomer('customer-one', 'Avery Customer', '555-0101', $plan, '40.00');
        $this->createCustomer('customer-two', 'Taylor Customer', '555-0102', $plan, '0.00');
        $this->createCustomer('customer-three', 'Jordan Customer', '555-0103', $plan, '-5.00');

        $this->get(route('collect-payment.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('CollectPayment/Index')
                ->has('orders.data', 1)
                ->where('orders.data.0.customer.id', $customer->id)
                ->where('orders.data.0.due_amount', '40.00')
                ->where('orders.total', 1));

        $this->get(route('collect-payment.index', ['search' => '555-0101']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('CollectPayment/Index')
                ->where('search', '555-0101')
                ->has('orders.data', 1));
    }

    public function test_single_and_bulk_payments_update_balances_and_record_payment_details(): void
    {
        $this->actingAs(User::factory()->create());
        $plan = $this->createPlan();
        $firstCustomer = $this->createCustomer('customer-one', 'Avery Customer', '555-0101', $plan, '40.00');
        $secondCustomer = $this->createCustomer('customer-two', 'Taylor Customer', '555-0102', $plan, '75.00');
        $thirdCustomer = $this->createCustomer('customer-three', 'Jordan Customer', '555-0103', $plan, '50.00');
        $firstOrder = $firstCustomer->orders()->firstOrFail();
        $secondOrder = $secondCustomer->orders()->firstOrFail();
        $thirdOrder = $thirdCustomer->orders()->firstOrFail();

        $this->post(route('collect-payment.store'), [
            'payments' => [['order_id' => $firstOrder->id, 'paid_amount' => '10.00']],
            'payment_date' => '2026-11-01',
            'mode' => 'Cash',
        ])->assertRedirect(route('collect-payment.index'));

        $this->post(route('collect-payment.store'), [
            'payments' => [
                ['order_id' => $secondOrder->id, 'paid_amount' => '25.50'],
                ['order_id' => $thirdOrder->id, 'paid_amount' => '20.00'],
            ],
            'payment_date' => '2026-11-01',
            'mode' => 'Online',
            'remarks' => 'Counter collection',
        ])->assertRedirect(route('collect-payment.index'));

        $this->assertDatabaseHas('payments', [
            'order_id' => $firstOrder->id,
            'due_amount' => '40.00',
            'paid_amount' => '10.00',
            'payment_date' => '2026-11-01',
            'mode' => 'Cash',
        ]);
        $this->assertDatabaseHas('payments', [
            'order_id' => $secondOrder->id,
            'due_amount' => '75.00',
            'paid_amount' => '25.50',
            'mode' => 'Online',
            'remarks' => 'Counter collection',
        ]);
        $this->assertDatabaseHas('payments', [
            'order_id' => $thirdOrder->id,
            'due_amount' => '50.00',
            'paid_amount' => '20.00',
        ]);
        $this->assertDatabaseHas('orders', ['id' => $firstOrder->id, 'due_amount' => '30.00']);
        $this->assertDatabaseHas('orders', ['id' => $secondOrder->id, 'due_amount' => '49.50']);
        $this->assertDatabaseHas('orders', ['id' => $thirdOrder->id, 'due_amount' => '30.00']);
    }

    public function test_bulk_collection_rolls_back_all_payments_if_a_selected_balance_is_no_longer_outstanding(): void
    {
        $this->actingAs(User::factory()->create());
        $plan = $this->createPlan();
        $firstCustomer = $this->createCustomer('customer-one', 'Avery Customer', '555-0101', $plan, '40.00');
        $paidCustomer = $this->createCustomer('customer-two', 'Taylor Customer', '555-0102', $plan, '0.00');

        $this->post(route('collect-payment.store'), [
            'payments' => [
                ['order_id' => $firstCustomer->orders()->value('id'), 'paid_amount' => '10.00'],
                ['order_id' => $paidCustomer->orders()->value('id'), 'paid_amount' => '5.00'],
            ],
            'payment_date' => '2026-11-01',
            'mode' => 'Cash',
        ])->assertSessionHasErrors('payments');

        $this->assertDatabaseCount('payments', 0);
        $this->assertDatabaseHas('orders', [
            'customer_id' => $firstCustomer->id,
            'due_amount' => '40.00',
        ]);
    }

    public function test_collection_validates_amounts_modes_and_duplicate_orders(): void
    {
        $this->actingAs(User::factory()->create());
        $customer = $this->createCustomer('customer-one', 'Avery Customer', '555-0101', $this->createPlan(), '40.00');
        $orderId = $customer->orders()->value('id');

        $this->post(route('collect-payment.store'), [
            'payments' => [
                ['order_id' => $orderId, 'paid_amount' => '0'],
                ['order_id' => $orderId, 'paid_amount' => '10.00'],
            ],
            'payment_date' => '2026-11-01',
            'mode' => 'Wire',
        ])->assertSessionHasErrors(['payments.0.paid_amount', 'payments.1.order_id', 'mode']);

        $this->assertDatabaseCount('payments', 0);
    }

    private function createCustomer(string $username, string $name, string $phone, Plan $plan, string $dueAmount): Customer
    {
        $customer = Customer::create([
            'username' => $username,
            'name' => $name,
            'phone' => $phone,
            'email' => null,
            'address_line_1' => '1 Example Street',
            'address_line_2' => null,
            'address_area' => 'Central',
            'remarks' => null,
            'status' => 1,
            'plan_id' => $plan->id,
        ]);

        $customer->orders()->create([
            'order_number' => 'ORD-'.strtoupper(str_replace('-', '', $username)),
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-31',
            'plan_name' => $plan->name,
            'plan_speed' => $plan->speed,
            'plan_duration' => (string) $plan->duration,
            'plan_price' => $plan->price,
            'due_amount' => $dueAmount,
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
