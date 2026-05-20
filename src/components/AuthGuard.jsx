import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/auth';

const AuthGuard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="login-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const ADMIN_EMAILS = ['pj.pompeia.11@gmail.com', 'imperador@gmail.com'];
  const isAdmin = user && (ADMIN_EMAILS.includes(user.email) || user.email === 'imperador@gmail.com');

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={{ user }} />;
};

export default AuthGuard;
