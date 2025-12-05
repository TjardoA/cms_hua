import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE, resolveMediaUrl } from "../src/cms/apiClient";

const toNumber = (value, fallback) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(num) ? num : fallback;
};

const normalizeHotspotImage = (info = {}) => {
  const candidates = [
    info.img,
    info.image,
    info.image_url,
    info.imageUrl,
    info.photo,
    info.photo_url,
    info.photoUrl,
    info.foto,
    info.foto_url,
    info.media,
    info.media_url,
    info.picture,
    info.picture_url,
  ];
  return candidates.find((c) => typeof c === "string" && c.trim()) || "";
};

const normalizeAdditionalInfo = (info = {}) => ({
  title: info.title ?? info.name ?? "",
  description: info.description ?? info.desc ?? "",
  url: info.url ?? info.link ?? "",
  img: normalizeHotspotImage(info),
  x: toNumber(
    info.x ??
      info.x_percent ??
      info.xPercent ??
      info.xcoord ??
      info.x_coord ??
      info.coordinate_x ??
      info.cordinate_x,
    50
  ),
  y: toNumber(
    info.y ??
      info.y_percent ??
      info.yPercent ??
      info.ycoord ??
      info.y_coord ??
      info.coordinate_y ??
      info.cordinate_y,
    50
  ),
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

const normalizeItem = (item, index) => {
  const baseAdditional =
    item.additionalInfo ??
    item.additional_info ??
    item.hotspots ??
    item.points ??
    item.markers;

  const fallbackHotspot = () => {
    const hasCoord =
      item.coordinate_x !== undefined ||
      item.cordinate_x !== undefined ||
      item.coordinate_y !== undefined ||
      item.cordinate_y !== undefined;
    if (!hasCoord) return [];
    return [
      normalizeAdditionalInfo({
        title: item.title ?? item.name,
        description: item.desc ?? item.description,
        img: pickImage(item),
        x: item.coordinate_x ?? item.cordinate_x,
        y: item.coordinate_y ?? item.cordinate_y,
      }),
    ];
  };

  return {
    id: String(item.id ?? index + 1),
    title: item.title ?? item.name ?? `Item ${index + 1}`,
    desc: item.desc ?? item.description ?? "",
    catalogNumber: item.catalog_number ?? item.catalogNumber ?? "",
    pageNumber: item.page_number ?? item.pageNumber ?? "",
    img: pickImage(item),
    additionalInfo: Array.isArray(baseAdditional)
      ? baseAdditional.map(normalizeAdditionalInfo)
      : fallbackHotspot(),
    raw: item,
  };
};

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
