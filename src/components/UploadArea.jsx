import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadArea({ onUpload, multiple = true, accept = "image/*" }) {
  const [loading, setLoading] = useState(false);

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      if (!onUpload) return;
      setLoading(true);
      try {
        await onUpload(acceptedFiles);
      } finally {
        setLoading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    multiple,
    accept,
  });

  return (
    <div
      {...getRootProps()}
      className={`p-6 border-2 border-dashed rounded-xl cursor-pointer transition ${
        isDragActive
          ? "border-green-500 bg-green-500/20"
          : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
      }`}
    >
      <input {...getInputProps()} />
      {loading ? (
        <p className="text-blue-400">Загрузка...</p>
      ) : isDragActive ? (
        <p className="text-green-400">Отпустите файлы здесь</p>
      ) : (
        <p className="text-gray-400">Перетащите файлы сюда или кликните для выбора</p>
      )}
    </div>
  );
}