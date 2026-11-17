import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Hide sidebar on login page
  const isLogin = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-primary-bg flex">
      {!isLogin && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0 ml-0 lg:ml-64">
        <Header />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;