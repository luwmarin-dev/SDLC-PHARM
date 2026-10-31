import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/button";
import axiosInstance from "../../lib/api/apiClient";
import { useAuthStore } from "../../store/authStore";
import type User from "../../types/user";
import AuthShell from "./components/AuthShell";
import { messageOf } from "@/lib/utils/errors";

interface LocationState {
  flow: "signup" | "forgot";
  email: string;
}

const CODE_LENGTH = 6;

const VerifyEmail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const setAuth = useAuthStore((s) => s.setAuth);

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    const next = [...code];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setCode(next);
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < CODE_LENGTH) {
      setError(t("auth.verify.incomplete"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (state?.flow === "signup") {
        const res = await axiosInstance.post<{ token: string; user: User }>(
          "/auth/verify-email",
          { email: state.email, code: fullCode },
        );
        setAuth(res.data.token, res.data.user);
        navigate("/auth/onboarding");
      } else {
        await axiosInstance.post("/auth/verify-reset-code", {
          email: state?.email,
          code: fullCode,
        });
        navigate("/auth/reset-password", {
          state: { email: state?.email, code: fullCode },
        });
      }
    } catch (err) {
      setError(messageOf(err, t("auth.verify.invalid")));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const endpoint =
        state?.flow === "signup"
          ? "/auth/resend-verification"
          : "/auth/forgot-password";
      await axiosInstance.post(endpoint, { email: state?.email });
      setResendCooldown(60);
    } catch (err) {
      setError(messageOf(err, t("auth.verify.resendFailed")));
    }
  };

  const isForgot = state?.flow === "forgot";

  return (
    <AuthShell>
      <h2 className="text-[#012D1D] font-bold text-4xl">
        {isForgot ? t("auth.verify.titleForgot") : t("auth.verify.titleSignup")}
      </h2>
      <p className="text-[#414844] text-base mt-3">
        {t("auth.verify.subtitlePrefix")}{" "}
        <span className="font-semibold text-[#012D1D]">
          {state?.email || t("auth.verify.yourEmail")}
        </span>
        {t("auth.verify.subtitleSuffix")}
      </p>

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="flex gap-3 justify-between">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className={`w-12 h-14 text-center text-2xl font-bold border outline-none bg-white text-[#012D1D] transition-colors ${
                digit ? "border-[#012D1D]" : "border-[#6B7280]"
              } focus:border-[#012D1D]`}
            />
          ))}
        </div>

        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

        <Button
          type="submit"
          className="w-full mt-6"
          variant="filled"
          disabled={loading}
        >
          {loading ? t("auth.verify.verifying") : t("auth.verify.submit")}
        </Button>
      </form>

      <p className="text-center mt-5 text-[#414844] text-sm">
        {t("auth.verify.notReceived")}{" "}
        <span
          className={`font-semibold ${
            resendCooldown > 0
              ? "text-[#6B7280] cursor-not-allowed"
              : "text-[#1F6D1A] cursor-pointer"
          }`}
          onClick={handleResend}
        >
          {resendCooldown > 0
            ? t("auth.verify.resendIn", { seconds: resendCooldown })
            : t("auth.verify.resend")}
        </span>
      </p>
    </AuthShell>
  );
};

export default VerifyEmail;
