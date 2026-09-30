"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  ImagePlus,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  ReceiptText,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { jobsApi } from "@/lib/api/jobs-api";
import { paymentApi } from "@/lib/api/payment-api";
import { supportApi } from "@/lib/api/support-api";
import { usersApi } from "@/lib/api/users-api";
import { getApiErrorMessage } from "@/lib/api/http";
import { useRequiredRole } from "@/lib/auth/use-required-role";
import {
  PROFILE_PHOTO_ACCEPT,
  PROFILE_PHOTO_REQUIREMENTS,
  optimizeProfilePhotoFile,
} from "@/lib/profile-photo";
import { formatPrice } from "@/lib/pricing-content";
import { formatDate, formatDateTime } from "@/lib/time";
import { useAuthStore } from "@/stores/use-auth-store";

const JOB_LIMIT = 100;
const PAYMENT_LIMIT = 6;
const SUPPORT_LIMIT = 20;

const supportCategories = [
  { value: "general", label: "General" },
  { value: "booking", label: "Booking" },
  { value: "payment", label: "Payment" },
  { value: "worker", label: "Hero" },
  { value: "account", label: "Account" },
  { value: "safety", label: "Safety" },
];

const supportPriorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const supportStatusConfig = {
  open: { label: "Open", badgeClassName: "bg-[#fff1dc] text-[#b45309]" },
  in_progress: { label: "In Progress", badgeClassName: "bg-[#dbeafe] text-[#1d4ed8]" },
  resolved: { label: "Resolved", badgeClassName: "bg-[#dcfce7] text-[#166534]" },
  closed: { label: "Closed", badgeClassName: "bg-[#e5e7eb] text-[#4b5563]" },
};

const paymentStatusConfig = {
  paid: { label: "Paid", badgeClassName: "bg-[#dcfce7] text-[#166534]" },
  authorized: { label: "Secure Hold", badgeClassName: "bg-[#dbeafe] text-[#1d4ed8]" },
  pending: { label: "Pending", badgeClassName: "bg-[#fff7d6] text-[#a16207]" },
  failed: { label: "Failed", badgeClassName: "bg-[#fee2e2] text-[#b91c1c]" },
  cancelled: { label: "Cancelled", badgeClassName: "bg-[#e5e7eb] text-[#4b5563]" },
};

const createEmptyProfileForm = () => ({
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  zipCode: "",
  profilePhotoUrl: "",
});

