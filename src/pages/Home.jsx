import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button.jsx";
import { Card, CardContent } from "@/components/ui/Card.jsx";
import { Input } from "@/components/ui/Input.jsx";
import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [photos, setPhotos] = useState(["/demo/photo1.jpg","/demo/photo2.jpg","/demo/photo3.jpg"]);
  const [stories] = useState([
    { img: "/demo/story1.jpg", text: "Наш первый влог 🎥", audio: "/demo/audio1.mp3" },
    { img: "/demo/story2.jpg", text: "Танцы под дождём 💃🕺", audio: "/demo/audio2.mp3" }
  ]);
  const [posts, setPosts] = useState([{ text: "Сегодня невероятный день! ✨", media: "/demo/photo1.jpg" }]);
  const [newPostText, setNewPostText] = useState("");
  const [newPostFile, setNewPostFile] = useState(null);

  const navigate = useNavigate();
  const audioRef = useRef(null);

  const playAudio = (src) => {
    if (audioRef.current) {
      audioRef.current.src = src;
      audioRef.current.play();
    }
  };

  const handleAddPost = () => {
    if (!newPostText && !newPostFile) return;
    const newPost = { text: newPostText, media: newPostFile ? URL.createObjectURL(newPostFile) : null };
    setPosts([newPost, ...posts]);
    setNewPostText("");
    setNewPostFile(null);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white">
      <audio ref={audioRef} className="hidden" />
      <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700 shadow-lg">
        <div className="flex items-center gap-4">
          <Logo />
          <h1 className="text-2xl font-bold text-white">Главная</h1>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => navigate("/cabinet")} className="rounded-xl bg-white text-gray-800 hover:bg-gray-200 px-4">Личный кабинет</Button>
          <Button onClick={() => navigate("/auth")} className="rounded-xl bg-white text-gray-800 hover:bg-gray-200 px-4">Выйти</Button>
        </div>
      </div>
      <motion.div className="p-6">
        <h2 className="text-3xl font-bold mb-6">Истории</h2>
        <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4">
          {stories.map((story, idx) => (
            <motion.div key={idx} className="min-w-[160px] max-w-[160px] aspect-[9/16] snap-center relative rounded-2xl overflow-hidden shadow-xl border border-gray-600 bg-gray-700/70 flex items-end cursor-pointer" whileHover={{ scale: 1.05, y: -5 }} onClick={() => playAudio(story.audio)}>
              <img src={story.img} alt={`story-\${idx}`} className="absolute inset-0 w-full h-full object-cover" />
              <div className="relative z-10 w-full bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-sm text-white font-semibold">{story.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <motion.div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <h2 className="col-span-full text-3xl font-bold mb-4">Фото</h2>
        {photos.map((photo, idx) => (
          <motion.div key={idx} whileHover={{ scale: 1.05 }} className="overflow-hidden rounded-2xl shadow-xl bg-gray-800/70 border border-gray-700">
            <img src={photo} alt={`photo-\${idx}`} className="w-full h-64 object-cover" />
          </motion.div>
        ))}
      </motion.div>
      <motion.div className="p-6">
        <h2 className="text-3xl font-bold mb-6">Новости</h2>
        <div className="space-y-6">
          {posts.map((post, idx) => (
            <Card key={idx} className="bg-gray-900/70 backdrop-blur-xl border border-gray-700">
              <CardContent className="p-4 text-white">
                {post.media && <img src={post.media} alt="post" className="rounded-xl mb-4" />}
                <p>{post.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-gray-900/70 backdrop-blur-xl border border-gray-700 mt-6">
          <CardContent className="p-4 space-y-4">
            <Input type="text" placeholder="Что у вас нового?" value={newPostText} onChange={(e) => setNewPostText(e.target.value)} className="w-full bg-gray-800 text-white border-gray-600" />
            <Input type="file" onChange={(e) => setNewPostFile(e.target.files[0])} className="w-full bg-gray-800 text-white border-gray-600" />
            <Button onClick={handleAddPost} className="rounded-xl bg-white text-gray-800 hover:bg-gray-200">Поделиться</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
