<?php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PlanCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_plans(): void
    {
        $this->get(route('plans.index'))->assertRedirect('/login');
    }

    public function test_authenticated_users_can_create_view_update_and_delete_a_plan(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get(route('plans.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Plans/Index')
                ->has('plans.data', 0));

        $this->post(route('plans.store'), $this->validPlanData())
            ->assertRedirect(route('plans.index'));

        $plan = Plan::query()->firstOrFail();
        $this->assertSame('Home Fiber', $plan->name);
        $this->assertSame(1, $plan->status);

        $this->get(route('plans.show', $plan))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Plans/Show')
                ->where('plan.id', $plan->id)
                ->where('plan.name', 'Home Fiber'));

        $this->get(route('plans.edit', $plan))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Plans/Edit')
                ->where('plan.id', $plan->id));

        $this->put(route('plans.update', $plan), [
            ...$this->validPlanData(),
            'name' => 'Business Fiber',
            'status' => 0,
        ])->assertRedirect(route('plans.index'));

        $this->assertDatabaseHas('plans', [
            'id' => $plan->id,
            'name' => 'Business Fiber',
            'status' => 0,
        ]);

        $this->delete(route('plans.destroy', $plan))
            ->assertRedirect(route('plans.index'));

        $this->assertDatabaseMissing('plans', ['id' => $plan->id]);
    }

    public function test_plan_fields_are_validated(): void
    {
        $this->actingAs(User::factory()->create());

        $this->post(route('plans.store'), [
            ...$this->validPlanData(),
            'price' => '-1',
            'duration' => '0',
            'status' => 2,
        ])->assertSessionHasErrors(['price', 'duration', 'status']);
    }

    public function test_plan_list_can_be_sorted_without_filtering(): void
    {
        $this->actingAs(User::factory()->create());

        Plan::create([
            ...$this->validPlanData(),
            'name' => 'Fiber Basic',
            'price' => '30.00',
            'status' => 1,
        ]);
        Plan::create([
            ...$this->validPlanData(),
            'name' => 'Fiber Premium',
            'price' => '80.00',
            'status' => 1,
        ]);
        Plan::create([
            ...$this->validPlanData(),
            'name' => 'Wireless Premium',
            'price' => '95.00',
            'status' => 0,
        ]);

        $this->get(route('plans.index', [
            'search' => 'Fiber',
            'status' => 'active',
            'sort' => 'price',
            'direction' => 'desc',
        ]))->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Plans/Index')
                ->where('sorting.sort', 'price')
                ->where('sorting.direction', 'desc')
                ->has('plans.data', 3)
                ->where('plans.data.0.name', 'Wireless Premium')
                ->where('plans.data.1.name', 'Fiber Premium')
                ->where('plans.data.2.name', 'Fiber Basic'));

        $this->get(route('plans.index', ['sort' => 'password']))
            ->assertSessionHasErrors('sort');
    }

    /**
     * @return array<string, int|string|null>
     */
    private function validPlanData(): array
    {
        return [
            'name' => 'Home Fiber',
            'speed' => '100 Mbps',
            'price' => '49.99',
            'duration' => '30',
            'vendor_name' => 'Fiber Vendor',
            'vendor_rate' => '25.00',
            'remarks' => null,
            'status' => 1,
        ];
    }
}
