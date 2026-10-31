import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type Course from "@/types/course";

interface Props {
  course: Course;
}

const CourseCard = ({ course: c }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      className="h-full flex flex-col rounded-lg border border-[#C1C8C2] cursor-pointer hover:shadow-lg transition-all delay-0 duration-200"
      onClick={() => navigate(`/academy/courses/${c.slug}`)}
    >
      <header
        className="shrink-0 bg-no-repeat bg-center bg-cover p-6 pt-5 rounded-t-lg h-50"
        style={{ backgroundImage: `url("${c.coverImage}")` }}
      >
        <div className="capitalize text-[#191C1B] bg-white w-max p-1 px-4 rounded-full">
          {t(`course.surface.${c.surface}`)}
        </div>
      </header>
      <div className="flex-1 p-6 flex flex-col justify-between gap-3">
        <div className="flex justify-between items-center">
          <div className="bg-[#1b43321a] capitalize w-max text-xs text-[#012D1D] py-1 px-2 rounded-xs">
            {t(`course.level.${c.level}`)}
          </div>
          <div className="text-[#F48C24] font-bold text-sm flex items-center gap-1">
            <Star size={18} fill="#F48C24" />
            {c.rating}
          </div>
        </div>
        <div>
          <h3 className="text-[#191C1B] text-base line-clamp-2">{c.title}</h3>
          <p className="text-[#414844] text-sm line-clamp-2">
            {c.shortDescription}
          </p>
        </div>
        <div className="mt-auto">
          <div className="bg-[#c1c8c280] h-px w-full my-5"></div>
          <p
            className={`capitalize ${c.pricing.amount ? "text-[#191C1B]" : "text-[#1F6D1A]"}`}
          >
            {c.pricing.amount || t("course.free")}{" "}
            {c.pricing.amount ? c.pricing.currency : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
