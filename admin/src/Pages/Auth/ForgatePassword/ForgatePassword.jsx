import { Form, Input, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import brandlogo from "../../../assets/image/yard-new.jpeg";
import { authApi } from "../../../lib/api/auth-api";
import {
  clearPasswordRecoveryState,
  setPasswordRecoveryState,
} from "../../../lib/auth-recovery";

const ForgatePassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const result = await authApi.requestPasswordResetCode({
        email: values.email.trim().toLowerCase(),
      });

      clearPasswordRecoveryState();
      setPasswordRecoveryState({
        email: values.email.trim().toLowerCase(),
        delivery: result.delivery || null,
      });

      message.success("If that email exists, a reset code has been sent.");
      navigate("/verify-code");
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Unable to send a reset code right now."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9fafb]">
      <div className="py-10 md:py-12 mx-2 md:mx-0 px-6 md:px-10 rounded-2xl w-[580px] bg-white border-2 border-[#eef6ff] mt-10">
        <div className="flex justify-center">
          <img className="h-20 w-20 rounded-xl object-cover" src={brandlogo} alt="Yard admin logo" />
        </div>
        <h1 className="my-2 font-bold text-2xl text-gray-900">Forgot password</h1>
        <p className="mb-4 text-gray-600">
          Enter your email address to receive a one-time verification code.
        </p>

        <Form name="forgotPassword" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              placeholder="Enter your email"
              className="py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </Form.Item>

          <Form.Item>
            <div className="text-center">
              <button
                type="submit"
                className="bg-[#0A3019] w-full text-white py-3 px-20 rounded-lg"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send code"}
              </button>
            </div>
          </Form.Item>

          <p className="text-center text-gray-600">
            Remember your password?{" "}
            <button
              type="button"
              className="hover:underline"
              onClick={() => navigate("/sign-in")}
            >
              Sign In
            </button>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default ForgatePassword;
