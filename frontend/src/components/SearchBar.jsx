export default function SearchBar({ setQuery }) {
  return (
    <input
      placeholder="Išči..."
      onChange={(e) => setQuery(e.target.value)}
      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
    />
  );
}