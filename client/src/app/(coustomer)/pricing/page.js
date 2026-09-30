"use client";
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ServicePricing from "@/app/component/ServicePricing";
import Banner from "@/app/component/Banner";

const PricingPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      question: "Is there a minimum charge per project?",
      answer:
        "Yes. Many services use a minimum price, and the final quote is the higher of that minimum or the calculator result based on square footage. Mulching uses cubic-yard logic with a 5.2-yard minimum.",
    },
    {
      question: "What will I actually be billed for payment?",
      answer:
        "Yard Hero shows the final fixed or calculated service price before checkout. Your payment method is secured up front, then funds are released only after the completed job is verified.",
    },
    {
      question: "What if I'm not satisfied with my work?",
      answer:
        "Every completed job requires a verification photo and verification video from the Hero. If the work is not done right, Yard Hero will fix it or refund it under the Yard Hero Guarantee.",
    },
    {
      question: "Do I have to pay separately from a subscription?",
      answer:
        "No, if you're on a monthly or annual plan, your tasks are included. You only pay separately if you exceed your plan's task limit.",
    },
    {
      question: "How can I communicate with the project?",
      answer:
        "You can communicate directly with your Hero through our app, via phone, or through our customer support team.",
    },
    {
      question: "Do Heroes bring their own tools and supplies?",
      answer:
        "Yes, all Heroes come equipped with professional-grade tools and supplies needed for the job. Any special materials will be discussed beforehand.",
    },
  ];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen">
      {/* Pricing Plans Section */}
      <div>
        <div
          className=" mx-auto px-4 py-16 text-center"
          style={{
            background: "linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 70.71%)",
          }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple & Transparent Pricing
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Pay only for what you need, with no hidden fees.
          </p>

        </div>

        {/*===================================================== Pricing Cards =====================================================*/}
        <ServicePricing />

        {/*================================ FAQ Section ================================*/}
        <div className="max-w-4xl py-20 mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 ">
            Pricing Questions
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Find answers to common questions about our pricing.
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-left">
                    {faq.question}
                  </span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600 shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* ================================Banner================================ */}
        <Banner/>
      </div>
    </div>
  );
};
export default PricingPage;
