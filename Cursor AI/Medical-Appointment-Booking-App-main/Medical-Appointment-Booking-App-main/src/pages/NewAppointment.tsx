import { AppointmentManager } from '../components/AppointmentManager';

export function NewAppointment() {
  return (
    <div className="page-stack">
      <section className="page-title">
        <span className="eyebrow">Booking</span>
        <h1>New appointment</h1>
      </section>
      <AppointmentManager view="form" />
    </div>
  );
}
