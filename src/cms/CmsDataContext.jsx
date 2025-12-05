import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../auth/AuthContext";
import {
  fetchPanoramaItems,
  resolveMediaUrl,
  updatePanoramaItem,
} from "./apiClient";

const CmsDataContext = createContext(null);
const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);
const normalizeXCoord = (value) => {
  if (!Number.isFinite(value)) return 0.5;
  if (value > 1 || value < 0) {
    return clampValue(value / 100, 0, 1);
  }
  return clampValue(value, 0, 1);
};
const normalizeYCoord = (value) => {
  if (!Number.isFinite(value)) return 0;
  if (value > 0.5 || value < -0.5) {
    return clampValue(0.5 - value / 100, -0.5, 0.5);
  }
  return clampValue(value, -0.5, 0.5);
};

const normalizeAdditionalInfo = (info = {}) => ({
  title: info.title ?? info.name ?? "",
  desc: info.desc ?? info.description ?? "",
  url: info.url ?? info.link ?? "",
  img:
    info.img ??
    info.image ??
    info.image_url ??
    info.imageUrl ??
    info.photo ??
    info.photo_url ??
    info.photoUrl ??
    "",
  x: normalizeXCoord(
    info.x ??
      info.x_percent ??
      info.xPercent ??
      info.xcoord ??
      info.x_coord ??
      info.x_pos ??
      info.xpos ??
      info.coordinate_x ??
      info.cordinate_x
  ),
  y: normalizeYCoord(
    info.y ??
      info.y_percent ??
      info.yPercent ??
      info.ycoord ??
      info.y_coord ??
      info.y_pos ??
      info.ypos ??
      info.coordinate_y ??
      info.cordinate_y
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

const normalizeItem = (item, index) => ({
  id: String(item.id ?? index + 1),
  title: item.title ?? item.name ?? `Item ${index + 1}`,
  desc: item.desc ?? item.description ?? "",
  img: pickImage(item),
  additionalInfo: Array.isArray(
    item.additionalInfo ??
      item.additional_info ??
      item.hotspots ??
      item.points ??
      item.markers
  )
    ? (
        item.additionalInfo ??
        item.additional_info ??
        item.hotspots ??
        item.points ??
        item.markers
      ).map(normalizeAdditionalInfo)
    : item.coordinate_x !== undefined || item.cordinate_x !== undefined
    ? [
        normalizeAdditionalInfo({
          title: item.title ?? item.name,
          desc: item.desc ?? item.description,
          img: pickImage(item),
          x: item.coordinate_x ?? item.cordinate_x,
          y: item.coordinate_y ?? item.cordinate_y,
        }),
      ]
    : [],
  raw: item,
});

export function CmsDataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken } = useAuth();

  // initial load from API
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchPanoramaItems({
          signal: controller.signal,
          token: authToken,
        });
        const normalized = (result || []).map((item, index) =>
          normalizeItem(item, index)
        );
        setItems(normalized);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Panorama API fout:", err);
        setError(err.message || "Kon items niet laden");
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [authToken]);

  const reorderItems = useCallback((fromIndex, toIndex) => {
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const updateItem = useCallback(
    async (itemId, data) => {
      let snapshot = null;
      setItems((prev) => {
        snapshot = prev;
        return prev.map((item) =>
          item.id === itemId ? { ...item, ...data } : item
        );
      });

      try {
        await updatePanoramaItem(itemId, data, authToken);
      } catch (err) {
        console.error("Kon item niet opslaan:", err);
        setError(err.message || "Opslaan mislukt");
        if (snapshot) {
          setItems(snapshot);
        }
        throw err;
      }
    },
    [authToken]
  );

  const getItem = useCallback(
    (itemId) => items.find((item) => item.id === itemId),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      reorderItems,
      updateItem,
      getItem,
      loading,
      error,
    }),
    [items, reorderItems, updateItem, getItem, loading, error]
  );

  return (
    <CmsDataContext.Provider value={value}>{children}</CmsDataContext.Provider>
  );
}

export function useCmsData() {
  const context = useContext(CmsDataContext);
  if (!context) {
    throw new Error("useCmsData must be used within a CmsDataProvider");
  }
  return context;
}
