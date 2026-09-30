import React from "react";
import { CheckCircle, Shield, DollarSign, Users, Wrench, ArrowRight, User } from "lucide-react";
import { FaCheckCircle, FaCut, FaEdit, FaUserCheck } from "react-icons/fa";
import { VscWorkspaceTrusted } from "react-icons/vsc";

import { IoLocationSharp } from "react-icons/io5";
import { FaHandshakeSimple } from "react-icons/fa6";
import Banner from "@/app/component/Banner";
import PlatformFeeSection from "@/app/component/PlatformFeeSection";
import WhatsIncludedSection from "@/app/component/WhatsIncludedSection";
import SecurePaymentSection from "@/app/component/SecurePaymentSection";
import Link from "next/link";


const page = () => {
  const steps = [
    {
      icon: <FaEdit className="w-6 h-6" />,
      title: "Request a yard task through the platform.",
      description:
        "Fill out a short form describing your yard work needs. Add photos if helpful and choose your preferred date.",
    },
    {
      icon: <FaUserCheck className="w-6 h-6" />,
      title: "Get matched with an available, qualified local Hero.",
      description:
        "We quickly match you with a qualified, nearby Hero who can handle your specific yard work needs.",
    },
    {
      icon: <FaCheckCircle className="w-6 h-6" />,
      title: "The job is completed, reviewed, and finalized after quality approval.",
      description:
        "Your Hero arrives on time, completes the task professionally, and you pay after the job is finished.",
    },
  ];

  const features = [
    {
      icon: <VscWorkspaceTrusted className="w-5 h-5" />,
      title: "Trusted & Safe",
      description:
        "All Heroes are background checked and vetted for your peace of mind.",
    },
    {
       
      icon: <FaHandshakeSimple className="w-5 h-5" />,
      title: "No Long Contracts",
      description:
        "Book one job at a time. No commitments or subscription required.",
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: "Simple Pricing",
      description:
        "Clear, upfront pricing with no hidden fees or surprise charges.",
    },
    {
      icon: <IoLocationSharp className="w-5 h-5" />,
      title: "Local Heroes",
      description: "Connect with experienced Heroes in your neighborhood.",
    },
  ];

  const Heroes = [
    {
      name: "Lawn Mowing",
      price: "August: $60",
      icon: <FaCut className="w-8 h-8" />,
    },
    {
      name: "Mike",
      rating: 5,
      reviews: "15 jobs • 8 months",
      image: true,
    },
    {
      name: "Job Complete",
      price: "Paid: $60",
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
    },
  ];

  return (
    <div className="min-h-screen mx-auto bg-white">
      {/*=============================== Hero Section ===============================*/}
      <div
        className=" mx-auto px-4 py-16 text-center"
        style={{
          background: "linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 70.71%)",
        }}
      >
        <h1 className="text-5xl font-bold text-gray-900 mb-4">How It Works</h1>
        <p className="text-gray-600 text-lg mb-8">
          Get your work done in 3 simple steps
        </p>
       <Link href="/book"> 
          <button className="bg-[#0A3019] text-white px-8 py-3 rounded-lg hover:bg-[#093a1d] transition-colors font-medium">
          Book Right Now
        </button>
       </Link>
      </div>

    
        {/*=============================== Steps Section ===============================*/}
        <div className=" max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-14 h-14 bg-[#0A3019] rounded-full flex items-center justify-center text-white mb-3">
                    {step.icon}
                  </div>
                  <div className="w-10 h-10 bg-[#0A3019] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/*=============================== Why Choose Section ===============================*/}
        <div className="bg-[#F9FAFB]  px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Why Choose YardCare?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 bg-[#0A3019] rounded-full flex items-center justify-center text-white shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*=============================== Visual Process Section ===============================*/}
        <div className="px-4 py-16">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            See How It Works
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center w-full md:w-64 border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Lawn Mowing</h3>
              <p className="text-gray-600 font-medium">August: $60</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:block">
              <ArrowRight className="w-8 h-8 text-gray-400" />
            </div>
            <div className="md:hidden">
              <ArrowRight className="w-8 h-8 text-gray-400 rotate-90" />
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center w-full md:w-64 border border-gray-100">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Mike</h3>
              <p className="text-sm text-gray-600 mb-2">15 jobs • 8 months</p>
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:block">
              <ArrowRight className="w-8 h-8 text-gray-400" />
            </div>
            <div className="md:hidden">
              <ArrowRight className="w-8 h-8 text-gray-400 rotate-90" />
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center w-full md:w-64 border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Job Complete</h3>
              <p className="text-gray-600 font-medium">Paid: $60</p>
            </div>
          </div>
        </div>

        {/*=============================== How Platform Fees Work=============================== */}
         <PlatformFeeSection/>
         <WhatsIncludedSection/>
         <SecurePaymentSection/>

        <Banner/>
     
    </div>
  );
};

export default page;
