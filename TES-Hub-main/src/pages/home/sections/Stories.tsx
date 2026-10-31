import CardSkeleton from "@/components/ui/cardSkeleton";
import StoryCard from "@/components/ui/storyCard";
import useStories from "@/lib/hooks/useStories";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Stories = () => {
  const { published, error, isLoading } = useStories();
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="bg-[#F2F4F2]">
      <div className="container mx-auto px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-15">
        <header>
          <h3 className="text-[#191C1B]">{t("home.stories.title")}</h3>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[#414844]">{t("home.stories.subtitle")}</p>
            <p
              className="text-[#012D1D] flex gap-1 items-center cursor-pointer"
              onClick={() => navigate("/community/stories")}
            >
              {t("home.stories.joinDiscussion")} <ArrowRight size={18} />
            </p>
          </div>
        </header>

        {error ? (
          <p className="text-[#C1292E] mt-10">
            {t("home.stories.error", { error })}
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10 lg:mt-10">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))
              : published
                  ?.slice(0, 3)
                  .map((s) => <StoryCard key={s.id} story={s} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;
