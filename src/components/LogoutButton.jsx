import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Button } from "@/components/ui/Button.jsx";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <Button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-4 py-2"
    >
      Выйти
    </Button>
  );
}