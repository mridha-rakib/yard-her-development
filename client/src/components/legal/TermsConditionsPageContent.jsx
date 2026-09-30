"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, LoaderCircle } from "lucide-react";
import { contentApi } from "@/lib/api/content-api";
import { getApiErrorMessage } from "@/lib/api/http";
import {
  getLegalDocumentDefinition,
  hasMeaningfulLegalDocumentContent,
  sanitizeLegalDocumentHtml,
} from "@/lib/legal-documents";

const TERMS_DEFAULT = {
  heroDescription: "Please read these Terms carefully before using our platform.",
  fallbackDate: "January 8, 2025",
  sections: {
    introduction: {
      title: "1. Introduction",
      paragraphs: [
        "Welcome to Yard Hero. These Terms & Conditions govern your use of our platform, which connects customers seeking yard work services with qualified Heroes. By accessing or using our platform, you agree to be bound by these terms.",
        "Our platform serves as a marketplace to facilitate connections between customers and Heroes. We are not an employer, and we do not directly provide yard work services.",
      ],
    },
    eligibility: {
      title: "2. Eligibility & Account Responsibility",
      intro:
        "To use Yard Hero, you must be at least 18 years old and capable of forming a legally binding contract. By creating an account, you agree to:",
      items: [
        "Provide accurate, current, and complete information during registration",
        "Maintain and promptly update your account information",
        "Keep your login credentials secure and confidential",
        "Accept responsibility for all activities that occur under your account",
        "Notify us immediately of any unauthorized access or security breach",
      ],
    },
    platformRole: {
      title: "3. Platform Role",
      intro:
        "Yard Hero operates as a connection service only. We provide the technology platform that enables customers and Heroes to find and communicate with each other.",
      emphasis: "Important clarifications:",
      items: [
        "We do not employ Heroes or control how they perform services",
        "We do not guarantee the quality, safety, or legality of services provided",
        "Heroes are Independent Hero Contractors, not employees of Yard Hero",
        "All agreements for services are directly between customers and Independent Hero Contractors",
        "We facilitate payment processing but are not party to the service contract",
      ],
    },
    jobRules: {
      title: "4. Job Posting & Acceptance Rules",
      customerTitle: "For Customers:",
      customerItems: [
        "Provide accurate and complete job descriptions, including location, scope of work, and timeline",
        "Set fair and reasonable compensation for the work requested",
        "Respond promptly to Hero inquiries and applications",
        "Do not post jobs that violate local laws or regulations",
        "Cancel jobs with adequate notice if plans change",
      ],
      workerTitle: "For Independent Hero Contractors:",
      workerItems: [
        "Only accept jobs you are qualified and equipped to complete",
        "Communicate clearly about your availability and capabilities",
        "Honor commitments once you accept a job",
        "Arrive on time and complete work as described",
        "Notify customers immediately if you cannot fulfill a commitment",
      ],
    },
    payments: {
      title: "5. Payments & Platform Fees",
      intro:
        "Yard Hero facilitates secure payment processing between customers and Heroes. Here's how it works:",
      feeTitle: "Platform Fee: 12%",
      feeDescription:
        "We charge a 12% service fee on all completed transactions. This fee covers payment processing, platform maintenance, customer support, and dispute resolution services.",
      processTitle: "Payment Process:",
      items: [
        "Customers pay through the platform when posting or accepting a quote",
        "Funds are held securely until job completion is confirmed",
        "Heroes receive payment after the customer confirms satisfactory completion",
        "The 12% platform fee is automatically deducted from the total payment",
        "Heroes receive 88% of the agreed job price",
        "Refunds are processed according to our dispute resolution policy",
      ],
    },
    refundPolicy: {
      title: "6. Refund & Cancellation Policy",
      intro:
        "YardHero is committed to providing a fair experience for both customers and independent Heroes on the platform. Refund eligibility is determined based on the circumstances of the booking.",
      fullRefundsTitle: "Full Refunds (100%)",
      fullRefundsIntro:
        "Customers are eligible for a full 100% refund only under the following conditions:",
      fullRefundItems: [
        "Property damage directly caused during the service",
        "YardHero is unable to assign a Hero to the booking request within the active booking period",
      ],
      partialRefundsTitle: "Partial Refunds (90%)",
      partialRefundsIntro:
        "Customers will receive a 90% refund in situations including, but not limited to:",
      partialRefundItems: [
        "Incorrect square footage or property size entered during booking",
        "Additional work or services requested in the job description that were not included in the original booking",
        "Outside purchases or materials requested for the Hero after booking",
        "Accidental or mistaken bookings submitted by the customer",
        "Customer-requested cancellations prior to job completion that are determined to be customer fault",
      ],
      retentionNote:
        "The remaining 10% is retained to cover non-refundable payment processing fees, administrative costs, and platform operations.",
      additionalNotesTitle: "Additional Notes",
      additionalNotesItems: [
        "Once a Hero is actively en route to the property or has begun work, only partial refunds may be issued depending on the circumstances.",
        "Refund requests submitted after a job has been fully completed may be denied.",
        "YardHero reserves the right to review all refund requests and determine eligibility on a case-by-case basis.",
      ],
    },
    disputes: {
      title: "7. Job Completion & Disputes",
      intro:
        "We encourage direct communication between customers and Heroes to resolve any issues. However, if disputes arise:",
      items: [
        "Customers must confirm job completion within 48 hours or provide specific reasons for dissatisfaction",
        "Heroes should document completed work with photos when possible",
        "Either party can open a dispute through the platform within 7 days of job completion",
        "Our support team will review evidence from both parties",
        "We reserve the right to make final decisions on payment release in disputes",
        "Repeated disputes may result in account review or suspension",
      ],
    },
  },
};

