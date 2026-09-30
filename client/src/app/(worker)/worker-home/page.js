import Link from "next/link";
import React from "react";
import HowitWorks from "@/app/component/HowitWorks";
import Banner from "@/app/component/Banner";

const page = () => {
  return (
    <div className="min-h-screen font-sans text-gray-900">
      {/* --- Hero Section --- */}
      <section
        style={{
          background: "linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 70.71%)",
        }}
        className="px-6 py-12 md:py-20"
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-emerald-950 pr-16">
              Earn Fast Money With Local Yard Jobs{" "}
            </h1>
            <p className="text-emerald-700 text-lg mb-8 pr-10 max-w-md">
              Flexible work. Get paid after every completed job. Start earning
              today with jobs in your neighborhood.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/registration">
                <button className="bg-[#0A3019] text-white px-8 py-3 rounded-md font-semibold flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors">
                  Apply Now
                </button>
              </Link>
              <Link href="/work-process">
                <button className="bg-white border border-emerald-900 text-emerald-900 px-8 py-3 rounded-md font-semibold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors">
                  How It Works
                </button>
              </Link>
            </div>
          </div>

          <div className="relative h-100 md:h-125 rounded-2xl overflow-hidden ">
            <img
              src="./worker.png"
              alt="Professional lawn mowing"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
      <HowitWorks />
      <Banner />
    </div>
  );
};

export default page;
