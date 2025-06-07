import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Review from '../pages/Review';
import Home from '../pages/Home';
import PrivateRoute from './PrivateRoute';
import ErrorBoundary from '../components/ErrorBoundary';
import NotFound from '../pages/NotFound';
import History from '../pages/History';
import Profile from '../pages/Profile';

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/review"
          element={
            <PrivateRoute>
              <Review />
            </PrivateRoute>
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
} 