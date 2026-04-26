import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { handleError, handleSuccess } from "../utils/notification";
import redirectByRole from "../utils/redirectByRole";
import axiosClient from "../utils/axiosClient";
import { ArrowLeft } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password should be at least 6 characters" }),
});

function StudentLogin() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    try {
      const payload = { email: data.email, password: data.password, role: "STUDENT" };
      const res = await axiosClient.post("/auth/login", payload);
      const { user, message } = res.data;
      if (user?.role) {
        Cookies.set("role", user.role, { expires: 7 });
        Cookies.set("loggedInUser", user.name, { expires: 7 });
        handleSuccess(message || "Login Successfully");
        redirectByRole(user.role, navigate);
      } else {
        handleError(message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      handleError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full" />
        <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-emerald-400/20 rounded-full" />
        <div className="absolute top-1/2 right-8 w-32 h-32 bg-emerald-300/20 rounded-full" />

        <img src="/logo.png" alt="Codelytics" className="h-24 w-auto self-start brightness-0 invert relative z-10" />

        <div className="relative z-10 space-y-4">
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Level up your<br />coding skills
          </h2>
          <p className="text-emerald-100 text-base leading-relaxed max-w-xs">
            Solve problems, track your progress across platforms and rise up the leaderboard.
          </p>
        </div>

        <p className="text-emerald-300 text-xs font-mono relative z-10 tracking-widest">
          CODELYTICS — EMPOWERING EDUCATION
        </p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start justify-start lg:justify-center px-8 sm:px-14 lg:px-20 pt-10 pb-12 lg:py-12 bg-white">
        <button
          onClick={() => navigate("/entry")}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-10 transition-colors w-fit self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Back to roles
        </button>

        <img src="/logo.png" alt="Codelytics" className="h-16 w-auto mb-8 lg:hidden" />

        <div className="max-w-sm w-full">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1 text-center lg:text-left">Student Login</h2>
          <p className="text-gray-400 text-sm mb-8 text-center lg:text-left">Sign in to your student account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all text-sm placeholder:text-gray-400"
                placeholder="student@college.edu"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                {...register("password")}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all text-sm placeholder:text-gray-400"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold rounded-xl transition-colors text-sm mt-2 shadow-md shadow-emerald-200"
            >
              {isSubmitting ? "Signing in..." : "Sign in as Student"}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

export default StudentLogin;
