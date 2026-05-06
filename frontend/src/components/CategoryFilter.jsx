import { useEffect, useState } from "react";

export default function CategoryFilter({ setCategoryId }) {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8000/kategorije")
            .then((res) => res.json())
            .then((data) => setCategories(data));
    }, []);

    return (
        <div style={{ margin: "10px 0" }}>
            <select
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "5px"
                }}
            >
                <option value="">Vse kategorije</option>

                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.naziv}
                    </option>
                ))}
            </select>
        </div>
    );
}