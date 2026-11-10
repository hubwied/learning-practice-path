import type { MedicalService } from '../types/appointment';

type ServiceCardProps = {
  service: MedicalService;
};

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="service-card">
      <div>
        <span className="eyebrow">{service.durationMinutes} min</span>
        <h3>{service.name}</h3>
        <p>{service.description}</p>
      </div>
      <strong>{service.price} PLN</strong>
    </article>
  );
}
