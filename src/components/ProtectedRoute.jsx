import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center mt-10">Загрузка...</p>;
  if (!user) return <Navigate to="/auth" replace />;

  return children;
}