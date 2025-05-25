import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { getCurrentUserData } from '../api/UserAPI';
import { getRoleById } from '../api/RoleAPI'; // Assuming you have a function to fetch role by ID

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getCurrentUserData({ userId: firebaseUser.uid });
          if (userData.status === 200) {
            // Fetch role data using roleId
            const roleData = await getRoleById({roleId: userData.data.userType});
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
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
