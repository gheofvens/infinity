import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/Button.jsx";
import { Input } from "@/components/ui/Input.jsx";
import UploadArea from "@/components/UploadArea.jsx";

export default function Stories() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Получаем stories
  async function fetchStories() {
    const { data, error } = await supabase
      .from("stories")
      .select("*, profiles(username)")
      .eq("account_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (!error && data) setStories(data);
  }

  // Загрузка story
  async function handleUpload(files) {
    setLoading(true);
    try {
      for (const file of files) {
        const fileName = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("stories")
          .upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("stories")
          .getPublicUrl(fileName);

        const { error: insertError } = await supabase.from("stories").insert([
          { content: publicUrl, account_id: user.id }
        ]);
        if (insertError) throw insertError;
      }
      fetchStories();
      setFile(null);
    } catch (err) {
      console.error("Ошибка загрузки сторис:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // Удаление своей story
  async function handleDeleteStory(storyId) {
    const { error } = await supabase.rpc("soft_delete", {
      table_name: "stories",
      row_id: storyId,
    });
    if (!error) {
      fetchStories();
      setCurrentIndex(0);
    }
  }

  // Автоплей с прогрессом
  useEffect(() => {
    if (stories.length === 0) return;
    setProgress(0);
    const duration = 5000;
    const interval = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);
      if (elapsed >= duration) {
        clearInterval(timer);
        setCurrentIndex((prev) => (prev + 1) % stories.length);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, stories]);

  useEffect(() => {
    fetchStories();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white p-6 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Stories</h1>

      {/* Story player */}
      <div className="relative w-full max-w-lg h-[600px] bg-black rounded-xl overflow-hidden flex items-center justify-center mb-6">
        {stories.length === 0 ? (
          <p className="text-gray-400">Сторис пока нет.</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.img
              key={stories[currentIndex].id}
              src={stories[currentIndex].content}
              alt="story"
              className="w-full h-full object-contain"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />
          </AnimatePresence>
        )}

        {/* Навигация */}
        {stories.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev === 0 ? stories.length - 1 : prev - 1
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 px-3 py-2 rounded-full hover:bg-black/70"
            >
              ◀
            </button>
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev + 1) % stories.length)
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 px-3 py-2 rounded-full hover:bg-black/70"
            >
              ▶
            </button>
          </>
        )}

        {/* Username + delete */}
        {stories.length > 0 && (
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-black/60 px-3 py-1 rounded-xl text-sm text-gray-300">
            <span>{stories[currentIndex].profiles?.username ?? "Неизвестный"}</span>
            {stories[currentIndex].account_id === user.id && (
              <Button
                onClick={() => handleDeleteStory(stories[currentIndex].id)}
                className="bg-red-600 text-white px-3 py-1 rounded-xl"
              >
                Удалить
              </Button>
            )}
          </div>
        )}

        {/* Progress bar */}
        {stories.length > 0 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700">
            <motion.div
              className="h-1 bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>
        )}
      </div>

      {/* Загрузка новой story */}
      <div className="w-full max-w-lg space-y-4">
        {/* Вариант 1 — drag&drop */}
        <UploadArea
          onUpload={handleUpload}
          multiple={false}
          accept="image/*,video/*"
        />

        {/* Вариант 2 — input + кнопка */}
        <div>
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-3 bg-gray-800 text-white border-gray-600"
          />
          <Button
            onClick={() => handleUpload([file])}
            disabled={loading || !file}
            className="w-full bg-white text-gray-800 hover:bg-gray-200 rounded-xl disabled:opacity-50"
          >
            {loading ? "Загрузка..." : "Добавить story"}
          </Button>
        </div>
      </div>
    </div>
  );
}