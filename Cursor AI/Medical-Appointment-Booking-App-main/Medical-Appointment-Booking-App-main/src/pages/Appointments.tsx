import { AppointmentManager } from '../components/AppointmentManager';

export function Appointments() {
  return (
    <div className="page-stack">
      <section className="page-title">
        <span className="eyebrow">Schedule</span>
        <h1>Appointments</h1>
      </section>
      <AppointmentManager view="list" />
    </div>
  );
}
