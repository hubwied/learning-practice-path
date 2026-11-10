import { useEffect, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { doctors } from '../data/doctors';
import { services } from '../data/services';
import { getAppointmentsFromStorage } from '../services/storageService';
import type { Appointment } from '../types/appointment';
import { isFutureAppointment } from '../utils/date';

export function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    setAppointments(getAppointmentsFromStorage());
  }, []);

  const upcoming = appointments.filter(
    (item) => item.status === 'Scheduled' && isFutureAppointment(item.date, item.time),
  ).length;
  const cancelled = appointments.filter((item) => item.status === 'Cancelled').length;

  return (
    <div className="page-stack">
      <section className="hero">
        <div>
          <span className="eyebrow">Clinic dashboard</span>
          <h1>Medical Appointment Booking App</h1>
          <p>Manage doctors, services, and patient visits from a clean local-first interface.</p>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="All appointments" value={appointments.length} />
        <StatCard label="Upcoming appointments" value={upcoming} tone="green" />
        <StatCard label="Cancelled appointments" value={cancelled} tone="gray" />
      </section>

      <section className="overview-grid">
        <article className="panel">
          <span className="eyebrow">Care team</span>
          <h2>{doctors.length} doctors available</h2>
          <p>Patients can choose specialists across family medicine, cardiology, dermatology, and more.</p>
        </article>
        <article className="panel">
          <span className="eyebrow">Services</span>
          <h2>{services.length} bookable services</h2>
          <p>The catalog includes consultations, control visits, and specialist appointments.</p>
        </article>
      </section>
    </div>
  );
}
