// src/cms/ContainerList.jsx
export default function ContainerList({ containers, selected, onSelect }) {
  if (!containers.length)
    return <p className="text-gray-500">Geen data beschikbaar</p>;

  return (
    <div className="space-y-4">
      {containers.map((c) => (
        <div
          key={c.id}
          onClick={() => onSelect(c)}
          className={`p-4 rounded-xl cursor-pointer transition shadow-md border ${
            selected?.id === c.id
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white hover:bg-gray-100"
          }`}
        >
          <p className="font-semibold text-lg">{c.title}</p>
        </div>
      ))}
    </div>
  );
}
