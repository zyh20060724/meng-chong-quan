import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <main className="layout__main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
