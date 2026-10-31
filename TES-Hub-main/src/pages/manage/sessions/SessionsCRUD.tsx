import Button from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmDialog";
import usePermissions from "@/lib/hooks/usePermissions";
import { useAuthStore } from "@/store/authStore";
import {
  createSession,
  deleteSession,
  updateSession,
} from "@/lib/service/sessionsApi";
import useSession from "@/lib/service/useSession";
import {
  MATERIAL_KIND_KEYS,
  SESSION_FORMAT_KEYS,
  SESSION_TYPE_KEYS,
  slugify,
} from "@/lib/utils/session";
import type Session from "@/types/session";
import {
  MATERIAL_KINDS,
  SESSION_FORMATS,
  SESSION_TYPES,
  type AgendaItem,
  type MaterialKind,
  type SessionFormat,
  type SessionMaterial,
  type SessionType,
} from "@/types/session";
import type { EntityStatus } from "@/types/status";
import { Plus, SendHorizonal, Trash2, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import z from "zod";

type Translate = (key: string) => string;

const buildSessionSchema = (t: Translate) =>
  z
    .object({
      title: z.string().min(1, t("manage.sessionForm.errors.titleRequired")),
      slug: z.string().min(1, t("manage.sessionForm.errors.slugRequired")),
      description: z
        .string()
        .min(1, t("manage.sessionForm.errors.descriptionRequired")),
      sessionType: z.enum(SESSION_TYPES),
      format: z.enum(SESSION_FORMATS),
      location: z.string().optional(),
      venueAddress: z.string().optional(),
      meetingUrl: z.string().optional(),
      startsAt: z.string().min(1, t("manage.sessionForm.errors.startRequired")),
      endsAt: z.string().min(1, t("manage.sessionForm.errors.endRequired")),
      registrationClosesAt: z.string().optional(),
      capacity: z
        .number({ error: t("manage.sessionForm.errors.capacityNumber") })
        .int()
        .min(1, t("manage.sessionForm.errors.capacityMin")),
      priceModel: z.enum(["free", "one_time", "subscription_only"]),
      amount: z.number().optional(),
      currency: z.enum(["KGS", "USD", "RUB"]),
      language: z.enum(["ru", "ky", "en"]),
      visibility: z.enum(["public", "unlisted", "private", "hidden"]),
      oblast: z.string().optional(),
      raion: z.string().optional(),
      coverImage: z.string().optional(),
    })
    .refine((v) => new Date(v.endsAt) > new Date(v.startsAt), {
      message: t("manage.sessionForm.errors.endAfterStart"),
      path: ["endsAt"],
    })
    .refine((v) => v.format === "online" || Boolean(v.location?.trim()), {
      message: t("manage.sessionForm.errors.locationRequired"),
      path: ["location"],
    })
    .refine((v) => v.format === "onsite" || Boolean(v.meetingUrl?.trim()), {
      message: t("manage.sessionForm.errors.meetingUrlRequired"),
      path: ["meetingUrl"],
    })
    .refine((v) => v.priceModel === "free" || (v.amount ?? 0) > 0, {
      message: t("manage.sessionForm.errors.amountAboveZero"),
      path: ["amount"],
    });

type SessionSchemaType = ReturnType<typeof buildSessionSchema>;
type FormState = z.input<SessionSchemaType>;

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  description: "",
  sessionType: "webinar",
  format: "online",
  location: "",
  venueAddress: "",
  meetingUrl: "",
  startsAt: "",
  endsAt: "",
  registrationClosesAt: "",
  capacity: 30,
  priceModel: "free",
  amount: undefined,
  currency: "KGS",
  language: "ru",
  visibility: "public",
  oblast: "",
  raion: "",
  coverImage: "",
};

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

const toISO = (local: string) => (local ? new Date(local).toISOString() : "");

const Field = ({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <label className={`block ${className}`}>
    <span className="text-[#191C1B] text-sm font-semibold">{label}</span>
    <div className="mt-2">{children}</div>
    {error && <span className="mt-1 text-red-500 text-xs block">{error}</span>}
  </label>
);

const inputClass =
  "w-full border border-[#C1C8C2] rounded-md px-3 h-11 text-sm outline-none bg-white focus:border-[#012D1D]";

const Card = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="border border-[#C1C8C2] rounded-xl bg-white p-6">
    <h2 className="text-[#012D1D] text-xl font-semibold">{title}</h2>
    {description && (
      <p className="text-[#414844] text-sm mt-1">{description}</p>
    )}
    <div className="mt-5">{children}</div>
  </section>
);

