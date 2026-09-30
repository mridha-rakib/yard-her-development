"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BellRing,
  CircleCheck,
  CreditCard,
  Database,
  Eye,
  FileLock2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MessageCircleMore,
  Settings2,
  ShieldCheck,
  SquarePen,
  Trash2,
  UsersRound,
} from "lucide-react";
import { contentApi } from "@/lib/api/content-api";
import { getApiErrorMessage } from "@/lib/api/http";
import {
  getLegalDocumentDefinition,
  hasMeaningfulLegalDocumentContent,
  sanitizeLegalDocumentHtml,
} from "@/lib/legal-documents";

const PRIVACY_POLICY_DEFAULT = {
  description:
    "Your privacy matters to us. We're committed to protecting your personal information and being transparent about how we use it.",
  fallbackDate: "January 8, 2025",
  sections: {
    information: {
      title: "Information We Collect",
      description:
        "We collect information to provide better services to our users and facilitate connections between customers and yard work professionals.",
      cardTitle: "Personal Information",
      items: [
        "Name, email address, and phone number for account creation and communication",
        "Address and location data to match you with nearby services or opportunities",
        "Profile photos and work portfolio images you choose to upload",
        "Payment information processed securely through our payment partners",
      ],
    },
    usage: {
      title: "How We Use Your Information",
      description:
        "Your information helps us create a safe, efficient platform for yard work services.",
      cards: [
        {
          title: "Job Matching",
          description:
            "Connect customers with qualified Heroes based on location, skills, and availability.",
        },
        {
          title: "Communication",
          description:
            "Enable secure messaging between customers and Heroes for job coordination.",
        },
        {
          title: "Payments",
          description:
            "Process secure payments and maintain transaction records for completed jobs.",
        },
      ],
    },
    sharing: {
      title: "Information Sharing",
      description:
        "We only share information when necessary to provide our services or as required by law.",
      policyTitle: "Limited Sharing Policy",
      items: [
        {
          label: "With other users",
          description:
            "Only job-related contact information when you're matched for a service",
        },
        {
          label: "Payment providers",
          description: "Necessary information to process payments securely",
        },
        {
          label: "Legal requirements",
          description: "When required by law or to protect our users' safety",
        },
      ],
    },
    security: {
      title: "Data Protection & Security",
      description:
        "We implement industry-standard security measures to protect your personal information.",
      measuresTitle: "Security Measures",
      measures: [
        "SSL encryption for all data transmission",
        "Secure data storage with regular backups",
        "Regular security audits and updates",
        "Limited employee access to personal data",
      ],
      cookiesTitle: "Cookies & Tracking",
      cookiesDescription:
        "We use cookies to improve your experience and remember your preferences. You can control cookie settings in your browser.",
      cookiesItems: [
        "Essential cookies for site functionality",
        "Analytics cookies to improve our service",
      ],
    },
    rights: {
      title: "Your Rights",
      description:
        "You have control over your personal information and can manage it at any time.",
      cards: [
        {
          title: "Access",
          description:
            "View and download all personal information we have about you",
        },
        {
          title: "Update",
          description:
            "Modify or correct your personal information through your account settings",
        },
        {
          title: "Delete",
          description:
            "Request deletion of your account and associated personal data",
        },
      ],
    },
    changes: {
      title: "Changes to This Policy",
      description:
        "We may update this Privacy Policy from time to time. When we make significant changes, we'll notify you through email or a prominent notice on our platform. We encourage you to review this policy periodically to stay informed about how we protect your information.",
    },
    contact: {
      title: "Questions About Your Privacy?",
      description:
        "If you have any questions about this Privacy Policy or how we handle your personal information, we're here to help.",
      actions: [
        {
          label: "yardheroinfo@gmail.com",
          href: "mailto:yardheroinfo@gmail.com",
          type: "mail",
        },
        {
          label: "Contact Support",
          href: "/contact",
          type: "link",
        },
      ],
    },
  },
};

const USAGE_CARD_STYLES = [
  {
    icon: UsersRound,
    iconColor: "text-[#0A3019]",
    iconBackground: "bg-[#DCFCE7]",
  },
  {
    icon: MessageCircleMore,
    iconColor: "text-[#2563EB]",
    iconBackground: "bg-[#DBEAFE]",
  },
  {
    icon: CreditCard,
    iconColor: "text-[#9333EA]",
    iconBackground: "bg-[#F3E8FF]",
  },
];

