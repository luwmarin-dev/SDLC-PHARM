import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import Button from "./button";
import { X } from "lucide-react";
import type User from "../../types/user";

export type ModalVariant =
  "edit_profile" | "add_credentials" | "delete_account" | "share_profile";

interface Props {
  variant: ModalVariant | null;
  user: User;
  onClose: () => void;
}

type Translate = (key: string) => string;

const buildEditProfileSchema = (t: Translate) =>
  z
    .object({
      email: z.string().email(t("modal.errors.email")),
      displayName: z.string().min(6, t("modal.errors.displayName")),
      password: z
        .string()
        .min(8, t("modal.errors.password"))
        .optional()
        .or(z.literal("")),
      confirmPassword: z.string().optional().or(z.literal("")),
      region: z.object({
        oblast: z.string().min(1, t("modal.errors.requiredField")),
        raion: z.string().optional(),
        village: z.string().optional(),
      }),
    })
    .refine(
      (data) => !data.password || data.password === data.confirmPassword,
      {
        message: t("modal.errors.passwordMismatch"),
        path: ["confirmPassword"],
      },
    );

const buildAddCredentialsSchema = (t: Translate) =>
  z.object({
    title: z.string().min(4, t("modal.errors.title")),
    date: z.string().date(t("modal.errors.date")),
    url: z.string().url(t("modal.errors.url")),
  });

type EditProfileData = z.infer<ReturnType<typeof buildEditProfileSchema>>;
type AddCredentialsData = z.infer<ReturnType<typeof buildAddCredentialsSchema>>;

const inputClass = (hasError: boolean) =>
  `p-3 py-2 outline-none border mt-1 bg-white ${hasError ? "border-red-500" : "border-[#6B7280]"}`;

const EditProfileForm = ({ user }: { user: User }) => {
  const { t } = useTranslation();
  const schema = useMemo(() => buildEditProfileSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user.email,
      displayName: user.displayName,
      region: {
        oblast: user.region?.oblast ?? "",
        raion: user.region?.raion,
        village: user.region?.village,
      },
    },
  });

  const onSubmit: SubmitHandler<EditProfileData> = async (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col">
        <label htmlFor="email" className="text-[#414844]">
          {t("modal.email")}
        </label>
        <input
          id="email"
          type="text"
          {...register("email")}
          className={inputClass(!!errors.email)}
        />
        {errors.email && (
          <span className="mt-1 text-red-500 text-sm">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="displayName" className="text-[#414844]">
          {t("modal.displayName")}
        </label>
        <input
          id="displayName"
          type="text"
          {...register("displayName")}
          className={inputClass(!!errors.displayName)}
        />
        {errors.displayName && (
          <span className="mt-1 text-red-500 text-sm">
            {errors.displayName.message}
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="password" className="text-[#414844]">
          {t("modal.password")}
        </label>
        <input
          id="password"
          type="password"
          {...register("password")}
          className={inputClass(!!errors.password)}
        />
        {errors.password && (
          <span className="mt-1 text-red-500 text-sm">
            {errors.password.message}
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="confirmPassword" className="text-[#414844]">
          {t("modal.confirmPassword")}
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          className={inputClass(!!errors.confirmPassword)}
        />
        {errors.confirmPassword && (
          <span className="mt-1 text-red-500 text-sm">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="oblast" className="text-[#414844]">
          {t("modal.oblast")}
        </label>
        <input
          id="oblast"
          type="text"
          {...register("region.oblast")}
          className={inputClass(!!errors.region?.oblast)}
        />
        {errors.region?.oblast && (
          <span className="mt-1 text-red-500 text-sm">
            {errors.region.oblast.message}
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="raion" className="text-[#414844]">
          {t("modal.raion")}
        </label>
        <input
          id="raion"
          type="text"
          {...register("region.raion")}
          className={inputClass(false)}
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="village" className="text-[#414844]">
          {t("modal.village")}
        </label>
        <input
          id="village"
          type="text"
          {...register("region.village")}
          className={inputClass(false)}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 p-2 bg-[#1F6D1A] text-white disabled:opacity-60"
      >
        {isSubmitting ? t("common.saving") : t("modal.saveChanges")}
      </Button>
    </form>
  );
};

const AddCredentialsForm = () => {
  const { t } = useTranslation();
  const schema = useMemo(() => buildAddCredentialsSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddCredentialsData>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<AddCredentialsData> = async (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col">
        <label htmlFor="title" className="text-[#414844]">
          {t("modal.title")}
        </label>
        <input
          id="title"
          type="text"
          {...register("title")}
          className={inputClass(!!errors.title)}
        />
        {errors.title && (
          <span className="mt-1 text-red-500 text-sm">
            {errors.title.message}
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="date" className="text-[#414844]">
          {t("modal.date")}
        </label>
        <input
          id="date"
          type="date"
          {...register("date")}
          className={inputClass(!!errors.date)}
        />
        {errors.date && (
          <span className="mt-1 text-red-500 text-sm">
            {errors.date.message}
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <label htmlFor="url" className="text-[#414844]">
          {t("modal.url")}
        </label>
        <input
          id="url"
          type="url"
          {...register("url")}
          className={inputClass(!!errors.url)}
        />
        {errors.url && (
          <span className="mt-1 text-red-500 text-sm">
            {errors.url.message}
          </span>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 p-2 bg-[#1F6D1A] text-white disabled:opacity-60"
      >
        {isSubmitting ? t("modal.adding") : t("modal.addCredential")}
      </Button>
    </form>
  );
};

const ShareProfile = () => {
  const { t } = useTranslation();
  return <div>{t("modal.share")}</div>;
};

const DeleteAccount = () => <div></div>;

const VARIANT_REGISTRY: Record<
  ModalVariant,
  { titleKey: string; component: React.ComponentType<{ user: User }> }
> = {
  edit_profile: {
    titleKey: "modal.editProfile",
    component: EditProfileForm,
  },
  add_credentials: {
    titleKey: "modal.addCredentials",
    component: AddCredentialsForm,
  },
  share_profile: {
    titleKey: "modal.shareProfile",
    component: ShareProfile,
  },
  delete_account: {
    titleKey: "modal.deleteAccount",
    component: DeleteAccount,
  },
};

const Modal = ({ onClose, variant, user }: Props) => {
  const { t } = useTranslation();

  if (!variant) return null;

  const currentConfig = VARIANT_REGISTRY[variant];
  const ActiveComponent = currentConfig.component;

  return (
    <div className="fixed w-full h-full bg-black/50 top-0 left-0 z-999 flex items-center justify-center">
      <div className="bg-white p-6 min-w-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t(currentConfig.titleKey)}</h2>
          <X
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 cursor-pointer"
          />
        </div>
        <ActiveComponent user={user} />
      </div>
    </div>
  );
};

export default Modal;
