import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterForm } from "@/lib/schemas";
import { register as registerUser, setToken } from "@/lib/api";
import { useState } from "react";

export const Route = createFileRoute("/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setApiError(null);
      const response = await registerUser(data.email, data.password);
      if (response.token) {
        setToken(response.token);
        navigate({ to: "/dashboard" });
      } else {
        setApiError(response.error || "Registration failed");
      }
    } catch {
      setApiError("An error occurred during registration.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full rounded-2xl p-8 glass-card">
        <h1 className="text-3xl font-semibold text-center text-white">
          Create Account
        </h1>
        <p className="text-center text-gray-400 mt-2">
          {" "}
          Start organizing your bookmarks
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              className="mt-1 w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 glass-input outline-none"
              id="email"
              type="email"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
            <p className="text-sm text-red-400 mt-1 h-5">
              {errors.email?.message || "\u00A0"}
            </p>
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              className="mt-1 w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 glass-input outline-none"
              id="password"
              type="password"
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
            />
            <p className="text-sm text-red-400 mt-1 h-5">
              {errors.password?.message || "\u00A0"}
            </p>
          </div>
          <p className="text-sm text-red-400 mt-1 h-5">
            {apiError || "\u00A0"}
          </p>
          <button
            type="submit"
            className="mt-4 w-full py-3 rounded-xl glass-button"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-white font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
