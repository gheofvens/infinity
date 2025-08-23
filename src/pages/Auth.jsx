import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button.jsx";
import { Card, CardContent } from "@/components/ui/Card.jsx";
import { Input } from "@/components/ui/Input.jsx";
import Logo from "@/components/Logo";

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    onAuthSuccess();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white flex flex-col items-center justify-center p-4 sm:p-8">
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
                className={`flex-1 rounded-xl \${isLogin ? "bg-white text-gray-800" : "bg-gray-700 text-white"}`}
              >
                Вход
              </Button>
              <Button
                onClick={() => setIsLogin(false)}
                className={`flex-1 rounded-xl \${!isLogin ? "bg-white text-gray-800" : "bg-gray-700 text-white"}`}
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
