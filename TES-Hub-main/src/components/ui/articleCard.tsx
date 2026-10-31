import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type Article from "@/types/article";
import { CATEGORY_KEYS } from "@/types/category";

interface Props {
  article: Article;
}

const ArticleCard = ({ article: a }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      className="h-full flex flex-col rounded-lg border border-[#C1C8C2] cursor-pointer hover:shadow-lg transition-all delay-0 duration-200"
      onClick={() => navigate(`/academy/articles/${a.slug}`)}
    >
      <header
        className="shrink-0 bg-no-repeat bg-center bg-cover p-6 pt-5 rounded-t-lg h-50"
        style={{ backgroundImage: `url("${a.coverImage}")` }}
      >
        <div className="capitalize text-[#191C1B] bg-white w-max p-1 px-4 rounded-full">
          {t(`course.surface.${a.surface}`)}
        </div>
      </header>
      <div className="flex-1 p-6 flex flex-col justify-between gap-3">
        <div className="flex justify-between items-center">
          <div className="bg-[#1b43321a] capitalize w-max text-xs text-[#012D1D] py-1 px-2 rounded-xs">
            {t(CATEGORY_KEYS[a.category])}
          </div>
          <div className="text-[#414844] text-sm flex items-center gap-1">
            <Clock size={16} />
            {t("course.minRead", { count: a.readTimeMinutes })}
          </div>
        </div>
        <div>
          <h3 className="text-[#191C1B] text-base line-clamp-2">{a.title}</h3>
          <p className="text-[#414844] text-sm line-clamp-2">{a.excerpt}</p>
        </div>
        <div className="mt-auto">
          <div className="bg-[#c1c8c280] h-px w-full my-5"></div>
          <p
            className={`capitalize ${a.pricing.amount ? "text-[#191C1B]" : "text-[#1F6D1A]"}`}
          >
            {a.pricing.amount || t("course.free")}{" "}
            {a.pricing.amount ? a.pricing.currency : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
