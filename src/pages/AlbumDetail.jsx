import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import UploadArea from "@/components/UploadArea.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input } from "@/components/ui/Input.jsx";

export default function AlbumDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [comments, setComments] = useState({});
  const [sortBy, setSortBy] = useState("created_at");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  async function fetchAlbum() {
    const { data, error } = await supabase
      .from("albums")
      .select("*")
      .eq("id", id)
      .single();
    if (!error) setAlbum(data);
  }

  async function fetchPhotos() {
    let query = supabase
      .from("photos_with_likes")
      .select("*, profiles(username)")
      .eq("album_id", id);

    if (sortBy === "created_at")
      query = query.order("created_at", { ascending: false });
    if (sortBy === "username")
      query = query.order("profiles.username", { ascending: true });

    const { data, error } = await query;
    if (!error) setPhotos(data);
  }

  async function fetchComments(photoId) {
    const { data, error } = await supabase
      .from("comments_with_users")
      .select("*")
      .eq("photo_id", photoId)
      .order("created_at", { ascending: true });
    if (!error) {
      setComments((prev) => ({ ...prev, [photoId]: data }));
    }
  }

  async function handleUpload(files) {
    setLoading(true);
    try {
      for (const file of files) {
        const fileName = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("photos")
          .getPublicUrl(fileName);

        const { error: insertError } = await supabase.from("photos").insert([
          { url: publicUrl, album_id: id, account_id: user.id }
        ]);
        if (insertError) throw insertError;
      }
      fetchPhotos();
      setFile(null);
    } catch (err) {
      console.error("Ошибка загрузки:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleLike(photoId) {
    const { data, error } = await supabase
      .from("photo_likes")
      .select("*")
      .eq("photo_id", photoId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) return console.error(error);

    if (data) {
      // Уже лайкнул → убираем
      await supabase
        .from("photo_likes")
        .delete()
        .eq("id", data.id);
    } else {
      // Новый лайк
      await supabase.from("photo_likes").insert([
        { photo_id: photoId, user_id: user.id }
      ]);
    }

    fetchPhotos();
  }

  async function addComment(photoId) {
    if (!newComment.trim()) return;
    await supabase.from("photo_comments").insert([
      { photo_id: photoId, user_id: user.id, text: newComment }
    ]);
    setNewComment("");
    fetchComments(photoId);
  }

  useEffect(() => {
    fetchAlbum();
    fetchPhotos();
  }, [id, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white p-6">
      {album ? (
        <>
          <h1 className="text-3xl font-bold mb-2">{album.title}</h1>
          <p className="text-gray-400 mb-6">
            Альбом ID: {album.id} • Фото: {photos.length}
          </p>

          {/* Фильтры */}
          <div className="mb-6 flex gap-4">
            <label>
              Сортировка:{" "}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-xl px-3 py-1"
              >
                <option value="created_at">По дате</option>
                <option value="username">По пользователю</option>
              </select>
            </label>
          </div>

          {/* Загрузка фото */}
          <UploadArea onUpload={handleUpload} multiple={true} accept="image/*" />

          {/* Фото */}
          {photos.length === 0 ? (
            <p className="text-gray-400 mt-6">Фотографий пока нет.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  className="relative group rounded-xl overflow-hidden border border-gray-700 shadow-lg p-3 bg-gray-900/60"
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={photo.url}
                    alt="photo"
                    className="w-full h-64 object-cover rounded-xl mb-2"
                  />

                  {/* Автор и лайки */}
                  <div className="flex justify-between items-center text-sm text-gray-300 mb-2">
                    <span>{photo.profiles?.username ?? "Неизвестный"}</span>
                    <button
                      onClick={() => toggleLike(photo.id)}
                      className="flex items-center gap-1"
                    >
                      ❤️ {photo.likes_count}
                    </button>
                  </div>

                  {/* Комментарии */}
                  <div className="space-y-1 mb-2 max-h-32 overflow-y-auto text-sm">
                    {(comments[photo.id] || []).map((c) => (
                      <div key={c.id} className="text-gray-400">
                        <b className="text-white">{c.username}: </b>
                        {c.text}
                      </div>
                    ))}
                  </div>

                  {/* Добавить комментарий */}
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Комментарий..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 bg-gray-800 border-gray-600 rounded-xl text-sm"
                    />
                    <Button
                      onClick={() => addComment(photo.id)}
                      className="bg-blue-500 text-white rounded-xl text-sm px-3"
                    >
                      Отправить
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-400">Загрузка альбома...</p>
      )}
    </div>
  );
}