import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import Chat from './pages/Chat';
import Events from './pages/Events';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import Loading from './components/Loading';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // Check if user is admin (you would typically check this in your database)
      if (user) {
        // In a real app, you would check the user's role in Firestore
        setIsAdmin(user.email === 'admin@example.com');
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="app">
      {currentUser && <Navbar isAdmin={isAdmin} />}
      
      <div className="content">
        <Routes>
          <Route
            path="/"
            element={currentUser ? <Navigate to="/groups" /> : <Auth />}
          />
          <Route
            path="/profile"
            element={currentUser ? <Profile /> : <Navigate to="/" />}
          />
          <Route
            path="/groups"
            element={currentUser ? <Groups /> : <Navigate to="/" />}
          />
          <Route
            path="/groups/:groupId/chat"
            element={currentUser ? <Chat /> : <Navigate to="/" />}
          />
          <Route
            path="/groups/:groupId/events"
            element={currentUser ? <Events /> : <Navigate to="/" />}
          />
          <Route
            path="/admin"
            element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;