import { FormEvent } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { appRoute } from '../../lib/app-route';
import { Customer, CustomerFormData, CustomerPlan } from '../../types/customer';

interface CustomerFormProps {
    customer?: Customer;
    plans: CustomerPlan[];
}

export default function CustomerForm({ customer, plans }: CustomerFormProps) {
    const { url } = usePage();
    const { data, setData, post, put, processing, errors } = useForm<CustomerFormData>({
        username: customer?.username ?? '',
        name: customer?.name ?? '',
        phone: customer?.phone ?? '',
        email: customer?.email ?? '',
        address_line_1: customer?.address_line_1 ?? '',
        address_line_2: customer?.address_line_2 ?? '',
        address_area: customer?.address_area ?? '',
        remarks: customer?.remarks ?? '',
        status: '1',
        plan_id: customer?.plan_id ? String(customer.plan_id) : '',
        vendor_name: customer?.plan?.vendor_name ?? '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (customer) {
            put(appRoute(url, `/customers/${customer.id}`));
        } else {
            post(appRoute(url, '/customers'));
        }
    }

    return (
        <form onSubmit={submit}>
            <div className="card card-primary card-outline">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="username" className="form-label">
                                Username
                            </label>
                            <input
                                id="username"
                                className={`form-control${errors.username ? ' is-invalid' : ''}`}
                                value={data.username}
                                onChange={(event) => setData('username', event.target.value)}
                                required
                            />
                            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="name" className="form-label">
                                Full name
                            </label>
                            <input
                                id="name"
                                className={`form-control${errors.name ? ' is-invalid' : ''}`}
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                required
                            />
                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="phone" className="form-label">
                                Phone
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                className={`form-control${errors.phone ? ' is-invalid' : ''}`}
                                value={data.phone}
                                onChange={(event) => setData('phone', event.target.value)}
                                required
                            />
                            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                className={`form-control${errors.email ? ' is-invalid' : ''}`}
                                value={data.email}
                                onChange={(event) => setData('email', event.target.value)}
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="address_line_1" className="form-label">
                                Address line 1
                            </label>
                            <input
                                id="address_line_1"
                                className={`form-control${errors.address_line_1 ? ' is-invalid' : ''}`}
                                value={data.address_line_1}
                                onChange={(event) => setData('address_line_1', event.target.value)}
                                required
                            />
                            {errors.address_line_1 && <div className="invalid-feedback">{errors.address_line_1}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="address_line_2" className="form-label">
                                Address line 2
                            </label>
                            <input
                                id="address_line_2"
                                className={`form-control${errors.address_line_2 ? ' is-invalid' : ''}`}
                                value={data.address_line_2}
                                onChange={(event) => setData('address_line_2', event.target.value)}
                            />
                            {errors.address_line_2 && <div className="invalid-feedback">{errors.address_line_2}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="address_area" className="form-label">
                                Area
                            </label>
                            <select
                                id="address_area"
                                className={`form-select${errors.address_area ? ' is-invalid' : ''}`}
                                value={data.address_area}
                                onChange={(event) => setData('address_area', event.target.value)}
                                required
                            >
                                <option value="">Select area</option>
                                <option value="Krishna Nagar">Krishna Nagar</option>
                                <option value="Arjun Nagar">Arjun Nagar</option>
                                <option value="Humayunpur">Humayunpur</option>
                                <option value="B-4">B-4</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.address_area && <div className="invalid-feedback">{errors.address_area}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="plan_id" className="form-label">
                                Internet plan
                            </label>
                            <select
                                id="plan_id"
                                className={`form-select${errors.plan_id ? ' is-invalid' : ''}`}
                                value={data.plan_id}
                                onChange={(event) => setData('plan_id', event.target.value)}
                            >
                                <option value="">No plan assigned</option>
                                {plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} - {plan.vendor_name}
                                    </option>
                                ))}
                            </select>
                            {errors.plan_id && <div className="invalid-feedback">{errors.plan_id}</div>}
                        </div>
                        <div className="col-12 mb-3">
                            <label htmlFor="remarks" className="form-label">
                                Remarks
                            </label>
                            <textarea
                                id="remarks"
                                className={`form-control${errors.remarks ? ' is-invalid' : ''}`}
                                rows={1}
                                value={data.remarks}
                                onChange={(event) => setData('remarks', event.target.value)}
                            />
                            {errors.remarks && <div className="invalid-feedback">{errors.remarks}</div>}
                        </div>
                    </div>
                </div>
                <div className="card-footer d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={processing}>
                        {processing ? 'Saving…' : customer ? 'Update customer' : 'Create customer'}
                    </button>
                    <Link href={appRoute(url, '/customers')} className="btn btn-secondary">
                        Cancel
                    </Link>
                </div>
            </div>
        </form>
    );
}
