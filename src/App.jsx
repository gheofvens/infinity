import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Cabinet from "./pages/Cabinet";
import { useState } from "react";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth onAuthSuccess={() => setIsAuthenticated(true)} />} />
        <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/auth" />} />
        <Route path="/cabinet" element={isAuthenticated ? <Cabinet /> : <Navigate to="/auth" />} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}