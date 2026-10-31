import { ImagePlus } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  coverImage: File | null;
  setCoverImage: (file: File | null) => void;
  existingUrl?: string;
  error?: string;
}

const CoverImage = ({
  coverImage,
  setCoverImage,
  existingUrl,
  error,
}: Props) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mt-8">
      <h3 className="text-[#191C1B] text-sm font-semibold">
        {t("ui.coverImage")}
      </h3>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
      />
      <div
        onClick={() => inputRef.current?.click()}
        className={`bg-white border-dashed border-4 rounded-lg flex flex-col items-center justify-center p-7 mt-2 hover:border-solid hover:shadow-lg transition-all cursor-pointer ${
          error ? "border-red-500" : "border-[#C1C8C2]"
        }`}
      >
        {!coverImage && existingUrl ? (
          <img
            src={existingUrl}
            alt={t("ui.currentCover")}
            className="w-full max-h-40 object-cover rounded-md"
          />
        ) : (
          <div className="bg-[#1B4332] w-max p-4 rounded-xl">
            <ImagePlus size={30} color="#86AF99" />
          </div>
        )}
        <h3 className="text-[#012D1D] text-sm font-semibold mt-3">
          {coverImage
            ? coverImage.name
            : existingUrl
              ? t("ui.clickToReplace")
              : t("ui.clickToUpload")}
        </h3>
        <p className="text-[#414844] text-xs mt-1">{t("ui.imageHint")}</p>
      </div>
      {error && (
        <span className="mt-2 text-red-500 text-sm block">{error}</span>
      )}
    </div>
  );
};

export default CoverImage;
