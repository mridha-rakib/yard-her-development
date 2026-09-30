import Link from "next/link";
import React from "react";
import {
  FaCalendarCheck,
  FaDollarSign,
  FaClock,
  FaStar,
} from "react-icons/fa";
import { MdLocalPolice } from "react-icons/md";
import Banner from "./component/Banner";
import InstantPriceCalculator from "./component/InstantPriceCalculator";
import { Leaf, Scissors, Sparkles, Trees } from "lucide-react";

const page = () => {
  return (
    <div className="min-h-screen font-sans text-gray-900">
      <section className="bg-emerald-50/50 px-6 py-12 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div className="max-w-2xl">
            <h1 className="max-w-2xl text-2xl font-bold leading-[1.16] text-emerald-950 md:text-4xl md:leading-[1.12]">
              <span className="mb-2 block text-[#15803D]">Same Day Service.</span>
              Book trusted yard work in seconds.
            </h1>
            <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-gray-700 md:text-base">
              Instantly schedule yard work at upfront prices. Verified local workers. Photo
              proof of completion.
            </p>
            <div className="mb-8 mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/book">
                <button className="flex items-center justify-center gap-2 rounded-md bg-[#0A3019] px-8 py-3 font-semibold text-white transition-colors hover:bg-emerald-800">
                  <FaCalendarCheck color="#fff" />
                  Book Yard Work
                </button>
              </Link>
              <Link href="/worker-home">
                <button className="flex items-center justify-center gap-2 rounded-md border border-emerald-900 bg-white px-8 py-3 font-semibold text-emerald-900 transition-colors hover:bg-emerald-50">
                  Become a Hero
                </button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-sm font-medium text-emerald-800">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#22C55E] p-1 text-emerald-800">
                  <MdLocalPolice color="#fff" />
                </span>
                Verification Before Payout
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <span className="rounded-full bg-[#22C55E] p-1 text-emerald-800">
                  <FaStar color="#fff" />
                </span>
                Fixed, Transparent Pricing
              </div>
            </div>
          </div>

          <div className="relative h-100 overflow-hidden rounded-2xl shadow-xl md:h-125">
            <img
              src="./heroimg.png"
              alt="Professional lawn mowing"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-emerald-950">
            Why Choose Yard Hero?
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-gray-600">
            Clear pricing, trusted proof, and local professionals who can start building their portfolio immediately.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<FaClock className="text-white" size={20} />}
              title="Get Assigned a local Hero"
              description="Book today and get assigned a local professional to get your yard work done"
            />
            <FeatureCard
              icon={<MdLocalPolice className="text-white" size={20} />}
              title="Trusted Heroes"
              description="Professional landscapers that take on more bookings!"
            />
            <FeatureCard
              icon={<FaDollarSign className="text-white" size={20} />}
              title="Fair Pricing"
              description="Automatic pricing uses fixed rules, square footage, or mulch-yard logic with no negotiation."
            />
          </div>
        </div>
      </section>

      <section className="bg-emerald-50/30 px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-emerald-950">
            Popular Services
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-gray-600">
            Professional outdoor service categories supported by the Yard Hero pricing engine.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ServiceCard
              icon={<Scissors className="text-[#22C55E]" size={20} />}
              title="Lawn Mowing"
              description="Minimum plus square-foot pricing that scales fairly."
            />
            <ServiceCard
              icon={<Leaf className="text-[#22C55E]" size={20} />}
              title="Leaf Cleanup"
              description="Transparent cleanup pricing for small and large yards."
            />
            <ServiceCard
              icon={<Trees className="text-[#22C55E]" size={20} />}
              title="Bush Trimming"
              description="Flat-rate service for clean, fast booking."
            />
            <ServiceCard
              icon={<Sparkles className="text-[#22C55E]" size={20} />}
              title="Mulching"
              description="Calculated by cubic yards with a 5-yard minimum."
            />
          </div>
        </div>
      </section>

      <InstantPriceCalculator />

      <Banner />
    </div>
  );
};

export default page;

const FeatureCard = ({ icon, title, description }) => (
  <div className="flex flex-col items-center rounded-xl border border-emerald-100/50 bg-emerald-50/50 p-10">
    <div className="mb-6 rounded-full bg-emerald-900 p-4">{icon}</div>
    <h3 className="mb-3 text-xl font-bold text-emerald-950">{title}</h3>
    <p className="leading-relaxed text-gray-600">{description}</p>
  </div>
);

const ServiceCard = ({ icon, title, description }) => (
  <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
    <div className="mb-4 rounded-md bg-emerald-900 p-3">{icon}</div>
    <h3 className="mb-2 font-bold text-emerald-950">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </div>
);
