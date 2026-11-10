import type { Doctor } from '../types/appointment';

type DoctorCardProps = {
  doctor: Doctor;
};

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <article className="doctor-card">
      <img src={doctor.photoUrl} alt={doctor.name} />
      <div>
        <span className="eyebrow">{doctor.specialization}</span>
        <h3>{doctor.name}</h3>
        <p>{doctor.description}</p>
      </div>
    </article>
  );
}
