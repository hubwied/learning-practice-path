import type { Doctor } from '../types/appointment';

type DoctorCardProps = {
  doctor: Doctor;
  isFavorite: boolean;
  onToggleFavorite: (doctorId: string) => void;
};

export function DoctorCard({ doctor, isFavorite, onToggleFavorite }: DoctorCardProps) {
  return (
    <article className="doctor-card">
      <img src={doctor.photoUrl} alt={doctor.name} />
      <div>
        <span className="eyebrow">{doctor.specialization}</span>
        <h3>{doctor.name}</h3>
        <p>{doctor.description}</p>
        <button
          type="button"
          className={isFavorite ? 'favorite-button active' : 'favorite-button'}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(doctor.id)}
        >
          {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        </button>
      </div>
    </article>
  );
}
