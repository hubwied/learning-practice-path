import type { MedicalService } from '../types/appointment';

export const services: MedicalService[] = [
  {
    id: 'service-1',
    name: 'Konsultacja ogolna',
    description: 'General consultation for everyday symptoms, prevention, and basic diagnostics.',
    durationMinutes: 30,
    price: 180,
  },
  {
    id: 'service-2',
    name: 'Badania kontrolne',
    description: 'Follow-up visit to review results, medication, and treatment progress.',
    durationMinutes: 25,
    price: 150,
  },
  {
    id: 'service-3',
    name: 'Konsultacja kardiologiczna',
    description: 'Heart health consultation with treatment recommendations and next steps.',
    durationMinutes: 45,
    price: 280,
  },
  {
    id: 'service-4',
    name: 'Konsultacja dermatologiczna',
    description: 'Skin condition assessment, treatment plan, and preventive advice.',
    durationMinutes: 30,
    price: 230,
  },
  {
    id: 'service-5',
    name: 'Konsultacja ortopedyczna',
    description: 'Orthopedic consultation for pain, injuries, mobility, and rehabilitation planning.',
    durationMinutes: 40,
    price: 260,
  },
];
