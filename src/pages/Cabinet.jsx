import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { useNavigate } from "react-router-dom";

export default function Cabinet() {
  const [photos, setPhotos] = useState(["/demo/photo1.jpg","/demo/photo2.jpg","/demo/photo3.jpg"]);
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white">
      <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700 shadow-lg">
        <h1 className="text-2xl font-bold text-white">Личный кабинет</h1>
        <div className="flex gap-4">
          <Button onClick={() => navigate("/home")} className="rounded-xl bg-white text-gray-800 hover:bg-gray-200 px-4">Главная</Button>
          <Button onClick={() => navigate("/auth")} className="rounded-xl bg-white text-gray-800 hover:bg-gray-200 px-4">Выйти</Button>
        </div>
      </div>
      <motion.div className="p-6">
        <h2 className="text-3xl font-bold mb-6">Редактирование вложений</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative group">
              <img src={photo} alt={`photo-\${idx}`} className="rounded-xl shadow-xl border border-gray-700" />
              <Button onClick={() => setPhotos(photos.filter((_, i) => i !== idx))} className="absolute top-2 right-2 bg-red-600/80 text-white hover:bg-red-500 px-3 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition">
                Удалить
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Input type="file" className="mb-3 bg-gray-800 text-white border-gray-600" />
          <Button className="rounded-xl bg-white text-gray-800 hover:bg-gray-200">Добавить фото/видео</Button>
        </div>
      </motion.div>
    </div>
  );
}