const createEmptyPasswordForm = () => ({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const createEmptySupportForm = () => ({
  subject: "",
  category: "general",
  priority: "medium",
  message: "",
});

const mapProfileToForm = (profile) => ({
  name: profile?.name || "",
  email: profile?.email || "",
  phone: profile?.phone || "",
  addressLine1: profile?.location?.addressLine1 || "",
  city: profile?.location?.city || "",
  state: profile?.location?.state || "",
  zipCode: profile?.location?.zipCode || "",
  profilePhotoUrl: profile?.profilePhotoUrl || "",
});

const buildProfilePayload = (formData) => ({
  name: formData.name.trim(),
  email: formData.email.trim(),
  phone: formData.phone.trim(),
  addressLine1: formData.addressLine1.trim(),
  city: formData.city.trim(),
  state: formData.state.trim(),
  zipCode: formData.zipCode.trim(),
  profilePhotoUrl: formData.profilePhotoUrl.trim(),
});

const getInitials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((value) => value.charAt(0).toUpperCase())
    .join("") || "YH";

const formatCurrency = (value) => `$${formatPrice(value || 0)}`;
const getPaymentDate = (payment) => payment?.paidAt || payment?.authorizedAt || payment?.createdAt;
const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

const humanizeValue = (value = "") =>
  String(value)
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Unknown";

const formatLocation = (formData) =>
  [formData.addressLine1, formData.city, formData.state, formData.zipCode]
    .filter(Boolean)
    .join(", ") || "Location not added yet";

const getConversationPreview = (conversation) => {
  const latestMessage = conversation?.messages?.[conversation.messages.length - 1];
  return latestMessage?.message || "No messages yet.";
};

const getPaymentHeadline = (payment) =>
  payment?.job?.title || payment?.description || "Yard Hero payment";

const getPaymentSubtext = (payment) =>
  payment?.worker?.name
    ? `Handled by ${payment.worker.name}`
    : payment?.job?.serviceType || humanizeValue(payment?.paymentMethod || payment?.gateway);

const sortConversations = (items = []) =>
  [...items].sort((left, right) => {
    const rightTime = new Date(right?.lastMessageAt || right?.updatedAt || 0).getTime();
    const leftTime = new Date(left?.lastMessageAt || left?.updatedAt || 0).getTime();
    return rightTime - leftTime;
  });

const upsertConversation = (items, conversation) =>
  sortConversations([conversation, ...items.filter((item) => item?._id !== conversation?._id)]);

function StatCard({ label, value, detail, toneClassName }) {
  return (
    <div className="rounded-[24px] border border-[#d8e4db] bg-white p-5 shadow-[0_18px_45px_rgba(10,48,25,0.06)]">
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${toneClassName}`}>
        {label}
      </span>
      <p className="mt-5 text-3xl font-bold text-[#10231a]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[#53655a]">{detail}</p>
    </div>
  );
}

function ConversationCard({ conversation, isActive, onSelect }) {
  const status = supportStatusConfig[conversation?.status] || supportStatusConfig.open;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[22px] border px-4 py-4 text-left transition-colors ${
        isActive
          ? "border-[#0A3019] bg-[#f3f9f4]"
          : "border-[#e1e8e3] bg-white hover:border-[#bfd2c4] hover:bg-[#f9fcf9]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#10231a]">{conversation.subject}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6b7280]">
            {humanizeValue(conversation.category)}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.badgeClassName}`}>
          {status.label}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#53655a]">{getConversationPreview(conversation)}</p>
      <p className="mt-3 text-xs text-[#7b8a80]">
        Updated {formatDateTime(conversation?.lastMessageAt || conversation?.updatedAt)}
      </p>
    </button>
  );
}

function PaymentCard({ payment }) {
  const status = paymentStatusConfig[payment?.status] || paymentStatusConfig.pending;

  return (
    <div className="rounded-[22px] border border-[#e1e8e3] bg-[#fbfdfb] px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#10231a]">{getPaymentHeadline(payment)}</p>
          <p className="mt-1 text-sm text-[#53655a]">{getPaymentSubtext(payment)}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.badgeClassName}`}>
          {status.label}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#53655a]">
        <span>{humanizeValue(payment?.paymentMethod || payment?.gateway || "unknown")}</span>
        <span>{formatDate(getPaymentDate(payment))}</span>
        <span className="font-semibold text-[#10231a]">{formatCurrency(payment?.amount)}</span>
      </div>
    </div>
  );
}

export default function CustomerProfilePage() {
  const pathname = usePathname();
  const { user, isRoleReady } = useRequiredRole("customer", pathname);
  const refreshCurrentUser = useAuthStore((state) => state.refreshCurrentUser);

  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(createEmptyProfileForm());
  const [passwordForm, setPasswordForm] = useState(createEmptyPasswordForm());
  const [supportForm, setSupportForm] = useState(createEmptySupportForm());
  const [replyMessage, setReplyMessage] = useState("");
  const [jobs, setJobs] = useState([]);
  const [jobSummary, setJobSummary] = useState(null);
  const [jobPagination, setJobPagination] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentPagination, setPaymentPagination] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [conversationPagination, setConversationPagination] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [pageError, setPageError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [supportError, setSupportError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    if (!isRoleReady) return;

    let isActive = true;

    const loadPageData = async () => {
      setIsLoading(true);
      setSupportError("");
      setActiveConversation(null);
      setActiveConversationId("");

      try {
        const [profileResult, jobsResult, paymentsResult, conversationsResult] =
          await Promise.allSettled([
            usersApi.getProfile(),
            jobsApi.listMyJobs({ limit: JOB_LIMIT, includeOperational: false }),
            paymentApi.listPayments({ limit: PAYMENT_LIMIT }),
            supportApi.listConversations({ limit: SUPPORT_LIMIT }),
          ]);

        if (!isActive) return;
        if (profileResult.status !== "fulfilled") throw profileResult.reason;

        const warnings = [];
        const nextProfile = profileResult.value;
        const nextConversations =
          conversationsResult.status === "fulfilled"
            ? sortConversations(conversationsResult.value.items || [])
            : [];

        setProfile(nextProfile);
        setProfileForm(mapProfileToForm(nextProfile));

        if (jobsResult.status === "fulfilled") {
          setJobs(jobsResult.value.items || []);
          setJobSummary(jobsResult.value.summary || null);
          setJobPagination(jobsResult.value.pagination || null);
        } else {
          warnings.push("Job activity is temporarily unavailable.");
          setJobs([]);
          setJobSummary(null);
          setJobPagination(null);
        }

        if (paymentsResult.status === "fulfilled") {
          setPayments(paymentsResult.value.items || []);
          setPaymentPagination(paymentsResult.value.pagination || null);
        } else {
          warnings.push("Payment activity could not be loaded.");
          setPayments([]);
          setPaymentPagination(null);
        }

        if (conversationsResult.status === "fulfilled") {
          setConversations(nextConversations);
          setConversationPagination(conversationsResult.value.pagination || null);
          setActiveConversation(nextConversations[0] || null);
          setActiveConversationId(nextConversations[0]?._id || "");
        } else {
          warnings.push("Support inbox is temporarily unavailable.");
          setConversations([]);
          setConversationPagination(null);
          setActiveConversation(null);
          setActiveConversationId("");
        }

        setPageError(warnings.join(" "));
      } catch (error) {
        if (isActive) setPageError(getApiErrorMessage(error));
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadPageData();
    return () => {
      isActive = false;
    };
  }, [isRoleReady, reloadVersion, user]);

  useEffect(() => {
    if (!isRoleReady || !activeConversationId) return;

    let isActive = true;

    const loadConversation = async () => {
      setIsLoadingConversation(true);
      try {
        const nextConversation = await supportApi.getConversation(activeConversationId);
        if (!isActive) return;
        setActiveConversation(nextConversation);
        setConversations((currentValue) => upsertConversation(currentValue, nextConversation));
        setSupportError("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        if ([403, 404].includes(error?.response?.status)) {
          setConversations((currentValue) =>
            currentValue.filter((item) => item?._id !== activeConversationId)
          );
          setActiveConversation(null);
          setActiveConversationId("");
          setSupportError("");
          return;
        }

        setSupportError(getApiErrorMessage(error));
      } finally {
        if (isActive) setIsLoadingConversation(false);
      }
    };

    loadConversation();
    return () => {
      isActive = false;
    };
  }, [activeConversationId, isRoleReady, user]);

  const quickLinks = [
    { href: "/payment-history", label: "Payment History" },
    { href: "/myjobs", label: "Track current jobs" },
    { href: "/terms-conditions", label: "Terms & Conditions" },
    { href: "/privacy-policy", label: "Privacy policy" },
  ];

  const locationLabel = formatLocation(profileForm);
  const stats = {
    totalJobs: jobPagination?.total || jobs.length,
    activeJobs:
      Number(jobSummary?.new || 0) +
      Number(jobSummary?.assigned || 0) +
      Number(jobSummary?.inProgress || 0),
    completedJobs:
      Number(jobSummary?.completed || 0) + jobs.filter((job) => job?.status === "paid").length,
    supportThreads: conversationPagination?.total || conversations.length,
    openSupportThreads: conversations.filter((item) =>
      ["open", "in_progress"].includes(item?.status)
    ).length,
  };
  const paymentSummary = {
    latestPaidPayment: payments.find((item) => item?.status === "paid") || null,
    recentPaidTotal: payments
      .filter((item) => item?.status === "paid")
      .reduce((sum, item) => sum + Number(item?.amount || 0), 0),
    pendingPaymentTotal: payments
      .filter((item) => ["pending", "authorized"].includes(item?.status))
      .reduce((sum, item) => sum + Number(item?.amount || 0), 0),
  };
  const selectedConversationStatus =
    supportStatusConfig[activeConversation?.status] || supportStatusConfig.open;
  const profilePhotoInputId = "customer-profile-photo-upload";

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((currentValue) => ({ ...currentValue, [name]: value }));
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
      setProfileMessage("Profile photo is ready. Save your profile to apply it.");
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
    setPasswordForm((currentValue) => ({ ...currentValue, [name]: value }));
    setPasswordError("");
    setPasswordMessage("");
  };

  const handleSupportFieldChange = (event) => {
    const { name, value } = event.target;
    setSupportForm((currentValue) => ({ ...currentValue, [name]: value }));
    setSupportError("");
    setSupportMessage("");
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (!profileForm.name.trim()) return setProfileError("Full name is required.");
    if (!profileForm.email.trim() || !isValidEmail(profileForm.email.trim())) {
      return setProfileError("A valid email address is required.");
    }
    if (!profileForm.phone.trim()) return setProfileError("Phone number is required.");

    setIsSavingProfile(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const updatedProfile = await usersApi.updateProfile(buildProfilePayload(profileForm));
      setProfile(updatedProfile);
      setProfileForm(mapProfileToForm(updatedProfile));
      await refreshCurrentUser();
      setProfileMessage("Your profile details were saved.");
    } catch (error) {
      setProfileError(getApiErrorMessage(error));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      return setPasswordError("Current password and new password are required.");
    }
    if (passwordForm.newPassword.length < 8) {
      return setPasswordError("New password must be at least 8 characters.");
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordError("New password and confirmation do not match.");
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

  const handleConversationSubmit = async (event) => {
    event.preventDefault();
    if (!profileForm.name.trim()) return setSupportError("Add your full name before contacting support.");
    if (!profileForm.email.trim() || !isValidEmail(profileForm.email.trim())) {
      return setSupportError("A valid profile email is required to contact support.");
    }
    if (!supportForm.subject.trim()) return setSupportError("A subject is required.");
    if (!supportForm.message.trim()) return setSupportError("Write a message for the support team.");

    setIsCreatingConversation(true);
    setSupportError("");
    setSupportMessage("");

    try {
      const nextConversation = await supportApi.createConversation({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        subject: supportForm.subject.trim(),
        category: supportForm.category,
        priority: supportForm.priority,
        message: supportForm.message.trim(),
      });
      setConversations((currentValue) => upsertConversation(currentValue, nextConversation));
      setConversationPagination((currentValue) =>
        currentValue
          ? { ...currentValue, total: Math.max((currentValue.total || 0) + 1, 1) }
          : currentValue
      );
      setActiveConversationId(nextConversation._id);
      setActiveConversation(nextConversation);
      setSupportForm(createEmptySupportForm());
      setReplyMessage("");
      setSupportMessage("Your message was sent to customer support.");
    } catch (error) {
      setSupportError(getApiErrorMessage(error));
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();
    if (!activeConversationId) return setSupportError("Select a conversation first.");
    if (!replyMessage.trim()) return setSupportError("Write a reply before sending.");

    setIsSendingReply(true);
    setSupportError("");
    setSupportMessage("");

    try {
      const updatedConversation = await supportApi.addMessage(activeConversationId, {
        message: replyMessage.trim(),
      });
      setConversations((currentValue) => upsertConversation(currentValue, updatedConversation));
      setActiveConversation(updatedConversation);
      setReplyMessage("");
      setSupportMessage("Your reply was sent.");
    } catch (error) {
      setSupportError(getApiErrorMessage(error));
    } finally {
      setIsSendingReply(false);
    }
  };

  if (!isRoleReady) {
    return <div className="min-h-screen bg-[#f4f8f4]" />;
  }

  return (
    <div className="min-h-screen bg-[#f4f8f4] pb-16">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <section className="relative overflow-hidden rounded-[34px] border border-[#163322] bg-[#0A3019] text-white shadow-[0_40px_90px_rgba(10,48,25,0.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(198,255,210,0.24),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(255,221,153,0.18),_transparent_30%)]" />
          <div className="relative grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#bfdac5]">
                <span>Customer profile</span>
                <span className="h-1 w-1 rounded-full bg-[#bfdac5]" />
                <span>Member since {formatDate(profile?.createdAt, { month: "long", year: "numeric" })}</span>
              </div>

              <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center">
                {profileForm.profilePhotoUrl ? (
                  <img
                    src={profileForm.profilePhotoUrl}
                    alt={profileForm.name || "Profile"}
                    className="h-28 w-28 rounded-[28px] border border-white/20 object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-white/12 text-4xl font-bold">
                    {getInitials(profileForm.name)}
                  </div>
                )}

                <div className="min-w-0">
                  <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                    {profileForm.name || "Your profile"}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d4e6d8]">
                    Keep your account details current, review recent payments, and send customer
                    support messages to the admin team without leaving this page.
                  </p>

                  <div className="mt-5 grid gap-3 text-sm text-[#e5f1e7] sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{profileForm.email || "Email pending"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{profileForm.phone || "Phone pending"}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{locationLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfdac5]">
                  Quick actions
                </p>
                <div className="mt-4 grid gap-3">
                  <Link
                    href="/book"
                    className="inline-flex items-center justify-between rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#10231a] transition-colors hover:bg-[#eaf4ec]"
                  >
                    Book a new service
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/myjobs"
                    className="inline-flex items-center justify-between rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    View my jobs
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="rounded-[22px] bg-[#103c21] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfdac5]">
                  Account health
                </p>
                <p className="mt-3 text-lg font-semibold">Ready for bookings and support</p>
                <p className="mt-2 text-sm leading-6 text-[#d4e6d8]">
                  Last sign in {formatDateTime(profile?.lastLoginAt) || "not available yet"}.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Requests"
            value={stats.totalJobs}
            detail="All jobs submitted from this account."
            toneClassName="bg-[#eef7f0] text-[#166534]"
          />
          <StatCard
            label="Active Jobs"
            value={stats.activeJobs}
            detail="Requests currently waiting, accepted, or in progress."
            toneClassName="bg-[#edf3ff] text-[#1d4ed8]"
          />
          <StatCard
            label="Completed"
            value={stats.completedJobs}
            detail="Finished work that has been completed or paid."
            toneClassName="bg-[#fff5e8] text-[#b45309]"
          />
          <StatCard
            label="Support Threads"
            value={stats.supportThreads}
            detail={`${stats.openSupportThreads} conversation${stats.openSupportThreads === 1 ? "" : "s"} still active.`}
            toneClassName="bg-[#f4ebff] text-[#7c3aed]"
          />
        </div>

        {pageError ? (
          <div className="mt-6 rounded-[20px] border border-[#f2d0d0] bg-[#fff8f8] px-5 py-4 text-sm text-[#b42318]">
            {pageError}
          </div>
        ) : null}

        {profile && !profile.isEmailVerified ? (
          <div className="mt-6 rounded-[20px] border border-[#f8e3b1] bg-[#fff8e5] px-5 py-4 text-sm text-[#8a5a00]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p>
                Your email is not verified yet. Verify it now so password recovery and
                security alerts stay tied to the correct inbox.
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
          <div className="mt-8 flex min-h-[360px] items-center justify-center rounded-[28px] border border-[#d8e4db] bg-white">
            <div className="flex items-center gap-3 text-sm text-[#52606d]">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading your customer profile...
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-[30px] border border-[#d8e4db] bg-white p-6 shadow-[0_20px_50px_rgba(10,48,25,0.05)] md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#eef7f0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#166534]">
                      <UserRound className="h-4 w-4" />
                      Personal details
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-[#10231a]">Keep your account current</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[#53655a]">
                      Update your contact details so job confirmations, payment receipts, and
                      support replies reach the right place.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileForm(mapProfileToForm(profile))}
                    className="inline-flex items-center justify-center rounded-full border border-[#d8e4db] px-4 py-2 text-sm font-semibold text-[#425246] transition-colors hover:bg-[#f6faf7]"
                  >
                    Reset changes
                  </button>
                </div>

                <form onSubmit={handleProfileSubmit} className="mt-8 space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { name: "name", label: "Full name", type: "text", span: "" },
                      { name: "phone", label: "Phone", type: "tel", span: "" },
                      { name: "email", label: "Email", type: "email", span: "md:col-span-2" },
                      { name: "addressLine1", label: "Street address", type: "text", span: "md:col-span-2" },
                      { name: "city", label: "City", type: "text", span: "" },
                      { name: "state", label: "State", type: "text", span: "" },
                      { name: "zipCode", label: "ZIP code", type: "text", span: "" },
                    ].map((field) => (
                      <label key={field.name} className={`text-sm font-medium text-[#334155] ${field.span}`}>
                        {field.label}
                        <input
                          type={field.type}
                          name={field.name}
                          value={profileForm[field.name]}
                          onChange={handleProfileFieldChange}
                          placeholder={field.placeholder || ""}
                          className="mt-2 w-full rounded-[20px] border border-[#d5ddd7] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                        />
                      </label>
                    ))}

                    <div className="md:col-span-2 rounded-[24px] border border-[#d5ddd7] bg-[#fbfdfb] p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        {profileForm.profilePhotoUrl ? (
                          <img
                            src={profileForm.profilePhotoUrl}
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
                            Choose a photo from your device, then save your profile to update it.
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
                              className={`inline-flex items-center justify-center rounded-full bg-[#0A3019] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0d4021] ${
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

                            {profileForm.profilePhotoUrl ? (
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

                  {profileMessage ? (
                    <div className="rounded-[18px] border border-[#cfe5d5] bg-[#f7fbf8] px-4 py-3 text-sm text-[#166534]">
                      {profileMessage}
                    </div>
                  ) : null}

                  {profileError ? (
                    <div className="rounded-[18px] border border-[#f2d0d0] bg-[#fff8f8] px-4 py-3 text-sm text-[#b42318]">
                      {profileError}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="inline-flex items-center justify-center rounded-full bg-[#0A3019] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d4021] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSavingProfile ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Saving profile...
                        </>
                      ) : (
                        "Save changes"
                      )}
                    </button>
                    <span className="text-sm text-[#6c7b71]">
                      Your support requests will use this name and email.
                    </span>
                  </div>
                </form>
              </section>
              <section className="rounded-[30px] border border-[#d8e4db] bg-white p-6 shadow-[0_20px_50px_rgba(10,48,25,0.05)] md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#1d4ed8]">
                      <MessageSquareText className="h-4 w-4" />
                      Customer support
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-[#10231a]">Message the admin support team</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[#53655a]">
                      Start a new conversation or continue an existing one. Messages are stored in
                      the same support system used by the admin dashboard.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReloadVersion((currentValue) => currentValue + 1)}
                    className="inline-flex items-center justify-center rounded-full border border-[#d8e4db] px-4 py-2 text-sm font-semibold text-[#425246] transition-colors hover:bg-[#f6faf7]"
                  >
                    Refresh inbox
                  </button>
                </div>

                {(supportMessage || supportError) && (
                  <div
                    className={`mt-6 rounded-[18px] border px-4 py-3 text-sm ${
                      supportError
                        ? "border-[#f2d0d0] bg-[#fff8f8] text-[#b42318]"
                        : "border-[#cfe5d5] bg-[#f7fbf8] text-[#166534]"
                    }`}
                  >
                    {supportError || supportMessage}
                  </div>
                )}

                <div className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                  <div className="space-y-5">
                    <form
                      onSubmit={handleConversationSubmit}
                      className="rounded-[26px] border border-[#dfe8e1] bg-[#f9fcf9] p-5"
                    >
                      <p className="text-lg font-semibold text-[#10231a]">Start a new conversation</p>
                      <div className="mt-4 space-y-4">
                        <label className="block text-sm font-medium text-[#334155]">
                          Subject
                          <input
                            type="text"
                            name="subject"
                            value={supportForm.subject}
                            onChange={handleSupportFieldChange}
                            placeholder="What do you need help with?"
                            className="mt-2 w-full rounded-[18px] border border-[#d5ddd7] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                          />
                        </label>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="block text-sm font-medium text-[#334155]">
                            Category
                            <select
                              name="category"
                              value={supportForm.category}
                              onChange={handleSupportFieldChange}
                              className="mt-2 w-full rounded-[18px] border border-[#d5ddd7] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                            >
                              {supportCategories.map((category) => (
                                <option key={category.value} value={category.value}>
                                  {category.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block text-sm font-medium text-[#334155]">
                            Priority
                            <select
                              name="priority"
                              value={supportForm.priority}
                              onChange={handleSupportFieldChange}
                              className="mt-2 w-full rounded-[18px] border border-[#d5ddd7] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                            >
                              {supportPriorities.map((priority) => (
                                <option key={priority.value} value={priority.value}>
                                  {priority.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>

                        <label className="block text-sm font-medium text-[#334155]">
                          Message
                          <textarea
                            name="message"
                            value={supportForm.message}
                            onChange={handleSupportFieldChange}
                            rows={5}
                            placeholder="Describe the issue, booking, or payment question you want the admin team to review."
                            className="mt-2 w-full rounded-[18px] border border-[#d5ddd7] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                          />
                        </label>

                        <button
                          type="submit"
                          disabled={isCreatingConversation}
                          className="inline-flex w-full items-center justify-center rounded-full bg-[#0A3019] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d4021] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isCreatingConversation ? (
                            <>
                              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                              Sending to support...
                            </>
                          ) : (
                            "Send message to support"
                          )}
                        </button>
                      </div>
                    </form>

                    <div className="rounded-[26px] border border-[#dfe8e1] bg-white p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-lg font-semibold text-[#10231a]">Your inbox</p>
                        <span className="rounded-full bg-[#edf3ff] px-3 py-1 text-xs font-semibold text-[#1d4ed8]">
                          {stats.supportThreads} thread{stats.supportThreads === 1 ? "" : "s"}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        {conversations.length ? (
                          conversations.map((conversation) => (
                            <ConversationCard
                              key={conversation._id}
                              conversation={conversation}
                              isActive={conversation._id === activeConversationId}
                              onSelect={() => {
                                setActiveConversationId(conversation._id);
                                setActiveConversation(conversation);
                                setSupportError("");
                                setSupportMessage("");
                              }}
                            />
                          ))
                        ) : (
                          <div className="rounded-[22px] border border-dashed border-[#cbd8ce] bg-[#fbfdfb] px-4 py-8 text-center text-sm leading-6 text-[#53655a]">
                            No support threads yet. Start one from the form above when you need the
                            admin team.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-[#dfe8e1] bg-[#fbfdfb] p-5 md:p-6">
                    {activeConversation ? (
                      <div className="flex h-full flex-col">
                        <div className="flex flex-col gap-4 border-b border-[#e2e8e3] pb-5 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedConversationStatus.badgeClassName}`}>
                                {selectedConversationStatus.label}
                              </span>
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#52606d]">
                                {humanizeValue(activeConversation.category)}
                              </span>
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#52606d]">
                                {humanizeValue(activeConversation.priority)}
                              </span>
                            </div>
                            <h3 className="mt-4 text-2xl font-bold text-[#10231a]">
                              {activeConversation.subject}
                            </h3>
                            <p className="mt-2 text-sm text-[#53655a]">
                              Last updated {formatDateTime(activeConversation.lastMessageAt || activeConversation.updatedAt)}
                            </p>
                          </div>
                          <div className="rounded-[20px] border border-[#e1e8e3] bg-white px-4 py-3 text-sm text-[#53655a]">
                            Replies come from the admin support dashboard.
                          </div>
                        </div>

                        {isLoadingConversation ? (
                          <div className="flex min-h-[220px] items-center justify-center text-sm text-[#53655a]">
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Loading conversation...
                          </div>
                        ) : (
                          <>
                            <div className="mt-5 max-h-[420px] space-y-4 overflow-y-auto pr-1">
                              {(activeConversation.messages || []).map((message, index) => {
                                const isCustomerMessage = message?.senderRole === "customer";

                                return (
                                  <div
                                    key={`${message?.createdAt || "message"}-${index}`}
                                    className={`flex ${isCustomerMessage ? "justify-end" : "justify-start"}`}
                                  >
                                    <div
                                      className={`max-w-[85%] rounded-[22px] px-4 py-4 ${
                                        isCustomerMessage
                                          ? "bg-[#0A3019] text-white"
                                          : "border border-[#dfe8e1] bg-white text-[#10231a]"
                                      }`}
                                    >
                                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
                                        <span>{message?.senderName || humanizeValue(message?.senderRole)}</span>
                                        <span className={isCustomerMessage ? "text-white/70" : "text-[#7b8a80]"}>
                                          {formatDateTime(message?.createdAt)}
                                        </span>
                                      </div>
                                      <p className={`mt-3 whitespace-pre-wrap text-sm leading-7 ${isCustomerMessage ? "text-white" : "text-[#4b5b51]"}`}>
                                        {message?.message}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <form onSubmit={handleReplySubmit} className="mt-6 border-t border-[#e2e8e3] pt-5">
                              <label className="block text-sm font-medium text-[#334155]">
                                Send a follow-up
                                <textarea
                                  value={replyMessage}
                                  onChange={(event) => {
                                    setReplyMessage(event.target.value);
                                    setSupportError("");
                                    setSupportMessage("");
                                  }}
                                  rows={4}
                                  placeholder="Add details, upload links, or confirm the issue has been resolved."
                                  className="mt-2 w-full rounded-[18px] border border-[#d5ddd7] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                                />
                              </label>

                              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm text-[#6c7b71]">
                                  Keep each reply focused so the admin team can act quickly.
                                </p>
                                <button
                                  type="submit"
                                  disabled={isSendingReply}
                                  className="inline-flex items-center justify-center rounded-full bg-[#0A3019] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d4021] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  {isSendingReply ? (
                                    <>
                                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="mr-2 h-4 w-4" />
                                      Send reply
                                    </>
                                  )}
                                </button>
                              </div>
                            </form>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[#cbd8ce] bg-white px-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef7f0] text-[#0A3019]">
                          <MessageSquareText className="h-8 w-8" />
                        </div>
                        <h3 className="mt-6 text-2xl font-bold text-[#10231a]">No conversation selected</h3>
                        <p className="mt-3 max-w-md text-sm leading-7 text-[#53655a]">
                          Start a new support request or pick an existing thread to view replies
                          from the admin support team.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-[30px] border border-[#d8e4db] bg-white p-6 shadow-[0_20px_50px_rgba(10,48,25,0.05)]">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#fff3dc] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#b45309]">
                  <ReceiptText className="h-4 w-4" />
                  Billing overview
                </div>
                <h2 className="mt-4 text-2xl font-bold text-[#10231a]">Recent payment activity</h2>
                <p className="mt-2 text-sm leading-7 text-[#53655a]">
                  Based on your latest {paymentPagination?.limit || PAYMENT_LIMIT} payment record
                  {(paymentPagination?.limit || PAYMENT_LIMIT) === 1 ? "" : "s"}.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-[22px] border border-[#e1e8e3] bg-[#fbfdfb] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                      Recent paid total
                    </p>
                    <p className="mt-3 text-3xl font-bold text-[#10231a]">
                      {formatCurrency(paymentSummary.recentPaidTotal)}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[20px] border border-[#e1e8e3] bg-[#fbfdfb] px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                        Secure Hold / Pending
                      </p>
                      <p className="mt-3 text-2xl font-bold text-[#10231a]">
                        {formatCurrency(paymentSummary.pendingPaymentTotal)}
                      </p>
                    </div>
                    <div className="rounded-[20px] border border-[#e1e8e3] bg-[#fbfdfb] px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                        Latest payment
                      </p>
                      <p className="mt-3 text-lg font-bold text-[#10231a]">
                        {paymentSummary.latestPaidPayment
                          ? formatDate(getPaymentDate(paymentSummary.latestPaidPayment))
                          : "No paid jobs yet"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-[#e1e8e3] bg-[#0f2f1c] px-4 py-4 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfdac5]">
                      Latest method
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold">
                          {humanizeValue(
                            paymentSummary.latestPaidPayment?.paymentMethod ||
                              paymentSummary.latestPaidPayment?.gateway ||
                              "Not available"
                          )}
                        </p>
                        <p className="text-sm text-[#d4e6d8]">
                          {paymentSummary.latestPaidPayment
                            ? getPaymentHeadline(paymentSummary.latestPaidPayment)
                            : "Your payment method will appear here once a payment is completed."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/payment-history"
                    className="inline-flex w-full items-center justify-between rounded-full border border-[#d6e5d8] bg-white px-4 py-3 text-sm font-semibold text-[#10231a] transition-colors hover:bg-[#f5faf6]"
                  >
                    View Payment History
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </section>
              <section className="rounded-[30px] border border-[#d8e4db] bg-white p-6 shadow-[0_20px_50px_rgba(10,48,25,0.05)]">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#eef7f0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#166534]">
                  <CalendarDays className="h-4 w-4" />
                  Recent payments
                </div>
                <div className="mt-5 space-y-3">
                  {payments.length ? (
                    payments.slice(0, 4).map((payment) => <PaymentCard key={payment._id} payment={payment} />)
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-[#cbd8ce] bg-[#fbfdfb] px-4 py-8 text-center text-sm leading-6 text-[#53655a]">
                      Payment history will appear here after you authorize your first booking.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[30px] border border-[#d8e4db] bg-white p-6 shadow-[0_20px_50px_rgba(10,48,25,0.05)]">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#eef7f0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#166534]">
                  <ShieldCheck className="h-4 w-4" />
                  Security
                </div>
                <h2 className="mt-4 text-2xl font-bold text-[#10231a]">Change password</h2>
                <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
                  {[
                    { name: "currentPassword", label: "Current password" },
                    { name: "newPassword", label: "New password" },
                    { name: "confirmPassword", label: "Confirm new password" },
                  ].map((field) => (
                    <label key={field.name} className="block text-sm font-medium text-[#334155]">
                      {field.label}
                      <input
                        type="password"
                        name={field.name}
                        value={passwordForm[field.name]}
                        onChange={handlePasswordFieldChange}
                        className="mt-2 w-full rounded-[18px] border border-[#d5ddd7] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
                      />
                    </label>
                  ))}

                  {passwordMessage ? (
                    <div className="rounded-[18px] border border-[#cfe5d5] bg-[#f7fbf8] px-4 py-3 text-sm text-[#166534]">
                      {passwordMessage}
                    </div>
                  ) : null}

                  {passwordError ? (
                    <div className="rounded-[18px] border border-[#f2d0d0] bg-[#fff8f8] px-4 py-3 text-sm text-[#b42318]">
                      {passwordError}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#0A3019] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d4021] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSavingPassword ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Updating password...
                      </>
                    ) : (
                      <>
                        <LockKeyhole className="mr-2 h-4 w-4" />
                        Update password
                      </>
                    )}
                  </button>
                </form>
              </section>

              <section className="rounded-[30px] border border-[#d8e4db] bg-white p-6 shadow-[0_20px_50px_rgba(10,48,25,0.05)]">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f4ebff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#7c3aed]">
                  <Sparkles className="h-4 w-4" />
                  Helpful links
                </div>
                <div className="mt-5 space-y-3">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between rounded-[22px] border border-[#e1e8e3] bg-[#fbfdfb] px-4 py-4 text-sm font-semibold text-[#10231a] transition-colors hover:border-[#bfd2c4]"
                    >
                      {link.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
