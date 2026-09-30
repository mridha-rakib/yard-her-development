import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import brandlogo from "../../../assets/image/yard-new.jpeg";
import { useAuthStore } from "../../../stores/use-auth-store";

const initialFormValues = {
  email: "",
  password: "",
  remember: true,
};

const validateEmail = (value = "") => /\S+@\S+\.\S+/.test(value);

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    }
  }, [isAuthenticated, location.state, navigate, user]);

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    setFormValues((currentValue) => ({
      ...currentValue,
      [name]: nextValue,
    }));

    if (errors[name]) {
      setErrors((currentValue) => ({
        ...currentValue,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    const email = formValues.email.trim();

    if (!email) {
      nextErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!formValues.password) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await login({
        email: formValues.email.trim(),
        password: formValues.password,
        remember: formValues.remember,
      });

      if (session.user?.role !== "admin") {
        await logout();
        toast.error("This account does not have admin access.");
        return;
      }

      toast.success("Signed in successfully.");
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDisabled = isSubmitting || isInitializing;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-2xl border-2 border-[#eef6ff] bg-white px-6 py-8 md:px-10 md:py-12"
      >
        <div className="flex justify-center">
          <img
            src={brandlogo}
            width="80"
            height="80"
            className="h-20 w-20 rounded-xl object-cover"
            alt="Yard admin logo"
          />
        </div>

        <p className="mt-5 text-center text-base text-black">
          Please enter your email and password to continue
        </p>

        <div className="mt-6">
          <label htmlFor="admin-email" className="text-base font-medium text-gray-900">
            Email
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="email"
            value={formValues.email}
            onChange={handleChange}
            placeholder="Your Email"
            aria-invalid={Boolean(errors.email)}
            className="mt-2 w-full rounded-md border border-gray-300 px-4 py-2 text-base outline-none focus:border-[#0A3019] focus:ring-2 focus:ring-[#0A3019]/20"
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          ) : null}
        </div>

        <div className="mt-5">
          <label htmlFor="admin-password" className="text-base font-medium text-gray-900">
            Password
          </label>
          <div className="relative mt-2">
            <input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formValues.password}
              onChange={handleChange}
              placeholder="Password"
              aria-invalid={Boolean(errors.password)}
              className="w-full rounded-md border border-gray-300 py-2 pl-4 pr-12 text-base outline-none focus:border-[#0A3019] focus:ring-2 focus:ring-[#0A3019]/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((currentValue) => !currentValue)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 hover:text-gray-900"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password ? (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          ) : null}
        </div>

        <div className="my-4 flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-base text-black">
            <input
              name="remember"
              type="checkbox"
              checked={formValues.remember}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-[#0A3019] focus:ring-[#0A3019]"
            />
            Remember Password
          </label>
          <Link to="/forgate-password" className="text-base text-red-600 hover:text-red-600">
            Forgot Password
          </Link>
        </div>

        <button
          className="mt-2 w-full rounded-md bg-[#0A3019] px-6 py-3 text-center font-semibold text-white disabled:opacity-60"
          type="submit"
          disabled={submitDisabled}
        >
          {submitDisabled ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
};

export default SignIn;
