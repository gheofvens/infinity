import { motion } from "framer-motion";

export default function Logo() {
  return (
    <div className="w-28 h-28 flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 600 400"
        className="w-full h-full"
      >
        <path
          d="M150,200 C150,100 300,100 300,200 C300,300 150,300 150,200 Z"
          fill="none"
          stroke="white"
          strokeWidth="40"
          strokeLinecap="round"
        />
        <path
          d="M300,200 C300,100 450,100 450,200 C450,300 300,300 300,200 Z"
          fill="none"
          stroke="white"
          strokeWidth="40"
          strokeLinecap="round"
        />
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
