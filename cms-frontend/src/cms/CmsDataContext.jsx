import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const INITIAL_ITEMS = [
  {
    id: "1",
    title: "Welkom bij ons platform",
    desc: "Ontdek de nieuwste functionaliteiten en mogelijkheden van ons platform.",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640",
    additionalInfo: [],
  },
  {
    id: "2",
    title: "Onze diensten",
    desc: "Wij bieden een breed scala aan diensten voor al uw behoeften.",
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=640",
    additionalInfo: [],
  },
  {
    id: "3",
    title: "Contact opnemen",
    desc: "Neem contact met ons op voor meer informatie of vragen.",
    img: "https://images.unsplash.com/photo-1581291519195-ef11498d1cf5?w=640",
    additionalInfo: [],
  },
  {
    id: "4",
    title: "Contact opnemen",
    desc: "Neem contact met ons op voor meer informatie of vragen.",
    img: "https://images.unsplash.com/photo-1581291519195-ef11498d1cf5?w=640",
    additionalInfo: [],
  },
  {
    id: "5",
    title: "Contact opnemen",
    desc: "Neem contact met ons op voor meer informatie of vragen.",
    img: "https://images.unsplash.com/photo-1581291519195-ef11498d1cf5?w=640",
    additionalInfo: [],
  },
  {
    id: "6",
    title: "Contact opnemen",
    desc: "Neem contact met ons op voor meer informatie of vragen.",
    img: "https://images.unsplash.com/photo-1581291519195-ef11498d1cf5?w=640",
    additionalInfo: [],
  },
  {
    id: "7",
    title: "Contact opnemen",
    desc: "Neem contact met ons op voor meer informatie of vragen.",
    img: "https://images.unsplash.com/photo-1581291519195-ef11498d1cf5?w=640",
    additionalInfo: [],
  },
  {
    id: "8",
    title: "Contact opnemen",
    desc: "Neem contact met ons op voor meer informatie of vragen.",
    img: "https://images.unsplash.com/photo-1581291519195-ef11498d1cf5?w=640",
    additionalInfo: [],
  },
  {
    id: "9",
    title: "Contact opnemen",
    desc: "Neem contact met ons op voor meer informatie of vragen.",
    img: "https://images.unsplash.com/photo-1581291519195-ef11498d1cf5?w=640",
    additionalInfo: [],
  },
  {
    id: "10",
    title: "Contact opnemen",
    desc: "Neem contact met ons op voor meer informatie of vragen.",
    img: "https://images.unsplash.com/photo-1581291519195-ef11498d1cf5?w=640",
    additionalInfo: [],
  },
];

const CmsDataContext = createContext(null);

export function CmsDataProvider({ children }) {
  const [items, setItems] = useState(INITIAL_ITEMS);

  const reorderItems = useCallback((fromIndex, toIndex) => {
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const updateItem = useCallback((itemId, data) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...data } : item))
    );
  }, []);

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
    }),
    [items, reorderItems, updateItem, getItem]
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
