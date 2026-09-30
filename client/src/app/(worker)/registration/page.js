"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPostAuthPath } from "@/lib/auth/auth-redirect";
import { hasRole } from "@/lib/auth/user-roles";
import { getApiErrorMessage } from "@/lib/api/http";
import { useAuthStore } from "@/stores/use-auth-store";

const initialFormData = {
  fullName: "",
  age: "",
  cityZipCode: "",
  phoneNumber: "",
  emailAddress: "",
  skills: [],
  availability: "",
  photoId: null,
};

const skillsOptions = [
  { id: "lawnMowing", label: "Lawn Mowing" },
  { id: "raking", label: "Raking" },
  { id: "trimming", label: "Trimming" },
  { id: "yardCleanup", label: "Yard Cleanup" },
  { id: "carCleaning", label: "Car Cleaning" },
];

const availabilityOptions = [
  "Weekdays (Monday-Friday)",
  "Weekends (Saturday-Sunday)",
  "Mornings (6AM-12PM)",
  "Afternoons (12PM-6PM)",
  "Evenings (6PM-10PM)",
  "Flexible / Any time",
];

const validateField = (name, value) => {
  switch (name) {
    case "fullName":
      if (!value.trim()) return "Full name is required";
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      if (!/^[a-zA-Z\s]+$/.test(value)) return "Name can only contain letters";
      return "";
    case "age": {
      if (!value) return "Age is required";
      const age = Number.parseInt(value, 10);
      if (Number.isNaN(age)) return "Age must be a number";
      if (age < 13) return "Must be 13 or older to apply";
      if (age > 100) return "Please enter a valid age";
      return "";
    }
    case "cityZipCode":
      if (!value.trim()) return "City/Zip code is required";
      if (value.trim().length < 3) return "Please enter a valid city or zip code";
      return "";
    case "phoneNumber": {
      if (!value.trim()) return "Phone number is required";
      const phoneRegex = /^[\d\s\-()+]+$/;
      if (!phoneRegex.test(value)) return "Please enter a valid phone number";
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length < 10) return "Phone number must be at least 10 digits";
      return "";
    }
    case "emailAddress": {
      if (!value.trim()) return "Email address is required";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Please enter a valid email address";
      return "";
    }
    case "skills":
      if (!value || value.length === 0) return "Please select at least one skill";
      return "";
    case "availability":
      if (!value) return "Please select your availability";
      return "";
    default:
      return "";
  }
};

const buildCityZipValue = (location = {}) =>
  [location?.city, location?.zipCode].filter(Boolean).join(", ");

