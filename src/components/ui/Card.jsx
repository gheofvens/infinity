export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl shadow-md bg-gray-800/60 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
