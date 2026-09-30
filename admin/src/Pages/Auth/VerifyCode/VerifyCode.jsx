import React, { useEffect, useRef, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import brandlogo from "../../../assets/image/yard-new.jpeg";
import { authApi } from "../../../lib/api/auth-api";
import {
  getPasswordRecoveryState,
  setPasswordRecoveryState,
} from "../../../lib/auth-recovery";

const CODE_LENGTH = 6;

const VerifyCode = () => {
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [recoveryState, setRecoveryState] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, CODE_LENGTH);
    const storedState = getPasswordRecoveryState();

    if (!storedState?.email) {
      navigate("/forgate-password", { replace: true });
      return;
    }

    setRecoveryState(storedState);
  }, [navigate]);

  const handleChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const nextCode = [...code];
    nextCode[index] = value.slice(0, 1);
    setCode(nextCode);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async (event) => {
    event.preventDefault();

    if (!recoveryState?.email) {
      navigate("/forgate-password", { replace: true });
      return;
    }

    setIsResending(true);

    try {
      const result = await authApi.requestPasswordResetCode({
        email: recoveryState.email,
        force: true,
      });

      const nextRecoveryState = {
        ...recoveryState,
        delivery: result.delivery || null,
      };

      setRecoveryState(nextRecoveryState);
      setPasswordRecoveryState(nextRecoveryState);
      message.success("A new verification code has been sent.");
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Unable to resend the verification code."
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    const verificationCode = code.join("");

    if (verificationCode.length !== CODE_LENGTH) {
      message.error(`Please enter the ${CODE_LENGTH}-digit verification code.`);
      return;
    }

    if (!recoveryState?.email) {
      navigate("/forgate-password", { replace: true });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authApi.verifyPasswordResetCode({
        email: recoveryState.email,
        code: verificationCode,
      });

      setPasswordRecoveryState({
        email: recoveryState.email,
        resetToken: result.resetToken,
      });

      message.success("Verification code accepted.");
      navigate("/new-password");
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Unable to verify the reset code."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9fafb]">
      <div className="py-10 md:py-12 mx-2 md:mx-0 px-6 md:px-10 rounded-2xl w-[580px] bg-white border-2 border-[#eef6ff]">
        <div className="flex justify-center">
          <img className="h-20 w-20 rounded-xl object-cover" src={brandlogo} alt="Yard admin logo" />
        </div>
        <h1 className="text-2xl font-medium text-gray-900">Verify your code</h1>
        <p className="mt-4 text-gray-600">
          Enter the {CODE_LENGTH}-digit code sent to{" "}
          <span className="font-medium text-gray-700">{recoveryState?.email || "your email"}</span>.
        </p>

        {recoveryState?.delivery?.previewCode ? (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Development code preview:{" "}
            <span className="font-semibold">{recoveryState.delivery.previewCode}</span>
          </div>
        ) : null}

        <form onSubmit={handleVerify} className="mt-6">
          <div className="flex justify-center gap-2">
            {Array.from({ length: CODE_LENGTH }).map((_, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                value={code[index]}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className="w-12 h-12 text-xl font-semibold text-center text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
                maxLength={1}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            ))}
          </div>
          <div className="flex items-center justify-between py-2">
            <p className="text-gray-500">Didn&apos;t receive the email?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-sky-400 hover:text-sky-500 focus:outline-none disabled:opacity-60"
            >
              {isResending ? "Resending..." : "Resend"}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="py-3 px-20 w-full mt-8 text-white transition-colors rounded-md bg-[#0A3019] focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 disabled:opacity-60"
          >
            {isSubmitting ? "Verifying..." : "Verify code"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyCode;
