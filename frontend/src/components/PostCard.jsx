import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PostCard({ post }) {
    const [votes, setVotes] = useState(post.glasovi || 0);
    const navigate = useNavigate();

    const vote = async (value, e) => {
        e.stopPropagation(); // 🔥 da klik na vote ne odpre posta

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Moraš biti prijavljen");
            return;
        }

        const res = await fetch("http://localhost:8000/glasovi/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                objava_id: post.id,
                vrednost: value
            })
        });

        if (res.ok) {
            setVotes(votes + value);
        }
    };

    return (
        <div
            onClick={() => navigate(`/objava/${post.id}`)}
            style={{
                border: "1px solid #ddd",
                padding: 10,
                margin: "10px",
                cursor: "pointer"
            }}
        >
            <h2>{post.naslov}</h2>
            <h4>{post.kategorija?.naziv}</h4>
            <p>{new Date(post.cas_objave).toLocaleString()}</p>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button onClick={(e) => vote(1, e)}>⬆️</button>
                <span>{votes}</span>
                <button onClick={(e) => vote(-1, e)}>⬇️</button>
            </div>
        </div>
    );
}