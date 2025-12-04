// src/cms/EditPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [content, setContent] = useState("");

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-100">
      <div className="w-[600px] bg-white p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Edit Item {id}</h1>

        <label className="block font-semibold mb-1">Titel</label>
        <input
          className="w-full border p-3 rounded-lg mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="block font-semibold mb-1">Afbeelding</label>
        <input
          type="file"
          className="w-full border p-3 rounded-lg mb-4"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <label className="block font-semibold mb-1">Content</label>
        <textarea
          className="w-full border p-3 rounded-lg h-40 mb-6"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex justify-between">
          <button
            onClick={() => navigate("/cms")}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            Terug
          </button>

          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}
