import { ServiceCard } from '../components/ServiceCard';
import { services } from '../data/services';

export function Services() {
  return (
    <div className="page-stack">
      <section className="page-title">
        <span className="eyebrow">Services</span>
        <h1>Available medical services</h1>
      </section>

      <section className="service-grid">
        {services.map((item) => (
          <ServiceCard key={item.id} service={item} />
        ))}
      </section>
    </div>
  );
}
