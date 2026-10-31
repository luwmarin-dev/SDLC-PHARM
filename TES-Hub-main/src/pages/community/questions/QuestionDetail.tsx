import { useUser } from "@/lib/hooks/useUser";
import useQuestion from "@/lib/service/useQuestion";
import { formatCount, formatTag, regionLabel } from "@/lib/utils/community";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  Eye,
  HelpCircle,
  MapPin,
} from "lucide-react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import Avatar from "../components/Avatar";
import Discussion from "../components/Discussion";
import PostActions from "../components/PostActions";

const QuestionDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();

  const { question, error, isLoading } = useQuestion(slug ?? "");
  const { user: author } = useUser(question?.authorId ?? "");

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-10 py-5 pt-12 animate-pulse">
        <div className="bg-[#c1c8c280] h-4 w-48 rounded-xs" />
        <div className="bg-[#c1c8c280] h-10 w-3/4 rounded-xs my-6" />
        <div className="bg-[#c1c8c280] h-5 w-full rounded-xs" />
        <div className="bg-[#c1c8c280] h-40 w-full rounded-lg mt-8" />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="container mx-auto px-4 sm:px-10 py-5 pt-12">
        <h1 className="text-[#191C1B] text-3xl font-semibold">
          {t("community.question.notFound")}
        </h1>
        <p className="text-[#414844] mt-2">
          {error ?? t("community.question.notFoundText")}
        </p>
        <button
          type="button"
          onClick={() => navigate("/community/questions")}
          className="border border-[#717973] mt-6 text-[#191C1B] py-2 px-5 text-sm rounded-xs cursor-pointer hover:shadow"
        >
          {t("community.question.backToQuestions")}
        </button>
      </div>
    );
  }

  const isVerified =
    author?.role === "verified_farmer" || author?.role === "spac_consultant";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-20">
      <Link
        to="/community/questions"
        className="inline-flex items-center gap-1 text-[#414844] text-sm hover:text-[#012D1D]"
      >
        <ChevronLeft size={16} /> {t("community.question.questions")}
      </Link>

      <div className="flex flex-col lg:flex-row gap-8 mt-4">
        <article className="w-full lg:w-[70%] border border-[#C1C8C2] bg-white rounded-xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {question.isSolved ? (
              <span className="flex items-center gap-1 text-[#267320] bg-[#E7F6E4] font-semibold py-1 px-2 rounded-full">
                <CheckCircle2 size={13} /> {t("community.question.solved")}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#1E3A8A] bg-[#DBEAFE] font-semibold py-1 px-2 rounded-full">
                <HelpCircle size={13} /> {t("community.question.open")}
              </span>
            )}
            <span className="text-[#414844]">
              {t("community.question.asked", {
                time: moment(
                  question.publishedAt ?? question.createdAt,
                ).fromNow(),
              })}
            </span>
            {question.region?.oblast && (
              <span className="flex items-center gap-1 text-[#414844] ml-auto">
                <MapPin size={13} /> {regionLabel(question.region)}
              </span>
            )}
          </div>

          <h1 className="text-[#012D1D] text-3xl sm:text-4xl font-bold mt-5">
            {question.title}
          </h1>

          <p className="text-[#414844] text-base leading-relaxed mt-5">
            {question.body}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
            <Link
              to={
                author?.username
                  ? `/community/author/${author.username}`
                  : `/profile/${question.authorId}`
              }
              className="flex items-center gap-3 group"
            >
              <Avatar
                name={author?.displayName}
                src={author?.avatar}
                size={40}
              />
              <span>
                <span className="flex items-center gap-1 text-[#191C1B] font-semibold text-sm group-hover:underline">
                  {author?.displayName ?? t("community.post.communityMember")}
                  {isVerified && (
                    <BadgeCheck size={15} className="text-[#1F6D1A]" />
                  )}
                </span>
                <span className="block text-[#414844] text-xs">
                  {t("community.question.askedOn", {
                    date: moment(question.createdAt).format("LL"),
                  })}
                </span>
              </span>
            </Link>

            <span className="flex items-center gap-1 text-[#414844] text-sm">
              <Eye size={16} />{" "}
              {t("community.question.views", {
                count: formatCount(question.stats.views),
              })}
            </span>
          </div>

          <div className="flex gap-2 flex-wrap mt-6">
            {question.topicTags.map((tag) => (
              <Link
                key={tag}
                to={`/community/topics/${tag}`}
                className="text-[#191C1B] bg-[#F2F4F2] hover:bg-[#E4E9E4] text-xs py-1 px-3 rounded-full"
              >
                {formatTag(tag)}
              </Link>
            ))}
          </div>

          <PostActions
            post={question}
            className="border-t border-[#E1E3E1] mt-6 pt-4"
            onCommentClick={() =>
              document
                .getElementById("answers")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          />
        </article>

        <aside className="w-full lg:w-[30%]" id="answers">
          <Discussion
            contentId={question.id}
            title={t("community.discussion.answers")}
            variant="answers"
            className="lg:sticky lg:top-28"
          />
        </aside>
      </div>
    </div>
  );
};

export default QuestionDetail;
