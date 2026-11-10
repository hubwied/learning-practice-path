export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  description: string;
  photoUrl: string;
}

export interface MedicalService {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorId: string;
  serviceId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface AppointmentFormData {
  patientName: string;
  doctorId: string;
  serviceId: string;
  date: string;
  time: string;
}
