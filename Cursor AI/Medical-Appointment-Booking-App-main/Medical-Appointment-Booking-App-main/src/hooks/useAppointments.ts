import { useCallback, useEffect, useState } from 'react';
import {
  addAppointmentToStorage,
  getAppointmentsFromStorage,
  updateAppointmentsInStorage,
} from '../services/storageService';
import type { Appointment, AppointmentFormData } from '../types/appointment';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    setAppointments(getAppointmentsFromStorage());
  }, []);

  const createAppointment = useCallback((formData: AppointmentFormData) => {
    const temp: Appointment = {
      id: `appointment-${Date.now()}`,
      patientName: formData.patientName,
      doctorId: formData.doctorId,
      serviceId: formData.serviceId,
      date: formData.date,
      time: formData.time,
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
    };

    const result = addAppointmentToStorage(temp);
    setAppointments(result);
    return temp;
  }, []);

  const cancelAppointment = useCallback((appointmentId: string) => {
    const result = appointments.map((item) =>
      item.id === appointmentId ? { ...item, status: 'Cancelled' as const } : item,
    );

    updateAppointmentsInStorage(result);
    setAppointments(result);
  }, [appointments]);

  return {
    appointments,
    setAppointments,
    createAppointment,
    cancelAppointment,
  };
};
