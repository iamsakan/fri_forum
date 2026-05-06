export default function SortBar({ setSort }) {
    return (
        <div style={{
            display: "flex",
            gap: "10px",
            padding: "10px"
        }}>
            <button onClick={() => setSort("new")}>
                🆕 New
            </button>

            <button onClick={() => setSort("old")}>
                📜 Old
            </button>
        </div>
    );
}