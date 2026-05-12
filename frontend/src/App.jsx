import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PostPage from "./pages/PostPage";
import Register from "./pages/Register";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminObjave from "./pages/admin/AdminObjave";
import AdminKomentarji from "./pages/admin/AdminKomentarji";
import AdminKategorije from "./pages/admin/AdminKategorije";
import AdminPrijave from "./pages/admin/AdminPrijave";
import AdminUsers from "./pages/admin/AdminUsers";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/objava/:id" element={<PostPage />} />
        <Route path="/registracija" element={<Register />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="objave" element={<AdminObjave />} />
          <Route path="komentarji" element={<AdminKomentarji />} />
          <Route path="kategorije" element={<AdminKategorije />} />
          <Route path="prijave" element={<AdminPrijave />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;