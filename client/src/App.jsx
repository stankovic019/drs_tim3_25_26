import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../src/page/LoginPage.jsx";
import RegisterPage from "../src/page/RegisterPage.jsx";
import AdminPage from "./page/AdminPage.jsx";
import PlayerPage from "./page/PlayerPage.jsx";
import ModeratorPage from "./page/ModeratorPage.jsx";
import UserProfilePage from "./page/UserProfilePage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/adminpage" element={<AdminPage />} />
        <Route path="/playerpage" element={<PlayerPage />} />
        <Route path="/moderatorpage" element={<ModeratorPage />} />
        <Route path="/user-profile" element={<UserProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
