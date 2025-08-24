import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button.jsx";
import { Input } from "@/components/ui/Input.jsx";
import LogoutButton from "../components/LogoutButton";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Cabinet() {
  const { user } = useAuth();

  // Альбомы и фото
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Аккаунт и участники
  const [account, setAccount] = useState(null);
  const [members, setMembers] = useState([]);
  const [inviteCode, setInviteCode] = useState("");

  // Текущий пользователь
  const [myPermissions, setMyPermissions] = useState({
    can_add: false,
    can_edit: false,
    can_delete: false,
  });
  const [myRole, setMyRole] = useState("guest");

  // =============================
  // Аккаунт и участники
  // =============================
  async function fetchAccount() {
    if (!user) return;
    const { data, error } = await supabase
      .from("accounts")
      .select("id, invite_code")
      .eq("owner_id", user.id) // ⚡️ если у тебя есть связь user→account — можно заменить
      .single();

    if (!error && data) {
      setAccount(data);
      fetchMembers(data.id);
      fetchAlbums(data.id);
    }
  }

  async function fetchMembers(accountId) {
    const { data, error } = await supabase
      .from("account_members")
      .select(`
        user_id,
        role,
        permissions,
        profiles(username)
      `)
      .eq("account_id", accountId);

    if (!error && data) {
      setMembers(data);

      // Найти текущего пользователя и его права
      const me = data.find((m) => m.user_id === user.id);
      if (me) {
        setMyPermissions(me.permissions || {});
        setMyRole(me.role);
      }
    }
  }

  async function updateMember(userId, newRole, newPermissions) {
    if (!account) return;
    const { error } = await supabase
      .from("account_members")
      .update({
        role: newRole,
        permissions: newPermissions,
      })
      .eq("account_id", account.id)
      .eq("user_id", userId);

    if (!error) fetchMembers(account.id);
  }

  // =============================
  // Альбомы и фото
  // =============================
  async function fetchAlbums(accountId) {
    const { data, error } = await supabase
      .from("active_albums")
      .select("*")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAlbums(data);
      if (data.length > 0 && !selectedAlbum) {
        setSelectedAlbum(data[0].id);
      }
    }
  }

  async function fetchPhotos(albumId) {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("album_id", albumId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (!error && data) setPhotos(data);
  }

  async function handleUpload() {
    if (files.length === 0 || !selectedAlbum) return;
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
          { url: publicUrl, album_id: selectedAlbum, account_id: account.id },
        ]);
        if (insertError) throw insertError;
      }
      await fetchPhotos(selectedAlbum);
      setFiles([]);
    } catch (err) {
      console.error("Ошибка загрузки:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePhoto(photoId) {
    const { error } = await supabase.rpc("soft_delete", {
      table_name: "photos",
      row_id: photoId,
    });
    if (!error) fetchPhotos(selectedAlbum);
  }

  // =============================
  // Приглашения
  // =============================
  async function joinByInvite() {
    if (!inviteCode.trim()) return;

    try {
      const { data: acc, error: accError } = await supabase
        .from("accounts")
        .select("id")
        .eq("invite_code", inviteCode)
        .single();

      if (accError || !acc) throw new Error("Код не найден");

      const { error: insertError } = await supabase.from("account_members").insert([
        {
          account_id: acc.id,
          user_id: user.id,
          role: "pending",
        },
      ]);

      if (insertError) throw insertError;

      alert("Заявка отправлена!");
      setInviteCode("");
    } catch (err) {
      alert("Ошибка: " + err.message);
    }
  }

  // =============================
  // Lifecycle
  // =============================
  useEffect(() => {
    fetchAccount();
  }, [user]);

  useEffect(() => {
    if (selectedAlbum) fetchPhotos(selectedAlbum);
  }, [selectedAlbum]);

  // =============================
  // Render
  // =============================
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900/80 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Личный кабинет</h1>
        <LogoutButton />
      </div>

      <motion.div className="p-6">
        {/* Альбомы */}
        <h2 className="text-2xl font-bold mb-4">Мои альбомы</h2>
        {albums.length > 0 ? (
          <select
            value={selectedAlbum ?? ""}
            onChange={(e) => setSelectedAlbum(Number(e.target.value))}
            className="mb-6 px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white"
          >
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.photos_count} фото)
              </option>
            ))}
          </select>
        ) : (
          <p className="text-gray-400 mb-6">Альбомов пока нет.</p>
        )}

        {/* Фото */}
        {photos.length === 0 ? (
          <p className="text-gray-400">В альбоме нет фото.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt="photo"
                  className="rounded-xl border border-gray-700 cursor-pointer"
                  onClick={() => setPreviewPhoto(photo.url)}
                />
                {myPermissions.can_delete && (
                  <Button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition"
                  >
                    Удалить
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Загрузка фото (только если есть право can_add) */}
        {selectedAlbum && myPermissions.can_add && (
          <div className="mt-6">
            <Input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="mb-3 bg-gray-800 text-white border-gray-600"
            />
            <Button
              onClick={handleUpload}
              disabled={loading || files.length === 0}
              className="bg-white text-gray-800 px-4 py-2 rounded-xl disabled:opacity-50"
            >
              {loading ? "Загрузка..." : "Добавить фото"}
            </Button>
          </div>
        )}

        {/* Участники аккаунта */}
        <h2 className="text-2xl font-bold mt-10 mb-4">Участники аккаунта</h2>
        {members.length === 0 ? (
          <p className="text-gray-400">Нет участников.</p>
        ) : (
          <table className="w-full text-left border border-gray-700 rounded-xl overflow-hidden">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-2">Пользователь</th>
                <th className="px-4 py-2">Роль</th>
                <th className="px-4 py-2">Права</th>
                <th className="px-4 py-2">Действие</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const [localRole, setLocalRole] = useState(m.role);
                const [localPerms, setLocalPerms] = useState(m.permissions || {});
                return (
                  <tr key={m.user_id} className="border-t border-gray-700">
                    <td className="px-4 py-2">{m.profiles?.username ?? m.user_id}</td>
                    <td className="px-4 py-2">
                      <select
                        value={localRole}
                        onChange={(e) => setLocalRole(e.target.value)}
                        className="bg-gray-700 text-white rounded px-2 py-1"
                      >
                        <option value="owner">Владелец</option>
                        <option value="member">Участник</option>
                        <option value="guest">Гость</option>
                        <option value="pending">Ожидает</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <label className="mr-2">
                        <input
                          type="checkbox"
                          checked={localPerms.can_add}
                          onChange={(e) =>
                            setLocalPerms({ ...localPerms, can_add: e.target.checked })
                          }
                        />{" "}
                        Добавление
                      </label>
                      <label className="mr-2">
                        <input
                          type="checkbox"
                          checked={localPerms.can_edit}
                          onChange={(e) =>
                            setLocalPerms({ ...localPerms, can_edit: e.target.checked })
                          }
                        />{" "}
                        Редактирование
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={localPerms.can_delete}
                          onChange={(e) =>
                            setLocalPerms({ ...localPerms, can_delete: e.target.checked })
                          }
                        />{" "}
                        Удаление
                      </label>
                    </td>
                    <td className="px-4 py-2">
                      <Button
                        onClick={() => updateMember(m.user_id, localRole, localPerms)}
                        className="bg-blue-500 text-white rounded px-3 py-1"
                      >
                        Сохранить
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Приглашения */}
        <h2 className="text-2xl font-bold mt-10 mb-4">Приглашения</h2>
        {account && (
          <div className="mb-6">
            <p className="mb-2">Ссылка для приглашения:</p>
            <div className="flex gap-2">
              <Input
                type="text"
                value={`${window.location.origin}/invite/${account.invite_code}`}
                readOnly
                className="flex-1 bg-gray-800 text-white border-gray-600 rounded-xl"
              />
              <Button
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${window.location.origin}/invite/${account.invite_code}`
                  )
                }
                className="bg-blue-500 text-white rounded-xl px-4"
              >
                Копировать
              </Button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <p className="mb-2">Ввести код приглашения:</p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Код"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="flex-1 bg-gray-800 text-white border-gray-600 rounded-xl"
            />
            <Button
              onClick={joinByInvite}
              className="bg-green-500 text-white rounded-xl px-4"
            >
              Присоединиться
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewPhoto(null)}
          >
            <motion.img
              src={previewPhoto}
              alt="preview"
              className="max-h-[90%] max-w-[90%] rounded-xl shadow-lg"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}