const HeroRegistrationPage = () => {
  const router = useRouter();
  const registerHero = useAuthStore((state) => state.registerHero);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isReady = useAuthStore((state) => state.isReady);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [fileName, setFileName] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submissionResult, setSubmissionResult] = useState(null);
  const canUpgradeExistingAccount =
    Boolean(user) && hasRole(user, "customer") && !hasRole(user, "worker");
  const alreadyHasHeroAccess = Boolean(user) && hasRole(user, "worker");

  useEffect(() => {
    if (!isReady || !isAuthenticated || !user || submissionResult) {
      return;
    }

    if (alreadyHasHeroAccess || !canUpgradeExistingAccount) {
      router.replace(getPostAuthPath(user));
    }
  }, [
    alreadyHasHeroAccess,
    canUpgradeExistingAccount,
    isAuthenticated,
    isReady,
    router,
    submissionResult,
    user,
  ]);

  useEffect(() => {
    if (!isReady || !canUpgradeExistingAccount || !user) {
      return;
    }

    setFormData((currentFormData) => ({
      ...currentFormData,
      fullName: currentFormData.fullName || user.name || "",
      cityZipCode: currentFormData.cityZipCode || buildCityZipValue(user.location),
      phoneNumber: user.phone || currentFormData.phoneNumber,
      emailAddress: user.email || currentFormData.emailAddress,
    }));
  }, [canUpgradeExistingAccount, isReady, user]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));

    if (touched[name]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [name]: validateField(name, value),
      }));
    }

    if (submitError) {
      setSubmitError("");
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    setTouched((currentTouched) => ({ ...currentTouched, [name]: true }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: validateField(name, value),
    }));
  };

  const handleSkillToggle = (skillId) => {
    setTouched((currentTouched) => ({ ...currentTouched, skills: true }));

    setFormData((currentFormData) => {
      const nextSkills = currentFormData.skills.includes(skillId)
        ? currentFormData.skills.filter((id) => id !== skillId)
        : [...currentFormData.skills, skillId];

      setErrors((currentErrors) => ({
        ...currentErrors,
        skills: validateField("skills", nextSkills),
      }));

      return {
        ...currentFormData,
        skills: nextSkills,
      };
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];

    if (!validTypes.includes(file.type)) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        photoId: "Please upload an image or PDF file",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        photoId: "File size must be less than 5MB",
      }));
      return;
    }

    setFormData((currentFormData) => ({ ...currentFormData, photoId: file }));
    setFileName(file.name);
    setErrors((currentErrors) => ({ ...currentErrors, photoId: "" }));

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      return;
    }

    setImagePreview("");
  };

  const validateForm = () => {
    const nextErrors = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "photoId") {
        return;
      }

      const validationMessage = validateField(key, value);
      if (validationMessage) {
        nextErrors[key] = validationMessage;
      }
    });

    setErrors(nextErrors);
    setTouched({
      fullName: true,
      age: true,
      cityZipCode: true,
      phoneNumber: true,
      emailAddress: true,
      skills: true,
      availability: true,
    });

    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
    setFileName("");
    setImagePreview("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmissionResult(null);

    try {
      const session = await registerHero({
        fullName: formData.fullName.trim(),
        age: Number.parseInt(formData.age, 10),
        cityZipCode: formData.cityZipCode.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.emailAddress.trim().toLowerCase(),
        skills: formData.skills,
        availability: formData.availability,
        availabilityLabel: formData.availability,
      });

      setSubmissionResult({
        user: session.user,
        generatedPassword: session.metadata?.generatedPassword || "",
        upgradedExistingAccount: Boolean(session.metadata?.upgradedExistingAccount),
      });
      resetForm();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {canUpgradeExistingAccount ? "Become a Hero" : "Apply as a Hero"}
          </h1>
          <p className="text-gray-600">
            {canUpgradeExistingAccount
              ? "Use your current account to unlock Hero access while keeping the same email and phone number."
              : "Fill out the form below to start earning with local yard jobs."}
          </p>
        </div>

        {canUpgradeExistingAccount && !submissionResult ? (
          <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50 p-5 text-sm text-teal-900">
            This will upgrade your current account so you can book services as a customer and work jobs
            with the same login. Your email and phone number stay linked to this account.
          </div>
        ) : null}

        {submitError ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        {submissionResult ? (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5">
            <h2 className="text-lg font-semibold text-green-900">
              {submissionResult.upgradedExistingAccount ? "Hero access enabled" : "Application submitted"}
            </h2>
            <p className="mt-2 text-sm text-green-800">
              {submissionResult.upgradedExistingAccount
                ? "Your existing account now supports both customer and Hero access."
                : "Your Hero account was created and signed in successfully."}
            </p>
            {submissionResult.generatedPassword ? (
              <p className="mt-2 text-sm text-green-900">
                Temporary password:{" "}
                <span className="font-semibold">{submissionResult.generatedPassword}</span>
              </p>
            ) : null}
            <p className="mt-2 text-sm text-green-700">
              Hero approval status starts as pending until the dashboard reviews the application.
            </p>
            <button
              type="button"
              onClick={() => router.push(getPostAuthPath(submissionResult.user))}
              className="mt-4 rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900"
            >
              Continue
            </button>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Enter your full name"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.fullName && touched.fullName
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
              } focus:ring-2 focus:outline-none transition-colors`}
            />
            {errors.fullName && touched.fullName ? (
              <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Enter your age"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.age && touched.age
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
              } focus:ring-2 focus:outline-none transition-colors`}
            />
            <p className="mt-1 text-xs text-gray-500">Must be 13 or older to apply</p>
            {errors.age && touched.age ? (
              <p className="mt-1 text-sm text-red-500">{errors.age}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="cityZipCode" className="block text-sm font-medium text-gray-700 mb-2">
              City / Zip Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="cityZipCode"
              name="cityZipCode"
              value={formData.cityZipCode}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="City, State or Zip Code"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.cityZipCode && touched.cityZipCode
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
              } focus:ring-2 focus:outline-none transition-colors`}
            />
            <p className="mt-1 text-xs text-gray-500">We&apos;ll match you with jobs in your area</p>
            {errors.cityZipCode && touched.cityZipCode ? (
              <p className="mt-1 text-sm text-red-500">{errors.cityZipCode}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="(555) 123-4567"
              readOnly={canUpgradeExistingAccount}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.phoneNumber && touched.phoneNumber
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
              } ${canUpgradeExistingAccount ? "bg-gray-50 text-gray-600" : ""} focus:ring-2 focus:outline-none transition-colors`}
            />
            {canUpgradeExistingAccount ? (
              <p className="mt-1 text-xs text-gray-500">
                Your Hero access must use the same phone number already saved on this account.
              </p>
            ) : null}
            {errors.phoneNumber && touched.phoneNumber ? (
              <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="emailAddress"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="your-email@example.com"
              readOnly={canUpgradeExistingAccount}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.emailAddress && touched.emailAddress
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
              } ${canUpgradeExistingAccount ? "bg-gray-50 text-gray-600" : ""} focus:ring-2 focus:outline-none transition-colors`}
            />
            {canUpgradeExistingAccount ? (
              <p className="mt-1 text-xs text-gray-500">
                Your Hero access must use the same email address already saved on this account.
              </p>
            ) : null}
            {errors.emailAddress && touched.emailAddress ? (
              <p className="mt-1 text-sm text-red-500">{errors.emailAddress}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Skills <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">Select all that apply (choose at least one)</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {skillsOptions.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => handleSkillToggle(skill.id)}
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 text-left transition-all ${
                    formData.skills.includes(skill.id)
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill.id)}
                    onChange={() => {}}
                    className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 pointer-events-none"
                  />
                  <span className="text-sm font-medium text-gray-700">{skill.label}</span>
                </button>
              ))}
            </div>
            {errors.skills && touched.skills ? (
              <p className="mt-2 text-sm text-red-500">{errors.skills}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
              Availability <span className="text-red-500">*</span>
            </label>
            <select
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.availability && touched.availability
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
              } focus:ring-2 focus:outline-none transition-colors bg-white`}
            >
              <option value="">Select your availability</option>
              {availabilityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.availability && touched.availability ? (
              <p className="mt-1 text-sm text-red-500">{errors.availability}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photo / ID</label>

            {imagePreview ? (
              <div className="relative border-2 border-teal-500 rounded-lg p-4 bg-teal-50">
                <img src={imagePreview} alt="Preview" className="w-full h-64 object-contain rounded-lg mb-3" />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-teal-700 truncate flex-1">{fileName}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setFileName("");
                      setFormData((currentFormData) => ({
                        ...currentFormData,
                        photoId: null,
                      }));
                    }}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
                <input
                  type="file"
                  id="photoId"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="photoId" className="cursor-pointer">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                  {fileName ? (
                    <p className="text-sm font-medium text-teal-600">{fileName}</p>
                  ) : (
                    <span className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                      Choose File
                    </span>
                  )}
                </label>
              </div>
            )}

            <p className="mt-2 text-xs text-gray-500">
              File preview is local for now. Upload persistence will be added when the backend exposes a
              document upload API.
            </p>
            {errors.photoId ? <p className="mt-1 text-sm text-red-500">{errors.photoId}</p> : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
              isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-teal-800 hover:bg-teal-900"
            } focus:outline-none focus:ring-4 focus:ring-teal-300`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </span>
            ) : (
              canUpgradeExistingAccount ? "Enable Hero Access" : "Submit Application"
            )}
          </button>

          <div className="flex items-start space-x-2 text-xs text-gray-500 pt-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p>Your information is safe and only used for job matching.</p>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => window.alert("Support contact is not connected yet.")}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Need help? Contact Support
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroRegistrationPage;
