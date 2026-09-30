import React from "react";

export const metadata = {
  title: "Independent Contractor Agreement | Yard Hero",
  description: "Independent Contractor Agreement for Yard Hero Independent Hero Contractors.",
};

const agreementVersion = "ICA v1.0";
const effectiveDate = "April 18, 2026";

const sections = [
  {
    id: "parties",
    title: "1. Parties",
    paragraphs: [
      "This Independent Contractor Agreement is entered into by Yard Hero and the individual or business entity that creates or maintains a Hero account on the Yard Hero platform. The Hero is an Independent Hero Contractor who may choose to offer yard work, outdoor maintenance, and related services to customers through the platform.",
      "By creating a Hero account, submitting a Hero application, accepting a service request, or using the platform as a Hero, the Independent Hero Contractor agrees to this Agreement.",
    ],
  },
  {
    id: "contractor-status",
    title: "2. Independent Contractor Status",
    paragraphs: [
      "The Independent Hero Contractor is not an employee, agent, partner, joint venturer, franchisee, or legal representative of Yard Hero. Nothing in this Agreement creates an employment relationship.",
      "Yard Hero does not control the manner, method, route, sequence, tools, equipment, or means by which the Independent Hero Contractor performs accepted services. The Independent Hero Contractor retains the right to decide whether to accept or decline any service request made available through the platform.",
      "The Independent Hero Contractor is responsible for determining when they are available, what service requests they accept, and how accepted services are completed, subject to the customer requirements, applicable law, and platform safety standards.",
    ],
  },
  {
    id: "platform-role",
    title: "3. Yard Hero Platform Role",
    paragraphs: [
      "Yard Hero provides a technology platform that helps customers connect with Independent Hero Contractors. Yard Hero does not directly provide yard work services and is not a party to the service relationship between a customer and an Independent Hero Contractor, except as expressly stated in this Agreement.",
      "Yard Hero may provide account tools, payment processing, support channels, trust and safety review, dispute assistance, and platform policies designed to support marketplace operations.",
    ],
  },
  {
    id: "services",
    title: "4. Services",
    paragraphs: [
      "The Independent Hero Contractor may provide services such as lawn mowing, leaf raking, trimming, yard cleanup, snow removal, outdoor maintenance, and other services accepted through the platform.",
      "The Independent Hero Contractor agrees to perform accepted services in a professional, lawful, and safe manner. The Independent Hero Contractor is responsible for reviewing each request before accepting it and confirming that they have the skill, equipment, time, and ability to complete the service.",
      "The Independent Hero Contractor must not accept a request that appears unsafe, unlawful, misleading, outside their ability, or outside the scope they are willing to perform.",
    ],
  },
  {
    id: "control",
    title: "5. Control Over Work",
    paragraphs: [
      "The Independent Hero Contractor controls the details of how accepted services are performed. Yard Hero does not require a fixed shift, fixed hours, exclusive availability, uniforms, or a required method of service performance.",
      "Yard Hero may establish platform standards related to customer communication, safety, lawful conduct, fraud prevention, payment processing, documentation, and dispute review. These standards protect platform users and do not create an employment relationship.",
    ],
  },
  {
    id: "tools",
    title: "6. Tools, Equipment, Supplies, and Expenses",
    paragraphs: [
      "Unless a customer expressly agrees otherwise in the request details, the Independent Hero Contractor is responsible for providing the tools, equipment, transportation, supplies, fuel, protective gear, mobile device, internet access, and other resources needed to perform accepted services.",
      "The Independent Hero Contractor is responsible for their own business expenses and will not be reimbursed by Yard Hero unless Yard Hero expressly agrees in writing.",
    ],
  },
  {
    id: "taxes",
    title: "7. Taxes and Legal Obligations",
    paragraphs: [
      "The Independent Hero Contractor is solely responsible for all federal, state, local, and other taxes arising from payments received through or related to the platform, including income taxes, self-employment taxes, sales taxes, and any other applicable taxes.",
      "Yard Hero will not withhold taxes, provide unemployment insurance, provide workers compensation benefits, provide health insurance, provide retirement benefits, or provide paid leave to the Independent Hero Contractor.",
      "The Independent Hero Contractor is responsible for maintaining any licenses, permits, registrations, certifications, or authorizations required to perform accepted services in the locations where they operate.",
    ],
  },
  {
    id: "insurance",
    title: "8. Insurance and Safety",
    paragraphs: [
      "The Independent Hero Contractor is responsible for determining and maintaining appropriate insurance coverage for their services, business activities, tools, equipment, vehicle, and potential liability. This may include general liability, vehicle insurance, occupational accident coverage, or other coverage required by law.",
      "The Independent Hero Contractor agrees to follow applicable safety laws, use reasonable care, avoid unsafe conditions, and stop work if a site condition creates an unreasonable risk of injury, property damage, or unlawful activity.",
      "The Independent Hero Contractor must promptly notify the customer and Yard Hero support of safety concerns, property damage, injury, or incidents related to an accepted service.",
    ],
  },
  {
    id: "payment",
    title: "9. Payment and Platform Fees",
    paragraphs: [
      "Customers pay for services through the Yard Hero platform unless Yard Hero expressly authorizes another payment method. The Independent Hero Contractor agrees not to bypass the platform for payment on service requests introduced through Yard Hero.",
      "For completed and approved services, Yard Hero will make the applicable payout to the Independent Hero Contractor after deducting the platform fee and any permitted adjustments, refunds, chargebacks, or dispute-related amounts.",
      "The platform fee for the current version of the platform is 12 percent unless updated in the platform terms, pricing disclosures, or written notice. The Independent Hero Contractor receives the remaining 88 percent of the agreed service amount, subject to any lawful deductions, adjustments, or payment processor requirements.",
    ],
  },
  {
    id: "communications",
    title: "10. Customer Communication and Conduct",
    paragraphs: [
      "The Independent Hero Contractor agrees to communicate respectfully, honestly, and promptly with customers about accepted services. The Independent Hero Contractor must not harass, threaten, discriminate, misrepresent qualifications, request improper payments, or engage in unlawful conduct.",
      "The Independent Hero Contractor must protect customer privacy and use customer contact information only for the accepted service and related platform communication.",
    ],
  },
  {
    id: "confidentiality",
    title: "11. Confidentiality and Data Protection",
    paragraphs: [
      "The Independent Hero Contractor may receive confidential or personal information through the platform, including customer names, addresses, contact details, service details, payment-related status, and platform information.",
      "The Independent Hero Contractor must protect this information, use it only for legitimate service purposes, and not sell, publish, misuse, or disclose it except as required to complete an accepted service or comply with law.",
    ],
  },
  {
    id: "quality",
    title: "12. Completion, Documentation, and Disputes",
    paragraphs: [
      "The Independent Hero Contractor may be required to provide completion notes, photos, timestamps, or other reasonable documentation through the platform. Documentation helps customers confirm completion and helps Yard Hero support review disputes.",
      "If a customer raises a dispute, Yard Hero may review platform records, communications, photos, payment status, and other relevant information. Yard Hero may delay, adjust, release, or reverse payment as permitted by platform policies, payment processor rules, and applicable law.",
    ],
  },
  {
    id: "non-exclusivity",
    title: "13. Non-Exclusivity",
    paragraphs: [
      "The Independent Hero Contractor is free to provide services to other customers, use other platforms, operate an independent business, advertise services, and work with competitors, provided they do not misuse Yard Hero confidential information or violate this Agreement.",
      "Yard Hero is not required to provide any minimum number of service requests, earnings, customers, or opportunities.",
    ],
  },
  {
    id: "account",
    title: "14. Account Access and Platform Standards",
    paragraphs: [
      "Yard Hero may review, approve, reject, suspend, restrict, or deactivate a Hero account for reasons including safety concerns, fraud, repeated customer complaints, poor documentation, policy violations, unlawful conduct, payment disputes, identity concerns, or failure to meet platform standards.",
      "Account review or deactivation is a platform access decision and does not change the Independent Hero Contractor relationship.",
    ],
  },
  {
    id: "intellectual-property",
    title: "15. Intellectual Property",
    paragraphs: [
      "Yard Hero owns or licenses the platform, brand names, logos, software, designs, workflows, content, and related intellectual property. The Independent Hero Contractor receives only a limited right to use the platform for authorized marketplace activity.",
      "The Independent Hero Contractor may not copy, reverse engineer, scrape, resell, misuse, or create derivative works from the platform except as expressly allowed by Yard Hero.",
    ],
  },
  {
    id: "indemnification",
    title: "16. Indemnification",
    paragraphs: [
      "To the fullest extent permitted by law, the Independent Hero Contractor agrees to defend, indemnify, and hold harmless Yard Hero, its owners, officers, employees, contractors, vendors, and affiliates from claims, losses, damages, liabilities, penalties, costs, and expenses arising from the Independent Hero Contractor's services, conduct, tax obligations, legal violations, property damage, injury, misrepresentations, or breach of this Agreement.",
    ],
  },
  {
    id: "limitation",
    title: "17. Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by law, Yard Hero is not liable for indirect, incidental, special, consequential, exemplary, or punitive damages, including lost profits, lost business, lost opportunity, or reputational harm.",
      "Yard Hero's total liability related to this Agreement or platform use will not exceed the platform fees retained by Yard Hero from the Independent Hero Contractor's completed services during the three months before the event giving rise to the claim, unless applicable law requires otherwise.",
    ],
  },
  {
    id: "termination",
    title: "18. Term and Termination",
    paragraphs: [
      "This Agreement begins when the Independent Hero Contractor accepts it by creating or using a Hero account, submitting a Hero application, or accepting a service request. It continues until terminated by either party.",
      "The Independent Hero Contractor may stop using the platform at any time. Yard Hero may suspend or terminate platform access as permitted by this Agreement and platform policies.",
      "Sections concerning taxes, confidentiality, payment adjustments, disputes, indemnification, limitation of liability, and any obligations that by their nature should survive will survive termination.",
    ],
  },
  {
    id: "changes",
    title: "19. Changes to this Agreement",
    paragraphs: [
      "Yard Hero may update this Agreement from time to time. The version number and effective date identify the applicable version. Continued use of the platform after an updated Agreement is posted or presented means the Independent Hero Contractor accepts the updated Agreement.",
    ],
  },
  {
    id: "acknowledgement",
    title: "20. Acknowledgement",
    paragraphs: [
      "The Independent Hero Contractor acknowledges that they have read this Agreement, understand it, and agree to operate as an independent business provider responsible for their own taxes, insurance, tools, expenses, safety, legal compliance, and accepted services.",
      "The Independent Hero Contractor further acknowledges that Yard Hero does not guarantee earnings, does not require exclusivity, and does not create an employment relationship.",
    ],
  },
];

