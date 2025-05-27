import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { getCurrentUserData } from '../api/UserAPI';
import { getRoleById } from '../api/RoleAPI';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let mounted = true;

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!mounted) return;

      if (firebaseUser) {
        try {
          const userData = await getCurrentUserData({ userId: firebaseUser.uid });
          if (!mounted) return;

          if (userData.status === 200) {
            const roleData = await getRoleById({roleId: userData.data.userType});
            if (!mounted) return;

            if (roleData.status === 200) {
              setUserRole(roleData.data);
              setUser({
                ...firebaseUser,
                role: roleData.data
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        if (mounted) {
          setUser(null);
          setUserRole(null);
        }
      }
      if (mounted) {
        setLoading(false);
      }
    });

    // Cleanup function
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
