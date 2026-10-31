import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import ScrollToTop from "./ScrollToTop";

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAF8] relative">
      <ScrollToTop />
      <Header />
      <main className="flex-1 pt-22">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
