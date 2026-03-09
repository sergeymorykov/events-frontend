import { NavLink } from 'react-router-dom';
import { FaCalendarAlt, FaRandom, FaUser } from 'react-icons/fa';

const baseItemClassName =
  'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors';
const inactiveItemClassName = 'text-gray-500';
const activeItemClassName = 'text-indigo-600';

export const TabBar = () => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden"
      aria-label="Мобильная навигация"
    >
      <div className="mx-auto flex h-16 w-full max-w-2xl">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${baseItemClassName} ${isActive ? activeItemClassName : inactiveItemClassName}`
          }
          aria-label="Мероприятия"
        >
          <FaCalendarAlt className="h-5 w-5" />
          <span>Мероприятия</span>
        </NavLink>
        <NavLink
          to="/swipe"
          className={({ isActive }) =>
            `${baseItemClassName} ${isActive ? activeItemClassName : inactiveItemClassName}`
          }
          aria-label="Свайпы"
        >
          <FaRandom className="h-5 w-5" />
          <span>Свайпы</span>
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${baseItemClassName} ${isActive ? activeItemClassName : inactiveItemClassName}`
          }
          aria-label="Профиль"
        >
          <FaUser className="h-5 w-5" />
          <span>Профиль</span>
        </NavLink>
      </div>
    </nav>
  );
};
