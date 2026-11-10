import { type FormEvent, useEffect, useState } from 'react';
import { doctors } from '../data/doctors';
import { services } from '../data/services';
import { getAppointmentsFromStorage, saveAppointmentsToStorage } from '../services/storageService';
import type { Appointment, AppointmentFormData, AppointmentStatus } from '../types/appointment';
import { formatAppointmentDate, getTodayInputValue } from '../utils/date';

type AppointmentManagerProps = { view?: 'form' | 'list' | 'full' };

const emptyForm: AppointmentFormData = {
  patientName: '',
  doctorId: doctors[0]?.id ?? '',
  serviceId: services[0]?.id ?? '',
  date: getTodayInputValue(),
  time: '09:00',
};

function filterScheduled(data: Appointment[]) {
  return data.filter((item) => item.status === 'Scheduled');
}

function filterCompleted(data: Appointment[]) {
  return data.filter((item) => item.status === 'Completed');
}

function filterCancelled(data: Appointment[]) {
  return data.filter((item) => item.status === 'Cancelled');
}

function sortAppointments(data: Appointment[]) {
  return [...data].sort((a, b) => {
    const first = new Date(`${a.date}T${a.time}:00`).getTime();
    const second = new Date(`${b.date}T${b.time}:00`).getTime();
    return first - second;
  });
}

function getDoctorName(doctorId: string) {
  const result = doctors.find((item) => item.id === doctorId);
  return result ? result.name : 'Unknown doctor';
}

function getDoctorSpecialization(doctorId: string) {
  const result = doctors.find((item) => item.id === doctorId);
  return result ? result.specialization : 'Unknown specialization';
}

function getServiceName(serviceId: string) {
  const result = services.find((item) => item.id === serviceId);
  return result ? result.name : 'Unknown service';
}

function getServicePrice(serviceId: string) {
  const result = services.find((item) => item.id === serviceId);
  return result ? result.price : 0;
}

function isFormValid(value: AppointmentFormData) {
  return (
    value.patientName.trim().length > 2 &&
    value.doctorId.length > 0 &&
    value.serviceId.length > 0 &&
    value.date.length > 0 &&
    value.time.length > 0
  );
}