const normalizeText = (value = "") =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

const getDirectChildren = (node, tagName = "") =>
  Array.from(node?.children || []).filter((child) =>
    tagName ? child.tagName.toLowerCase() === tagName.toLowerCase() : true
  );

const getFirstDirectChild = (node, tagName = "") => getDirectChildren(node, tagName)[0] || null;

const getElementText = (node) => normalizeText(node?.textContent || "");

const getListItems = (listNode) =>
  getDirectChildren(listNode, "li")
    .map((item) => getElementText(item))
    .filter(Boolean);

const normalizeSectionTitle = (value = "") =>
  normalizeText(value)
    .replace(/^\d+\.\s*/, "")
    .replace(/\s*&\s*/g, " & ")
    .toLowerCase();

const findSectionByTitle = (sections, titles = []) => {
  const titleList = Array.isArray(titles) ? titles : [titles];
  const normalizedTitles = titleList.map((title) => normalizeSectionTitle(title));

  return (
    sections.find((section) => {
      const sectionTitle = getElementText(getFirstDirectChild(section, "h2"));
      const normalizedSectionTitle = normalizeSectionTitle(sectionTitle);

      return (
        titleList.some((title) => sectionTitle.toLowerCase() === title.toLowerCase()) ||
        normalizedTitles.includes(normalizedSectionTitle)
      );
    }) || null
  );
};

const getSectionByTitle = (sections, title, fallbackIndex) =>
  findSectionByTitle(sections, title) || sections[fallbackIndex] || null;

const formatLastUpdatedLabel = (value) => {
  if (!value) {
    return `Last updated: ${TERMS_DEFAULT.fallbackDate}`;
  }

  return `Last updated: ${new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))}`;
};

