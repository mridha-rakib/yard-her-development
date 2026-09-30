"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, MailCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { authApi } from "@/lib/api/auth-api";
import { getApiErrorMessage } from "@/lib/api/http";
import {
  buildLoginPath,
  getPostAuthPath,
  sanitizeRedirectTo,
} from "@/lib/auth/auth-redirect";
import { getDefaultPathForUser } from "@/lib/auth/get-default-path";
import { useAuthStore } from "@/stores/use-auth-store";

function VerifyEmailPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const metadata = useAuthStore((state) => state.metadata);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isReady = useAuthStore((state) => state.isReady);
  const refreshCurrentUser = useAuthStore((state) => state.refreshCurrentUser);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [pageError, setPageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [deliveryPreview, setDeliveryPreview] = useState(
    metadata?.emailVerificationDelivery || null
  );
  const redirectTo = sanitizeRedirectTo(searchParams.get("redirectTo"));

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(buildLoginPath(pathname));
      return;
    }

    if (user?.role === "admin") {
      router.replace(getDefaultPathForUser(user));
      return;
    }

    if (user?.isEmailVerified) {
      router.replace(getPostAuthPath(user, redirectTo));
    }
  }, [isAuthenticated, isReady, pathname, redirectTo, router, user]);

  const handleSendCode = async () => {
    setIsSendingCode(true);
    setPageError("");
    setMessage("");

    try {
      const result = await authApi.requestEmailVerificationCode();
      setDeliveryPreview(result.delivery || null);
      setMessage(
        result.alreadyVerified
          ? "Your email is already verified."
          : "A verification code has been sent to your email."
      );
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    if (!code.trim()) {
      setPageError("Enter the verification code from your email.");
      return;
    }

    setIsSubmitting(true);
    setPageError("");
    setMessage("");

    try {
      const result = await authApi.verifyEmailVerificationCode({
        code: code.trim(),
      });

      await refreshCurrentUser();
      setMessage("Email verified successfully.");
      router.replace(getPostAuthPath(result.user, redirectTo));
    } catch (error) {
      setPageError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady || !isAuthenticated || user?.role === "admin") {
    return <div className="min-h-screen bg-[#f6f8f6]" />;
  }

  return (
    <div className="min-h-screen bg-[#f6f8f6] px-4 py-12">
      <div className="mx-auto max-w-xl rounded-[28px] border border-[#d8e4db] bg-white p-8 shadow-[0_24px_60px_rgba(10,48,25,0.06)]">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef7f0] text-[#0A3019]">
            <MailCheck className="h-8 w-8" />
          </div>
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold text-[#10231a]">Verify your email</h1>
          <p className="mt-3 text-sm leading-7 text-[#53655a]">
            Enter the one-time code sent to <span className="font-semibold">{user?.email}</span>.
          </p>
        </div>

        <div className="mt-6 rounded-[20px] border border-[#e2e8e3] bg-[#fbfdfb] px-4 py-4 text-sm text-[#53655a]">
          Verifying your email keeps account recovery and password reset tied to the right inbox.
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

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-[#334155]">
            Verification code
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
                Verify email
              </>
            )}
          </button>
        </form>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSendCode}
            disabled={isSendingCode}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-[#d6e5d8] bg-white px-5 py-3 text-sm font-semibold text-[#10231a] transition-colors hover:bg-[#f5faf6] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSendingCode ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend code
              </>
            )}
          </button>

          <Link
            href={getDefaultPathForUser(user)}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-transparent bg-[#eef7f0] px-5 py-3 text-sm font-semibold text-[#166534] transition-colors hover:bg-[#e1f1e5]"
          >
            Back to account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f8f6]" />}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
