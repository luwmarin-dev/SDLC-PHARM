import type postsPublished from "./../../types/postsPublished";
import { MessagesSquare, Lightbulb } from "lucide-react";
import moment from "moment";
import { useTranslation } from "react-i18next";

const PostsPublished = ({ date, title, message, type }: postsPublished) => {
  const { t } = useTranslation();

  if (type === "comment") {
    return (
      <div className="border-l-5 mt-5 border-[#1F6D1A] p-2 pl-5 rounded-md flex gap-7.5">
        <MessagesSquare color="#1F6D1A" size={30} />
        <div>
          <h3 className="text-[#012D1D] text-base font-semibold">
            {t("ui.commentedOn", { title })}
          </h3>
          <p className="text-sm text-[#414844] italic mt-1">"{message}"</p>
          <p className="text-[#717973] text-xs mt-2">
            {moment(date).fromNow()}
          </p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="border-l-5 mt-5 border-[#3E1E00] p-2 pl-5 rounded-md flex gap-5">
        <Lightbulb />
        <div>
          <h3 className="text-[#012D1D] text-base font-semibold">
            {t("ui.sharedTip", { title })}
          </h3>
          <p className="text-sm text-[#414844] italic mt-1">"{message}"</p>
          <p className="text-[#717973] text-xs mt-2">
            {moment(date).fromNow()}
          </p>
        </div>
      </div>
    );
  }
};

export default PostsPublished;
