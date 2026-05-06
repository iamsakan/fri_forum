import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import PostList from "../components/PostList";
import SortBar from "../components/SortBar";

export default function Home() {
    const [query, setQuery] = useState("");
    const [posts, setPosts] = useState([]);
    const [sort, setSort] = useState("new");

    const fetchPosts = () => {
        fetch(`http://localhost:8000/objave/?q=${query}&sort=${sort}`)
            .then((res) => res.json())
            .then((data) => setPosts(data.objave));
    };

    useEffect(() => {
        fetchPosts();
    }, [sort]);

    return (
        <div>
            <Navbar setQuery={setQuery} refreshPosts={fetchPosts} />

            <SortBar setSort={setSort} />

            <PostList posts={posts} />
        </div>
    );
}