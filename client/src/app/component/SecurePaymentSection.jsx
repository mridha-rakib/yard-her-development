import { FaLock } from "react-icons/fa";

const SecurePaymentSection = () => {
  return (
    <section className="bg-gray-50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto text-center px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
          Secure Payment Options
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Multiple ways to pay, all processed securely after job completion
        </p>

        <div className="mt-8 flex justify-center">
          <div className="bg-white shadow-lg rounded-lg p-6 sm:p-10 w-full max-w-5xl">
            
            {/* Payment Methods */}
            <div className="mt-4 flex flex-wrap justify-center gap-6 sm:gap-10">
              {[
                { img: "/Credit.png", label: "Credit Card" },
                { img: "/visa.png", label: "Visa Card" },
                { img: "/mastercard.png", label: "MasterCard" },
                { img: "/applepay.png", label: "Apple Pay" },
                { img: "/paypal.png", label: "PayPal" },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="bg-[#E5E7EB] p-5 sm:p-6 rounded-2xl">
                    <img
                      src={item.img}
                      alt={item.label}
                      className="w-10 h-10 sm:w-12 sm:h-12"
                    />
                  </div>
                  <p className="text-sm sm:text-base text-[#374151] font-semibold mt-3">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Secure Info Box */}
            <div className="bg-[#f0fdf4] border-2 border-[#BBF7D0] p-6 sm:p-8 mt-10 rounded-lg">
              <div className="flex justify-center text-emerald-600">
                <FaLock size={32} />
              </div>
              <p className="mt-4 text-sm sm:text-lg text-gray-600 max-w-3xl mx-auto">
                All payments are processed securely through our website after
                the job is completed. Your payment information is encrypted and
                protected with industry-standard security measures.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default SecurePaymentSection;
