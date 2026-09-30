import React from "react";

const page = () => {
  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="bg-white ">
        <div className="max-w-4xl  mx-auto px-6 py-8">
          <h1 className="text-3xl text-center font-bold text-gray-900 mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-600">Last updated: January 2026</p>
          <div className="bg-[#eff6ff] border-[#60a5fa] border-l-8 mt-5 p-5">
            <p className="text-[#1E40AF]">
              Please read these terms carefully before using Yard Hero&apos;s
              platform. By accessing or using our service, you agree to be bound
              by these terms.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Introduction */}
        {/* <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Agreement</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            These terms and conditions outline the rules and regulations for the use of our website and services. By accessing this website, we assume you accept these terms and conditions. Do not continue to use our services if you do not agree to all the terms and conditions stated on this page.
          </p>
        </section> */}

        {/* Table of Contents */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Table of Contents
          </h2>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
            <ul className="space-y-2">
              <li>
                <a
                  href="#definitions"
                  className="text-[#16A34A] hover:underline"
                >
                  1. Definitions
                </a>
              </li>
              <li>
                <a href="#cookies" className="text-[#16A34A] hover:underline">
                  2. Cookies
                </a>
              </li>
              <li>
                <a href="#license" className="text-[#16A34A] hover:underline">
                  3. License
                </a>
              </li>
              <li>
                <a href="#liability" className="text-[#16A34A] hover:underline">
                  4. Liability & Warranties
                </a>
              </li>
            </ul>
            <ul className="space-y-2">
              <li>
                <a
                  href="#restrictions"
                  className="text-[#16A34A] hover:underline"
                >
                  5. User Restrictions
                </a>
              </li>
              <li>
                <a href="#content" className="text-[#16A34A] hover:underline">
                  6. Content
                </a>
              </li>
              <li>
                <a href="#removal" className="text-[#16A34A] hover:underline">
                  7. Removal of Links
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* 1. Definitions  */}
        <section id="definitions" className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            1. Overview
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Yard Hero operates as a marketplace platform that connects customers
            seeking yard work and home maintenance services with independent
            contractors (&quot;Independent Hero Contractors&quot;). We facilitate these connections but do not
            directly provide the services.
            <br />
            By using our platform, you acknowledge that all work performed is
            between customers and independent contractors, with Yard Hero
            serving solely as an intermediary platform.
          </p>
        </section>

        {/* 2. Cookies */}
        <section id="cookies" className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            2. Platform Role
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Yard Hero provides:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
            <li>A platform for service discovery and booking</li>
            <li>Payment processing services</li>
            <li>Communication tools between parties</li>
            <li>Basic dispute resolution assistance</li>
          </ul>
        </section>

        {/* 3. License */}
        <section id="license" className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            3. Liability & Disclaimers
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Important: Platform Liability Limitations
          </p>
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-red-800 font-semibold mb-2">
              Yard Hero is NOT liable for:
            </p>
            <ul className="list-disc list-inside space-y-1 text-red-700 ml-4">
              <li>Hero injuries sustained while providing services</li>
              <li>Accidents occurring during service delivery</li>
              <li>Property damage caused by Heroes or during services</li>
              <li>Delays or inconveniences related to service delivery</li>
            </ul>
          </div>
          <p className="text-gray-700 leading-relaxed">
            All services are performed by independent contractors. Customers and
            Independent Hero Contractors are responsible for ensuring appropriate insurance coverage,
            safety measures, and legal compliance for all work performed.
          </p>
        </section>

        {/* 4. Liability & Warranties */}
        <section id="liability" className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            4. Terms for Customers
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your Responsibilities
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
            <li>Provide accurate job descriptions and property access</li>
            <li>
              Ensure your property is safe for Heroes to provide services
            </li>
            <li>Pay for services as agreed through the platform</li>
            <li>Verify Hero credentials and insurance if required</li>
          </ul>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-800">
              <span className="font-semibold">Insurance Recommendation::</span>{" "}
              Consider verifying that Heroes carry appropriate liability
              insurance for the services being performed on your property.
            </p>
          </div>
        </section>

        {/* 5. User Restrictions */}
        <section id="restrictions" className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            5. Terms for Independent Hero Contractors
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your Status & Responsibilities
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
            <p>
              As an Independent Hero Contractor on Yard Hero, you are not
              an employee. This means:{" "}
            </p>
            <li>You are responsible for your own insurance coverage</li>
            <li>You handle your own tax obligations</li>
            <li>You maintain proper licenses and certifications</li>
            <li>You provide your own tools and equipment</li>
            <li>You follow all applicable safety regulations</li>
          </ul>
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
            <p className="text-orange-800">
              <span className="font-semibold">Insurance Requirement::</span>{" "}
              Heroes are strongly encouraged to maintain general liability
              insurance and occupational accident coverage or other coverage required by law.
            </p>
          </div>
        </section>

        {/* 6. Content */}
        <section id="content" className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            6. Dispute Resolution
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For disputes between customers and Heroes, Yard Hero provides basic
            mediation assistance. However, legal disputes must be resolved
            between the parties directly.
          </p>
          <p className="text-gray-700 leading-relaxed">Dispute Process</p>
          <p>Contact our support team within 48 hours</p>
          <p>Provide documentation and evidence</p>
          <p>Participate in mediation process </p>
          <p>Seek independent legal counsel if needed </p>
        </section>

        {/* 7. Removal of Links */}
        <section id="removal" className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            7. Account Termination
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Either party may terminate their account at any time. Yard Hero
            reserves the right to suspend or terminate accounts for violations
            of these terms.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Termination does not affect completed transactions or ongoing
            disputes.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0a3019] text-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-4">
            <div className="inline-block bg-white/10 rounded-full p-3 mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_542_866)">
                  <path
                    d="M12 0C12.2156 0 12.4313 0.046875 12.6281 0.135938L21.4547 3.88125C22.486 4.31719 23.2547 5.33438 23.25 6.5625C23.2266 11.2125 21.3141 19.7203 13.2375 23.5875C12.4547 23.9625 11.5453 23.9625 10.7625 23.5875C2.68596 19.7203 0.773459 11.2125 0.750021 6.5625C0.745334 5.33438 1.51408 4.31719 2.54533 3.88125L11.3766 0.135938C11.5688 0.046875 11.7844 0 12 0ZM12 3.13125V20.85C18.4688 17.7188 20.2078 10.7859 20.25 6.62813L12 3.13125Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_542_866">
                    <path d="M0 0H24V24H0V0Z" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Your Safety & Fair Pay Matter
            </h3>
            <p className="text-emerald-100 max-w-2xl mx-auto">
              We&apos;re committed to ensuring you feel safe and fairly compensated
              for your hard work. Our team monitors all jobs and payments to
              protect Heroes like you.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default page;
