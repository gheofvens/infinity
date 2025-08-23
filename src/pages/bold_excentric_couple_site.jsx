import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button.jsx";
import { Card, CardContent } from "@/components/ui/Card.jsx";
import { Input } from "@/components/ui/Input.jsx";

function Logo() {
  return (
    <div className="w-28 h-28 flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 600 400"
        className="w-full h-full"
      >
        {/* Левая петля бесконечности */}
        <path
          d="M150,200 C150,100 300,100 300,200 C300,300 150,300 150,200 Z"
          fill="none"
          stroke="white"
          strokeWidth="40"
          strokeLinecap="round"
        />

        {/* Правая петля бесконечности (цельная) */}
        <path
          d="M300,200 C300,100 450,100 450,200 C450,300 300,300 300,200 Z"
          fill="none"
          stroke="white"
          strokeWidth="40"
          strokeLinecap="round"
        />

        {/* Крупное сердце смещено правее в правой петле */}
        <motion.path
          d="M430 260
             C430 230 480 230 480 260
             C480 290 430 330 430 330
             C430 330 380 290 380 260
             C380 230 430 230 430 260 Z"
          fill="red"
          animate={{ scale: [1, 1.2, 1] }}
          transformOrigin="center"
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState("auth"); // auth | main | cabinet
  const [showWelcome, setShowWelcome] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [photos, setPhotos] = useState([
    "/demo/photo1.jpg",
    "/demo/photo2.jpg",
    "/demo/photo3.jpg"
  ]);
  const [stories, setStories] = useState([
    { img: "/demo/story1.jpg", text: "Наш первый влог 🎥", audio: "/demo/audio1.mp3" },
    { img: "/demo/story2.jpg", text: "Танцы под дождём 💃🕺", audio: "/demo/audio2.mp3" }
  ]);
  const [posts, setPosts] = useState([
    { text: "Сегодня невероятный день! ✨", media: "/demo/photo1.jpg" }
  ]);

  const [newPostText, setNewPostText] = useState("");
  const [newPostFile, setNewPostFile] = useState(null);

  const audioRef = useRef(null);
  const playAudio = (src) => {
    if (audioRef.current) {
      audioRef.current.src = src;
      audioRef.current.play();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isLogin && password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setIsAuthenticated(true);
    setShowWelcome(true);
    setTimeout(() => setShowWelcome(false), 3000);
    setPage("main");
  };

  const handleAddPost = () => {
    if (!newPostText && !newPostFile) return;

    const newPost = {
      text: newPostText,
      media: newPostFile ? URL.createObjectURL(newPostFile) : null
    };

    setPosts([newPost, ...posts]);
    setNewPostText("");
    setNewPostFile(null);
  };

  const welcomeText = "Бесконечность - она здесь!".split("");

  // ----------- AUTH PAGE -----------
  if (page === "auth") {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white flex flex-col items-center justify-center p-4 sm:p-8">
        {/* Logo */}
        <Logo />

        <motion.div
          className="relative z-10 w-full max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-gray-900/80 backdrop-blur-2xl border border-gray-700 shadow-2xl">
            <CardContent className="p-6 sm:p-8">
              <div className="flex justify-center mb-6 gap-2 sm:gap-4">
                <Button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 rounded-xl ${isLogin ? "bg-white text-gray-800" : "bg-gray-700 text-white"}`}
                >
                  Вход
                </Button>
                <Button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 rounded-xl ${!isLogin ? "bg-white text-gray-800" : "bg-gray-700 text-white"}`}
                >
                  Регистрация
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-gray-800 text-white border-gray-600"
                />
                <Input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-gray-800 text-white border-gray-600"
                />
                {!isLogin && (
                  <Input
                    type="password"
                    placeholder="Подтвердите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl bg-gray-800 text-white border-gray-600"
                  />
                )}
                {error && <div className="rounded-lg bg-red-500/20 border border-red-400/40 text-red-300 px-3 py-2">{error}</div>}
                {success && <div className="rounded-lg bg-green-500/20 border border-green-400/40 text-green-300 px-3 py-2">{success}</div>}
                <Button type="submit" className="w-full rounded-xl bg-white text-gray-800 hover:bg-gray-200 py-3">
                  {isLogin ? "Войти" : "Зарегистрироваться"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ----------- MAIN PAGE -----------
  if (page === "main") {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white">
        <audio ref={audioRef} className="hidden" />

        {/* Welcome text */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center text-4xl sm:text-6xl font-extrabold text-white drop-shadow-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {welcomeText.map((char, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="mx-0.5"
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700 shadow-lg">
          <div className="flex items-center gap-4">
            <Logo />
            <h1 className="text-2xl font-bold text-white">Главная</h1>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => setPage("cabinet")} className="rounded-xl bg-white text-gray-800 hover:bg-gray-200 px-4">Личный кабинет</Button>
            <Button onClick={() => { setPage("auth"); setIsAuthenticated(false); }} className="rounded-xl bg-white text-gray-800 hover:bg-gray-200 px-4">Выйти</Button>
          </div>
        </div>

        {/* Stories */}
        <motion.div className="p-6">
          <h2 className="text-3xl font-bold mb-6">Истории</h2>
          <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4">
            {stories.map((story, idx) => (
              <motion.div
                key={idx}
                className="min-w-[160px] max-w-[160px] aspect-[9/16] snap-center relative rounded-2xl overflow-hidden shadow-xl border border-gray-600 bg-gray-700/70 flex items-end cursor-pointer"
                whileHover={{ scale: 1.05, y: -5, boxShadow: "0px 8px 25px rgba(0,0,0,0.4)" }}
                onClick={() => playAudio(story.audio)}
              >
                <img src={story.img} alt={`story-${idx}`} className="absolute inset-0 w-full h-full object-cover" />
                <div className="relative z-10 w-full bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-sm text-white font-semibold">{story.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Gallery */}
        <motion.div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <h2 className="col-span-full text-3xl font-bold mb-4">Фото</h2>
          {photos.map((photo, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.05 }} className="overflow-hidden rounded-2xl shadow-xl bg-gray-800/70 border border-gray-700">
              <img src={photo} alt={`photo-${idx}`} className="w-full h-64 object-cover" />
            </motion.div>
          ))}
        </motion.div>

        {/* Blog / News feed */}
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
          {/* Add new post */}
          <Card className="bg-gray-900/70 backdrop-blur-xl border border-gray-700 mt-6">
            <CardContent className="p-4 space-y-4">
              <Input
                type="text"
                placeholder="Что у вас нового?"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                className="w-full bg-gray-800 text-white border-gray-600"
              />
              <Input
                type="file"
                onChange={(e) => setNewPostFile(e.target.files[0])}
                className="w-full bg-gray-800 text-white border-gray-600"
              />
              <Button onClick={handleAddPost} className="rounded-xl bg-white text-gray-800 hover:bg-gray-200">Поделиться</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ----------- CABINET PAGE -----------
  if (page === "cabinet") {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white">
        <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700 shadow-lg">
          <h1 className="text-2xl font-bold text-white">Личный кабинет</h1>
          <div className="flex gap-4">
            <Button onClick={() => setPage("main")} className="rounded-xl bg-white text-gray-800 hover:bg-gray-200 px-4">Главная</Button>
            <Button onClick={() => { setPage("auth"); setIsAuthenticated(false); }} className="rounded-xl bg-white text-gray-800 hover:bg-gray-200 px-4">Выйти</Button>
          </div>
        </div>

        {/* Edit attachments */}
        <motion.div className="p-6">
          <h2 className="text-3xl font-bold mb-6">Редактирование вложений</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative group">
                <img src={photo} alt={`photo-${idx}`} className="rounded-xl shadow-xl border border-gray-700" />
                <Button
                  onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                  className="absolute top-2 right-2 bg-red-600/80 text-white hover:bg-red-500 px-3 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition"
                >Удалить</Button>
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
}