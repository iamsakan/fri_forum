import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PostPage() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [komentarji, setKomentarji] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:8000/objave/${id}`)
            .then(res => res.json())
            .then(data => setPost(data));

        fetch(`http://localhost:8000/komentarji/${id}`)
            .then(res => res.json())
            .then(data => setKomentarji(data));
    }, [id]);

    if (!post) return <p>Loading...</p>;

    return (
        <div style={{ padding: 20 }}>
            <h1>{post.naslov}</h1>
            <p>{post.vsebina}</p>

            <hr />

            <h3>Komentarji</h3>

            {komentarji.length === 0 && <p>Ni komentarjev</p>}

            {komentarji.map((k) => (
                <div key={k.id} style={{ borderBottom: "1px solid #ddd", padding: 5 }}>
                    <b>{k.uporabnik?.ime || "Anon"}</b>
                    <p>{k.vsebina}</p>
                </div>
            ))}
        </div>
    );
}