import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import useScrollToTop from "../hooks/useScrollToTop";

export default function Layout() {
  useScrollToTop();

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
