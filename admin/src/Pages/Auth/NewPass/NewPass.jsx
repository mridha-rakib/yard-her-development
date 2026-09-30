import { Form, Input, Typography, message } from "antd";
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import brandlogo from "../../../assets/image/yard-new.jpeg";
import { authApi } from "../../../lib/api/auth-api";
import {
  clearPasswordRecoveryState,
  getPasswordRecoveryState,
} from "../../../lib/auth-recovery";

const NewPass = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recoveryState, setRecoveryState] = useState(null);

  useEffect(() => {
    const storedState = getPasswordRecoveryState();

    if (!storedState?.email || !storedState?.resetToken) {
      navigate("/forgate-password", { replace: true });
      return;
    }

    setRecoveryState(storedState);
  }, [navigate]);

  const onFinish = async (values) => {
    const { newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    if (String(newPassword || "").length < 8) {
      message.error("Password must be at least 8 characters.");
      return;
    }

    if (!recoveryState?.email || !recoveryState?.resetToken) {
      navigate("/forgate-password", { replace: true });
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPasswordWithToken({
        email: recoveryState.email,
        resetToken: recoveryState.resetToken,
        newPassword,
      });

      clearPasswordRecoveryState();
      message.success("Password changed successfully.");
      navigate("/sign-in", { replace: true });
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Unable to update the password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9fafb]">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center w-full gap-2 mx-auto md:max-w-screen-md">
          <Form
            name="new-password"
            onFinish={onFinish}
            layout="vertical"
            className="w-full max-w-lg px-6 py-10 mt-10 bg-white md:py-20 md:px-10 rounded-2xl"
          >
            <div className="mx-auto">
              <div className="flex justify-center">
                <img src={brandlogo} alt="Yard admin logo" className="my-3 h-20 w-20 rounded-xl object-cover" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-gray-700 md:text-3xl">
                Create new password
              </h2>
              <Typography.Text className="text-base text-gray-600">
                Choose a new password for{" "}
                <span className="font-semibold text-gray-700">
                  {recoveryState?.email || "your account"}
                </span>
                .
              </Typography.Text>
            </div>

            <Form.Item
              name="newPassword"
              label={<p className="text-md">New Password</p>}
              rules={[
                { required: true, message: "Please input your new password!" },
              ]}
            >
              <div className="relative flex items-center">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  className="text-md"
                />
                <div className="absolute right-0 pr-3">
                  <button type="button" onClick={() => setShowPassword((current) => !current)}>
                    {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
                </div>
              </div>
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<p className="text-md">Confirm Password</p>}
              rules={[
                { required: true, message: "Please confirm your password!" },
              ]}
            >
              <div className="relative flex items-center">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="text-md"
                />
                <div className="absolute right-0 pr-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                  >
                    {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
                </div>
              </div>
            </Form.Item>

            <Form.Item className="mt-8 text-center">
              <button
                className="bg-[#0A3019] text-center w-full p-2 font-semibold text-white px-20 py-3 rounded-md"
                type="submit"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default NewPass;
