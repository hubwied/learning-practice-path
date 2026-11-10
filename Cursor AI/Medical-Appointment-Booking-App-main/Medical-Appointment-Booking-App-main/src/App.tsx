import { useState } from 'react';
import { Appointments } from './pages/Appointments';
import { Dashboard } from './pages/Dashboard';
import { Doctors } from './pages/Doctors';
import { NewAppointment } from './pages/NewAppointment';
import { Services } from './pages/Services';

type Page = 'dashboard' | 'doctors' | 'services' | 'new-appointment' | 'appointments';

const navigation: Array<{ id: Page; label: string }> = [
  { id: 'dashboard', label: 'DashboardV2' },
  { id: 'doctors', label: 'Doctors' },
  { id: 'services', label: 'Services' },
  { id: 'new-appointment', label: 'New Appointment' },
  { id: 'appointments', label: 'Appointments' },
];

function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');

  const renderPage = () => {
    if (activePage === 'doctors') {
      return <Doctors />;
    }

    if (activePage === 'services') {
      return <Services />;
    }

    if (activePage === 'new-appointment') {
      return <NewAppointment />;
    }

    if (activePage === 'appointments') {
      return <Appointments />;
    }

    return <Dashboard />;
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">M</div>
          <div>
            <strong>MedBook</strong>
            <span>Clinic scheduling</span>
          </div>
        </div>

        <nav className="navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={activePage === item.id ? 'active' : ''}
              onClick={() => setActivePage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">{renderPage()}</main>
    </div>
  );
}

export default App;
