import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import z from "zod";
import Editor from "../../../components/ui/editor";
import ArticleSettings from "@/components/ui/articleSettings";
import Button from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";
import axiosInstance from "@/lib/api/apiClient";
import useAuth from "@/lib/hooks/useAuth";
import usePermissions from "@/lib/hooks/usePermissions";
import useArticle from "@/lib/service/useArticle";
import type { Tag } from "@/components/ui/tags";
import type Article from "@/types/article";
import type { EntityStatus } from "@/types/status";
import CATEGORIES, { type Category } from "@/types/category";

type Translate = (key: string) => string;

const buildArticleSchema = (t: Translate) =>
  z.object({
    body: z.string().min(1, t("manage.articles.errors.bodyRequired")),
    title: z.string().min(1, t("manage.articles.errors.titleRequired")),
    category: z.enum(CATEGORIES, {
      error: t("manage.articles.errors.categoryRequired"),
    }),
    coverImage: z.union([z.instanceof(File), z.string().min(1)], {
      error: t("manage.articles.errors.coverRequired"),
    }),
  });

const buildDraftSchema = (t: Translate) =>
  z.object({
    title: z.string().min(1, t("manage.articles.errors.titleRequired")),
  });

type Intent = "draft" | "publish" | "review";

const STATUS_BY_INTENT: Record<Intent, EntityStatus> = {
  draft: "draft",
  publish: "published",
  review: "pending_review",
};

interface FormProps {
  article: Article | null;
}

const ArticleForm = ({ article }: FormProps) => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const auth = useAuth();
  const navigate = useNavigate();

  const [body, setBody] = useState(article?.body ?? "");
  const [title, setTitle] = useState<string | "">(article?.title ?? "");
  const [category, setCategory] = useState<Category | "">(
    article?.category ?? "",
  );
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [tags, setTags] = useState<Tag[]>(
    (article?.topicTags ?? []).map((t, i) => ({ id: i, title: t })),
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setSaving] = useState(false);

  const existingCover = article?.coverImage ?? "";

  const articleSchema = useMemo(() => buildArticleSchema(t), [t]);
  const draftSchema = useMemo(() => buildDraftSchema(t), [t]);

  const save = async (intent: Intent) => {
    const schema = intent === "draft" ? draftSchema : articleSchema;
    const result = schema.safeParse({
      title,
      body,
      category,
      coverImage: coverImage ?? existingCover,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSaveError(null);
    setSaving(true);

    const payload = {
      title,
      body,
      category,
      status: STATUS_BY_INTENT[intent],
      topicTags: tags.map((t) => t.title),
      coverImage: coverImage ? URL.createObjectURL(coverImage) : existingCover,
      authorId: auth?.id,
    };

    try {
      if (article) {
        await axiosInstance.put(`/articles/${article.slug}`, payload);
      } else {
        await axiosInstance.post("/articles", payload);
      }
      navigate("/manage/articles");
    } catch (err) {
      setSaveError(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? err.message)
          : t("manage.articles.saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  const canPublish = can("publishDirectly");
  const canSubmitForReview = can("submitForReview");

  return (
    <div className="container mx-auto px-10 pt-5 pb-10">
      <div className="flex items-center justify-between">
        {article ? (
          <h2 className="text-5xl text-[#012D1D] font-bold">
            {t("manage.articles.editing", { title: article.title })}
          </h2>
        ) : (
          <h2 className="text-5xl text-[#012D1D] font-bold">
            {t("manage.articles.adding")}
          </h2>
        )}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-none! px-5! py-2!"
            disabled={isSaving}
            onClick={() => save("draft")}
          >
            {t("manage.articles.saveDraft")}
          </Button>
          {canPublish && (
            <Button
              className="rounded-none! px-5! py-2!"
              disabled={isSaving}
              onClick={() => save("publish")}
            >
              {t("manage.articles.publish")}
            </Button>
          )}

          {canSubmitForReview && (
            <Button
              className="rounded-none! px-5! py-2! gap-2"
              Icon={SendHorizonal}
              disabled={isSaving}
              onClick={() => save("review")}
            >
              {t("manage.articles.submitForReview")}
            </Button>
          )}
        </div>
      </div>

      {saveError && <p className="text-red-500 text-sm mt-4">{saveError}</p>}

      <div className="flex mt-5 items-stretch">
        <Editor
          value={body}
          onChange={setBody}
          error={errors.body}
          className="rounded-xl w-[70%]"
        />
        <ArticleSettings
          className="w-[30%] bg-[#f8faf8]"
          title={title}
          setTitle={setTitle}
          titleError={errors.title}
          category={category}
          setCategory={setCategory}
          categoryError={errors.category}
          coverImage={coverImage}
          setCoverImage={setCoverImage}
          existingCover={existingCover}
          coverImageError={errors.coverImage}
          tags={tags}
          setTags={setTags}
        />
      </div>
    </div>
  );
};

const ArticlesCRUD = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const isNew = slug === "new";

  const { article, error, isLoading } = useArticle(isNew ? "" : (slug ?? ""));

  if (!isNew && isLoading)
    return (
      <div className="container mx-auto px-10 pt-5 pb-10">
        <p className="text-[#414844]">{t("manage.articles.loadingArticle")}</p>
      </div>
    );

  if (!isNew && (error || !article))
    return (
      <div className="container mx-auto px-10 pt-5 pb-10">
        <h2 className="text-3xl text-[#012D1D] font-bold">
          {t("manage.articles.notFound")}
        </h2>
        <p className="text-[#414844] mt-2">
          {error ?? t("manage.articles.notFoundText", { slug })}
        </p>
      </div>
    );

  return <ArticleForm key={slug} article={isNew ? null : article} />;
};

export default ArticlesCRUD;
