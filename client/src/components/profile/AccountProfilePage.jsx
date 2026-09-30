"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Camera,
  ImagePlus,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { usersApi } from "@/lib/api/users-api";
import { getApiErrorMessage } from "@/lib/api/http";
import { useRequiredRole } from "@/lib/auth/use-required-role";
import {
  PROFILE_PHOTO_ACCEPT,
  PROFILE_PHOTO_REQUIREMENTS,
  optimizeProfilePhotoFile,
} from "@/lib/profile-photo";
import {
  TIME_HOURS,
  TIME_MINUTES,
  TIME_PERIODS,
  buildTimeValue,
  createEmptyTimeParts,
  formatTime,
  getTimeFieldParts,
} from "@/lib/time";
import { useAuthStore } from "@/stores/use-auth-store";

const weekdays = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

const workerStatusLabel = {
  approved: "Approved",
  pending: "Pending Review",
  rejected: "Rejected",
  not_applicable: "Not Applicable",
};

const roleLabel = {
  customer: "Customer",
  worker: "Hero",
};

const createEmptyPortfolioItem = () => ({
  id: `portfolio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: "",
  description: "",
  serviceType: "",
  completedAt: "",
  imageUrl: "",
});

const createEmptyProfileForm = () => ({
  name: "",
  email: "",
  phone: "",
  age: "",
  addressLine1: "",
  city: "",
  state: "",
  zipCode: "",
  profilePhotoUrl: "",
  idDocumentUrl: "",
  skillsText: "",
  workerBio: "",
  portfolioItems: [],
  availabilityLabel: "",
  availableDays: [],
  startTime: createEmptyTimeParts(),
  endTime: createEmptyTimeParts(),
});

const createEmptyPasswordForm = () => ({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const getInitials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join("") || "YH";

const mapProfileToForm = (profile) => ({
  name: profile?.name || "",
  email: profile?.email || "",
  phone: profile?.phone || "",
  age: profile?.age ? String(profile.age) : "",
  addressLine1: profile?.location?.addressLine1 || "",
  city: profile?.location?.city || "",
  state: profile?.location?.state || "",
  zipCode: profile?.location?.zipCode || "",
  profilePhotoUrl: profile?.profilePhotoUrl || "",
  idDocumentUrl: profile?.idDocumentUrl || "",
  skillsText: Array.isArray(profile?.skills) ? profile.skills.join(", ") : "",
  workerBio: profile?.workerBio || "",
  portfolioItems: Array.isArray(profile?.portfolioItems)
    ? profile.portfolioItems.map((item, index) => ({
        id: item?.id || `portfolio-${index + 1}`,
        title: item?.title || "",
        description: item?.description || "",
        serviceType: item?.serviceType || "",
        completedAt: item?.completedAt
          ? new Date(item.completedAt).toISOString().slice(0, 10)
          : "",
        imageUrl: item?.imageUrl || "",
      }))
    : [],
  availabilityLabel: profile?.availability?.label || "",
  availableDays: Array.isArray(profile?.availability?.days) ? profile.availability.days : [],
  startTime: getTimeFieldParts(profile?.availability?.startTime),
  endTime: getTimeFieldParts(profile?.availability?.endTime),
});

const buildProfilePayload = (formData, expectedRole) => {
  const payload = {
    name: formData.name.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim(),
    addressLine1: formData.addressLine1.trim(),
    city: formData.city.trim(),
    state: formData.state.trim(),
    zipCode: formData.zipCode.trim(),
    profilePhotoUrl: formData.profilePhotoUrl.trim(),
  };

  if (formData.age.trim()) {
    payload.age = Number(formData.age);
  }

  if (expectedRole === "worker") {
    payload.idDocumentUrl = formData.idDocumentUrl.trim();
    payload.skills = formData.skillsText
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
    payload.workerBio = formData.workerBio.trim();
    payload.portfolioItems = formData.portfolioItems
      .map((item) => ({
        id: item.id,
        title: item.title.trim(),
        description: item.description.trim(),
        serviceType: item.serviceType.trim(),
        completedAt: item.completedAt || null,
        imageUrl: item.imageUrl.trim(),
      }))
      .filter((item) => item.imageUrl);
    payload.availabilityLabel = formData.availabilityLabel.trim();
    payload.availableDays = formData.availableDays;
    payload.startTime = buildTimeValue(formData.startTime);
    payload.endTime = buildTimeValue(formData.endTime);
  }

  return payload;
};

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);
const isTimeFieldEmpty = (value) => !value.hour && !value.minute && !value.meridiem;
const isTimeFieldComplete = (value) => Boolean(value.hour && value.minute !== "" && value.meridiem);

function TimeSelectField({ label, value, onChange }) {
  const timePreview = formatTime(buildTimeValue(value));

  return (
    <div className="text-sm font-medium text-[#334155]">
      <span>{label}</span>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_0.9fr]">
        <select
          value={value.hour}
          onChange={(event) => onChange("hour", event.target.value)}
          aria-label={`${label} hour`}
          className="rounded-2xl border border-[#d5ddd7] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
        >
          <option value="">Hour</option>
          {TIME_HOURS.map((hourValue) => (
            <option key={hourValue} value={hourValue}>
              {hourValue}
            </option>
          ))}
        </select>

        <select
          value={value.minute}
          onChange={(event) => onChange("minute", event.target.value)}
          aria-label={`${label} minute`}
          className="rounded-2xl border border-[#d5ddd7] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
        >
          <option value="">Minute</option>
          {TIME_MINUTES.map((minuteValue) => (
            <option key={minuteValue} value={minuteValue}>
              {minuteValue}
            </option>
          ))}
        </select>

        <select
          value={value.meridiem}
          onChange={(event) => onChange("meridiem", event.target.value)}
          aria-label={`${label} period`}
          className="rounded-2xl border border-[#d5ddd7] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
        >
          <option value="">AM/PM</option>
          {TIME_PERIODS.map((periodValue) => (
            <option key={periodValue} value={periodValue}>
              {periodValue}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-2 text-xs text-[#64748b]">{timePreview || "Leave blank if not set."}</p>
    </div>
  );
}

export default function AccountProfilePage({ expectedRole }) {
  const pathname = usePathname();
  const { user, isRoleReady } = useRequiredRole(expectedRole, pathname);
  const refreshCurrentUser = useAuthStore((state) => state.refreshCurrentUser);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(createEmptyProfileForm());
  const [passwordForm, setPasswordForm] = useState(createEmptyPasswordForm());
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [pageError, setPageError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    if (!isRoleReady) {
      return;
    }

    let isActive = true;

    const loadProfile = async () => {
      setIsLoading(true);

      try {
        const nextProfile = await usersApi.getProfile();

        if (!isActive) {
          return;
        }

        setProfile(nextProfile);
        setProfileForm(mapProfileToForm(nextProfile));
        setPageError("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setPageError(getApiErrorMessage(error));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [expectedRole, isRoleReady, user]);

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
    setProfileError("");
    setProfileMessage("");
  };

  const handleProfilePhotoFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsPreparingPhoto(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const optimizedPhoto = await optimizeProfilePhotoFile(file);
      setProfileForm((currentValue) => ({
        ...currentValue,
        profilePhotoUrl: optimizedPhoto,
      }));
      setProfileMessage("Profile photo is ready. Click Save Profile to apply it.");
    } catch (error) {
      setProfileError(error?.message || "We could not prepare that photo.");
    } finally {
      setIsPreparingPhoto(false);
    }
  };

  const handleProfilePhotoRemove = () => {
    setProfileForm((currentValue) => ({
      ...currentValue,
      profilePhotoUrl: "",
    }));
    setProfileError("");
    setProfileMessage("Profile photo will be removed when you save.");
  };

  const handlePasswordFieldChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
    setPasswordError("");
    setPasswordMessage("");
  };

  const handleTimeFieldChange = (fieldName, partName, partValue) => {
    setProfileForm((currentValue) => ({
      ...currentValue,
      [fieldName]: {
        ...currentValue[fieldName],
        [partName]: partValue,
      },
    }));
    setProfileError("");
    setProfileMessage("");
  };

  const handlePortfolioFieldChange = (itemId, fieldName, fieldValue) => {
    setProfileForm((currentValue) => ({
      ...currentValue,
      portfolioItems: currentValue.portfolioItems.map((item) =>
        item.id === itemId ? { ...item, [fieldName]: fieldValue } : item
      ),
    }));
    setProfileError("");
    setProfileMessage("");
  };

  const handleAddPortfolioItem = () => {
    setProfileForm((currentValue) => ({
      ...currentValue,
      portfolioItems: [...currentValue.portfolioItems, createEmptyPortfolioItem()],
    }));
    setProfileError("");
    setProfileMessage("");
  };

  const handleRemovePortfolioItem = (itemId) => {
    setProfileForm((currentValue) => ({
      ...currentValue,
      portfolioItems: currentValue.portfolioItems.filter((item) => item.id !== itemId),
    }));
    setProfileError("");
    setProfileMessage("");
  };

  const handlePortfolioImageChange = async (itemId, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsPreparingPhoto(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const optimizedPhoto = await optimizeProfilePhotoFile(file);
      setProfileForm((currentValue) => ({
        ...currentValue,
        portfolioItems: currentValue.portfolioItems.map((item) =>
          item.id === itemId ? { ...item, imageUrl: optimizedPhoto } : item
        ),
      }));
      setProfileMessage("Portfolio image is ready. Save Profile to publish it.");
    } catch (error) {
      setProfileError(error?.message || "We could not prepare that portfolio image.");
    } finally {
      setIsPreparingPhoto(false);
    }
  };

  const toggleAvailableDay = (dayValue) => {
    setProfileForm((currentValue) => ({
      ...currentValue,
      availableDays: currentValue.availableDays.includes(dayValue)
        ? currentValue.availableDays.filter((day) => day !== dayValue)
        : [...currentValue.availableDays, dayValue],
    }));
    setProfileError("");
    setProfileMessage("");
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (!profileForm.name.trim()) {
      setProfileError("Name is required.");
      return;
    }

    if (!profileForm.email.trim() || !isValidEmail(profileForm.email.trim())) {
      setProfileError("A valid email address is required.");
      return;
    }

    if (!profileForm.phone.trim()) {
      setProfileError("Phone number is required.");
      return;
    }

    if (!isTimeFieldEmpty(profileForm.startTime) && !isTimeFieldComplete(profileForm.startTime)) {
      setProfileError("Complete the start time or leave it blank.");
      return;
    }

    if (!isTimeFieldEmpty(profileForm.endTime) && !isTimeFieldComplete(profileForm.endTime)) {
      setProfileError("Complete the end time or leave it blank.");
      return;
    }

    setIsSavingProfile(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const updatedProfile = await usersApi.updateProfile(
        buildProfilePayload(profileForm, expectedRole)
      );
      setProfile(updatedProfile);
      setProfileForm(mapProfileToForm(updatedProfile));
      await refreshCurrentUser();
      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      setProfileError(getApiErrorMessage(error));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError("Current password and new password are required.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setIsSavingPassword(true);
    setPasswordError("");
    setPasswordMessage("");

    try {
      await usersApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm(createEmptyPasswordForm());
      setPasswordMessage("Password updated successfully.");
    } catch (error) {
      setPasswordError(getApiErrorMessage(error));
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (!isRoleReady) {
    return <div className="min-h-screen bg-[#f6f8f6]" />;
  }

  const profileImageUrl = profileForm.profilePhotoUrl.trim();
  const locationSummary = [profileForm.city, profileForm.state, profileForm.zipCode]
    .filter(Boolean)
    .join(", ");
  const dashboardHref = expectedRole === "worker" ? "/all-jobs" : "/myjobs";
  const profilePhotoInputId = `${expectedRole}-profile-photo-upload`;

  return (
    <div className="min-h-screen bg-[#f6f8f6] py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
              {roleLabel[expectedRole]} Profile
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#0f172a]">Manage your account</h1>
            <p className="mt-2 text-sm text-[#52606d]">
              View your account details, update your profile, and keep your password secure.
            </p>
          </div>

          <Link
            href={dashboardHref}
            className="inline-flex items-center justify-center rounded-full border border-[#d7e0d9] bg-white px-4 py-2 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f9fbf9]"
          >
            {expectedRole === "worker" ? "View All Jobs" : "View My Jobs"}
          </Link>
        </div>

        {pageError ? (
          <div className="mb-6 rounded-2xl border border-[#f2d0d0] bg-[#fff8f8] px-4 py-3 text-sm text-[#b42318]">
            {pageError}
          </div>
        ) : null}

        {profile && !profile.isEmailVerified ? (
          <div className="mb-6 rounded-[24px] border border-[#f8e3b1] bg-[#fff8e5] px-5 py-4 text-sm text-[#8a5a00]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p>
                Your email is not verified yet. Complete verification before you need
                password recovery or other account security checks.
              </p>
              <Link
                href="/verify-email"
                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 font-semibold text-[#7c4a00] transition-colors hover:bg-[#fff2cc]"
              >
                Verify email
              </Link>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-[#d8e4db] bg-white">
            <div className="flex items-center gap-3 text-sm text-[#52606d]">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading profile...
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6 md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt={profileForm.name || "Profile"}
                        className="h-20 w-20 rounded-full object-cover border border-[#d8e4db]"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0A3019] text-2xl font-bold text-white">
                        {getInitials(profileForm.name)}
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-bold text-[#0f172a]">{profileForm.name}</h2>
                        <span className="rounded-full bg-[#eef7f0] px-3 py-1 text-xs font-semibold text-[#166534]">
                          {roleLabel[expectedRole]}
                        </span>
                        {expectedRole === "worker" ? (
                          <span className="rounded-full bg-[#f5f7fa] px-3 py-1 text-xs font-semibold text-[#475569]">
                            {workerStatusLabel[profile?.workerStatus] || "Hero"}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 flex flex-col gap-2 text-sm text-[#52606d]">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{profileForm.email || "Email pending"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{profileForm.phone || "Phone pending"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{locationSummary || "Location not added yet"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                      Account status
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#111827]">
                      {expectedRole === "worker"
                        ? workerStatusLabel[profile?.workerStatus] || "Hero"
                        : "Active customer"}
                    </p>
                  </div>
                </div>
              </section>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6 md:p-8">
                  <div className="flex items-center gap-2">
                    <UserRound className="h-5 w-5 text-[#0A3019]" />
                    <h3 className="text-xl font-semibold text-[#0f172a]">Profile Details</h3>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="text-sm font-medium text-[#334155]">
                      Full name
                      <input
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileFieldChange}
                        className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                      />
                    </label>

                    <label className="text-sm font-medium text-[#334155]">
                      Age
                      <input
                        type="number"
                        name="age"
                        value={profileForm.age}
                        onChange={handleProfileFieldChange}
                        className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                      />
                    </label>

                    <label className="text-sm font-medium text-[#334155]">
                      Email
                      <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileFieldChange}
                        className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                      />
                    </label>

                    <label className="text-sm font-medium text-[#334155]">
                      Phone
                      <input
                        type="tel"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileFieldChange}
                        className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                      />
                    </label>

                    <div className="md:col-span-2 rounded-[24px] border border-[#d5ddd7] bg-[#fbfdfb] p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        {profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt={profileForm.name || "Profile"}
                            className="h-20 w-20 rounded-full border border-[#d8e4db] object-cover"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0A3019] text-2xl font-bold text-white">
                            {getInitials(profileForm.name)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#334155]">Profile picture</p>
                          <p className="mt-1 text-sm text-[#64748b]">
                            Upload a new photo, then save your profile to update it everywhere.
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <input
                              id={profilePhotoInputId}
                              type="file"
                              accept={PROFILE_PHOTO_ACCEPT}
                              onChange={handleProfilePhotoFileChange}
                              className="hidden"
                              disabled={isPreparingPhoto || isSavingProfile}
                            />
                            <label
                              htmlFor={profilePhotoInputId}
                              className={`inline-flex items-center justify-center rounded-full bg-[#0A3019] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0b4221] ${
                                isPreparingPhoto || isSavingProfile
                                  ? "cursor-not-allowed opacity-70"
                                  : ""
                              }`}
                            >
                              {isPreparingPhoto ? (
                                <>
                                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                  Preparing photo...
                                </>
                              ) : (
                                <>
                                  <ImagePlus className="mr-2 h-4 w-4" />
                                  Upload photo
                                </>
                              )}
                            </label>

                            {profileImageUrl ? (
                              <button
                                type="button"
                                onClick={handleProfilePhotoRemove}
                                disabled={isPreparingPhoto || isSavingProfile}
                                className="inline-flex items-center justify-center rounded-full border border-[#d5ddd7] bg-white px-4 py-2 text-sm font-semibold text-[#425246] transition-colors hover:bg-[#f6faf7] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove photo
                              </button>
                            ) : null}
                          </div>

                          <p className="mt-3 text-xs text-[#64748b]">
                            {PROFILE_PHOTO_REQUIREMENTS}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6 md:p-8">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#0A3019]" />
                    <h3 className="text-xl font-semibold text-[#0f172a]">Address</h3>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="text-sm font-medium text-[#334155] md:col-span-2">
                      Address line
                      <input
                        type="text"
                        name="addressLine1"
                        value={profileForm.addressLine1}
                        onChange={handleProfileFieldChange}
                        className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                      />
                    </label>

                    <label className="text-sm font-medium text-[#334155]">
                      City
                      <input
                        type="text"
                        name="city"
                        value={profileForm.city}
                        onChange={handleProfileFieldChange}
                        className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                      />
                    </label>

                    <label className="text-sm font-medium text-[#334155]">
                      State
                      <input
                        type="text"
                        name="state"
                        value={profileForm.state}
                        onChange={handleProfileFieldChange}
                        className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                      />
                    </label>

                    <label className="text-sm font-medium text-[#334155]">
                      ZIP Code
                      <input
                        type="text"
                        name="zipCode"
                        value={profileForm.zipCode}
                        onChange={handleProfileFieldChange}
                        className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                      />
                    </label>
                  </div>
                </section>

                {expectedRole === "worker" ? (
                  <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6 md:p-8">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-[#0A3019]" />
                      <h3 className="text-xl font-semibold text-[#0f172a]">
                        Hero Details
                      </h3>
                    </div>

                    <div className="mt-5 grid gap-4">
                      <label className="text-sm font-medium text-[#334155]">
                        Skills
                        <input
                          type="text"
                          name="skillsText"
                          value={profileForm.skillsText}
                          onChange={handleProfileFieldChange}
                          placeholder="Lawn mowing, cleanup, trimming"
                          className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                        />
                      </label>

                      <label className="text-sm font-medium text-[#334155]">
                        Hero bio
                        <textarea
                          rows={4}
                          name="workerBio"
                          value={profileForm.workerBio}
                          onChange={handleProfileFieldChange}
                          placeholder="Tell customers what kind of outdoor jobs you do best."
                          className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                        />
                      </label>

                      <label className="text-sm font-medium text-[#334155]">
                        Availability label
                        <input
                          type="text"
                          name="availabilityLabel"
                          value={profileForm.availabilityLabel}
                          onChange={handleProfileFieldChange}
                          placeholder="Weekdays, evenings, weekends"
                          className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                        />
                      </label>

                      <div>
                        <p className="text-sm font-medium text-[#334155]">Available days</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {weekdays.map((day) => {
                            const isSelected = profileForm.availableDays.includes(day.value);

                            return (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() => toggleAvailableDay(day.value)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                  isSelected
                                    ? "bg-[#0A3019] text-white"
                                    : "bg-[#f5f7f5] text-[#475569] hover:bg-[#edf2ee]"
                                }`}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <TimeSelectField
                          label="Start time"
                          value={profileForm.startTime}
                          onChange={(partName, partValue) =>
                            handleTimeFieldChange("startTime", partName, partValue)
                          }
                        />

                        <TimeSelectField
                          label="End time"
                          value={profileForm.endTime}
                          onChange={(partName, partValue) =>
                            handleTimeFieldChange("endTime", partName, partValue)
                          }
                        />
                      </div>

                      <label className="text-sm font-medium text-[#334155]">
                        ID document URL
                        <input
                          type="url"
                          name="idDocumentUrl"
                          value={profileForm.idDocumentUrl}
                          onChange={handleProfileFieldChange}
                          className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                        />
                      </label>

                      <div className="rounded-[24px] border border-[#d5ddd7] bg-[#fbfdfb] p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[#0f172a]">
                              Portfolio Photos
                            </p>
                            <p className="mt-1 text-sm text-[#64748b]">
                              New Heroes can build a portfolio immediately so customers can see the quality of your work.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleAddPortfolioItem}
                            className="inline-flex items-center justify-center rounded-full border border-[#0A3019] bg-white px-4 py-2 text-sm font-semibold text-[#0A3019] transition-colors hover:bg-[#f6faf7]"
                          >
                            Add Portfolio Item
                          </button>
                        </div>

                        <div className="mt-5 space-y-4">
                          {profileForm.portfolioItems.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#d5ddd7] bg-white px-4 py-6 text-sm text-[#64748b]">
                              No portfolio items yet. Add a completed job photo so assigned customers can review your quality.
                            </div>
                          ) : (
                            profileForm.portfolioItems.map((item) => {
                              const portfolioUploadId = `portfolio-upload-${item.id}`;

                              return (
                                <div
                                  key={item.id}
                                  className="rounded-2xl border border-[#dbe3dd] bg-white p-4"
                                >
                                  <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                                    <div className="space-y-3">
                                      {item.imageUrl ? (
                                        <img
                                          src={item.imageUrl}
                                          alt={item.title || "Portfolio"}
                                          className="h-40 w-full rounded-2xl border border-[#d8e4db] object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-40 w-full items-center justify-center rounded-2xl border border-dashed border-[#d5ddd7] bg-[#f8faf8] text-sm text-[#64748b]">
                                          Upload a completed job photo
                                        </div>
                                      )}

                                      <input
                                        id={portfolioUploadId}
                                        type="file"
                                        accept={PROFILE_PHOTO_ACCEPT}
                                        onChange={(event) =>
                                          handlePortfolioImageChange(item.id, event)
                                        }
                                        className="hidden"
                                      />
                                      <div className="flex flex-wrap gap-2">
                                        <label
                                          htmlFor={portfolioUploadId}
                                          className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#0A3019] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0b4221]"
                                        >
                                          Upload photo
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => handleRemovePortfolioItem(item.id)}
                                          className="inline-flex items-center justify-center rounded-full border border-[#d5ddd7] bg-white px-4 py-2 text-sm font-semibold text-[#425246] transition-colors hover:bg-[#f6faf7]"
                                        >
                                          Remove item
                                        </button>
                                      </div>
                                    </div>

                                    <div className="grid gap-4">
                                      <label className="text-sm font-medium text-[#334155]">
                                        Project title
                                        <input
                                          type="text"
                                          value={item.title}
                                          onChange={(event) =>
                                            handlePortfolioFieldChange(
                                              item.id,
                                              "title",
                                              event.target.value
                                            )
                                          }
                                          className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                                        />
                                      </label>

                                      <label className="text-sm font-medium text-[#334155]">
                                        Service type
                                        <input
                                          type="text"
                                          value={item.serviceType}
                                          onChange={(event) =>
                                            handlePortfolioFieldChange(
                                              item.id,
                                              "serviceType",
                                              event.target.value
                                            )
                                          }
                                          placeholder="Lawn mowing, mulch install, hedge trimming"
                                          className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                                        />
                                      </label>

                                      <label className="text-sm font-medium text-[#334155]">
                                        Completed date
                                        <input
                                          type="date"
                                          value={item.completedAt}
                                          onChange={(event) =>
                                            handlePortfolioFieldChange(
                                              item.id,
                                              "completedAt",
                                              event.target.value
                                            )
                                          }
                                          className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                                        />
                                      </label>

                                      <label className="text-sm font-medium text-[#334155]">
                                        Description
                                        <textarea
                                          rows={4}
                                          value={item.description}
                                          onChange={(event) =>
                                            handlePortfolioFieldChange(
                                              item.id,
                                              "description",
                                              event.target.value
                                            )
                                          }
                                          placeholder="Add a short explanation of what you completed."
                                          className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                                        />
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                ) : null}

                {profileMessage ? (
                  <div className="rounded-2xl border border-[#cfe5d5] bg-[#f7fbf8] px-4 py-3 text-sm text-[#166534]">
                    {profileMessage}
                  </div>
                ) : null}

                {profileError ? (
                  <div className="rounded-2xl border border-[#f2d0d0] bg-[#fff8f8] px-4 py-3 text-sm text-[#b42318]">
                    {profileError}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex items-center justify-center rounded-full bg-[#0A3019] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b4221] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingProfile ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </button>
              </form>
            </div>

            <aside className="space-y-6">
              <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6">
                <div className="flex items-center gap-2">
                  <LockKeyhole className="h-5 w-5 text-[#0A3019]" />
                  <h3 className="text-xl font-semibold text-[#0f172a]">Change Password</h3>
                </div>

                <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
                  <label className="block text-sm font-medium text-[#334155]">
                    Current password
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordFieldChange}
                      className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                    />
                  </label>

                  <label className="block text-sm font-medium text-[#334155]">
                    New password
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordFieldChange}
                      className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                    />
                  </label>

                  <label className="block text-sm font-medium text-[#334155]">
                    Confirm new password
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordFieldChange}
                      className="mt-2 w-full rounded-2xl border border-[#d5ddd7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                    />
                  </label>

                  {passwordMessage ? (
                    <div className="rounded-2xl border border-[#cfe5d5] bg-[#f7fbf8] px-4 py-3 text-sm text-[#166534]">
                      {passwordMessage}
                    </div>
                  ) : null}

                  {passwordError ? (
                    <div className="rounded-2xl border border-[#f2d0d0] bg-[#fff8f8] px-4 py-3 text-sm text-[#b42318]">
                      {passwordError}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#0A3019] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b4221] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSavingPassword ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </form>
              </section>

              <section className="rounded-[28px] border border-[#d8e4db] bg-white p-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#0A3019]" />
                  <h3 className="text-xl font-semibold text-[#0f172a]">Account Summary</h3>
                </div>

                <div className="mt-5 space-y-4 text-sm text-[#52606d]">
                  <div className="rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                      Role
                    </p>
                    <p className="mt-2 text-base font-semibold text-[#111827]">
                      {roleLabel[expectedRole]}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                      Primary email
                    </p>
                    <p className="mt-2 text-base font-semibold text-[#111827]">
                      {profileForm.email || "Not added"}
                    </p>
                  </div>

                  {expectedRole === "worker" ? (
                    <div className="rounded-2xl border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                        Availability
                      </p>
                      <p className="mt-2 text-base font-semibold text-[#111827]">
                        {profileForm.availabilityLabel || "Not set"}
                      </p>
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-[#eef1ef] bg-[#f9fbf9] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <Camera className="mt-0.5 h-5 w-5 text-[#64748b]" />
                      <p className="text-sm leading-6 text-[#52606d]">
                        Upload a profile photo from your device and save it with the rest of your
                        profile changes. Password changes still require your current password for
                        security.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
