import { Link } from "react-router-dom";
import React from 'react';

export default function Footer() {
  return (
<footer
  className="w-full relative bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('../../../shared-assets/pompompurin/background/vm2.jpeg')" }}
>
  <div className="relative max-w-7xl mx-auto px-8 py-5 flex flex-col md:flex-row items-center justify-between text-[#8B5A3C] gap-4">
  
    <Link to="/privacy-policy">
      <div className="bubble">
        <p>Privacy Policies</p>
      </div>
    </Link>

    <Link to="/CGU">
      <div className="bubble">
        <p>CGU</p>
      </div>
    </Link>

    <Link to="/terms-of-service">
      <div className="bubble">
        <p>Terms of Service</p>
      </div>
    </Link>
  </div>
</footer>
  );
}
