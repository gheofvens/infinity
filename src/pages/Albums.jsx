import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/Button.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { useNavigate } from "react-router-dom";

export default function Albums() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function fetchAlbums() {
    if (!user) return;
    const { data, error } = await supabase
      .from("active_albums")
      .select("*")
      .eq("account_id", user.id) // ⚡️ если у тебя аккаунты отдельные — заменить на account_id
      .order("created_at", { ascending: false });

    if (error) console.error("Ошибка загрузки альбомов:", error.message);
    else setAlbums(data);
  }

  async function handleCreateAlbum(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("albums").insert([
        { title: newTitle, account_id: user.id }
      ]);
      if (error) throw error;
      setNewTitle("");
      fetchAlbums();
    } catch (err) {
      console.error("Ошибка создания альбома:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlbums();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Альбомы</h1>

      {/* Форма создания альбома */}
      <form onSubmit={handleCreateAlbum} className="flex gap-2 mb-8">
        <Input
          type="text"
          placeholder="Название альбома"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 bg-gray-800 text-white border-gray-600 rounded-xl"
        />
        <Button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white rounded-xl px-4 disabled:opacity-50"
        >
          {loading ? "Создаём..." : "Создать"}
        </Button>
      </form>

      {/* Список альбомов */}
      {albums.length === 0 ? (
        <p className="text-gray-400">Альбомов пока нет.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {albums.map((album) => (
            <motion.div
              key={album.id}
              className="bg-gray-900/80 border border-gray-700 rounded-xl p-4 shadow-lg flex flex-col justify-between hover:shadow-2xl transition cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/albums/${album.id}`)}
            >
              <div>
                <h2 className="text-xl font-bold mb-2">{album.title}</h2>
                <p className="text-gray-400 text-sm">
                  Фото: {album.photos_count ?? 0}
                </p>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/albums/${album.id}`);
                }}
                className="mt-4 bg-white text-gray-800 hover:bg-gray-200 rounded-xl"
              >
                Открыть
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}