import { FaArrowRight, FaPlus, FaUser } from "react-icons/fa";

const PlatformFeeSection = () => {
  return (
    <section className="bg-[#f0fdf4] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto text-center px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
          How Platform Fees Work
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Complete transparency. No surprises.
        </p>

        <div className="mt-8 flex justify-center">
          <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 w-full max-w-5xl">

            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                {
                  title: "Hero Receives",
                  percent: "88%",
                  desc: "Of your payment goes directly to the Hero",
                },
                {
                  title: "Platform Fee",
                  percent: "12%",
                  desc: "Used to operate and support the platform",
                },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-500 text-white flex items-center justify-center text-xl">
                    <FaUser />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-lg sm:text-xl font-semibold">
                      {item.title}
                    </span>
                    <p className="text-3xl sm:text-4xl font-bold">
                      {item.percent}
                    </p>
                    <p className="text-sm text-gray-600 max-w-xs mx-auto">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Example Breakdown */}
            <div className="mt-8 bg-[#f9fafb] max-w-4xl mx-auto rounded-2xl border-2 border-[#e5e7eb] p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-6">
                Example Breakdown
              </h2>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
                <div>
                  <p className="text-[#4B5563] text-sm sm:text-base">
                    Job Price
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold">$100</p>
                </div>

                <FaArrowRight className="hidden sm:block" size={24} />

                <div>
                  <p className="text-[#4B5563] text-sm sm:text-base">
                    Hero Gets
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold">$88</p>
                </div>

                <FaPlus className="hidden sm:block text-gray-400" />

                <div>
                  <p className="text-[#4B5563] text-sm sm:text-base">
                    Platform Fee
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold">$12</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformFeeSection;
