import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Browsers restore the previous scroll offset on SPA navigation, so every new
// route would otherwise open half-way down the page.
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
