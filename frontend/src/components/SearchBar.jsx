export default function SearchBar({ setQuery }) {
  return (
    <input
      placeholder="Išči..."
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}