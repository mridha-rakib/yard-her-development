import React, { useEffect, useState } from "react";
import { ExternalLink, ImagePlus, LoaderCircle, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminApi } from "../../lib/api/admin-api";
import { getApiErrorMessage } from "../../lib/api/http";
import {
  DEFAULT_LEGAL_DOCS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_PAYMENT_SETTINGS,
  DEFAULT_PLATFORM_INFO,
  getLegalDocumentStatusClasses,
  normalizeLegalDocs,
  normalizeNotificationSettings,
  normalizePaymentSettings,
  normalizePlatformInfo,
  PAYMENT_PROCESSOR_OPTIONS,
} from "../../lib/settings";
import { formatDateTime } from "../../lib/time";
import { getInitials } from "../../lib/workers";
import {
  PROFILE_PHOTO_ACCEPT,
  PROFILE_PHOTO_REQUIREMENTS,
  optimizeProfilePhotoFile,
} from "../../lib/profile-photo";
import { useAuthStore } from "../../stores/use-auth-store";
import RichTextEditor from "../../Components/ui/rich-text-editor";

const createEmptyPasswordState = () => ({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const formatLastSeen = (value) => formatDateTime(value) || "Not available";

const extractPlainText = (value = "") =>
  String(value)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();

const normalizeRichTextBody = (value = "") => {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return "";
  }

  return extractPlainText(normalizedValue) ? normalizedValue : "";
};

const Settings = () => {
  const refreshCurrentUser = useAuthStore((state) => state.refreshCurrentUser);
  const [platformInfo, setPlatformInfo] = useState(DEFAULT_PLATFORM_INFO);
  const [paymentSettings, setPaymentSettings] = useState(DEFAULT_PAYMENT_SETTINGS);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATION_SETTINGS);
  const [legalDocs, setLegalDocs] = useState(() => normalizeLegalDocs(DEFAULT_LEGAL_DOCS));
  const [adminProfile, setAdminProfile] = useState(null);
  const [passwordForm, setPasswordForm] = useState(() => createEmptyPasswordState());
  const [selectedLegalDoc, setSelectedLegalDoc] = useState(null);
  const [legalDocDraft, setLegalDocDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingProfilePhoto, setIsUpdatingProfilePhoto] = useState(false);
  const [error, setError] = useState("");

  const applySettings = (settings) => {
    setPlatformInfo(normalizePlatformInfo(settings?.platformSettings));
    setPaymentSettings(normalizePaymentSettings(settings?.paymentSettings));
    setNotifications(normalizeNotificationSettings(settings?.notificationSettings));
    setLegalDocs(normalizeLegalDocs(settings?.legalDocs));
    setAdminProfile(settings?.adminProfile || null);
  };

  useEffect(() => {
    let ignore = false;

    const loadSettings = async () => {
      setIsLoading(true);
      setError("");

      try {
        const settings = await adminApi.getSettings();

        if (!ignore) {
          applySettings(settings);
        }
      } catch (apiError) {
        if (!ignore) {
          setError(getApiErrorMessage(apiError));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      ignore = true;
    };
  }, []);

  const handlePlatformChange = (field, value) => {
    setPlatformInfo((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handlePaymentChange = (field, value) => {
    setPaymentSettings((current) => ({
      ...current,
      [field]: field === "paymentProcessor" ? value : Number(value || 0),
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleNotification = (key) => {
    setNotifications((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const openLegalDocDialog = (document) => {
    setSelectedLegalDoc(document);
    setLegalDocDraft({ ...document });
  };

  const closeLegalDocDialog = () => {
    setSelectedLegalDoc(null);
    setLegalDocDraft(null);
  };

  const handleLegalDocDraftChange = (field, value) => {
    setLegalDocDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveLegalDocDraft = () => {
    if (!legalDocDraft?.name?.trim()) {
      toast.error("Document name is required.");
      return;
    }

    setLegalDocs((current) =>
      current.map((document) =>
        document.id === legalDocDraft.id
          ? {
              ...legalDocDraft,
              name: legalDocDraft.name.trim(),
              body: normalizeRichTextBody(legalDocDraft.body),
            }
          : document
      )
    );

    closeLegalDocDialog();
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("All password fields are required.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await adminApi.changeProfilePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm(createEmptyPasswordState());
      toast.success("Password updated successfully.");
    } catch (apiError) {
      toast.error(getApiErrorMessage(apiError));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const updateAdminProfilePhoto = async (profilePhotoUrl) => {
    setIsUpdatingProfilePhoto(true);

    try {
      const updatedProfile = await adminApi.updateCurrentProfile({ profilePhotoUrl });
      setAdminProfile(updatedProfile);
      await refreshCurrentUser();
      toast.success(
        profilePhotoUrl ? "Profile photo updated successfully." : "Profile photo removed."
      );
    } catch (apiError) {
      toast.error(getApiErrorMessage(apiError));
    } finally {
      setIsUpdatingProfilePhoto(false);
    }
  };

  const handleAdminPhotoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsUpdatingProfilePhoto(true);

    try {
      const optimizedPhoto = await optimizeProfilePhotoFile(file);
      const updatedProfile = await adminApi.updateCurrentProfile({
        profilePhotoUrl: optimizedPhoto,
      });
      setAdminProfile(updatedProfile);
      await refreshCurrentUser();
      toast.success("Profile photo updated successfully.");
    } catch (apiError) {
      toast.error(
        apiError?.message && !apiError?.response
          ? apiError.message
          : getApiErrorMessage(apiError)
      );
    } finally {
      setIsUpdatingProfilePhoto(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!platformInfo.name.trim()) {
      toast.error("Platform name is required.");
      return;
    }

    if (!platformInfo.email.trim()) {
      toast.error("Support email is required.");
      return;
    }

    if (Number(paymentSettings.platformFee) < 0 || Number(paymentSettings.minimumServiceAmount) < 0) {
      toast.error("Payment values must be zero or greater.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const updatedSettings = await adminApi.updateSettings({
        platformSettings: platformInfo,
        paymentSettings,
        notificationSettings: notifications,
        legalDocs,
      });

      applySettings(updatedSettings);
      toast.success("Settings saved successfully.");
    } catch (apiError) {
      const nextError = getApiErrorMessage(apiError);
      setError(nextError);
      toast.error(nextError);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 mt-16">
        <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow-sm">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-16">
      <div className="mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-500">
            Configure platform details, payment rules, notification preferences, and
            legal content from one page.
          </p>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">Platform Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={platformInfo.name}
                    onChange={(event) => handlePlatformChange("name", event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-700"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={platformInfo.email}
                    onChange={(event) => handlePlatformChange("email", event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-700"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={platformInfo.phone}
                    onChange={(event) => handlePlatformChange("phone", event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-700"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">Payment Settings</h2>

              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Current Platform Fee</h3>
                      <p className="text-sm text-gray-600">
                        Commission charged on completed services.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {Number(paymentSettings.platformFee || 0)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {PAYMENT_PROCESSOR_OPTIONS.find(
                          (option) => option.value === paymentSettings.paymentProcessor
                        )?.label || paymentSettings.paymentProcessor}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Platform Fee (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentSettings.platformFee}
                    readOnly
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-600 outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Fixed globally at 12% for all services and future listings.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Minimum Service Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentSettings.minimumServiceAmount}
                      onChange={(event) =>
                        handlePaymentChange("minimumServiceAmount", event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-8 pr-4 text-sm text-gray-900 outline-none transition focus:border-green-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Payment Processor
                  </label>
                  <select
                    value={paymentSettings.paymentProcessor}
                    onChange={(event) =>
                      handlePaymentChange("paymentProcessor", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-700"
                  >
                    {PAYMENT_PROCESSOR_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Notification Preferences
              </h2>

              <div className="space-y-4">
                {[
                  {
                    key: "newUserRegistrations",
                    title: "New User Registrations",
                    description: "Notify when new users join the platform.",
                  },
                  {
                    key: "serviceCompletions",
                    title: "Service Completions",
                    description: "Notify when services are marked as complete.",
                  },
                  {
                    key: "paymentIssues",
                    title: "Payment Issues",
                    description: "Notify about failed payments or disputes.",
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleNotification(item.key)}
                      className={`relative h-6 w-12 rounded-full transition-colors ${
                        notifications[item.key] ? "bg-emerald-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          notifications[item.key] ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">Admin Profile</h2>

              <div className="mb-6 flex flex-col items-center">
                {adminProfile?.profilePhotoUrl ? (
                  <img
                    src={adminProfile.profilePhotoUrl}
                    alt={adminProfile.name}
                    className="mb-3 h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-3xl font-bold text-white">
                    {getInitials(adminProfile?.name || "Admin")}
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-900">
                  {adminProfile?.name || "Admin"}
                </h3>
                <p className="text-sm text-gray-600">{adminProfile?.email || "No email"}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Last login: {formatLastSeen(adminProfile?.lastLoginAt)}
                </p>
              </div>

              <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">Profile photo</p>
                <p className="mt-1 text-sm text-gray-600">
                  Upload a new image to update your admin avatar across the dashboard.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <input
                    id="admin-profile-photo-upload"
                    type="file"
                    accept={PROFILE_PHOTO_ACCEPT}
                    onChange={handleAdminPhotoChange}
                    className="hidden"
                    disabled={isUpdatingProfilePhoto}
                  />
                  <label
                    htmlFor="admin-profile-photo-upload"
                    className={`inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 ${
                      isUpdatingProfilePhoto ? "cursor-not-allowed opacity-70" : ""
                    }`}
                  >
                    {isUpdatingProfilePhoto ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Updating photo...
                      </>
                    ) : (
                      <>
                        <ImagePlus className="mr-2 h-4 w-4" />
                        Upload photo
                      </>
                    )}
                  </label>

                  {adminProfile?.profilePhotoUrl ? (
                    <button
                      type="button"
                      onClick={() => updateAdminProfilePhoto("")}
                      disabled={isUpdatingProfilePhoto}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove photo
                    </button>
                  ) : null}
                </div>

                <p className="mt-3 text-xs text-gray-500">{PROFILE_PHOTO_REQUIREMENTS}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      handlePasswordChange("currentPassword", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-700"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      handlePasswordChange("newPassword", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-700"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      handlePasswordChange("confirmPassword", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-700"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdatingPassword ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">Legal & Compliance</h2>

              <div className="space-y-3">
                {legalDocs.map((document) => {
                  const previewText = extractPlainText(document.body);

                  return (
                    <div
                      key={document.id}
                      className="flex items-center justify-between gap-4 border-b border-gray-100 py-3 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900">{document.name}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getLegalDocumentStatusClasses(
                              document.status
                            )}`}
                          >
                            {document.status === "inactive" ? "Inactive" : "Active"}
                          </span>
                          <span className="truncate text-xs text-gray-500">
                            {previewText
                              ? `${previewText.slice(0, 96)}${previewText.length > 96 ? "..." : ""}`
                              : "No content added yet."}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openLegalDocDialog(document)}
                        className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
                      >
                        Edit
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-8 py-3 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Saving..." : "Save All Settings"}
          </button>
        </div>

        <Dialog
          open={Boolean(selectedLegalDoc)}
          onOpenChange={(open) => (!open ? closeLegalDocDialog() : null)}
        >
          <DialogContent className="max-h-[calc(100vh-2rem)] max-w-4xl overflow-hidden p-0">
            <div className="flex min-h-0 max-h-[min(90vh,56rem)] flex-col">
              <DialogHeader className="shrink-0 border-b border-gray-200 px-6 pb-4 pt-6 pr-14">
                <DialogTitle>{selectedLegalDoc?.name || "Edit Document"}</DialogTitle>
                <DialogDescription>
                  Update the document status and content. These changes will be included in
                  the next settings save.
                </DialogDescription>
              </DialogHeader>

              {legalDocDraft ? (
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Document Name
                      </label>
                      <input
                        type="text"
                        value={legalDocDraft.name}
                        onChange={(event) =>
                          handleLegalDocDraftChange("name", event.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-700"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        value={legalDocDraft.status}
                        onChange={(event) =>
                          handleLegalDocDraftChange("status", event.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-700"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="min-h-0">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Content
                      </label>
                      <RichTextEditor
                        value={legalDocDraft.body}
                        onChange={(value) => handleLegalDocDraftChange("body", value)}
                        placeholder="Write and format the document content here..."
                        minHeight={420}
                        height={420}
                        maxHeight={420}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <DialogFooter className="mx-0 mb-0 shrink-0 border-t border-gray-200 bg-white px-6 py-4">
                <Button type="button" variant="outline" onClick={closeLegalDocDialog}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSaveLegalDocDraft}>
                  Apply Changes
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Settings;
