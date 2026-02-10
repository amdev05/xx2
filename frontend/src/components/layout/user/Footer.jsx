import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-footer mt-16 md:mt-20 py-5">
      <div className="my-container space-y-4">
        <p className="text-[10px]">Copyright © 2025 XX2. All rights reserved</p>
        <div className="text-[10px] space-x-2.5">
          <Link to={"/"}>Tentang Kami</Link>
          <span>|</span>
          <Link to={"/"}>Syarat Penggunaan</Link>
          <span>|</span>
          <Link to={"/"}>Kebijakan Privasi</Link>
          <span>|</span>
          <Link to={"/"}>Hubungi Kami</Link>
        </div>
      </div>
    </footer>
  );
}