export default function HeroAgreementPage() {
  return (
    <div className="min-h-screen bg-[#f7faf7] text-[#111827]">
      <header className="border-b border-[#d8e4db] bg-white">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#166534]">
            {agreementVersion}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#0f172a]">
            Independent Contractor Agreement
          </h1>
          <p className="mt-3 text-sm text-[#52606d]">Effective date: {effectiveDate}</p>
          <div className="mt-6 rounded-lg border-l-4 border-[#16a34a] bg-[#f0fdf4] px-5 py-4 text-sm leading-6 text-[#14532d]">
            This Agreement applies to Independent Hero Contractors using Yard Hero.
            Review this Agreement carefully before accepting service requests through
            the platform.
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-10 lg:grid-cols-[16rem_1fr]">
        <aside className="h-fit rounded-lg border border-[#d8e4db] bg-white p-5 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#64748b]">
            Contents
          </h2>
          <nav className="mt-4 space-y-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded-md px-3 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f1f7f2] hover:text-[#166534]"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <article className="rounded-lg border border-[#d8e4db] bg-white px-6 py-8 shadow-sm md:px-10">
          <div className="mb-8 border-b border-[#e5eee7] pb-6">
            <p className="text-sm leading-6 text-[#52606d]">
              This document is the full Independent Contractor Agreement for Yard
              Hero. It is written for platform use and should be reviewed by legal
              counsel before relying on it as a final legal agreement.
            </p>
          </div>

          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-[#0f172a]">{section.title}</h2>
                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-8 text-[#374151]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
