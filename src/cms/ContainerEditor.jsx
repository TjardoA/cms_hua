import { useState, useEffect } from "react";

export default function ContainerEditor({ selected }) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    image: null,
  });

  useEffect(() => {
    if (selected) {
      setForm(selected);
    }
  }, [selected]);

  if (!selected) return <p>Selecteer een container...</p>;

  return (
    <div className="bg-gray-50 p-6 rounded-xl border shadow-md space-y-4">
      <h2 className="text-xl font-bold">Container bewerken</h2>

      <div>
        <label className="font-semibold block mb-1">Titel</label>
        <input
          className="border p-2 rounded-lg w-full"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      <div>
        <label className="font-semibold block mb-1">Content</label>
        <textarea
          className="border p-2 rounded-lg w-full h-40"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
      </div>

      <button className="bg-green-600 text-white p-2 rounded-lg">
        Opslaan
      </button>
    </div>
  );
}
