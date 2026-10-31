import { MapPin, Pencil, Share2, CirclePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import Alert from "../../components/ui/alert";
import Button from "../../components/ui/button";
import PostsPublished from "../../components/ui/postsPublished";
import ProfileBadge from "../../components/ui/profileBadge";
import { useUser } from "../../lib/hooks/useUser";
import SkillsInterest from "../../components/ui/skillsInterest";
import Certificate from "./../../components/ui/certificate";
import Modal, { type ModalVariant } from "@/components/ui/modal";
import { useState } from "react";
import StyledContainer from "../../components/layout/StyledContainer";

const Profile = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user, loading } = useUser(id || "me");
  const [variant, setVariant] = useState<ModalVariant | null>(null);

  // Loading must be checked first: while the request is in flight `user` is
  // still null, and the old order flashed "user not found" on every visit.
  if (loading) return <div className="p-10">{t("common.loading")}</div>;

  if (!user) return <div className="p-10">{t("common.userNotFound")}</div>;

  const closeModal = () => setVariant(null);

  return (
    <StyledContainer className="py-10">
      <div className="mb-5">{user.isBanned && <Alert />}</div>

      <div className="flex flex-col items-center text-center gap-5 md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:text-left md:justify-between">
        <img
          src={user.avatar}
          className="w-28 h-28 md:w-40 md:h-40 rounded-lg border-5 shadow-lg -shadow-lg border-white"
          alt=""
        />
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex flex-wrap justify-center md:justify-start gap-5 items-center">
            <h1 className="text-2xl md:text-3xl text-[#012D1D] font-semibold">
              {user.displayName}
            </h1>
            <ProfileBadge role={user.role} />
          </div>
          <div className="text-[#414844] flex gap-2 items-center">
            <MapPin />
            {user.region?.oblast}
          </div>
          <p className="break-all">{user.bio}</p>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          {id == "me" && (
            <Button
              className="gap-3"
              Icon={Pencil}
              onClick={() => setVariant("edit_profile")}
            >
              {t("profile.editProfile")}
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-3"
            Icon={Share2}
            onClick={() => setVariant("share_profile")}
          >
            {t("profile.shareProfile")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] mt-10 gap-5 content-start">
        <div className="w-full">
          <div className="outline-1 p-5 md:p-8 h-fit py-5 md:py-7 rounded-lg w-full outline-[#E2E8F0] bg-[#FFFFFF]">
            <h1 className="text-xl md:text-2xl font-semibold text-[#012D1D]">
              {id == "me"
                ? t("profile.myActivities")
                : t("profile.userActivities", { name: user.displayName })}
            </h1>
            {user.stats.postsPublished.map((post) => (
              <PostsPublished key={post.id} {...post} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5 pb-10">
          <div className="outline-1 p-5 md:p-8 h-fit py-5 md:py-7 rounded-lg outline-[#E2E8F0] bg-[#FFFFFF]">
            <h1 className="text-xl md:text-2xl mb-5 font-semibold text-[#012D1D]">
              {t("profile.skillsInterests")}
            </h1>
            <div className="flex flex-wrap gap-3">
              {user.interests.map((int, idx) => (
                <SkillsInterest key={idx} children={int} />
              ))}
            </div>
          </div>

          <div className="outline-1 p-5 md:p-8 h-fit py-5 md:py-7 rounded-lg outline-[#E2E8F0] bg-[#FFFFFF]">
            <h1 className="text-xl md:text-2xl flex items-center justify-between mb-5 font-semibold text-[#012D1D]">
              {t("profile.certificates")}
              <span className="text-[#1F6D1A] text-sm">
                {t("profile.earned", {
                  count: user.stats.certificatesEarned.length,
                })}
              </span>
            </h1>
            <div className="flex flex-wrap gap-3">
              {user.stats.certificatesEarned.map((cer) => (
                <Certificate key={cer.id} {...cer} />
              ))}
            </div>
            {id === "me" && (
              <Button
                Icon={CirclePlus}
                variant="outline"
                className="mt-5 gap-3 w-full border-dashed hover:border-solid border-[#717973] hover:border-[#012D1D] transition duration-100 active:scale-90"
                onClick={() => setVariant("add_credentials")}
              >
                {t("profile.addCredentials")}
              </Button>
            )}
          </div>
        </div>
      </div>
      <Modal variant={variant} user={user} onClose={closeModal} />
    </StyledContainer>
  );
};

export default Profile;
