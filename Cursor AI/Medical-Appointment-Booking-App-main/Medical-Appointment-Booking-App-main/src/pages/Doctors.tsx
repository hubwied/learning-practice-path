import { DoctorCard } from '../components/DoctorCard';
import { doctors } from '../data/doctors';
import { useFavoriteDoctors } from '../hooks/useFavoriteDoctors';

export function Doctors() {
  const { favoriteIds, toggleFavorite } = useFavoriteDoctors();

  return (
    <div className="page-stack">
      <section className="page-title">
        <span className="eyebrow">Doctors</span>
        <h1>Choose a specialist</h1>
        <p>{favoriteIds.length} favorite doctors</p>
      </section>

      <section className="cards-grid">
        {doctors.map((item) => (
          <DoctorCard
            key={item.id}
            doctor={item}
            isFavorite={favoriteIds.includes(item.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </section>
    </div>
  );
}