const buildTermsContent = (body = "", updatedAt = null) => {
  const sanitizedBody = sanitizeLegalDocumentHtml(body);
  const fallback = TERMS_DEFAULT;

  if (!sanitizedBody || typeof DOMParser === "undefined") {
    return {
      ...fallback,
      lastUpdatedLabel: formatLastUpdatedLabel(updatedAt),
    };
  }

  const parsedDocument = new DOMParser().parseFromString(sanitizedBody, "text/html");
  const sections = getDirectChildren(parsedDocument.body, "section");

  if (!sections.length) {
    return {
      ...fallback,
      lastUpdatedLabel: formatLastUpdatedLabel(updatedAt),
    };
  }

  const introductionSection = getSectionByTitle(sections, "1. Introduction", 0);
  const eligibilitySection = getSectionByTitle(sections, "2. Eligibility & Account Responsibility", 1);
  const platformRoleSection = getSectionByTitle(sections, "3. Platform Role", 2);
  const jobRulesSection = getSectionByTitle(sections, "4. Job Posting & Acceptance Rules", 3);
  const paymentsSection = getSectionByTitle(sections, "5. Payments & Platform Fees", 4);
  const refundPolicySection = findSectionByTitle(sections, [
    "6. Refund & Cancellation Policy",
    "Refund & Cancellation Policy",
  ]);
  const disputesSection =
    findSectionByTitle(sections, [
      "7. Job Completion & Disputes",
      "6. Job Completion & Disputes",
      "Job Completion & Disputes",
    ]) ||
    sections[6] ||
    sections[5] ||
    null;

  const introParagraphs = getDirectChildren(introductionSection, "p");
  const jobRulesHeadings = getDirectChildren(jobRulesSection, "h3");
  const jobRulesLists = getDirectChildren(jobRulesSection, "ul");
  const paymentsParagraphs = getDirectChildren(paymentsSection, "p");
  const paymentsBlockquote = getFirstDirectChild(paymentsSection, "blockquote");
  const paymentsBlockquoteParagraphs = getDirectChildren(paymentsBlockquote, "p");
  const paymentsStrong = paymentsBlockquote?.querySelector("strong");
  const refundPolicyHeadings = getDirectChildren(refundPolicySection, "h3");
  const refundPolicyParagraphs = getDirectChildren(refundPolicySection, "p");
  const refundPolicyLists = getDirectChildren(refundPolicySection, "ul");

  return {
    heroDescription:
      getElementText(getFirstDirectChild(parsedDocument.body, "p")) || fallback.heroDescription,
    lastUpdatedLabel: formatLastUpdatedLabel(updatedAt),
    sections: {
      introduction: {
        title:
          getElementText(getFirstDirectChild(introductionSection, "h2")) ||
          fallback.sections.introduction.title,
        paragraphs:
          introParagraphs.length > 0
            ? introParagraphs.map((paragraph) => getElementText(paragraph)).filter(Boolean)
            : fallback.sections.introduction.paragraphs,
      },
      eligibility: {
        title:
          getElementText(getFirstDirectChild(eligibilitySection, "h2")) ||
          fallback.sections.eligibility.title,
        intro:
          getElementText(getFirstDirectChild(eligibilitySection, "p")) ||
          fallback.sections.eligibility.intro,
        items:
          getListItems(getFirstDirectChild(eligibilitySection, "ul")).length > 0
            ? getListItems(getFirstDirectChild(eligibilitySection, "ul"))
            : fallback.sections.eligibility.items,
      },
      platformRole: {
        title:
          getElementText(getFirstDirectChild(platformRoleSection, "h2")) ||
          fallback.sections.platformRole.title,
        intro:
          getElementText(getDirectChildren(platformRoleSection, "p")[0]) ||
          fallback.sections.platformRole.intro,
        emphasis:
          getElementText(getDirectChildren(platformRoleSection, "p")[1]) ||
          fallback.sections.platformRole.emphasis,
        items:
          getListItems(getFirstDirectChild(platformRoleSection, "ul")).length > 0
            ? getListItems(getFirstDirectChild(platformRoleSection, "ul"))
            : fallback.sections.platformRole.items,
      },
      jobRules: {
        title:
          getElementText(getFirstDirectChild(jobRulesSection, "h2")) ||
          fallback.sections.jobRules.title,
        customerTitle:
          getElementText(jobRulesHeadings[0]) || fallback.sections.jobRules.customerTitle,
        customerItems:
          getListItems(jobRulesLists[0]).length > 0
            ? getListItems(jobRulesLists[0])
            : fallback.sections.jobRules.customerItems,
        workerTitle:
          getElementText(jobRulesHeadings[1]) || fallback.sections.jobRules.workerTitle,
        workerItems:
          getListItems(jobRulesLists[1]).length > 0
            ? getListItems(jobRulesLists[1])
            : fallback.sections.jobRules.workerItems,
      },
      payments: {
        title:
          getElementText(getFirstDirectChild(paymentsSection, "h2")) ||
          fallback.sections.payments.title,
        intro:
          getElementText(paymentsParagraphs[0]) || fallback.sections.payments.intro,
        feeTitle: getElementText(paymentsStrong) || fallback.sections.payments.feeTitle,
        feeDescription:
          paymentsBlockquoteParagraphs.map((paragraph) => getElementText(paragraph)).join(" ") ||
          fallback.sections.payments.feeDescription,
        processTitle:
          getElementText(getFirstDirectChild(paymentsSection, "h3")) ||
          fallback.sections.payments.processTitle,
        items:
          getListItems(getDirectChildren(paymentsSection, "ul")[0]).length > 0
            ? getListItems(getDirectChildren(paymentsSection, "ul")[0])
            : fallback.sections.payments.items,
      },
      refundPolicy: {
        title:
          getElementText(getFirstDirectChild(refundPolicySection, "h2")) ||
          fallback.sections.refundPolicy.title,
        intro:
          getElementText(refundPolicyParagraphs[0]) || fallback.sections.refundPolicy.intro,
        fullRefundsTitle:
          getElementText(refundPolicyHeadings[0]) ||
          fallback.sections.refundPolicy.fullRefundsTitle,
        fullRefundsIntro:
          getElementText(refundPolicyParagraphs[1]) ||
          fallback.sections.refundPolicy.fullRefundsIntro,
        fullRefundItems:
          getListItems(refundPolicyLists[0]).length > 0
            ? getListItems(refundPolicyLists[0])
            : fallback.sections.refundPolicy.fullRefundItems,
        partialRefundsTitle:
          getElementText(refundPolicyHeadings[1]) ||
          fallback.sections.refundPolicy.partialRefundsTitle,
        partialRefundsIntro:
          getElementText(refundPolicyParagraphs[2]) ||
          fallback.sections.refundPolicy.partialRefundsIntro,
        partialRefundItems:
          getListItems(refundPolicyLists[1]).length > 0
            ? getListItems(refundPolicyLists[1])
            : fallback.sections.refundPolicy.partialRefundItems,
        retentionNote:
          getElementText(refundPolicyParagraphs[3]) ||
          fallback.sections.refundPolicy.retentionNote,
        additionalNotesTitle:
          getElementText(refundPolicyHeadings[2]) ||
          fallback.sections.refundPolicy.additionalNotesTitle,
        additionalNotesItems:
          getListItems(refundPolicyLists[2]).length > 0
            ? getListItems(refundPolicyLists[2])
            : fallback.sections.refundPolicy.additionalNotesItems,
      },
      disputes: {
        title:
          getElementText(getFirstDirectChild(disputesSection, "h2")) ||
          fallback.sections.disputes.title,
        intro:
          getElementText(getFirstDirectChild(disputesSection, "p")) ||
          fallback.sections.disputes.intro,
        items:
          getListItems(getFirstDirectChild(disputesSection, "ul")).length > 0
            ? getListItems(getFirstDirectChild(disputesSection, "ul"))
            : fallback.sections.disputes.items,
      },
    },
  };
};

