import { Navigate } from "react-router-dom";
import { isAuthenticated } from "./authenticator";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const auth = await isAuthenticated();
      setAllowed(auth?.authenticated ?? false);
      setLoading(false);
    };
    check();
  }, []);

  if (loading) return null;

  if (!allowed) {
    return <Navigate to="/Login" replace />;
  }

  return children;
}
