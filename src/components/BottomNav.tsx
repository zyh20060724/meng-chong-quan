import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const tabs = [
  { to: '/', label: '主页', icon: '🏠' },
  { to: '/friends', label: '好友', icon: '👫' },
  { to: '/post', label: '发文', icon: '✏️', center: true },
  { to: '/pet', label: '宠物', icon: '🐾' },
  { to: '/profile', label: '我的', icon: '👤' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `bottom-nav__item${tab.center ? ' bottom-nav__item--center' : ''}${isActive ? ' bottom-nav__item--active' : ''}`
          }
        >
          <span className="bottom-nav__icon">{tab.icon}</span>
          <span className="bottom-nav__label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
