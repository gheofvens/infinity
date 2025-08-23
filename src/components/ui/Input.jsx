export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring ${className}`}
    />
  );
}
