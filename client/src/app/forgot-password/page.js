"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { authApi } from "@/lib/api/auth-api";
import { getApiErrorMessage } from "@/lib/api/http";
import { buildLoginPath } from "@/lib/auth/auth-redirect";

const STEP_REQUEST = "request";
const STEP_VERIFY = "verify";
const STEP_RESET = "reset";
const STEP_SUCCESS = "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(STEP_REQUEST);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pageError, setPageError] = useState("");
  const [deliveryPreview, setDeliveryPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestCode = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setPageError("Enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setPageError("");
    setMessage("");

    try {
      const result = await authApi.requestPasswordResetCode({
        email: email.trim().toLowerCase(),
      });
      setDeliveryPreview(result.delivery || null);
      setMessage("If that email exists, a reset code has been sent.");
      setStep(STEP_VERIFY);
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();

    if (!code.trim()) {
      setPageError("Enter the reset code from your email.");
      return;
    }

    setIsSubmitting(true);
    setPageError("");
    setMessage("");

    try {
      const result = await authApi.verifyPasswordResetCode({
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });
      setResetToken(result.resetToken || "");
      setMessage("Code verified. You can now choose a new password.");
      setStep(STEP_RESET);
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!newPassword || !confirmPassword) {
      setPageError("Enter and confirm your new password.");
      return;
    }

    if (newPassword.length < 8) {
      setPageError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPageError("New password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);
    setPageError("");
    setMessage("");

    try {
      await authApi.resetPasswordWithToken({
        email: email.trim().toLowerCase(),
        resetToken,
        newPassword,
      });
      setMessage("Password updated successfully.");
      setStep(STEP_SUCCESS);
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsSubmitting(true);
    setPageError("");
    setMessage("");

    try {
      const result = await authApi.requestPasswordResetCode({
        email: email.trim().toLowerCase(),
        force: true,
      });
      setDeliveryPreview(result.delivery || null);
      setMessage("A new reset code has been sent.");
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8f6] px-4 py-12">
      <div className="mx-auto max-w-xl rounded-[28px] border border-[#d8e4db] bg-white p-8 shadow-[0_24px_60px_rgba(10,48,25,0.06)]">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef7f0] text-[#0A3019]">
            {step === STEP_RESET || step === STEP_SUCCESS ? (
              <LockKeyhole className="h-8 w-8" />
            ) : (
              <KeyRound className="h-8 w-8" />
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold text-[#10231a]">Forgot password</h1>
          <p className="mt-3 text-sm leading-7 text-[#53655a]">
            Recover access with an email OTP and set a new password securely.
          </p>
        </div>

        {message ? (
          <div className="mt-6 rounded-[18px] border border-[#cfe5d5] bg-[#f7fbf8] px-4 py-3 text-sm text-[#166534]">
            {message}
          </div>
        ) : null}

        {pageError ? (
          <div className="mt-6 rounded-[18px] border border-[#f2d0d0] bg-[#fff8f8] px-4 py-3 text-sm text-[#b42318]">
            {pageError}
          </div>
        ) : null}

        {deliveryPreview?.previewCode ? (
          <div className="mt-6 rounded-[18px] border border-[#dbeafe] bg-[#eff6ff] px-4 py-3 text-sm text-[#1d4ed8]">
            Development code preview: <span className="font-semibold">{deliveryPreview.previewCode}</span>
          </div>
        ) : null}

        {step === STEP_REQUEST ? (
          <form onSubmit={handleRequestCode} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-[#334155]">
              Email address
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setPageError("");
                  }}
                  placeholder="Enter your email"
                  className="w-full rounded-[18px] border border-[#d5ddd7] bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-[#0A3019]"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#0A3019] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d4021] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                "Send reset code"
              )}
            </button>
          </form>
        ) : null}

        {step === STEP_VERIFY ? (
          <form onSubmit={handleVerifyCode} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-[#334155]">
              Reset code
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                  setPageError("");
                }}
                placeholder="Enter 6-digit code"
                className="mt-2 w-full rounded-[18px] border border-[#d5ddd7] bg-white px-4 py-3 text-center text-lg tracking-[0.35em] outline-none transition-colors focus:border-[#0A3019]"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#0A3019] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d4021] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Verify code
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full border border-[#d6e5d8] bg-white px-5 py-3 text-sm font-semibold text-[#10231a] transition-colors hover:bg-[#f5faf6] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Resend code
            </button>
          </form>
        ) : null}

        {step === STEP_RESET ? (
          <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-[#334155]">
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setPageError("");
                }}
                placeholder="Create a new password"
                className="mt-2 w-full rounded-[18px] border border-[#d5ddd7] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
              />
            </label>

            <label className="block text-sm font-medium text-[#334155]">
              Confirm new password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setPageError("");
                }}
                placeholder="Confirm your new password"
                className="mt-2 w-full rounded-[18px] border border-[#d5ddd7] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#0A3019]"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#0A3019] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d4021] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                "Update password"
              )}
            </button>
          </form>
        ) : null}

        {step === STEP_SUCCESS ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-[20px] border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4 text-sm text-[#53655a]">
              Your password has been reset. Sign in with the new password to continue.
            </div>

            <Link
              href={buildLoginPath()}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#0A3019] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d4021]"
            >
              Back to login
            </Link>
          </div>
        ) : null}

        <div className="mt-6 text-center text-sm text-[#53655a]">
          Remembered your password?{" "}
          <Link href={buildLoginPath()} className="font-semibold text-[#0A3019] hover:text-[#0d4021]">
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
}
