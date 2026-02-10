import { Outlet } from "react-router-dom";

import Header from "../components/layout/user/Header";
import Footer from "../components/layout/user/Footer";

function UserLayout() {
  return (
    <div className="flex flex-col min-h-dvh">
      <Header />

      <main className="flex-1 2xl:max-w-global 2xl:mx-auto">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default UserLayout;
