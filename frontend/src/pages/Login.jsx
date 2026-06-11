import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

import logo from "../assets/logo-edumentor.svg";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      showToast(
        error.response?.data?.message ||
        "Login gagal",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center relative overflow-hidden">

      {/* Geometric decorations */}
      <div className="absolute top-[-120px] right-[-80px] w-[300px] h-[300px] rounded-full bg-primary/5" />
      <div className="absolute bottom-[-100px] left-[-60px] w-[250px] h-[250px] rounded-full bg-secondary/5" />
      <div className="absolute top-1/2 left-[10%] w-[80px] h-[80px] bg-accent/5 rotate-45" />

      <div className="relative z-10 w-full max-w-md">

        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src={logo} alt="EduMentor AI Logo" className="w-12 h-12 object-contain" />
          <span className="text-2xl font-extrabold tracking-tight text-foreground">
            EduMentor AI
          </span>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white rounded-lg p-8"
        >
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            Masuk
          </h1>

          <p className="text-gray-500 mb-8">
            Lanjutkan perjalanan belajar Anda
          </p>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="nama@email.com"
              className="w-full bg-gray-100 border-0 rounded-md px-4 py-3.5 text-foreground font-medium placeholder:text-gray-400 focus:bg-white focus:border-2 focus:border-primary focus:outline-none transition-all duration-200"
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
              className="w-full bg-gray-100 border-0 rounded-md px-4 py-3.5 text-foreground font-medium placeholder:text-gray-400 focus:bg-white focus:border-2 focus:border-primary focus:outline-none transition-all duration-200"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white h-14 rounded-md font-semibold text-base transition-all duration-200 hover:bg-primary-dark hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
          >
            {loading ? "Memproses..." : "Login"}
          </button>

          <div className="text-center mt-6">
            <span className="text-gray-500 text-sm">Belum punya akun? </span>
            <Link
              to="/register"
              className="text-primary font-semibold text-sm hover:text-primary-dark transition-colors"
            >
              Daftar
            </Link>
          </div>
        </form>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-8 z-50 flex items-center gap-3 border px-5 py-3.5 rounded-lg shadow-lg animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800 shadow-green-100/50'
            : 'bg-red-50 border-red-200 text-red-800 shadow-red-100/50'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            toast.type === 'success'
              ? 'bg-green-500 animate-pulse'
              : 'bg-red-500 animate-pulse'
          }`} />
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}

      </div>
    </div>
  );
}

export default Login;