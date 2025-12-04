import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE, resolveMediaUrl } from "../src/cms/apiClient";

const normalizeAdditionalInfo = (info = {}) => ({
  title: info.title ?? info.name ?? "",
  desc: info.desc ?? info.description ?? "",
  url: info.url ?? info.link ?? "",
  x: Number.isFinite(info.x) ? info.x : 50,
  y: Number.isFinite(info.y) ? info.y : 50,
});

const pickImage = (item) => {
  const normalizeValue = (value) => {
    if (!value) return "";
    if (Array.isArray(value)) return normalizeValue(value[0]);
    if (typeof value === "object") {
      const objCandidates = [
        value.url,
        value.path,
        value.src,
        value.href,
        value.file,
        value.full,
        value.original,
        value.thumbnail,
      ].filter(Boolean);
      return normalizeValue(objCandidates.find(Boolean));
    }
    if (typeof value === "string") return value.trim();
    return "";
  };

  const candidates = [
    item.img,
    item.image,
    item.image_url,
    item.imageUrl,
    item.photo,
    item.photo_url,
    item.photoUrl,
    item.foto,
    item.foto_url,
    item.media,
    item.media_url,
    item.picture,
    item.picture_url,
    item.thumbnail,
    item.thumbnail_url,
    item.thumbnailUrl,
    item.cover,
    item.cover_url,
    item.coverUrl,
    item.panorama_image,
    item.panoramaImage,
    item.file,
    item.file_url,
    item.fileUrl,
    item.asset,
    item.asset_url,
  ];

  const found = normalizeValue(candidates.find((c) => normalizeValue(c)));
  return resolveMediaUrl(found);
};

const normalizeItem = (item, index) => ({
  id: String(item.id ?? index + 1),
  title: item.title ?? item.name ?? `Item ${index + 1}`,
  desc: item.desc ?? item.description ?? "",
  img: pickImage(item),
  additionalInfo: Array.isArray(item.additionalInfo)
    ? item.additionalInfo.map(normalizeAdditionalInfo)
    : [],
  raw: item,
});

const useReadApi = (token) => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const headers = useMemo(() => {
    const base = { "Content-Type": "application/json" };
    if (token) return { ...base, Authorization: `Bearer ${token}` };
    return base;
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [panoramaRes, userRes] = await Promise.all([
          fetch(`${API_BASE}/api/panorama/`, {
            headers,
            signal: controller.signal,
          }),
          fetch(`${API_BASE}/api/user/`, {
            headers,
            signal: controller.signal,
          }),
        ]);

        if (!panoramaRes.ok || !userRes.ok) {
          throw new Error(
            `API error: panorama ${panoramaRes.status}, user ${userRes.status}`
          );
        }

        const [panoramaData, userData] = await Promise.all([
          panoramaRes.json(),
          userRes.json(),
        ]);

        const normalized = (panoramaData.pages ?? panoramaData ?? []).map(
          (item, index) => normalizeItem(item, index)
        );

        setPosts(normalized);
        setUser(userData.userdata ?? userData ?? null);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("API Error:", err);
        setError(err.message || "Kon API niet laden");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [headers, reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  return { posts, loading, error, user, refresh };
};

export default useReadApi;
