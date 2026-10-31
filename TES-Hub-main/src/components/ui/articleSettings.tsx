import Tags, { type Tag } from "./tags";
import Category from "./category";
import CoverImage from "./coverImage";
import type { Category as CategoryType } from "@/types/category";
import Title from "./title";
import { useTranslation } from "react-i18next";

interface Props {
  title: string;
  setTitle: (title: string) => void;
  titleError?: string;
  className?: string;
  coverImage: File | null;
  setCoverImage: (file: File | null) => void;
  existingCover?: string;
  coverImageError?: string;
  category: CategoryType | "";
  setCategory: (category: CategoryType) => void;
  categoryError?: string;
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}

const ArticleSettings = ({
  title,
  setTitle,
  titleError,
  className,
  coverImage,
  setCoverImage,
  existingCover,
  coverImageError,
  category,
  setCategory,
  categoryError,
  tags,
  setTags,
}: Props) => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <header className="p-6 border border-[#C1C8C2]">
        <h3 className="text-[#191C1B] text-sm font-semibold">
          {t("ui.articleSettings")}
        </h3>
        <p className="text-[#414844] text-xs mt-1">
          {t("ui.articleSettingsHint")}
        </p>
      </header>
      <div className="p-6 border border-[#c1c8c2]">
        <Title
          value={title}
          setValue={setTitle}
          label={t("ui.titleLabel")}
          placeholder={t("ui.titlePlaceholder")}
          error={titleError}
        />

        <CoverImage
          coverImage={coverImage}
          setCoverImage={setCoverImage}
          existingUrl={existingCover}
          error={coverImageError}
        />

        <Category
          category={category}
          setCategory={setCategory}
          error={categoryError}
        />

        <Tags tags={tags} setTags={setTags} />
      </div>
    </div>
  );
};

export default ArticleSettings;