const RIGHTS_CARD_STYLES = [
  {
    icon: Eye,
    iconColor: "text-[#2563EB]",
    iconBackground: "bg-[#DBEAFE]",
  },
  {
    icon: SquarePen,
    iconColor: "text-[#16A34A]",
    iconBackground: "bg-[#DCFCE7]",
  },
  {
    icon: Trash2,
    iconColor: "text-[#DC2626]",
    iconBackground: "bg-[#FEE2E2]",
  },
];

const SECTION_ICONS = {
  information: Database,
  usage: Settings2,
  sharing: ShieldCheck,
  security: LockKeyhole,
  rights: FileLock2,
  changes: BellRing,
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

const splitLabeledText = (value = "") => {
  const normalizedValue = normalizeText(value);
  const separatorIndex = normalizedValue.indexOf(":");

  if (separatorIndex < 0) {
    return {
      label: "",
      description: normalizedValue,
    };
  }

  return {
    label: normalizedValue.slice(0, separatorIndex).trim(),
    description: normalizedValue.slice(separatorIndex + 1).trim(),
  };
};

const getLabeledListItems = (listNode) =>
  getDirectChildren(listNode, "li")
    .map((item) => {
      const strongNode = item.querySelector("strong");
      const fullText = getElementText(item);

      if (strongNode) {
        const label = getElementText(strongNode).replace(/:\s*$/, "");
        const description = fullText.replace(new RegExp(`^${label}\\s*:?\\s*`, "i"), "").trim();

        return {
          label,
          description: description || fullText,
        };
      }

      return splitLabeledText(fullText);
    })
    .filter((item) => item.label || item.description);

const getSectionByTitle = (sections, title, fallbackIndex) =>
  sections.find(
    (section) =>
      getElementText(getFirstDirectChild(section, "h2")).toLowerCase() === title.toLowerCase()
  ) || sections[fallbackIndex] || null;

const formatLastUpdatedLabel = (value) => {
  if (!value) {
    return `Last updated: ${PRIVACY_POLICY_DEFAULT.fallbackDate}`;
  }

  return `Last updated: ${new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))}`;
};

const buildPrivacyPolicyContent = (body = "", updatedAt = null) => {
  const sanitizedBody = sanitizeLegalDocumentHtml(body);
  const fallback = PRIVACY_POLICY_DEFAULT;

  if (
    !sanitizedBody ||
    typeof window === "undefined" ||
    typeof DOMParser === "undefined"
  ) {
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

  const informationSection = getSectionByTitle(sections, "Information We Collect", 0);
  const usageSection = getSectionByTitle(sections, "How We Use Your Information", 1);
  const sharingSection = getSectionByTitle(sections, "Information Sharing", 2);
  const securitySection = getSectionByTitle(sections, "Data Protection & Security", 3);
  const rightsSection = getSectionByTitle(sections, "Your Rights", 4);
  const changesSection = getSectionByTitle(sections, "Changes to This Policy", 5);
  const contactSection = getSectionByTitle(sections, "Questions About Your Privacy?", 6);

  const infoBox = getFirstDirectChild(informationSection, "div");
  const usageCardsContainer = getFirstDirectChild(usageSection, "div");
  const usageCards = getDirectChildren(usageCardsContainer, "div");
  const sharingCallout = getFirstDirectChild(sharingSection, "div");
  const securityColumns = getFirstDirectChild(securitySection, "div");
  const securityColumnItems = getDirectChildren(securityColumns, "div");
  const rightsCardsContainer = getFirstDirectChild(rightsSection, "div");
  const rightsCards = getDirectChildren(rightsCardsContainer, "div");
  const contactParagraphs = getDirectChildren(contactSection, "p");
  const actionLinks = Array.from(contactSection?.querySelectorAll("a") || []);

  return {
    description:
      getElementText(getFirstDirectChild(parsedDocument.body, "p")) || fallback.description,
    lastUpdatedLabel: formatLastUpdatedLabel(updatedAt),
    sections: {
      information: {
        title:
          getElementText(getFirstDirectChild(informationSection, "h2")) ||
          fallback.sections.information.title,
        description:
          getElementText(getFirstDirectChild(informationSection, "p")) ||
          fallback.sections.information.description,
        cardTitle:
          getElementText(getFirstDirectChild(infoBox, "h3")) ||
          fallback.sections.information.cardTitle,
        items:
          getListItems(getFirstDirectChild(infoBox, "ul")).length > 0
            ? getListItems(getFirstDirectChild(infoBox, "ul"))
            : fallback.sections.information.items,
      },
      usage: {
        title:
          getElementText(getFirstDirectChild(usageSection, "h2")) ||
          fallback.sections.usage.title,
        description:
          getElementText(getFirstDirectChild(usageSection, "p")) ||
          fallback.sections.usage.description,
        cards:
          usageCards.length > 0
            ? usageCards.map((card, index) => ({
                title:
                  getElementText(getFirstDirectChild(card, "h3")) ||
                  fallback.sections.usage.cards[index]?.title ||
                  `Card ${index + 1}`,
                description:
                  getElementText(getFirstDirectChild(card, "p")) ||
                  fallback.sections.usage.cards[index]?.description ||
                  "",
              }))
            : fallback.sections.usage.cards,
      },
      sharing: {
        title:
          getElementText(getFirstDirectChild(sharingSection, "h2")) ||
          fallback.sections.sharing.title,
        description:
          getElementText(getFirstDirectChild(sharingSection, "p")) ||
          fallback.sections.sharing.description,
        policyTitle:
          getElementText(getFirstDirectChild(sharingCallout, "h3")) ||
          fallback.sections.sharing.policyTitle,
        items:
          getLabeledListItems(getFirstDirectChild(sharingCallout, "ul")).length > 0
            ? getLabeledListItems(getFirstDirectChild(sharingCallout, "ul"))
            : fallback.sections.sharing.items,
      },
      security: {
        title:
          getElementText(getFirstDirectChild(securitySection, "h2")) ||
          fallback.sections.security.title,
        description:
          getElementText(getFirstDirectChild(securitySection, "p")) ||
          fallback.sections.security.description,
        measuresTitle:
          getElementText(getFirstDirectChild(securityColumnItems[0], "h3")) ||
          fallback.sections.security.measuresTitle,
        measures:
          getListItems(getFirstDirectChild(securityColumnItems[0], "ul")).length > 0
            ? getListItems(getFirstDirectChild(securityColumnItems[0], "ul"))
            : fallback.sections.security.measures,
        cookiesTitle:
          getElementText(getFirstDirectChild(securityColumnItems[1], "h3")) ||
          fallback.sections.security.cookiesTitle,
        cookiesDescription:
          getElementText(getFirstDirectChild(securityColumnItems[1], "p")) ||
          fallback.sections.security.cookiesDescription,
        cookiesItems:
          getListItems(getFirstDirectChild(securityColumnItems[1], "ul")).length > 0
            ? getListItems(getFirstDirectChild(securityColumnItems[1], "ul"))
            : fallback.sections.security.cookiesItems,
      },
      rights: {
        title:
          getElementText(getFirstDirectChild(rightsSection, "h2")) ||
          fallback.sections.rights.title,
        description:
          getElementText(getFirstDirectChild(rightsSection, "p")) ||
          fallback.sections.rights.description,
        cards:
          rightsCards.length > 0
            ? rightsCards.map((card, index) => ({
                title:
                  getElementText(getFirstDirectChild(card, "h3")) ||
                  fallback.sections.rights.cards[index]?.title ||
                  `Right ${index + 1}`,
                description:
                  getElementText(getFirstDirectChild(card, "p")) ||
                  fallback.sections.rights.cards[index]?.description ||
                  "",
              }))
            : fallback.sections.rights.cards,
      },
      changes: {
        title:
          getElementText(getFirstDirectChild(changesSection, "h2")) ||
          fallback.sections.changes.title,
        description:
          getElementText(getFirstDirectChild(changesSection, "p")) ||
          fallback.sections.changes.description,
      },
      contact: {
        title:
          getElementText(getFirstDirectChild(contactSection, "h2")) ||
          fallback.sections.contact.title,
        description:
          getElementText(contactParagraphs[0]) || fallback.sections.contact.description,
        actions:
          actionLinks.length > 0
            ? actionLinks.map((action, index) => ({
                label:
                  getElementText(action) ||
                  fallback.sections.contact.actions[index]?.label ||
                  "Learn More",
                href:
                  action.getAttribute("href") ||
                  fallback.sections.contact.actions[index]?.href ||
                  "#",
                type: fallback.sections.contact.actions[index]?.type || "link",
              }))
            : fallback.sections.contact.actions,
      },
    },
  };
};

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-4">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#0A3019]/10">
      <Icon className="h-5 w-5 text-[#0A3019]" />
    </div>
    <div className="space-y-3">
      <h2 className="text-[24px] font-bold leading-8 tracking-[-0.5px] text-[#202326]">
        {title}
      </h2>
      <p className="text-[16px] leading-[26px] tracking-[-0.5px] text-[#4B5563]">
        {description}
      </p>
    </div>
  </div>
);

const EmptyState = ({ title, description }) => (
  <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-[#E5E7EB] bg-white px-6 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef7f0] text-[#0A3019]">
      <FileLock2 className="h-8 w-8" />
    </div>
    <h2 className="mt-6 text-2xl font-bold text-[#10231a]">{title}</h2>
    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#53655a]">{description}</p>
  </div>
);

export default function PrivacyPolicyPageContent() {
  const definition = useMemo(
    () => getLegalDocumentDefinition("privacy-policy"),
    []
  );
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadDocument = async () => {
      setIsLoading(true);
      setError("");

      try {
        const currentDocument = await contentApi.getLegalDocument("privacy-policy");

        if (!ignore) {
          setDocument(currentDocument);
        }
      } catch (apiError) {
        if (!ignore) {
          setDocument(null);
          setError(
            apiError?.response?.status === 404
              ? "This privacy policy is currently unavailable."
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

  const title = document?.name || definition?.title || "Privacy Policy";
  const hasContent = hasMeaningfulLegalDocumentContent(document?.body);
  const policyContent = useMemo(
    () => buildPrivacyPolicyContent(document?.body, document?.updatedAt),
    [document?.body, document?.updatedAt]
  );

  return (
    <section className="min-h-screen bg-white">
      <div className="w-full bg-[linear-gradient(135deg,#F0FDF4_0%,#ECFDF5_70.71%)]">
        <div className="mx-auto flex min-h-[349px] max-w-[1440px] items-center justify-center px-6 py-16">
          <div className="w-full max-w-[896px] text-center">
            <h1 className="text-[42px] font-bold leading-[48px] tracking-[-0.5px] text-[#0A3019] sm:text-[48px]">
              {title}
            </h1>
            <p className="mx-auto mt-[18px] max-w-[603px] text-[20px] leading-7 tracking-[-0.005em] text-[#4B5563]">
              {policyContent.description}
            </p>
            <p className="mt-7 text-[14px] leading-5 tracking-[-0.5px] text-[#6B7280]">
              {policyContent.lastUpdatedLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[896px] px-6 py-16">
        {isLoading ? (
          <div className="flex min-h-[520px] items-center justify-center text-sm text-[#53655a]">
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Loading privacy policy...
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
            <section className="space-y-6">
              <SectionHeader
                icon={SECTION_ICONS.information}
                title={policyContent.sections.information.title}
                description={policyContent.sections.information.description}
              />

              <div className="rounded-xl bg-[#F9FAFB] px-8 py-8">
                <h3 className="text-[18px] font-semibold leading-7 tracking-[-0.5px] text-[#202326]">
                  {policyContent.sections.information.cardTitle}
                </h3>
                <ul className="mt-5 space-y-3">
                  {policyContent.sections.information.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-[16px] leading-6 tracking-[-0.5px] text-[#4B5563]"
                    >
                      <CircleCheck className="mt-1 h-4 w-4 shrink-0 text-[#0A3019]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="space-y-6">
              <SectionHeader
                icon={SECTION_ICONS.usage}
                title={policyContent.sections.usage.title}
                description={policyContent.sections.usage.description}
              />

              <div className="grid gap-6 md:grid-cols-3">
                {policyContent.sections.usage.cards.map((card, index) => {
                  const style = USAGE_CARD_STYLES[index] || USAGE_CARD_STYLES[0];
                  const Icon = style.icon;

                  return (
                    <div
                      key={card.title}
                      className="rounded-xl border border-[#E5E7EB] bg-white px-[25px] py-[25px]"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${style.iconBackground}`}
                      >
                        <Icon className={`h-5 w-5 ${style.iconColor}`} />
                      </div>
                      <h3 className="mt-6 text-[18px] font-semibold leading-[22px] tracking-[-0.5px] text-[#202326]">
                        {card.title}
                      </h3>
                      <p className="mt-3 text-[14px] leading-[17px] tracking-[-0.5px] text-[#4B5563]">
                        {card.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="space-y-6">
              <SectionHeader
                icon={SECTION_ICONS.sharing}
                title={policyContent.sections.sharing.title}
                description={policyContent.sections.sharing.description}
              />

              <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-[33px] py-[33px]">
                <div className="flex items-start gap-4">
                  <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-[#D97706]" />
                  <div className="space-y-4">
                    <h3 className="text-[18px] font-semibold leading-7 tracking-[-0.5px] text-[#202326]">
                      {policyContent.sections.sharing.policyTitle}
                    </h3>
                    <ul className="space-y-3">
                      {policyContent.sections.sharing.items.map((item) => (
                        <li
                          key={`${item.label}-${item.description}`}
                          className="flex items-start gap-3 text-[16px] leading-6 tracking-[-0.5px] text-[#374151]"
                        >
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#F59E0B]" />
                          <span>
                            {item.label ? <strong>{item.label}:</strong> : null}{" "}
                            {item.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <SectionHeader
                icon={SECTION_ICONS.security}
                title={policyContent.sections.security.title}
                description={policyContent.sections.security.description}
              />

              <div className="grid gap-8 md:grid-cols-[408px_1fr]">
                <div>
                  <h3 className="text-[18px] font-semibold leading-7 tracking-[-0.5px] text-[#202326]">
                    {policyContent.sections.security.measuresTitle}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {policyContent.sections.security.measures.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-[16px] leading-6 tracking-[-0.5px] text-[#4B5563]"
                      >
                        <CircleCheck className="mt-1 h-4 w-4 shrink-0 text-[#22C55E]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-[18px] font-semibold leading-7 tracking-[-0.5px] text-[#202326]">
                    {policyContent.sections.security.cookiesTitle}
                  </h3>
                  <div className="mt-4 rounded-lg bg-[#F9FAFB] px-6 py-6">
                    <p className="text-[14px] leading-[17px] tracking-[-0.5px] text-[#4B5563]">
                      {policyContent.sections.security.cookiesDescription}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {policyContent.sections.security.cookiesItems.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-[14px] leading-5 tracking-[-0.5px] text-[#4B5563]"
                        >
                          <span className="mt-[6px] h-2 w-2 shrink-0 rounded-full bg-[#0A3019]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <SectionHeader
                icon={SECTION_ICONS.rights}
                title={policyContent.sections.rights.title}
                description={policyContent.sections.rights.description}
              />

              <div className="grid gap-6 md:grid-cols-3">
                {policyContent.sections.rights.cards.map((card, index) => {
                  const style = RIGHTS_CARD_STYLES[index] || RIGHTS_CARD_STYLES[0];
                  const Icon = style.icon;

                  return (
                    <div key={card.title} className="text-center">
                      <div
                        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-xl ${style.iconBackground}`}
                      >
                        <Icon className={`h-5 w-5 ${style.iconColor}`} />
                      </div>
                      <h3 className="mt-4 text-[18px] font-semibold leading-7 tracking-[-0.5px] text-[#202326]">
                        {card.title}
                      </h3>
                      <p className="mx-auto mt-2 max-w-[234px] text-[14px] leading-5 tracking-[-0.5px] text-[#4B5563]">
                        {card.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="rounded-xl border border-[#0A3019]/20 bg-[#0A3019]/5 px-[33px] py-[33px]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#0A3019]/10">
                    <BellRing className="h-5 w-5 text-[#0A3019]" />
                  </div>
                  <div>
                    <h2 className="text-[24px] font-bold leading-8 tracking-[-0.5px] text-[#202326]">
                      {policyContent.sections.changes.title}
                    </h2>
                    <p className="mt-4 text-[16px] leading-[26px] tracking-[-0.5px] text-[#374151]">
                      {policyContent.sections.changes.description}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="rounded-2xl bg-[#0A3019] px-8 py-10 text-center">
                <h2 className="text-[24px] font-bold leading-8 tracking-[-0.5px] text-white">
                  {policyContent.sections.contact.title}
                </h2>
                <p className="mx-auto mt-4 max-w-[591px] text-[16px] leading-[26px] tracking-[-0.5px] text-[#DCFCE7]">
                  {policyContent.sections.contact.description}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-6">
                  {policyContent.sections.contact.actions.map((action) => {
                    const isMail = action.type === "mail";
                    const content = (
                      <>
                        {isMail ? (
                          <Mail className="h-4 w-4 text-white" />
                        ) : (
                          <MessageCircleMore className="h-4 w-4 text-white" />
                        )}
                        <span>{action.label}</span>
                      </>
                    );

                    if (action.href.startsWith("/")) {
                      return (
                        <Link
                          key={action.label}
                          href={action.href}
                          className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-white/20 px-6 text-[16px] leading-[19px] tracking-[-0.5px] text-white"
                        >
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <a
                        key={action.label}
                        href={action.href}
                        className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-white/20 px-6 text-[16px] leading-[19px] tracking-[-0.5px] text-white"
                      >
                        {content}
                      </a>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </section>
  );
}
