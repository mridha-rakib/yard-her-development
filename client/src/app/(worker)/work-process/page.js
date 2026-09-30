"use client";
import Banner from "@/app/component/Banner";
import React from "react";
import { SiStripe } from "react-icons/si";

const page = () => {
  return (
    <div className="min-h-screen bg-white  px-4">
      <div
        style={{
          background: "linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 70.71%)",
        }}
        className="text-center py-16"
      >
        <h2 className="text-4xl md:text-6xl font-bold text-[#202326] mb-3">
          How It Works
        </h2>
        <p className="text-[#4B5563] text-xl">
          Start earning money in four simple steps
        </p>
      </div>
      <div>
        {/* How It Works Section */}

        {/* Steps */}
        <div className="grid max-w-7xl mx-auto grid-cols-1 md:grid-cols-4 gap-8 py-20">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-[#0A3019] rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Create Profile
            </h3>
            <p className="text-sm text-gray-600">
              Sign up in minutes and share basic job and skills
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-[#0A3019] rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Get Job Offers
            </h3>
            <p className="text-sm text-gray-600">
              Customers post jobs that match your skills and area
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-[#0A3019] rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Do the job well and make the customer happy
            </h3>
            <p className="text-sm text-gray-600">
              On your own customized web feed in minutes
            </p>
          </div>

          {/* Step 4 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-[#0A3019] rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              4
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Get paid
            </h3>
            <p className="text-sm text-gray-600">
              YReceive payment quickly and get paid today
            </p>
          </div>
        </div>

        {/* Earnings Section */}
        <div className="bg-[#f0fdf4] py-20">
          <div className="text-center mb-20">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">
              You keep 88% of every job
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
              <div className="mb-6">
                <p className="text-4xl font-bold text-gray-900">
                  Job pays $100
                </p>
                <p className="text-gray-600 my-2">Platform fee (12%): $12</p>
              </div>
              <div className="border-t border-gray-300 pt-6">
                <p className="text-4xl font-bold text-[#0A3019]">
                  You earn $88
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="text-center py-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Stripe Express
          </h3>
          <p className="mx-auto mb-10 max-w-2xl text-gray-600">
            Yard Hero uses Stripe Express for secure, trustworthy payouts to your connected
            bank account.
          </p>

          <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
            <div className="flex h-16 w-32 items-center justify-center rounded-lg bg-[#635bff] text-white">
              <SiStripe className="h-10 w-24" aria-label="Stripe" />
            </div>
            <p className="mt-5 text-lg font-semibold text-[#202326]">Stripe Express</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Stripe protects sensitive payment details and is trusted by businesses worldwide
              for secure payment processing.
            </p>
          </div>
        </div>

        {/* Why Work With Us Section */}
        <div className="text-center bg-[#f9fafb] py-20">
          <h3 className="text-4xl font-bold text-[#202326] mb-10">
            Why work with us?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Feature 1 */}
            <div className="flex items-start text-left">
              <div className="w-10 h-10 bg-[#0A3019] rounded-full flex items-center justify-center text-white flex-shrink-0 mr-4">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_81_1572)">
                    <path
                      d="M8 0C10.1217 0 12.1566 0.842855 13.6569 2.34315C15.1571 3.84344 16 5.87827 16 8C16 10.1217 15.1571 12.1566 13.6569 13.6569C12.1566 15.1571 10.1217 16 8 16C5.87827 16 3.84344 15.1571 2.34315 13.6569C0.842855 12.1566 0 10.1217 0 8C0 5.87827 0.842855 3.84344 2.34315 2.34315C3.84344 0.842855 5.87827 0 8 0ZM7.25 3.75V8C7.25 8.25 7.375 8.48438 7.58437 8.625L10.5844 10.625C10.9281 10.8562 11.3938 10.7625 11.625 10.4156C11.8562 10.0687 11.7625 9.60625 11.4156 9.375L8.75 7.6V3.75C8.75 3.33437 8.41562 3 8 3C7.58437 3 7.25 3.33437 7.25 3.75Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_81_1572">
                      <path d="M0 0H16V16H0V0Z" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Flexible timing
                </h4>
                <p className="text-sm text-gray-600">Work when you want</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start text-left">
              <div className="w-10 h-10 bg-[#0A3019] rounded-full flex items-center justify-center text-white flex-shrink-0 mr-4">
                <svg
                  width="12"
                  height="16"
                  viewBox="0 0 12 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_81_1582)">
                    <path
                      d="M6.74062 15.6C8.34375 13.5938 12 8.73125 12 6C12 2.6875 9.3125 0 6 0C2.6875 0 0 2.6875 0 6C0 8.73125 3.65625 13.5938 5.25938 15.6C5.64375 16.0781 6.35625 16.0781 6.74062 15.6ZM6 4C6.53043 4 7.03914 4.21071 7.41421 4.58579C7.78929 4.96086 8 5.46957 8 6C8 6.53043 7.78929 7.03914 7.41421 7.41421C7.03914 7.78929 6.53043 8 6 8C5.46957 8 4.96086 7.78929 4.58579 7.41421C4.21071 7.03914 4 6.53043 4 6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_81_1582">
                      <path d="M0 0H12V16H0V0Z" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Local jobs</h4>
                <p className="text-sm text-gray-600">
                  Work in your neighborhood
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start text-left">
              <div className="w-10 h-10 bg-[#0A3019] rounded-full flex items-center justify-center text-white flex-shrink-0 mr-4">
                <svg
                  width="10"
                  height="16"
                  viewBox="0 0 10 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_81_1591)">
                    <path
                      d="M5.00005 0C5.55317 0 6.00005 0.446875 6.00005 1V2.11562C6.05005 2.12187 6.09692 2.12812 6.14692 2.1375C6.15942 2.14062 6.1688 2.14062 6.1813 2.14375L7.6813 2.41875C8.22505 2.51875 8.58442 3.04063 8.48442 3.58125C8.38442 4.12187 7.86255 4.48438 7.32192 4.38438L5.83755 4.1125C4.85942 3.96875 3.99692 4.06563 3.39067 4.30625C2.78442 4.54688 2.54067 4.87812 2.48442 5.18437C2.42192 5.51875 2.4688 5.70625 2.52192 5.82188C2.57817 5.94375 2.69379 6.08125 2.92192 6.23438C3.43129 6.56875 4.21255 6.7875 5.22505 7.05625L5.31567 7.08125C6.20942 7.31875 7.30317 7.60625 8.11567 8.1375C8.55942 8.42812 8.97817 8.82187 9.23755 9.37187C9.50317 9.93125 9.55942 10.5563 9.43754 11.2219C9.22192 12.4094 8.40317 13.2031 7.38755 13.6187C6.95942 13.7937 6.4938 13.9062 6.00005 13.9625V15C6.00005 15.5531 5.55317 16 5.00005 16C4.44692 16 4.00005 15.5531 4.00005 15V13.9094C3.98755 13.9062 3.97192 13.9062 3.95942 13.9031H3.95317C3.19067 13.7844 1.93755 13.4563 1.0938 13.0813C0.59067 12.8562 0.362545 12.2656 0.587545 11.7625C0.812545 11.2594 1.40317 11.0312 1.9063 11.2563C2.55942 11.5469 3.63442 11.8344 4.25629 11.9312C5.25317 12.0781 6.07505 11.9937 6.6313 11.7656C7.15942 11.55 7.40005 11.2375 7.4688 10.8625C7.52817 10.5312 7.4813 10.3406 7.42817 10.225C7.3688 10.1 7.25317 9.9625 7.02192 9.80937C6.50942 9.475 5.72505 9.25625 4.70942 8.9875L4.62192 8.96562C3.7313 8.72812 2.63755 8.4375 1.82505 7.90625C1.3813 7.61562 0.96567 7.21875 0.706295 6.66875C0.443795 6.10938 0.39067 5.48438 0.51567 4.81875C0.74067 3.625 1.63442 2.85 2.65005 2.44688C3.06567 2.28125 3.52192 2.16875 4.00005 2.10313V1C4.00005 0.446875 4.44692 0 5.00005 0Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_81_1591">
                      <path d="M0 0H10V16H0V0Z" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Clear pay</h4>
                <p className="text-sm text-gray-600">
                  Know exactly what you&apos;ll earn
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start text-left">
              <div className="w-10 h-10 bg-[#0A3019] rounded-full flex items-center justify-center text-white flex-shrink-0 mr-4">
                <svg
                  width="20"
                  height="16"
                  viewBox="0 0 20 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20 16H0V0H20V16Z" stroke="#E5E7EB" />
                  <path
                    d="M10.1062 2.6625L7.08125 5.1125C6.57812 5.51875 6.48125 6.25 6.8625 6.77187C7.26562 7.32812 8.05 7.4375 8.59062 7.01562L11.6938 4.60313C11.9125 4.43438 12.225 4.47188 12.3969 4.69063C12.5688 4.90938 12.5281 5.22188 12.3094 5.39375L11.6562 5.9L16 9.9V4H15.9781L15.8562 3.92188L13.5875 2.46875C13.1094 2.1625 12.55 2 11.9812 2C11.3 2 10.6375 2.23437 10.1062 2.6625ZM10.8188 6.55L9.20312 7.80625C8.21875 8.575 6.79063 8.375 6.05312 7.3625C5.35938 6.40938 5.53437 5.07812 6.45 4.3375L9.05 2.23438C8.6875 2.08125 8.29688 2.00312 7.9 2.00312C7.3125 2 6.74062 2.175 6.25 2.5L4 4V11H4.88125L7.7375 13.6062C8.35 14.1656 9.29688 14.1219 9.85625 13.5094C10.0281 13.3187 10.1438 13.0969 10.2031 12.8656L10.7344 13.3531C11.3438 13.9125 12.2937 13.8719 12.8531 13.2625C12.9937 13.1094 13.0969 12.9312 13.1625 12.7469C13.7688 13.1531 14.5938 13.0687 15.1031 12.5125C15.6625 11.9031 15.6219 10.9531 15.0125 10.3938L10.8188 6.55ZM0.5 4C0.225 4 0 4.225 0 4.5V11C0 11.5531 0.446875 12 1 12H2C2.55312 12 3 11.5531 3 11V4H0.5ZM1.5 10C1.63261 10 1.75979 10.0527 1.85355 10.1464C1.94732 10.2402 2 10.3674 2 10.5C2 10.6326 1.94732 10.7598 1.85355 10.8536C1.75979 10.9473 1.63261 11 1.5 11C1.36739 11 1.24021 10.9473 1.14645 10.8536C1.05268 10.7598 1 10.6326 1 10.5C1 10.3674 1.05268 10.2402 1.14645 10.1464C1.24021 10.0527 1.36739 10 1.5 10ZM17 4V11C17 11.5531 17.4469 12 18 12H19C19.5531 12 20 11.5531 20 11V4.5C20 4.225 19.775 4 19.5 4H17ZM18 10.5C18 10.3674 18.0527 10.2402 18.1464 10.1464C18.2402 10.0527 18.3674 10 18.5 10C18.6326 10 18.7598 10.0527 18.8536 10.1464C18.9473 10.2402 19 10.3674 19 10.5C19 10.6326 18.9473 10.7598 18.8536 10.8536C18.7598 10.9473 18.6326 11 18.5 11C18.3674 11 18.2402 10.9473 18.1464 10.8536C18.0527 10.7598 18 10.6326 18 10.5Z"
                    fill="white"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  No long-term commitment
                </h4>
                <p className="text-sm text-gray-600">
                  Work as much or as little as you want
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Banner />
    </div>
  );
};
export default page;
