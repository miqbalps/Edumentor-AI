import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

import logo from "../assets/logo-edumentor.svg";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post(
        "/auth/register",
        {
          name,
          email,
          password,
        }
      );

      navigate("/login");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Register gagal"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center relative overflow-hidden">

      {/* Geometric decorations */}
      <div className="absolute top-[-100px] left-[-80px] w-[280px] h-[280px] rounded-full bg-secondary/5" />
      <div className="absolute bottom-[-120px] right-[-60px] w-[320px] h-[320px] rounded-full bg-primary/5" />
      <div className="absolute bottom-[20%] left-[15%] w-[60px] h-[60px] bg-accent/5 rotate-12" />

      <div className="relative z-10 w-full max-w-md">

        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src={logo} alt="EduMentor AI Logo" className="w-12 h-12 object-contain" />
          <span className="text-2xl font-extrabold tracking-tight text-foreground">
            EduMentor AI
          </span>
        </div>

        <form
          onSubmit={handleRegister}
          className="bg-white rounded-lg p-8"
        >
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            Daftar
          </h1>

          <p className="text-gray-500 mb-8">
            Buat akun dan mulai belajar dengan AI
          </p>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama
            </label>
            <input
              type="text"
              placeholder="Nama lengkap"
              className="w-full bg-gray-100 border-0 rounded-md px-4 py-3.5 text-foreground font-medium placeholder:text-gray-400 focus:bg-white focus:border-2 focus:border-secondary focus:outline-none transition-all duration-200"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="nama@email.com"
              className="w-full bg-gray-100 border-0 rounded-md px-4 py-3.5 text-foreground font-medium placeholder:text-gray-400 focus:bg-white focus:border-2 focus:border-secondary focus:outline-none transition-all duration-200"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-gray-100 border-0 rounded-md px-4 py-3.5 text-foreground font-medium placeholder:text-gray-400 focus:bg-white focus:border-2 focus:border-secondary focus:outline-none transition-all duration-200"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-white h-14 rounded-md font-semibold text-base transition-all duration-200 hover:bg-secondary-dark hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>

          <div className="text-center mt-6">
            <span className="text-gray-500 text-sm">Sudah punya akun? </span>
            <Link
              to="/login"
              className="text-primary font-semibold text-sm hover:text-primary-dark transition-colors"
            >
              Masuk
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
}

export default Register;