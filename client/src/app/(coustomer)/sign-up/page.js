"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Phone, User, UserPlus } from "lucide-react";
import { buildLoginPath, getPostAuthPath, sanitizeRedirectTo } from "@/lib/auth/auth-redirect";
import { getApiErrorMessage } from "@/lib/api/http";
import { useAuthStore } from "@/stores/use-auth-store";

const initialFormData = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const validateSignUpForm = (formData) => {
  const nextErrors = {};

  if (!formData.fullName.trim()) {
    nextErrors.fullName = "Full name is required";
  }

  if (!formData.email.trim()) {
    nextErrors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    nextErrors.email = "Email is invalid";
  }

  if (!formData.phone.trim()) {
    nextErrors.phone = "Phone number is required";
  }

  if (!formData.password) {
    nextErrors.password = "Password is required";
  } else if (formData.password.length < 8) {
    nextErrors.password = "Password must be at least 8 characters";
  }

  if (!formData.confirmPassword) {
    nextErrors.confirmPassword = "Please confirm your password";
  } else if (formData.password !== formData.confirmPassword) {
    nextErrors.confirmPassword = "Passwords do not match";
  }

  return nextErrors;
};

const SignUpPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registerCustomer = useAuthStore((state) => state.registerCustomer);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const redirectTo = sanitizeRedirectTo(searchParams.get("redirectTo"));
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const loginHref = buildLoginPath(redirectTo);
  const postAuthPath = getPostAuthPath(user, redirectTo);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(postAuthPath);
    }
  }, [isAuthenticated, postAuthPath, router, user]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [name]: "",
      }));
    }

    if (submitError) {
      setSubmitError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateSignUpForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const session = await registerCustomer({
        name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      router.replace(getPostAuthPath(session.user, redirectTo));
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl p-4">
          <div className="flex justify-center mb-6">
            <div className="bg-[#0A3019] rounded-full p-4 shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create an Account
            </h1>
            <p className="text-gray-600">Join us and start your journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {submitError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                />
              </div>
              {errors.fullName ? (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                />
              </div>
              {errors.email ? (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                />
              </div>
              {errors.phone ? (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  className={`w-full pl-10 pr-12 py-3 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((currentValue) => !currentValue)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-12 py-3 border ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((currentValue) => !currentValue)
                  }
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              ) : null}
            </div>

            <div className="text-sm text-gray-600 text-center py-2">
              By signing up, you agree to our{" "}
              <Link
                href="/terms-conditions"
                className="text-green-700 font-semibold hover:text-green-800 underline"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="text-green-700 font-semibold hover:text-green-800 underline"
              >
                Privacy Policy
              </Link>
            </div>

            <button
              type="submit"
              disabled={isInitializing}
              className="w-full bg-[#0A3019] text-white py-4 rounded-lg font-bold text-lg hover:from-green-800 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-300 disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none"
            >
              {isInitializing ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href={loginHref}
                className="text-green-700 font-bold hover:text-green-800 transition-colors"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f8f6]" />}>
      <SignUpPageContent />
    </Suspense>
  );
}