const SessionsCRUD = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const isNew = slug === "new";
  const navigate = useNavigate();
  const { role, can } = usePermissions();
  const { user } = useAuthStore();

  const { session, isLoading } = useSession(isNew ? "" : (slug ?? ""));

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [materials, setMaterials] = useState<SessionMaterial[]>([]);
  const [topicTags, setTopicTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (isNew || !session) return;
    setForm({
      title: session.title,
      slug: session.slug,
      description: session.description,
      sessionType: session.sessionType,
      format: session.format,
      location: session.location ?? "",
      venueAddress: session.venueAddress ?? "",
      meetingUrl: session.meetingUrl ?? "",
      startsAt: toLocalInput(session.startsAt),
      endsAt: toLocalInput(session.endsAt),
      registrationClosesAt: toLocalInput(session.registrationClosesAt),
      capacity: session.capacity,
      priceModel: session.pricing.model,
      amount: session.pricing.amount,
      currency: session.pricing.currency,
      language: session.language,
      visibility: session.visibility,
      oblast: session.region?.oblast ?? "",
      raion: session.region?.raion ?? "",
      coverImage: session.coverImage ?? "",
    });
    setAgenda(session.agenda ?? []);
    setMaterials(session.materials ?? []);
    setTopicTags(session.topicTags ?? []);
  }, [session, isNew]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildPayload(
    data: z.output<SessionSchemaType>,
    status: EntityStatus,
  ): Partial<Session> {
    return {
      title: data.title,
      slug: data.slug,
      description: data.description,
      sessionType: data.sessionType,
      format: data.format,
      location: data.location || undefined,
      venueAddress: data.venueAddress || undefined,
      meetingUrl: data.meetingUrl || undefined,
      startsAt: toISO(data.startsAt),
      endsAt: toISO(data.endsAt),
      registrationClosesAt: data.registrationClosesAt
        ? toISO(data.registrationClosesAt)
        : undefined,
      capacity: data.capacity,
      language: data.language,
      visibility: data.visibility,
      coverImage: data.coverImage || undefined,
      region: data.oblast
        ? { oblast: data.oblast, raion: data.raion || undefined }
        : undefined,
      topicTags,
      agenda,
      materials,
      pricing: {
        model: data.priceModel,
        amount: data.priceModel === "free" ? undefined : data.amount,
        currency: data.currency,
        hasDiscount: false,
        isRefundable: data.priceModel !== "free",
      },
      status,
      hostId: session?.hostId ?? user?.id ?? "user-tes-admin-1",
      authorId: session?.authorId ?? user?.id ?? "user-tes-admin-1",
    };
  }

  async function submit(status: EntityStatus) {
    const parsed = buildSessionSchema(t).safeParse({
      ...form,
      capacity: Number(form.capacity),
      amount: form.amount === undefined ? undefined : Number(form.amount),
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      setBanner(t("manage.sessionForm.fixFields"));
      return;
    }

    setErrors({});
    setBanner(null);
    setSaving(true);
    try {
      const payload = buildPayload(parsed.data, status);
      if (isNew) {
        await createSession(payload);
      } else {
        await updateSession(slug!, payload);
      }
      navigate("/manage/sessions");
    } catch (e) {
      setBanner(
        e instanceof Error ? e.message : t("manage.sessionForm.saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (isNew || !slug) return;
    setConfirmingDelete(false);
    try {
      await deleteSession(slug);
      navigate("/manage/sessions");
    } catch (e) {
      setBanner(
        e instanceof Error ? e.message : t("manage.sessionForm.deleteFailed"),
      );
    }
  }

  const addAgendaItem = () =>
    setAgenda((a) => [
      ...a,
      {
        id: `ag-${Date.now()}`,
        startsAt: "09:00",
        endsAt: "10:00",
        title: "",
        description: "",
      },
    ]);

  const patchAgendaItem = (id: string, patch: Partial<AgendaItem>) =>
    setAgenda((a) => a.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const addMaterial = () =>
    setMaterials((m) => [
      ...m,
      {
        id: `mat-${Date.now()}`,
        name: "",
        kind: "pdf" as MaterialKind,
        size: "",
        locked: true,
      },
    ]);

  const patchMaterial = (id: string, patch: Partial<SessionMaterial>) =>
    setMaterials((m) => m.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const addTag = () => {
    const value = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!value || topicTags.includes(value)) return;
    setTopicTags((t) => [...t, value]);
    setTagInput("");
  };

  const needsLocation = form.format !== "online";
  const needsMeetingUrl = form.format !== "onsite";

  if (!isNew && isLoading) {
    return (
      <div className="container mx-auto px-10 py-20 text-[#414844]">
        {t("manage.sessionForm.loading")}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-5 pb-16">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <nav className="text-sm text-[#6B7280]">
            <span
              className="cursor-pointer hover:underline"
              onClick={() => navigate("/manage/sessions")}
            >
              {t("manage.sessions.title")}
            </span>
            <span className="mx-1">/</span>
            <span className="text-[#012D1D] font-semibold">
              {isNew
                ? t("manage.sessionForm.breadcrumbNew")
                : t("manage.sessionForm.breadcrumbEdit")}
            </span>
          </nav>
          <h1 className="text-4xl lg:text-5xl text-[#012D1D] font-bold mt-2">
            {isNew
              ? t("manage.sessionForm.titleNew")
              : t("manage.sessionForm.titleEdit", {
                  title: form.title || slug,
                })}
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          {!isNew && can("deleteOwnContent") && (
            <Button
              variant="outline"
              className="rounded-md! px-5! py-2! border-[#DC2626]! text-[#DC2626]! gap-2"
              onClick={() => setConfirmingDelete(true)}
              disabled={saving}
            >
              <Trash2 size={18} />
              {t("common.delete")}
            </Button>
          )}
          <Button
            variant="outline"
            className="rounded-md! px-5! py-2!"
            onClick={() => submit("draft")}
            disabled={saving}
          >
            {t("manage.sessionForm.saveDraft")}
          </Button>
          {can("publishDirectly") ? (
            <Button
              className="rounded-md! px-5! py-2!"
              onClick={() => submit("published")}
              disabled={saving}
            >
              {t("manage.sessionForm.publish")}
            </Button>
          ) : (
            can("submitForReview") && (
              <Button
                className="rounded-md! px-5! py-2! gap-2"
                onClick={() => submit("pending_review")}
                disabled={saving}
              >
                <SendHorizonal size={18} />
                {t("manage.sessionForm.submitForReview")}
              </Button>
            )
          )}
        </div>
      </header>

      {banner && (
        <div className="flex gap-3 border-l-4 p-4 border-[#BA1A1A] bg-[#FFDAD6] rounded-lg mt-6">
          <TriangleAlert color="#93000A" size={20} />
          <p className="text-sm text-[#93000A]">{banner}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card
            title={t("manage.sessionForm.detailsTitle")}
            description={t("manage.sessionForm.detailsDescription")}
          >
            <div className="flex flex-col gap-5">
              <Field label={t("manage.sessionForm.title")} error={errors.title}>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => {
                    set("title", e.target.value);
                    if (isNew) set("slug", slugify(e.target.value));
                  }}
                  placeholder={t("manage.sessionForm.titlePlaceholder")}
                />
              </Field>

              <Field label={t("manage.sessionForm.slug")} error={errors.slug}>
                <input
                  className={inputClass}
                  value={form.slug}
                  onChange={(e) => set("slug", slugify(e.target.value))}
                  placeholder={t("manage.sessionForm.slugPlaceholder")}
                />
              </Field>

              <Field
                label={t("manage.sessionForm.description")}
                error={errors.description}
              >
                <textarea
                  className={`${inputClass} h-32 py-3 resize-y`}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder={t("manage.sessionForm.descriptionPlaceholder")}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  label={t("manage.sessionForm.sessionType")}
                  error={errors.sessionType}
                >
                  <select
                    className={inputClass}
                    value={form.sessionType}
                    onChange={(e) =>
                      set("sessionType", e.target.value as SessionType)
                    }
                  >
                    {SESSION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {t(SESSION_TYPE_KEYS[type])}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label={t("manage.sessionForm.format")}
                  error={errors.format}
                >
                  <select
                    className={inputClass}
                    value={form.format}
                    onChange={(e) =>
                      set("format", e.target.value as SessionFormat)
                    }
                  >
                    {SESSION_FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {t(SESSION_FORMAT_KEYS[f])}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {needsLocation && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field
                    label={t("manage.sessionForm.location")}
                    error={errors.location}
                  >
                    <input
                      className={inputClass}
                      value={form.location}
                      onChange={(e) => set("location", e.target.value)}
                      placeholder={t("manage.sessionForm.locationPlaceholder")}
                    />
                  </Field>
                  <Field
                    label={t("manage.sessionForm.venueAddress")}
                    error={errors.venueAddress}
                  >
                    <input
                      className={inputClass}
                      value={form.venueAddress}
                      onChange={(e) => set("venueAddress", e.target.value)}
                      placeholder={t(
                        "manage.sessionForm.venueAddressPlaceholder",
                      )}
                    />
                  </Field>
                </div>
              )}

              {needsMeetingUrl && (
                <Field
                  label={t("manage.sessionForm.meetingUrl")}
                  error={errors.meetingUrl}
                >
                  <input
                    className={inputClass}
                    value={form.meetingUrl}
                    onChange={(e) => set("meetingUrl", e.target.value)}
                    placeholder={t("manage.sessionForm.meetingUrlPlaceholder")}
                  />
                </Field>
              )}

              <Field
                label={t("manage.sessionForm.coverImage")}
                error={errors.coverImage}
              >
                <input
                  className={inputClass}
                  value={form.coverImage}
                  onChange={(e) => set("coverImage", e.target.value)}
                  placeholder={t("manage.sessionForm.coverImagePlaceholder")}
                />
              </Field>
            </div>
          </Card>

          <Card
            title={t("manage.sessionForm.agendaTitle")}
            description={t("manage.sessionForm.agendaDescription")}
          >
            <div className="flex flex-col gap-4">
              {agenda.map((item) => (
                <div
                  key={item.id}
                  className="border border-[#E5E7EB] rounded-lg p-4 bg-[#F9FAFB]"
                >
                  <div className="flex flex-wrap gap-3 items-end">
                    <label className="flex flex-col">
                      <span className="text-xs text-[#6B7280]">
                        {t("manage.sessionForm.start")}
                      </span>
                      <input
                        type="time"
                        className={`${inputClass} w-32`}
                        value={item.startsAt}
                        onChange={(e) =>
                          patchAgendaItem(item.id, { startsAt: e.target.value })
                        }
                      />
                    </label>
                    <label className="flex flex-col">
                      <span className="text-xs text-[#6B7280]">
                        {t("manage.sessionForm.end")}
                      </span>
                      <input
                        type="time"
                        className={`${inputClass} w-32`}
                        value={item.endsAt}
                        onChange={(e) =>
                          patchAgendaItem(item.id, { endsAt: e.target.value })
                        }
                      />
                    </label>
                    <label className="flex flex-col flex-1 min-w-50">
                      <span className="text-xs text-[#6B7280]">
                        {t("manage.sessionForm.agendaItemTitle")}
                      </span>
                      <input
                        className={inputClass}
                        value={item.title}
                        onChange={(e) =>
                          patchAgendaItem(item.id, { title: e.target.value })
                        }
                        placeholder={t(
                          "manage.sessionForm.agendaItemPlaceholder",
                        )}
                      />
                    </label>
                    <button
                      type="button"
                      aria-label={t("manage.sessionForm.removeAgendaItem")}
                      className="p-2 rounded-md text-[#DC2626] hover:bg-[#FEE2E2] cursor-pointer"
                      onClick={() =>
                        setAgenda((a) => a.filter((i) => i.id !== item.id))
                      }
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <input
                    className={`${inputClass} mt-3`}
                    value={item.description ?? ""}
                    onChange={(e) =>
                      patchAgendaItem(item.id, { description: e.target.value })
                    }
                    placeholder={t(
                      "manage.sessionForm.agendaDescriptionPlaceholder",
                    )}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addAgendaItem}
                className="flex items-center justify-center gap-2 border-2 border-dashed border-[#C1C8C2] rounded-lg py-3 text-sm text-[#414844] hover:border-[#012D1D] hover:text-[#012D1D] cursor-pointer"
              >
                <Plus size={18} />
                {t("manage.sessionForm.addAgendaBlock")}
              </button>
            </div>
          </Card>

          <Card
            title={t("manage.sessionForm.materialsTitle")}
            description={t("manage.sessionForm.materialsDescription")}
          >
            <div className="flex flex-col gap-4">
              {materials.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap gap-3 items-end border border-[#E5E7EB] rounded-lg p-4 bg-[#F9FAFB]"
                >
                  <label className="flex flex-col flex-1 min-w-50">
                    <span className="text-xs text-[#6B7280]">
                      {t("manage.sessionForm.materialName")}
                    </span>
                    <input
                      className={inputClass}
                      value={m.name}
                      onChange={(e) =>
                        patchMaterial(m.id, { name: e.target.value })
                      }
                      placeholder={t(
                        "manage.sessionForm.materialNamePlaceholder",
                      )}
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-xs text-[#6B7280]">
                      {t("manage.sessionForm.materialKind")}
                    </span>
                    <select
                      className={`${inputClass} w-32`}
                      value={m.kind}
                      onChange={(e) =>
                        patchMaterial(m.id, {
                          kind: e.target.value as MaterialKind,
                        })
                      }
                    >
                      {MATERIAL_KINDS.map((k) => (
                        <option key={k} value={k}>
                          {t(MATERIAL_KIND_KEYS[k])}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col">
                    <span className="text-xs text-[#6B7280]">
                      {t("manage.sessionForm.materialSize")}
                    </span>
                    <input
                      className={`${inputClass} w-28`}
                      value={m.size ?? ""}
                      onChange={(e) =>
                        patchMaterial(m.id, { size: e.target.value })
                      }
                      placeholder={t(
                        "manage.sessionForm.materialSizePlaceholder",
                      )}
                    />
                  </label>
                  <label className="flex items-center gap-2 h-11 text-sm text-[#414844]">
                    <input
                      type="checkbox"
                      checked={m.locked}
                      onChange={(e) =>
                        patchMaterial(m.id, { locked: e.target.checked })
                      }
                    />
                    {t("manage.sessionForm.locked")}
                  </label>
                  <button
                    type="button"
                    aria-label={t("manage.sessionForm.removeMaterial")}
                    className="p-2 rounded-md text-[#DC2626] hover:bg-[#FEE2E2] cursor-pointer"
                    onClick={() =>
                      setMaterials((list) => list.filter((i) => i.id !== m.id))
                    }
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addMaterial}
                className="flex items-center justify-center gap-2 border-2 border-dashed border-[#C1C8C2] rounded-lg py-3 text-sm text-[#414844] hover:border-[#012D1D] hover:text-[#012D1D] cursor-pointer"
              >
                <Plus size={18} />
                {t("manage.sessionForm.addMaterial")}
              </button>
            </div>
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          <Card title={t("manage.sessionForm.whenTitle")}>
            <div className="flex flex-col gap-5">
              <Field
                label={t("manage.sessionForm.startsAt")}
                error={errors.startsAt}
              >
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={form.startsAt}
                  onChange={(e) => set("startsAt", e.target.value)}
                />
              </Field>
              <Field
                label={t("manage.sessionForm.endsAt")}
                error={errors.endsAt}
              >
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={form.endsAt}
                  onChange={(e) => set("endsAt", e.target.value)}
                />
              </Field>
              <Field
                label={t("manage.sessionForm.registrationCloses")}
                error={errors.registrationClosesAt}
              >
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={form.registrationClosesAt}
                  onChange={(e) => set("registrationClosesAt", e.target.value)}
                />
              </Field>
            </div>
          </Card>

          <Card title={t("manage.sessionForm.capacityTitle")}>
            <div className="flex flex-col gap-5">
              <Field
                label={t("manage.sessionForm.capacity")}
                error={errors.capacity}
              >
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={form.capacity}
                  onChange={(e) => set("capacity", Number(e.target.value))}
                />
              </Field>
              <Field
                label={t("manage.sessionForm.priceModel")}
                error={errors.priceModel}
              >
                <select
                  className={inputClass}
                  value={form.priceModel}
                  onChange={(e) =>
                    set("priceModel", e.target.value as FormState["priceModel"])
                  }
                >
                  <option value="free">
                    {t("manage.sessionForm.priceFree")}
                  </option>
                  <option value="one_time">
                    {t("manage.sessionForm.priceOneTime")}
                  </option>
                  <option value="subscription_only">
                    {t("manage.sessionForm.priceSubscription")}
                  </option>
                </select>
              </Field>
              {form.priceModel !== "free" && (
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label={t("manage.sessionForm.amount")}
                    error={errors.amount}
                  >
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      value={form.amount ?? ""}
                      onChange={(e) =>
                        set(
                          "amount",
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                        )
                      }
                    />
                  </Field>
                  <Field
                    label={t("manage.sessionForm.currency")}
                    error={errors.currency}
                  >
                    <select
                      className={inputClass}
                      value={form.currency}
                      onChange={(e) =>
                        set("currency", e.target.value as FormState["currency"])
                      }
                    >
                      <option value="KGS">KGS</option>
                      <option value="USD">USD</option>
                      <option value="RUB">RUB</option>
                    </select>
                  </Field>
                </div>
              )}
            </div>
          </Card>

          <Card title={t("manage.sessionForm.audienceTitle")}>
            <div className="flex flex-col gap-5">
              <Field
                label={t("manage.sessionForm.language")}
                error={errors.language}
              >
                <select
                  className={inputClass}
                  value={form.language}
                  onChange={(e) =>
                    set("language", e.target.value as FormState["language"])
                  }
                >
                  <option value="ru">{t("auth.language.ru")}</option>
                  <option value="ky">{t("auth.language.ky")}</option>
                  <option value="en">{t("auth.language.en")}</option>
                </select>
              </Field>
              <Field
                label={t("manage.sessionForm.visibility")}
                error={errors.visibility}
              >
                <select
                  className={inputClass}
                  value={form.visibility}
                  onChange={(e) =>
                    set("visibility", e.target.value as FormState["visibility"])
                  }
                >
                  <option value="public">
                    {t("manage.sessionForm.visibilityPublic")}
                  </option>
                  <option value="unlisted">
                    {t("manage.sessionForm.visibilityUnlisted")}
                  </option>
                  <option value="private">
                    {t("manage.sessionForm.visibilityPrivate")}
                  </option>
                  <option value="hidden">
                    {t("manage.sessionForm.visibilityHidden")}
                  </option>
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label={t("manage.sessionForm.oblast")}
                  error={errors.oblast}
                >
                  <input
                    className={inputClass}
                    value={form.oblast}
                    onChange={(e) => set("oblast", e.target.value)}
                    placeholder={t("manage.sessionForm.oblastPlaceholder")}
                  />
                </Field>
                <Field
                  label={t("manage.sessionForm.raion")}
                  error={errors.raion}
                >
                  <input
                    className={inputClass}
                    value={form.raion}
                    onChange={(e) => set("raion", e.target.value)}
                    placeholder={t("manage.sessionForm.raionPlaceholder")}
                  />
                </Field>
              </div>

              <div>
                <span className="text-[#191C1B] text-sm font-semibold">
                  {t("manage.sessionForm.topicTags")}
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {topicTags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#A4F792] text-[#267320] flex gap-1 items-center rounded-xs px-2 py-1 text-xs"
                    >
                      {tag}
                      <button
                        type="button"
                        aria-label={t("manage.sessionForm.removeTag", { tag })}
                        className="cursor-pointer"
                        onClick={() =>
                          setTopicTags((list) => list.filter((x) => x !== tag))
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  className={`${inputClass} mt-2`}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder={t("manage.sessionForm.tagPlaceholder")}
                />
              </div>
            </div>
          </Card>

          {role === "guest" && (
            <p className="text-sm text-[#93000A]">
              {t("manage.sessionForm.guestNotice")}
            </p>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title={t("manage.sessionForm.deleteTitle")}
        message={t("manage.sessionForm.deleteMessage", {
          title: form.title || slug,
        })}
        confirmLabel={t("manage.sessionForm.deleteTitle")}
        cancelLabel={t("manage.sessionForm.keepIt")}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
};

export default SessionsCRUD;