const SectionList = ({ items = [] }) => (
  <ul className="space-y-[19px]">
    {items.map((item, index) => (
      <li
        key={`${item}-${index}`}
        className="flex items-start gap-3 text-[18px] leading-[30px] tracking-[-0.5px] text-[#374151]"
      >
        <span className="mt-[12px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#374151]" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const EmptyState = ({ title, description }) => (
  <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-[#E5E7EB] bg-white px-6 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef7f0] text-[#0A3019]">
      <FileText className="h-8 w-8" />
    </div>
    <h2 className="mt-6 text-2xl font-bold text-[#10231a]">{title}</h2>
    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#53655a]">{description}</p>
  </div>
);

export default function TermsConditionsPageContent() {
  const definition = useMemo(() => getLegalDocumentDefinition("terms-of-service"), []);
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadDocument = async () => {
      setIsLoading(true);
      setError("");

      try {
        const currentDocument = await contentApi.getLegalDocument("terms-of-service");

        if (!ignore) {
          setDocument(currentDocument);
        }
      } catch (apiError) {
        if (!ignore) {
          setDocument(null);
          setError(
            apiError?.response?.status === 404
              ? "This legal document is currently unavailable."
              : getApiErrorMessage(apiError)
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      ignore = true;
    };
  }, []);

  const rawTitle = document?.name || definition?.title || "Terms & Conditions";
  const title = /^terms of service$/i.test(rawTitle) ? "Terms & Conditions" : rawTitle;
  const hasContent = hasMeaningfulLegalDocumentContent(document?.body);
  const termsContent = useMemo(
    () => buildTermsContent(document?.body, document?.updatedAt),
    [document?.body, document?.updatedAt]
  );

  return (
    <section className="min-h-screen bg-white">
      <div className="w-full bg-[linear-gradient(135deg,#F0FDF4_0%,#ECFDF5_70.71%)]">
        <div className="mx-auto flex min-h-[265px] max-w-[1440px] items-center justify-center px-6 py-[80px]">
          <div className="w-full max-w-[896px] text-center">
            <h1 className="text-[40px] font-bold leading-[48px] tracking-[-0.5px] text-[#0A3019] sm:text-[48px]">
              {title}
            </h1>
            <p className="mx-auto mt-[24px] max-w-[603px] text-[18px] leading-7 tracking-[-0.005em] text-[#4B5563] sm:text-[20px]">
              {termsContent.heroDescription}
            </p>
            <p className="mt-[41px] text-[14px] leading-5 tracking-[-0.5px] text-[#6B7280]">
              {termsContent.lastUpdatedLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] justify-center px-6 py-[64px] lg:px-[272px]">
        <div className="w-full max-w-[896px]">
          {isLoading ? (
            <div className="flex min-h-[520px] items-center justify-center text-sm text-[#53655a]">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Loading legal document...
            </div>
          ) : error ? (
            <EmptyState title={title} description={error} />
          ) : !hasContent ? (
            <EmptyState
              title={title}
              description="This document exists, but no content has been published from the admin dashboard yet."
            />
          ) : (
            <div className="space-y-16">
              <section className="space-y-[19px]">
                <h2 className="text-[30px] font-bold leading-9 tracking-[-0.005em] text-[#202326]">
                  {termsContent.sections.introduction.title}
                </h2>
                {termsContent.sections.introduction.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="max-w-[835px] text-[18px] leading-[30px] tracking-[-0.5px] text-[#374151]"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>

              <div className="space-y-16">
                <section className="space-y-[19px]">
                  <h2 className="text-[30px] font-bold leading-9 tracking-[-0.005em] text-[#202326]">
                    {termsContent.sections.eligibility.title}
                  </h2>
                  <p className="max-w-[839px] text-[18px] leading-[30px] tracking-[-0.5px] text-[#374151]">
                    {termsContent.sections.eligibility.intro}
                  </p>
                  <SectionList items={termsContent.sections.eligibility.items} />
                </section>

                <section className="space-y-[18px]">
                  <h2 className="text-[30px] font-bold leading-9 tracking-[-0.005em] text-[#202326]">
                    {termsContent.sections.platformRole.title}
                  </h2>
                  <p className="max-w-[791px] text-[18px] leading-[30px] tracking-[-0.5px] text-[#374151]">
                    {termsContent.sections.platformRole.intro}
                  </p>
                  <p className="text-[18px] font-bold leading-[30px] tracking-[-0.5px] text-[#374151]">
                    {termsContent.sections.platformRole.emphasis}
                  </p>
                  <SectionList items={termsContent.sections.platformRole.items} />
                </section>
              </div>

              <section className="space-y-6">
                <h2 className="text-[30px] font-bold leading-9 tracking-[-0.005em] text-[#202326]">
                  {termsContent.sections.jobRules.title}
                </h2>

                <div className="space-y-6">
                  <h3 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-[#202326]">
                    {termsContent.sections.jobRules.customerTitle}
                  </h3>
                  <SectionList items={termsContent.sections.jobRules.customerItems} />
                </div>

                <div className="space-y-6">
                  <h3 className="text-[24px] font-semibold leading-8 tracking-[-0.5px] text-[#202326]">
                    {termsContent.sections.jobRules.workerTitle}
                  </h3>
                  <SectionList items={termsContent.sections.jobRules.workerItems} />
                </div>
              </section>

              <section className="space-y-[22px]">
                <h2 className="text-[30px] font-bold leading-9 tracking-[-0.005em] text-[#202326]">
                  {termsContent.sections.payments.title}
                </h2>
                <p className="max-w-[825px] text-[18px] leading-[30px] tracking-[-0.5px] text-[#374151]">
                  {termsContent.sections.payments.intro}
                </p>

                <div className="bg-[#F0FDF4] px-7 py-6">
                  <p className="text-[18px] font-semibold leading-[22px] tracking-[-0.5px] text-[#202326]">
                    {termsContent.sections.payments.feeTitle}
                  </p>
                  <p className="mt-4 max-w-[844px] text-[18px] leading-[30px] tracking-[-0.5px] text-[#374151]">
                    {termsContent.sections.payments.feeDescription}
                  </p>
                </div>

                <h3 className="text-[24px] font-semibold leading-8 tracking-[-0.005em] text-[#202326]">
                  {termsContent.sections.payments.processTitle}
                </h3>
                <SectionList items={termsContent.sections.payments.items} />
              </section>

              <section className="space-y-[22px]">
                <h2 className="text-[30px] font-bold leading-9 tracking-[-0.005em] text-[#202326]">
                  {termsContent.sections.refundPolicy.title}
                </h2>
                <p className="max-w-[838px] text-[18px] leading-[30px] tracking-[-0.5px] text-[#374151]">
                  {termsContent.sections.refundPolicy.intro}
                </p>

                <div className="space-y-6">
                  <h3 className="text-[24px] font-semibold leading-8 tracking-[-0.005em] text-[#202326]">
                    {termsContent.sections.refundPolicy.fullRefundsTitle}
                  </h3>
                  <p className="max-w-[838px] text-[18px] leading-[30px] tracking-[-0.5px] text-[#374151]">
                    {termsContent.sections.refundPolicy.fullRefundsIntro}
                  </p>
                  <SectionList items={termsContent.sections.refundPolicy.fullRefundItems} />
                </div>

                <div className="space-y-6">
                  <h3 className="text-[24px] font-semibold leading-8 tracking-[-0.005em] text-[#202326]">
                    {termsContent.sections.refundPolicy.partialRefundsTitle}
                  </h3>
                  <p className="max-w-[838px] text-[18px] leading-[30px] tracking-[-0.5px] text-[#374151]">
                    {termsContent.sections.refundPolicy.partialRefundsIntro}
                  </p>
                  <SectionList items={termsContent.sections.refundPolicy.partialRefundItems} />
                </div>

                <p className="max-w-[838px] text-[18px] leading-[30px] tracking-[-0.5px] text-[#374151]">
                  {termsContent.sections.refundPolicy.retentionNote}
                </p>

                <div className="space-y-6">
                  <h3 className="text-[24px] font-semibold leading-8 tracking-[-0.005em] text-[#202326]">
                    {termsContent.sections.refundPolicy.additionalNotesTitle}
                  </h3>
                  <SectionList items={termsContent.sections.refundPolicy.additionalNotesItems} />
                </div>
              </section>

              <section className="space-y-[19px]">
                <h2 className="text-[30px] font-bold leading-9 tracking-[-0.005em] text-[#202326]">
                  {termsContent.sections.disputes.title}
                </h2>
                <p className="max-w-[838px] text-[18px] leading-[30px] tracking-[-0.5px] text-[#374151]">
                  {termsContent.sections.disputes.intro}
                </p>
                <SectionList items={termsContent.sections.disputes.items} />
              </section>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
