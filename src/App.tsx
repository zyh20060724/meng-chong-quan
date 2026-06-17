import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Friends from './pages/Friends';
import PostPage from './pages/Post';
import PetPage from './pages/Pet';
import Profile from './pages/Profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { currentUser } = useApp();

  return (
    <Routes>
      <Route path="/welcome" element={currentUser ? <Navigate to="/" replace /> : <Onboarding />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/post" element={<PostPage />} />
        <Route path="/pet" element={<PetPage />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to={currentUser ? '/' : '/welcome'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
