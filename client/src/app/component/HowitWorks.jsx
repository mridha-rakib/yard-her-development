import React from "react";
import {

  MoveRight,
} from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      icon: (
        <svg
          width="38"
          height="30"
          viewBox="0 0 38 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.625 7.5C5.625 5.51088 6.41518 3.60322 7.8217 2.1967C9.22822 0.790176 11.1359 0 13.125 0C15.1141 0 17.0218 0.790176 18.4283 2.1967C19.8348 3.60322 20.625 5.51088 20.625 7.5C20.625 9.48912 19.8348 11.3968 18.4283 12.8033C17.0218 14.2098 15.1141 15 13.125 15C11.1359 15 9.22822 14.2098 7.8217 12.8033C6.41518 11.3968 5.625 9.48912 5.625 7.5ZM0 28.2598C0 22.4883 4.67578 17.8125 10.4473 17.8125H15.8027C21.5742 17.8125 26.25 22.4883 26.25 28.2598C26.25 29.2207 25.4707 30 24.5098 30H1.74023C0.779297 30 0 29.2207 0 28.2598ZM29.5312 18.2812V14.5312H25.7812C25.002 14.5312 24.375 13.9043 24.375 13.125C24.375 12.3457 25.002 11.7188 25.7812 11.7188H29.5312V7.96875C29.5312 7.18945 30.1582 6.5625 30.9375 6.5625C31.7168 6.5625 32.3438 7.18945 32.3438 7.96875V11.7188H36.0938C36.873 11.7188 37.5 12.3457 37.5 13.125C37.5 13.9043 36.873 14.5312 36.0938 14.5312H32.3438V18.2812C32.3438 19.0605 31.7168 19.6875 30.9375 19.6875C30.1582 19.6875 29.5312 19.0605 29.5312 18.2812Z"
            fill="#0A3019"
          />
        </svg>
      ),
      title: "Create Profile",
      description: "Sign up in minutes and share basic job and skills",
    },
    {
      number: 2,
      icon: (
        <svg
          width="27"
          height="30"
          viewBox="0 0 27 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_79_734)">
            <path
              d="M13.1249 0C12.0877 0 11.2499 0.837891 11.2499 1.875V3C6.97251 3.86719 3.74986 7.65234 3.74986 12.1875V13.2891C3.74986 16.043 2.73618 18.7031 0.908058 20.7656L0.474464 21.252C-0.0177231 21.8027 -0.134911 22.5938 0.163917 23.2676C0.462746 23.9414 1.13657 24.375 1.87485 24.375H24.3749C25.1131 24.375 25.7811 23.9414 26.0858 23.2676C26.3905 22.5938 26.2674 21.8027 25.7752 21.252L25.3417 20.7656C23.5135 18.7031 22.4999 16.0488 22.4999 13.2891V12.1875C22.4999 7.65234 19.2772 3.86719 14.9999 3V1.875C14.9999 0.837891 14.162 0 13.1249 0ZM15.7792 28.9043C16.4823 28.2012 16.8749 27.2461 16.8749 26.25H13.1249H9.37485C9.37485 27.2461 9.76743 28.2012 10.4706 28.9043C11.1737 29.6074 12.1288 30 13.1249 30C14.1209 30 15.076 29.6074 15.7792 28.9043Z"
              fill="#0A3019"
            />
          </g>
          <defs>
            <clipPath id="clip0_79_734">
              <path d="M0 0H26.25V30H0V0Z" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
      title: "Get Job Offers",
      description: "Customers post jobs that match your skills and area",
    },
    {
      number: 3,
      icon: (
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_79_747)">
            <path
              d="M15 30C18.9782 30 22.7936 28.4196 25.6066 25.6066C28.4196 22.7936 30 18.9782 30 15C30 11.0218 28.4196 7.20644 25.6066 4.3934C22.7936 1.58035 18.9782 0 15 0C11.0218 0 7.20644 1.58035 4.3934 4.3934C1.58035 7.20644 0 11.0218 0 15C0 18.9782 1.58035 22.7936 4.3934 25.6066C7.20644 28.4196 11.0218 30 15 30ZM21.6211 12.2461L14.1211 19.7461C13.5703 20.2969 12.6797 20.2969 12.1348 19.7461L8.38477 15.9961C7.83398 15.4453 7.83398 14.5547 8.38477 14.0098C8.93555 13.4648 9.82617 13.459 10.3711 14.0098L13.125 16.7637L19.6289 10.2539C20.1797 9.70312 21.0703 9.70312 21.6152 10.2539C22.1602 10.8047 22.166 11.6953 21.6152 12.2402L21.6211 12.2461Z"
              fill="#0A3019"
            />
          </g>
          <defs>
            <clipPath id="clip0_79_747">
              <path d="M0 0H30V30H0V0Z" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
      title: "Complete Work",
      description: "Do the job well and make the customer happy",
    },
    {
      number: 4,
      icon: (
        <svg
          width="34"
          height="30"
          viewBox="0 0 34 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_79_761)">
            <path
              d="M0 6.59193V24.7443C0 25.799 0.591797 26.7951 1.58203 27.1642C6.67969 29.0685 11.7773 27.7677 16.875 26.4669C21.5508 25.2775 26.2266 24.0822 30.8965 25.3595C32.2441 25.7286 33.75 24.8029 33.75 23.4025V5.25599C33.75 4.20131 33.1582 3.20521 32.168 2.83607C27.0703 0.931775 21.9727 2.23256 16.875 3.53334C12.1992 4.72279 7.52344 5.91224 2.85352 4.6349C1.5 4.26576 0 5.19154 0 6.59193ZM16.875 20.6251C14.2852 20.6251 12.1875 18.1056 12.1875 15.0001C12.1875 11.8947 14.2852 9.37513 16.875 9.37513C19.4648 9.37513 21.5625 11.8947 21.5625 15.0001C21.5625 18.1056 19.4648 20.6251 16.875 20.6251ZM3.75 20.6251C5.81836 20.6251 7.5 22.3068 7.5 24.3751H3.75V20.6251ZM7.5 8.43763C7.5 10.506 5.81836 12.1876 3.75 12.1876V8.43763H7.5ZM30 17.8126V21.5626H26.25C26.25 19.4943 27.9316 17.8126 30 17.8126ZM26.25 5.62513H30V9.37513C27.9316 9.37513 26.25 7.69349 26.25 5.62513Z"
              fill="#0A3019"
            />
          </g>
          <defs>
            <clipPath id="clip0_79_761">
              <path d="M0 0H33.75V30H0V0Z" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
      title: "Get Paid",
      description: "Receive payment quickly and get paid today",
    },
  ];

  const benefits = [
    {
      icon: (
        <svg
          width="24"
          height="32"
          viewBox="0 0 24 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M24 32H0V0H24V32Z" stroke="#E5E7EB" />
          <g clip-path="url(#clip0_79_807)">
            <path
              d="M12 3C15.1826 3 18.2348 4.26428 20.4853 6.51472C22.7357 8.76516 24 11.8174 24 15C24 18.1826 22.7357 21.2348 20.4853 23.4853C18.2348 25.7357 15.1826 27 12 27C8.8174 27 5.76516 25.7357 3.51472 23.4853C1.26428 21.2348 0 18.1826 0 15C0 11.8174 1.26428 8.76516 3.51472 6.51472C5.76516 4.26428 8.8174 3 12 3ZM10.875 8.625V15C10.875 15.375 11.0625 15.7266 11.3766 15.9375L15.8766 18.9375C16.3922 19.2844 17.0906 19.1437 17.4375 18.6234C17.7844 18.1031 17.6437 17.4094 17.1234 17.0625L13.125 14.4V8.625C13.125 8.00156 12.6234 7.5 12 7.5C11.3766 7.5 10.875 8.00156 10.875 8.625Z"
              fill="#0A3019"
            />
          </g>
          <defs>
            <clipPath id="clip0_79_807">
              <path d="M0 3H24V27H0V3Z" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
      title: "Work Flexible",
      description: "Work when you want. Choose jobs that fit your availability",
    },
    {
      icon: (
        <svg
          width="18"
          height="24"
          viewBox="0 0 18 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_79_816)">
            <path
              d="M10.1109 23.4C12.5156 20.3906 18 13.0969 18 9C18 4.03125 13.9688 0 9 0C4.03125 0 0 4.03125 0 9C0 13.0969 5.48438 20.3906 7.88906 23.4C8.46562 24.1172 9.53438 24.1172 10.1109 23.4ZM9 6C9.79565 6 10.5587 6.31607 11.1213 6.87868C11.6839 7.44129 12 8.20435 12 9C12 9.79565 11.6839 10.5587 11.1213 11.1213C10.5587 11.6839 9.79565 12 9 12C8.20435 12 7.44129 11.6839 6.87868 11.1213C6.31607 10.5587 6 9.79565 6 9C6 8.20435 6.31607 7.44129 6.87868 6.87868C7.44129 6.31607 8.20435 6 9 6Z"
              fill="#0A3019"
            />
          </g>
          <defs>
            <clipPath id="clip0_79_816">
              <path d="M0 0H18V24H0V0Z" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
      title: "Steady Income",
      description: "Access to a local marketplace with high volume",
    },
    {
      icon: (
        <svg
          width="27"
          height="24"
          viewBox="0 0 27 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_79_824)">
            <path
              d="M3 1.5C1.34531 1.5 0 2.84531 0 4.5V6H27V4.5C27 2.84531 25.6547 1.5 24 1.5H3ZM27 10.5H0V19.5C0 21.1547 1.34531 22.5 3 22.5H24C25.6547 22.5 27 21.1547 27 19.5V10.5ZM5.25 16.5H8.25C8.6625 16.5 9 16.8375 9 17.25C9 17.6625 8.6625 18 8.25 18H5.25C4.8375 18 4.5 17.6625 4.5 17.25C4.5 16.8375 4.8375 16.5 5.25 16.5ZM10.5 17.25C10.5 16.8375 10.8375 16.5 11.25 16.5H17.25C17.6625 16.5 18 16.8375 18 17.25C18 17.6625 17.6625 18 17.25 18H11.25C10.8375 18 10.5 17.6625 10.5 17.25Z"
              fill="#0A3019"
            />
          </g>
          <defs>
            <clipPath id="clip0_79_824">
              <path d="M0 0H27V24H0V0Z" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
      title: "Simple Payment",
      description:
        "No need to chase customers. Payment is sent after job is finished",
    },
    {
      icon: (
        <svg
          width="30"
          height="24"
          viewBox="0 0 30 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M30 24H0V0H30V24Z" stroke="#E5E7EB" />
          <path
            d="M15.1594 3.99375L10.6219 7.66875C9.86719 8.27812 9.72188 9.375 10.2938 10.1578C10.8984 10.9922 12.075 11.1562 12.8859 10.5234L17.5406 6.90469C17.8688 6.65156 18.3375 6.70781 18.5953 7.03594C18.8531 7.36406 18.7922 7.83281 18.4641 8.09062L17.4844 8.85L24 14.85V6H23.9672L23.7844 5.88281L20.3812 3.70312C19.6641 3.24375 18.825 3 17.9719 3C16.95 3 15.9562 3.35156 15.1594 3.99375ZM16.2281 9.825L13.8047 11.7094C12.3281 12.8625 10.1859 12.5625 9.07969 11.0437C8.03906 9.61406 8.30156 7.61719 9.675 6.50625L13.575 3.35156C13.0312 3.12187 12.4453 3.00469 11.85 3.00469C10.9688 3 10.1109 3.2625 9.375 3.75L6 6V16.5H7.32187L11.6063 20.4094C12.525 21.2484 13.9453 21.1828 14.7844 20.2641C15.0422 19.9781 15.2156 19.6453 15.3047 19.2984L16.1016 20.0297C17.0156 20.8687 18.4406 20.8078 19.2797 19.8937C19.4906 19.6641 19.6453 19.3969 19.7438 19.1203C20.6531 19.7297 21.8906 19.6031 22.6547 18.7687C23.4937 17.8547 23.4328 16.4297 22.5187 15.5906L16.2281 9.825ZM0.75 6C0.3375 6 0 6.3375 0 6.75V16.5C0 17.3297 0.670312 18 1.5 18H3C3.82969 18 4.5 17.3297 4.5 16.5V6H0.75ZM2.25 15C2.44891 15 2.63968 15.079 2.78033 15.2197C2.92098 15.3603 3 15.5511 3 15.75C3 15.9489 2.92098 16.1397 2.78033 16.2803C2.63968 16.421 2.44891 16.5 2.25 16.5C2.05109 16.5 1.86032 16.421 1.71967 16.2803C1.57902 16.1397 1.5 15.9489 1.5 15.75C1.5 15.5511 1.57902 15.3603 1.71967 15.2197C1.86032 15.079 2.05109 15 2.25 15ZM25.5 6V16.5C25.5 17.3297 26.1703 18 27 18H28.5C29.3297 18 30 17.3297 30 16.5V6.75C30 6.3375 29.6625 6 29.25 6H25.5ZM27 15.75C27 15.5511 27.079 15.3603 27.2197 15.2197C27.3603 15.079 27.5511 15 27.75 15C27.9489 15 28.1397 15.079 28.2803 15.2197C28.421 15.3603 28.5 15.5511 28.5 15.75C28.5 15.9489 28.421 16.1397 28.2803 16.2803C28.1397 16.421 27.9489 16.5 27.75 16.5C27.5511 16.5 27.3603 16.421 27.2197 16.2803C27.079 16.1397 27 15.9489 27 15.75Z"
            fill="#0A3019"
          />
        </svg>
      ),
      title: "Transparency",
      description: "Work with total transparency with easy job postings",
    },
  ];

  const securityFeatures = [
    {
      icon: (
        <svg
          width="20"
          height="28"
          viewBox="0 0 20 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20 28H0V0H20V28Z" stroke="#E5E7EB" />
          <g clip-path="url(#clip0_79_862)">
            <path
              d="M10 23.5C12.6522 23.5 15.1957 22.4464 17.0711 20.5711C18.9464 18.6957 20 16.1522 20 13.5C20 10.8478 18.9464 8.3043 17.0711 6.42893C15.1957 4.55357 12.6522 3.5 10 3.5C7.34784 3.5 4.8043 4.55357 2.92893 6.42893C1.05357 8.3043 0 10.8478 0 13.5C0 16.1522 1.05357 18.6957 2.92893 20.5711C4.8043 22.4464 7.34784 23.5 10 23.5ZM14.4141 11.6641L9.41406 16.6641C9.04688 17.0312 8.45312 17.0312 8.08984 16.6641L5.58984 14.1641C5.22266 13.7969 5.22266 13.2031 5.58984 12.8398C5.95703 12.4766 6.55078 12.4727 6.91406 12.8398L8.75 14.6758L13.0859 10.3359C13.4531 9.96875 14.0469 9.96875 14.4102 10.3359C14.7734 10.7031 14.7773 11.2969 14.4102 11.6602L14.4141 11.6641Z"
              fill="#0A3019"
            />
          </g>
          <defs>
            <clipPath id="clip0_79_862">
              <path d="M0 3.5H20V23.5H0V3.5Z" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
      label: "Verified Jobs",
    },
    {
      icon: (
        <svg
          width="20"
          height="28"
          viewBox="0 0 20 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20 28H0V0H20V28Z" stroke="#E5E7EB" />
          <g clip-path="url(#clip0_79_862)">
            <path
              d="M10 23.5C12.6522 23.5 15.1957 22.4464 17.0711 20.5711C18.9464 18.6957 20 16.1522 20 13.5C20 10.8478 18.9464 8.3043 17.0711 6.42893C15.1957 4.55357 12.6522 3.5 10 3.5C7.34784 3.5 4.8043 4.55357 2.92893 6.42893C1.05357 8.3043 0 10.8478 0 13.5C0 16.1522 1.05357 18.6957 2.92893 20.5711C4.8043 22.4464 7.34784 23.5 10 23.5ZM14.4141 11.6641L9.41406 16.6641C9.04688 17.0312 8.45312 17.0312 8.08984 16.6641L5.58984 14.1641C5.22266 13.7969 5.22266 13.2031 5.58984 12.8398C5.95703 12.4766 6.55078 12.4727 6.91406 12.8398L8.75 14.6758L13.0859 10.3359C13.4531 9.96875 14.0469 9.96875 14.4102 10.3359C14.7734 10.7031 14.7773 11.2969 14.4102 11.6602L14.4141 11.6641Z"
              fill="#0A3019"
            />
          </g>
          <defs>
            <clipPath id="clip0_79_862">
              <path d="M0 3.5H20V23.5H0V3.5Z" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
      label: "Secure Payments",
    },
    {
      icon: (
        <svg
          width="20"
          height="28"
          viewBox="0 0 20 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20 28H0V0H20V28Z" stroke="#E5E7EB" />
          <g clip-path="url(#clip0_79_862)">
            <path
              d="M10 23.5C12.6522 23.5 15.1957 22.4464 17.0711 20.5711C18.9464 18.6957 20 16.1522 20 13.5C20 10.8478 18.9464 8.3043 17.0711 6.42893C15.1957 4.55357 12.6522 3.5 10 3.5C7.34784 3.5 4.8043 4.55357 2.92893 6.42893C1.05357 8.3043 0 10.8478 0 13.5C0 16.1522 1.05357 18.6957 2.92893 20.5711C4.8043 22.4464 7.34784 23.5 10 23.5ZM14.4141 11.6641L9.41406 16.6641C9.04688 17.0312 8.45312 17.0312 8.08984 16.6641L5.58984 14.1641C5.22266 13.7969 5.22266 13.2031 5.58984 12.8398C5.95703 12.4766 6.55078 12.4727 6.91406 12.8398L8.75 14.6758L13.0859 10.3359C13.4531 9.96875 14.0469 9.96875 14.4102 10.3359C14.7734 10.7031 14.7773 11.2969 14.4102 11.6602L14.4141 11.6641Z"
              fill="#0A3019"
            />
          </g>
          <defs>
            <clipPath id="clip0_79_862">
              <path d="M0 3.5H20V23.5H0V3.5Z" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
      label: "24/7 Support",
    },
  ];

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white my-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#202326] mb-2">
              How It Works
            </h1>
            <p className="text-[#4B5563] text-2xl">
              Get started in 4 simple steps
            </p>
          </div>
        </div>
      </div>

      <div className=" px-4 py-12 space-y-16">
        {/* Steps Section */}
        <div className=" max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line - Only show between steps on larger screens */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5  -z-10" />
              )}

              <div className="text-center  shadow-xl p-4 rounded-2xl bg-[#f0fdf4]">
                {/* Icon Circle */}
                <div className="relative inline-flex items-center justify-center mb-4">
                  <div className="w-16 h-16 l flex items-center justify-center  relative z-10">
                    {step.icon}
                  </div>
                  <div className="   md:absolute -top-28 right-1 w-16 h-16 bg-[#0A3019]  text-white  rounded-full flex items-center justify-center text-2xl font-bold ">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#4B5563] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Keep 88% Section */}
        <div className="bg-[#f9fafb] py-20   text-center">
          <h2 className="text-2xl md:text-5xl font-bold text-[#202326]  mb-2">
            Keep 88% of What You Earn
          </h2>
          <p className="text-[#4B5563] text-xl my-8">
            Transparent pricing. We believe less. More money in your pocket.
          </p>

          <div className="bg-white shadow-xl  rounded-xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-8 mb-4">
              <div>
                <p className="text-xl font-bold text-[#9CA3AF] mb-1">
                  Job Pays
                </p>
                <p className="text-3xl md:text-4xl font-bold text-[#202326]">
                  $100
                </p>
              </div>

              <div className="text-2xl text-gray-400 font-light">
                <MoveRight />
              </div>

              <div>
                <p className="text-xl font-bold mb-1">You Receive</p>
                <p className="text-3xl md:text-4xl font-bold text-[#0A3019]">
                  $88
                </p>
              </div>
            </div>

            <div className="bg-[#f0fdf4] py-5 px-20">
              <p className="text-lg font-semibold text-[#4B5563]">
                Only 12% platform fee. That&apos;s it!
              </p>
            </div>
          </div>
        </div>

        {/* Why Work With Us */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Why Work With Us
          </h2>
          <p className="text-gray-600">
            The easiest way to start earning money in your spare time
          </p>
        </div>

        <div className="grid max-w-7xl mx-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl  p-6 text-center ">
              <div className="w-14 h-14 bg-[#f0fdf4] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-700">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Safe & Secure Section */}
        <div className="bg-[#f9fafb] text-center py-20 ">
          <div className="max-w-7xl mx-auto shadow-2xl rounded-2xl bg-white py-10">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M48 48H0V0H48V48Z" stroke="#E5E7EB" />
                <path
                  d="M24 0C24.4313 0 24.8625 0.09375 25.2563 0.271875L42.9094 7.7625C44.9719 8.63438 46.5094 10.6688 46.5 13.125C46.4532 22.425 42.6282 39.4406 26.475 47.175C24.9094 47.925 23.0907 47.925 21.525 47.175C5.37192 39.4406 1.54692 22.425 1.50004 13.125C1.49067 10.6688 3.02817 8.63438 5.09067 7.7625L22.7532 0.271875C23.1375 0.09375 23.5688 0 24 0ZM24 6.2625V41.7C36.9375 35.4375 40.4157 21.5719 40.5 13.2563L24 6.2625Z"
                  fill="#0A3019"
                />
              </svg>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Safe & Secure
            </h2>
            <p className="text-[#4B5563] max-w-2xl mx-auto mb-8 text-xl leading-relaxed">
              We verify all businesses and check reviews before they get access
              with video chat and government ID. We provide every step of the
              way. Plus every job is secure with our money-back guarantee.
            </p>

            {/* Security Features */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              {securityFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full"
                >
                  <div className="text-emerald-400">{feature.icon}</div>
                  <span className="text-sm font-medium">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
     
    </div>
  );
};

export default HowItWorks;
