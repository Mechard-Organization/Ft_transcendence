import { cgvContent } from "../content/cgv";
import { User } from "lucide-react";




export default function CGU() {

  return (
    <div>
    <main id="mainContent">
      <div className="min-h-[calc(100vh-8rem)] max-w-2xl w-full  mx-auto text-center">
              <br/><br/>
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl overflow-y-auto p-7 h-175 shadow-xl hover:shadow-2xl sm:flex-row border-4 border-[#FEE96E] cursor-pointer">
          <div className="flex items-center justify-center">

            <div className="w-12 h-12 rounded-full bg-[#FEE96E] flex items-center justify-center">
              <User className="w-6 h-6 text-[#8B5A3C]" />
            </div>
          </div>
          <h1 className="flex items-center justify-center rounded-full">CGU</h1>
          <div className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
          {cgvContent}
          </div>
            </div>
        </div>
    </main>
    </div>
  );
}
