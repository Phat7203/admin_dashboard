import React, { createContext, useState, useContext, useEffect } from "react";
import { auth } from "../firebase/firebase";
import { getCurrentUserData } from "../api/UserAPI";
import { getRoleById } from "../api/RoleAPI";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    console.log("AuthProvider mounted");
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!mounted) return;
      setLoading(true);
      if (firebaseUser) {
        // Gán tạm firebaseUser ngay lập tức
        setUser(firebaseUser);

        try {
          const userData = await getCurrentUserData({
            userId: firebaseUser.uid,
          });
          if (!mounted) return;

          if (userData.status === 200) {
            const roleData = await getRoleById(
              userData.data.userType,
            );
            if (!mounted) return;

            if (roleData.status === 200) {
              setUserRole(roleData.data);
              setUser({
                ...userData.data,
                role: roleData.data,
              });
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("userRole");
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  return (
    <AuthContext.Provider value={{ user, userRole, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
