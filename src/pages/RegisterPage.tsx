// src/pages/RegisterPage.tsx
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/auth.store";
import { registerApi } from "@/services/auth.service";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["CUSTOMER", "ORGANIZER"]),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === "ORGANIZER" ? "/organizer" : "/");
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "CUSTOMER" },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: RegisterForm) {
    try {
      const { confirmPassword, ...payload } = data;
      const userData = await registerApi({
        ...payload,
        referralCode: payload.referralCode || undefined,
      });
      setUser(userData);
      navigate(userData.role === "ORGANIZER" ? "/organizer" : "/");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Registration failed. Please try again.";
      setError("root", { message });
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a12] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            Create an account
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Join Eventify and start exploring events
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#12121e] rounded-2xl border border-white/10 p-8 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Root error */}
            {errors.root && (
              <div className="bg-red-500/10 border border-red-400/20 text-red-400 text-sm px-4 py-3 rounded-lg">
                {errors.root.message}
              </div>
            )}

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: "CUSTOMER",
                    label: "Attend Events",
                    desc: "Browse & buy tickets",
                  },
                  {
                    value: "ORGANIZER",
                    label: "Host Events",
                    desc: "Create & manage events",
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-colors
                      ${
                        selectedRole === option.value
                          ? "border-violet-400 bg-violet-500/10"
                          : "border-white/10 hover:border-white/20"
                      }`}
                  >
                    <input
                      {...register("role")}
                      type="radio"
                      value={option.value}
                      className="sr-only"
                    />
                    <span
                      className={`text-sm font-medium ${selectedRole === option.value ? "text-violet-300" : "text-slate-300"}`}
                    >
                      {option.label}
                    </span>
                    <span
                      className={`text-xs mt-0.5 ${selectedRole === option.value ? "text-violet-400/80" : "text-slate-500"}`}
                    >
                      {option.desc}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Full name
              </label>
              <input
                {...register("name")}
                type="text"
                placeholder="John Doe"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-white placeholder:text-slate-500 outline-none transition-colors
                  ${
                    errors.name
                      ? "border-red-400/40 focus:border-red-400 bg-red-500/5"
                      : "border-white/10 focus:border-violet-400/60 bg-white/5"
                  }`}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-white placeholder:text-slate-500 outline-none transition-colors
                  ${
                    errors.email
                      ? "border-red-400/40 focus:border-red-400 bg-red-500/5"
                      : "border-white/10 focus:border-violet-400/60 bg-white/5"
                  }`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="Min. 6 characters"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-white placeholder:text-slate-500 outline-none transition-colors
                  ${
                    errors.password
                      ? "border-red-400/40 focus:border-red-400 bg-red-500/5"
                      : "border-white/10 focus:border-violet-400/60 bg-white/5"
                  }`}
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Confirm password
              </label>
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-white placeholder:text-slate-500 outline-none transition-colors
                  ${
                    errors.confirmPassword
                      ? "border-red-400/40 focus:border-red-400 bg-red-500/5"
                      : "border-white/10 focus:border-violet-400/60 bg-white/5"
                  }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Referral code (customer only) */}
            {selectedRole === "CUSTOMER" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Referral code{" "}
                  <span className="text-slate-500 font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  {...register("referralCode")}
                  type="text"
                  placeholder="e.g. ANDZ123"
                  className="w-full px-4 py-2.5 rounded-lg border border-white/10 focus:border-violet-400/60 text-sm text-white placeholder:text-slate-500 outline-none transition-colors bg-white/5 uppercase"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Get 10% discount on your first purchase
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-violet-500 hover:bg-violet-400 disabled:bg-violet-500/40
                text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors
                disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-violet-400 hover:text-violet-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}