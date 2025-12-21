import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ItemList = lazy(() => import('./pages/ItemList'));
const ItemDetail = lazy(() => import('./pages/ItemDetail'));
const NewItem = lazy(() => import('./pages/NewItem'));
const MyItems = lazy(() => import('./pages/MyItems'));
const EditItem = lazy(() => import('./pages/EditItem'));
const AccessRequestsDashboard = lazy(() => import('./pages/AccessRequestsDashboard'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-vivid-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-300">Loading...</p>
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <Router>
                <div className="min-h-screen bg-gradient-subtle dark:bg-gradient-to-b dark:from-slate-900 dark:via-deep-900 dark:to-slate-900">
                  <Navbar />
                  <main>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/items" element={<ItemList />} />
                        <Route
                          path="/items/new"
                          element={
                            <PrivateRoute>
                              <NewItem />
                            </PrivateRoute>
                          }
                        />
                        <Route path="/items/:id" element={<ItemDetail />} />
                        <Route
                          path="/items/:id/edit"
                          element={
                            <PrivateRoute>
                              <EditItem />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/myitems"
                          element={
                            <PrivateRoute>
                              <MyItems />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/access-requests"
                          element={
                            <PrivateRoute>
                              <AccessRequestsDashboard />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/notifications"
                          element={
                            <PrivateRoute>
                              <NotificationsPage />
                            </PrivateRoute>
                          }
                        />
                      </Routes>
                    </Suspense>
                  </main>
                </div>
              </Router>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;