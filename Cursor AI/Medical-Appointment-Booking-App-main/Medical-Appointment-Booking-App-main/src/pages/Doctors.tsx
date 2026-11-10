import { DoctorCard } from '../components/DoctorCard';
import { doctors } from '../data/doctors';

export function Doctors() {
  return (
    <div className="page-stack">
      <section className="page-title">
        <span className="eyebrow">Doctors</span>
        <h1>Choose a specialist</h1>
      </section>

      <section className="cards-grid">
        {doctors.map((item) => (
          <DoctorCard key={item.id} doctor={item} />
        ))}
      </section>
    </div>
  );
}
