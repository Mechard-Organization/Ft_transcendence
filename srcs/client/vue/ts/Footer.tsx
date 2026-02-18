import { Link } from "react-router-dom";
import React from 'react';

export default function Footer() {
  return (
<footer
  className="w-full relative bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('../../../shared-assets/pompompurin/background/vm2.jpeg')" }}
>
  <div className="relative max-w-7xl mx-auto px-8 py-5 flex flex-col md:flex-row items-center justify-between text-[#FEE96E] gap-4">
    
    <Link to="/terms-and-conditions">
      <div className="flex items-center justify-center rounded-full transition-all cursor-pointer">
        <p className="font-poppins font-semibold">CGU</p>
      </div>
    </Link>

    <Link to="/privacy_policy">
      <div className="flex items-center justify-center rounded-full transition-all cursor-pointer">
        <p className="font-poppins font-semibold">Privacy Policies</p>
      </div>
    </Link>

  </div>
</footer>
  );
}
