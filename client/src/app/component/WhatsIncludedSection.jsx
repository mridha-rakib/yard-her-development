import { Check } from "lucide-react";
import { IoMdClose } from "react-icons/io";

const WhatsIncludedSection = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto text-center px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
          What’s Included & What’s Not
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Clear expectations for every service
        </p>

        {/* Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Included */}
          <div className="bg-[#f0fdf4] border-2 border-[#bbf7d0] p-6 sm:p-8 rounded-lg shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-[#0A3019] w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full">
                <Check color="#fff" size={20} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-green-600">
                What’s Included
              </h3>
            </div>

            <ul className="mt-4 space-y-3 text-left text-gray-600 text-sm sm:text-base">
              {[
                "Verified local Heroes",
                "Flexible scheduling options",
                "Pay after job completion",
                "Secure payment processing",
                "Customer support team",
                "Satisfaction guarantee",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="bg-[#0A3019] w-4 h-4 flex items-center justify-center rounded-full mt-1">
                    <Check color="#fff" size={12} />
                  </div>
                  <p>{item}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Not Included */}
          <div className="bg-[#fef2f2] border-2 border-[#fecaca] p-6 sm:p-8 rounded-lg shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-[#EF4444] w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full">
                <IoMdClose color="#fff" size={18} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-red-600">
                What’s Not Included
              </h3>
            </div>

            <ul className="mt-4 space-y-3 text-left text-gray-600 text-sm sm:text-base">
              {[
                "Long-term contracts required",
                "Hidden service charges",
                "Upfront payment requirements",
                "Cancellation penalties",
                "Minimum service periods",
                "Additional processing fees",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="bg-[#EF4444] w-4 h-4 flex items-center justify-center rounded-full mt-1">
                    <IoMdClose color="#fff" size={12} />
                  </div>
                  <p>{item}</p>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhatsIncludedSection;
