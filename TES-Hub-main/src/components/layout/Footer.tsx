import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface FooterLink {
  key: string;
  url: string;
}

interface FooterSection {
  key: string;
  links: FooterLink[];
}

interface Props {
  className?: string;
  sections?: FooterSection[];
  copyright?: string;
}

const DEFAULT_SECTIONS: FooterSection[] = [
  {
    key: "academy",
    links: [
      { key: "articles", url: "/academy/articles" },
      { key: "courses", url: "/academy/courses" },
    ],
  },
  {
    key: "community",
    links: [
      { key: "stories", url: "/community/stories" },
      { key: "questions", url: "/community/questions" },
      { key: "photos", url: "/community/photos" },
    ],
  },
  {
    key: "support",
    links: [
      { key: "about", url: "/about" },
      { key: "contact", url: "/contact" },
      { key: "terms", url: "/terms-of-service" },
      { key: "privacy", url: "/privacy-policy" },
    ],
  },
];

const MAX_SECTIONS = 3;

const Footer = ({
  className = "",
  sections = DEFAULT_SECTIONS,
  copyright = "Made with ❤️ by David",
}: Props) => {
  const { t } = useTranslation();
  const visibleSections = sections.slice(0, MAX_SECTIONS);

  return (
    <footer
      className={`border-t border-b bg-[#ECEEEC] py-5 pt-10 ${className}`}
    >
      <div className="container mx-auto px-5">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          <div className="col-span-2 mb-8 lg:mb-0">
            <div className="flex items-center lg:justify-start">
              <Link to={"/"} className="text-2xl font-bold text-[#012D1D]">
                TES Hub
              </Link>
            </div>

            <p className="mt-4 text-sm font-medium text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>

          {visibleSections.map((section) => (
            <div key={section.key}>
              <h3 className="mb-4 text-sm font-semibold tracking-tight">
                {t(`footer.${section.key}`)}
              </h3>
              <ul className="space-y-4 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.key} className="font-medium hover:text-primary">
                    <Link to={link.url}>{t(`footer.${link.key}`)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col justify-between gap-4 pt-8 text-xs font-medium text-muted-foreground md:flex-row md:items-center">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