export function AppointmentManager({ view = 'full' }: AppointmentManagerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState<AppointmentFormData>(emptyForm);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [showCancelled, setShowCancelled] = useState(true);

  useEffect(() => {
    const data = getAppointmentsFromStorage();
    setAppointments(data);
  }, []);

  const scheduledCount = filterScheduled(appointments).length;
  const completedCount = filterCompleted(appointments).length;
  const cancelledCount = filterCancelled(appointments).length;
  const selectedDoctor = doctors.find((item) => item.id === form.doctorId);
  const selectedService = services.find((item) => item.id === form.serviceId);

  const handleInputChange = (field: keyof AppointmentFormData, value: string) => setForm({ ...form, [field]: value });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid(form)) {
      setMessage('Please complete all required fields before booking.');
      return;
    }

    const temp: Appointment = {
      id: `appointment-${Date.now()}`,
      patientName: form.patientName,
      doctorId: form.doctorId,
      serviceId: form.serviceId,
      date: form.date,
      time: form.time,
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
    };

    const result = [temp, ...appointments];
    setAppointments(result);
    saveAppointmentsToStorage(result);
    setForm({ ...emptyForm, doctorId: form.doctorId, serviceId: form.serviceId });
    setMessage('Appointment booked successfully.');
  };

  const cancelAppointment = (appointmentId: string) => {
    const result = appointments.map((item) => {
      if (item.id === appointmentId) {
        return { ...item, status: 'Cancelled' as AppointmentStatus };
      }

      return item;
    });

    setAppointments(result);
    saveAppointmentsToStorage(result);
    setMessage('Appointment cancelled.');
  };

  const deleteAppointment = (appointmentId: string) => {
    const result = appointments.filter((item) => item.id !== appointmentId);
    const temp = result.find((item) => item.id === appointmentId);
    const doctorName = getDoctorName(temp!.doctorId);

    setAppointments(result);
    saveAppointmentsToStorage(result);
    setMessage(`Appointment with ${doctorName} removed.`);
  };

  let filteredAppointments = appointments;

  if (statusFilter === 'Scheduled') filteredAppointments = filterScheduled(filteredAppointments);
  if (statusFilter === 'Completed') filteredAppointments = filterCompleted(filteredAppointments);
  if (statusFilter === 'Cancelled') filteredAppointments = filterCancelled(filteredAppointments);

  if (!showCancelled) {
    filteredAppointments = filteredAppointments.filter((item) => item.status !== 'Cancelled');
  }

  if (search.trim()) {
    const value = search.toLowerCase();
    filteredAppointments = filteredAppointments.filter((item) => {
      const doctor = getDoctorName(item.doctorId).toLowerCase();
      const service = getServiceName(item.serviceId).toLowerCase();
      const patient = item.patientName.toLowerCase();
      return patient.includes(value) || doctor.includes(value) || service.includes(value);
    });
  }

  const sortedAppointments = sortAppointments(filteredAppointments);

  const renderBookingForm = () => (
    <section className="panel booking-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">New Appointment</span>
          <h2>Book a visit</h2>
        </div>
        <span className="availability-pill">Local storage only</span>
      </div>

      {message && <div className="message">{message}</div>}

      <form className="appointment-form" onSubmit={handleSubmit}>
        <label>
          <span>Patient</span>
          <input value={form.patientName} onChange={(event) => handleInputChange('patientName', event.target.value)} placeholder="Patient name" />
        </label>

        <label>
          <span>Doctor</span>
          <select value={form.doctorId} onChange={(event) => handleInputChange('doctorId', event.target.value)}>
            {doctors.map((item) => (
              <option key={item.id} value={item.id}>{item.name} - {item.specialization}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Service</span>
          <select value={form.serviceId} onChange={(event) => handleInputChange('serviceId', event.target.value)}>
            {services.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>

        <div className="form-row">
          <label>
            <span>Date</span>
            <input type="date" value={form.date} onChange={(event) => handleInputChange('date', event.target.value)} />
          </label>
          <label>
            <span>Time</span>
            <input type="time" value={form.time} onChange={(event) => handleInputChange('time', event.target.value)} />
          </label>
        </div>

        <div className="selection-summary">
          <div>
            <span>Selected doctor</span>
            <strong>{selectedDoctor?.name}</strong>
            <small>{selectedDoctor?.specialization}</small>
          </div>
          <div>
            <span>Selected service</span>
            <strong>{selectedService?.name}</strong>
            <small>{selectedService?.durationMinutes} min</small>
          </div>
        </div>

        <button className="primary-button" type="submit">Book appointment</button>
      </form>
    </section>
  );

  const renderAppointmentsList = () => (
    <section className="panel list-panel">
      <div className="section-heading appointments-heading">
        <div>
          <span className="eyebrow">Appointments</span>
          <h2>Manage bookings</h2>
        </div>
        <div className="small-stats">
          <span>{scheduledCount} scheduled</span>
          <span>{completedCount} completed</span>
          <span>{cancelledCount} cancelled</span>
        </div>
      </div>

      {message && view === 'list' && <div className="message">{message}</div>}

      <div className="filters">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by patient, doctor, or service" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as AppointmentStatus | 'All')}>
          <option value="All">All statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <label className="toggle-control">
          <input type="checkbox" checked={showCancelled} onChange={(event) => setShowCancelled(event.target.checked)} />
          <span>Show cancelled</span>
        </label>
      </div>

      <div className="appointment-list">
        {sortedAppointments.map((item) => (
          <article className="appointment-card" key={item.id}>
            <div className="appointment-main">
              <span className={`status-badge status-${item.status.toLowerCase()}`}>{item.status}</span>
              <h3>{item.patientName}</h3>
              <p>{formatAppointmentDate(item.date, item.time)}</p>
            </div>
            <div className="appointment-details">
              <span>Doctor</span>
              <strong>{getDoctorName(item.doctorId)}</strong>
              <small>{getDoctorSpecialization(item.doctorId)}</small>
            </div>
            <div className="appointment-details">
              <span>Service</span>
              <strong>{getServiceName(item.serviceId)}</strong>
              <small>{getServicePrice(item.serviceId)} PLN</small>
            </div>
            <div className="appointment-actions">
              <button className="secondary-button" onClick={() => cancelAppointment(item.id)} disabled={item.status !== 'Scheduled'}>Cancel</button>
              {item.status === 'Cancelled' && (
                <button className="danger-button" onClick={() => deleteAppointment(item.id)}>Remove</button>
              )}
            </div>
          </article>
        ))}

        {sortedAppointments.length === 0 && (
          <div className="empty-state">
            <h3>No appointments found</h3>
            <p>Try changing the search phrase or status filter.</p>
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className={view === 'full' ? 'appointment-manager' : 'appointment-manager single'}>
      {view !== 'list' && renderBookingForm()}
      {view !== 'form' && renderAppointmentsList()}
    </div>
  );
}
