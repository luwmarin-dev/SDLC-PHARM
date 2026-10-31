import CATEGORIES, {
  CATEGORY_KEYS,
  type Category as CategoryType,
} from "@/types/category";
import { useTranslation } from "react-i18next";

interface Props {
  category: CategoryType | "";
  setCategory: (category: CategoryType) => void;
  error?: string;
}

const Category = ({ category, setCategory, error }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <h3 className="text-[#012D1D] text-sm font-semibold mt-8">
        {t("category.label")}
      </h3>
      <select
        name=""
        id=""
        value={category}
        onChange={(e) => setCategory(e.target.value as CategoryType)}
        className={`p-4 py-3 outline-none border-2 mt-2 bg-white text-[#191C1B] rounded-xs ${
          error ? "border-red-500" : "border-[#717973]"
        }`}
      >
        <option value="" disabled>
          {t("category.select")}
        </option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {t(CATEGORY_KEYS[c])}
          </option>
        ))}
      </select>
      {error && <span className="mt-2 text-red-500 text-sm">{error}</span>}
    </div>
  );
};

export default Category;
