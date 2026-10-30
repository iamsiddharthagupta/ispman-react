import { FormEvent } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { appRoute } from '../../lib/app-route';
import { Plan, PlanFormData } from '../../types/plan';

interface PlanFormProps {
    plan?: Plan;
}

export default function PlanForm({ plan }: PlanFormProps) {
    const { url } = usePage();
    const { data, setData, post, put, processing, errors } = useForm<PlanFormData>({
        name: plan?.name ?? '',
        speed: plan?.speed ?? '',
        price: plan?.price ?? '',
        duration: plan ? String(plan.duration) : '',
        vendor_name: plan?.vendor_name ?? '',
        vendor_rate: plan?.vendor_rate ?? '',
        remarks: plan?.remarks ?? '',
        status: '1',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (plan) {
            put(appRoute(url, `/plans/${plan.id}`));
        } else {
            post(appRoute(url, '/plans'));
        }
    }

    return (
        <form onSubmit={submit}>
            <div className="card card-primary card-outline">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="name" className="form-label">
                                Plan name
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
                            <label htmlFor="speed" className="form-label">
                                Speed
                            </label>
                            <input
                                id="speed"
                                className={`form-control${errors.speed ? ' is-invalid' : ''}`}
                                value={data.speed}
                                onChange={(event) => setData('speed', event.target.value)}
                                placeholder="e.g. 100 Mbps"
                                required
                            />
                            {errors.speed && <div className="invalid-feedback">{errors.speed}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="price" className="form-label">
                                Price
                            </label>
                            <input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                className={`form-control${errors.price ? ' is-invalid' : ''}`}
                                value={data.price}
                                onChange={(event) => setData('price', event.target.value)}
                                required
                            />
                            {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="duration" className="form-label">
                                Duration (days)
                            </label>
                            <input
                                id="duration"
                                type="number"
                                min="1"
                                step="1"
                                className={`form-control${errors.duration ? ' is-invalid' : ''}`}
                                value={data.duration}
                                onChange={(event) => setData('duration', event.target.value)}
                                required
                            />
                            {errors.duration && <div className="invalid-feedback">{errors.duration}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="vendor_name" className="form-label">
                                Vendor name
                            </label>
                            <input
                                id="vendor_name"
                                className={`form-control${errors.vendor_name ? ' is-invalid' : ''}`}
                                value={data.vendor_name}
                                onChange={(event) => setData('vendor_name', event.target.value)}
                                required
                            />
                            {errors.vendor_name && <div className="invalid-feedback">{errors.vendor_name}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="vendor_rate" className="form-label">
                                Vendor rate
                            </label>
                            <input
                                id="vendor_rate"
                                type="number"
                                min="0"
                                step="0.01"
                                className={`form-control${errors.vendor_rate ? ' is-invalid' : ''}`}
                                value={data.vendor_rate}
                                onChange={(event) => setData('vendor_rate', event.target.value)}
                            />
                            {errors.vendor_rate && <div className="invalid-feedback">{errors.vendor_rate}</div>}
                        </div>
                        <div className="col-12 mb-3">
                            <label htmlFor="remarks" className="form-label">
                                Remarks
                            </label>
                            <textarea
                                id="remarks"
                                className={`form-control${errors.remarks ? ' is-invalid' : ''}`}
                                rows={4}
                                value={data.remarks}
                                onChange={(event) => setData('remarks', event.target.value)}
                            />
                            {errors.remarks && <div className="invalid-feedback">{errors.remarks}</div>}
                        </div>
                    </div>
                </div>
                <div className="card-footer d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={processing}>
                        {processing ? 'Saving…' : plan ? 'Update plan' : 'Create plan'}
                    </button>
                    <Link href={appRoute(url, '/plans')} className="btn btn-secondary">
                        Cancel
                    </Link>
                </div>
            </div>
        </form>
    );
}
