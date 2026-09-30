"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BellRing,
  CircleCheck,
  Database,
  FileLock2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MessageCircleMore,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { contentApi } from "@/lib/api/content-api";
import { getApiErrorMessage } from "@/lib/api/http";
import {
  getLegalDocumentDefinition,
  hasMeaningfulLegalDocumentContent,
  sanitizeLegalDocumentHtml,
} from "@/lib/legal-documents";

const FALLBACK_DESCRIPTION =
  "How cookies and related technologies are used across the platform.";
const FALLBACK_DATE = "January 8, 2025";
const FALLBACK_ACTIONS = [
  { label: "yardheroinfo@gmail.com", href: "mailto:yardheroinfo@gmail.com", type: "mail" },
  { label: "Contact Support", href: "/contact", type: "link" },
];

const FALLBACK_SECTIONS = [
  {
    title: "What Are Cookies?",
    description:
      "Cookies are small text files and similar technologies stored on your device when you visit our platform.",
    blocks: [
      {
        title: "Technologies We Use",
        items: [
          "Session cookies that help keep your session secure",
          "Persistent cookies that remember your settings and preferences",
          "Analytics technologies that help us understand site performance",
          "Storage tools used to support important platform features",
        ],
      },
    ],
  },
  {
    title: "Types of Cookies We Use",
    description:
      "Different categories of cookies support essential functionality, performance monitoring, and a smoother experience.",
    blocks: [
      {
        title: "Essential Cookies",
        description:
          "Required for secure sign-in, core account features, and other important site functions.",
      },
      {
        title: "Performance Cookies",
        description:
          "Help us measure usage, diagnose issues, and improve reliability over time.",
      },
      {
        title: "Preference Cookies",
        description:
          "Remember settings and choices so your experience feels more consistent between visits.",
      },
    ],
  },
  {
    title: "How We Use Cookies",
    description:
      "We use cookies where they support security, product functionality, and the overall user experience.",
    blocks: [
      {
        title: "Main Uses",
        items: [
          "Authentication: Help keep you signed in and protect secure areas of your account",
          "Site performance: Understand traffic patterns and improve usability",
          "Preferences: Remember settings so you do not need to re-enter them repeatedly",
        ],
      },
    ],
  },
  {
    title: "Managing Cookie Preferences",
    description:
      "You can manage cookies through your browser or device settings, although disabling some cookies may affect functionality.",
    blocks: [
      {
        title: "Browser Controls",
        items: [
          "Delete existing cookies from your browser settings",
          "Block new cookies or ask for permission before storage",
          "Use private browsing modes where available",
        ],
      },
      {
        title: "What To Expect",
        description:
          "Some platform features rely on essential cookies and may not work fully if those are disabled.",
        items: [
          "Saved preferences may reset between visits",
          "Secure sign-in and checkout flows may be affected",
        ],
      },
    ],
  },
  {
    title: "Third-Party Cookies",
    description:
      "Some services we rely on may set their own cookies or similar technologies when their features are used on our platform.",
    blocks: [
      {
        title: "Payments",
        description:
          "Payment providers may use cookies to secure transactions and help prevent fraud.",
      },
      {
        title: "Analytics",
        description:
          "Analytics services may help us understand how visitors use the website so we can improve it.",
      },
      {
        title: "Embedded Tools",
        description:
          "Support, communication, and security tools may place cookies when their features are loaded.",
      },
    ],
  },
  {
    title: "Changes to This Cookie Policy",
    description:
      "We may update this Cookie Policy from time to time to reflect product, legal, or technology changes.",
    blocks: [],
  },
  {
    title: "Questions About Cookies?",
    description:
      "If you have questions about how cookies or similar technologies are used on our platform, please reach out and we will help.",
    blocks: [],
    actions: FALLBACK_ACTIONS,
  },
];

const SECTION_META = [
  { icon: Database, variant: "list" },
  { icon: Settings2, variant: "cards" },
  { icon: ShieldCheck, variant: "callout" },
  { icon: LockKeyhole, variant: "columns" },
  { icon: FileLock2, variant: "feature-cards" },
  { icon: BellRing, variant: "changes" },
  { icon: MessageCircleMore, variant: "contact" },
];

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

const parseBlock = (node) => {
  if (!node) {
    return null;
  }

  if (node.tagName.toLowerCase() === "ul") {
    return {
      title: "",
      description: "",
      items: getListItems(node),
    };
  }

  return {
    title: getElementText(getFirstDirectChild(node, "h3")),
    description: getElementText(getFirstDirectChild(node, "p")),
    items: getListItems(getFirstDirectChild(node, "ul")),
  };
};

const formatLastUpdatedLabel = (value) => {
  if (!value) {
    return `Last updated: ${FALLBACK_DATE}`;
  }

  return `Last updated: ${new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))}`;
};

const buildPolicyContent = (body = "", updatedAt = null) => {
  const sanitizedBody = sanitizeLegalDocumentHtml(body);

  if (
    !sanitizedBody ||
    typeof window === "undefined" ||
    typeof DOMParser === "undefined"
  ) {
    return {
      description: FALLBACK_DESCRIPTION,
      lastUpdatedLabel: formatLastUpdatedLabel(updatedAt),
      sections: FALLBACK_SECTIONS,
    };
  }

  const parsedDocument = new DOMParser().parseFromString(sanitizedBody, "text/html");
  const parsedSections = getDirectChildren(parsedDocument.body, "section").map((section) => {
    const descriptionNode = getFirstDirectChild(section, "p");
    const blocks = getDirectChildren(section)
      .filter(
        (child) =>
          child.tagName.toLowerCase() !== "h2" &&
          child !== descriptionNode
      )
      .map(parseBlock)
      .filter(Boolean);

    return {
      title: getElementText(getFirstDirectChild(section, "h2")),
      description: getElementText(descriptionNode),
      blocks,
      actions: Array.from(section.querySelectorAll("a")).map((link) => ({
        label: getElementText(link),
        href: link.getAttribute("href") || "#",
        type: String(link.getAttribute("href") || "").startsWith("mailto:") ? "mail" : "link",
      })),
    };
  });

  return {
    description:
      getElementText(getFirstDirectChild(parsedDocument.body, "p")) || FALLBACK_DESCRIPTION,
    lastUpdatedLabel: formatLastUpdatedLabel(updatedAt),
    sections: FALLBACK_SECTIONS.map((fallbackSection, index) => ({
      ...fallbackSection,
      ...parsedSections[index],
      blocks: parsedSections[index]?.blocks?.length
        ? parsedSections[index].blocks
        : fallbackSection.blocks,
      actions: parsedSections[index]?.actions?.length
        ? parsedSections[index].actions
        : fallbackSection.actions,
    })),
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

const renderListItems = (items = [], bulletClassName = "bg-[#0A3019]") =>
  items.map((item) => {
    const { label, description } = splitLabeledText(item);

    return (
      <li
        key={item}
        className="flex items-start gap-3 text-[16px] leading-6 tracking-[-0.5px] text-[#4B5563]"
      >
        <span className={`mt-[10px] h-2 w-2 shrink-0 rounded-full ${bulletClassName}`} />
        <span>
          {label ? <strong>{label}:</strong> : null} {description || item}
        </span>
      </li>
    );
  });

const hasBlockContent = (block) =>
  Boolean(block?.title || block?.description || block?.items?.length);

const hasCardContent = (block) => Boolean(block?.title || block?.description);

export default function CookiePolicyPageContent() {
  const definition = useMemo(() => getLegalDocumentDefinition("cookie-policy"), []);
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadDocument = async () => {
      setIsLoading(true);
      setError("");

      try {
        const currentDocument = await contentApi.getLegalDocument("cookie-policy");

        if (!ignore) {
          setDocument(currentDocument);
        }
      } catch (apiError) {
        if (!ignore) {
          setDocument(null);
          setError(
            apiError?.response?.status === 404
              ? "This cookie policy is currently unavailable."
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

  const title = document?.name || definition?.title || "Cookie Policy";
  const hasContent = hasMeaningfulLegalDocumentContent(document?.body);
  const policyContent = useMemo(
    () => buildPolicyContent(document?.body, document?.updatedAt),
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
            Loading cookie policy...
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
            {policyContent.sections.map((section, index) => {
              const meta = SECTION_META[index];
              const Icon = meta.icon;
              const primaryBlock = section.blocks[0] || { title: "", description: "", items: [] };
              const secondaryBlock = section.blocks[1] || { title: "", description: "", items: [] };
              const visibleBlocks = section.blocks.filter(hasBlockContent);
              const visibleCardBlocks = section.blocks.filter(hasCardContent);
              const hasSectionHeading = Boolean(section.title || section.description);

              if (meta.variant === "contact") {
                if (!hasSectionHeading) {
                  return null;
                }

                return (
                  <section key={section.title}>
                    <div className="rounded-2xl bg-[#0A3019] px-8 py-10 text-center">
                      <h2 className="text-[24px] font-bold leading-8 tracking-[-0.5px] text-white">
                        {section.title}
                      </h2>
                      <p className="mx-auto mt-4 max-w-[591px] text-[16px] leading-[26px] tracking-[-0.5px] text-[#DCFCE7]">
                        {section.description}
                      </p>
                      <div className="mt-6 flex flex-wrap justify-center gap-6">
                        {(section.actions || FALLBACK_ACTIONS).map((action) => {
                          const actionContent = (
                            <>
                              {action.type === "mail" ? (
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
                                {actionContent}
                              </Link>
                            );
                          }

                          return (
                            <a
                              key={action.label}
                              href={action.href}
                              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-white/20 px-6 text-[16px] leading-[19px] tracking-[-0.5px] text-white"
                            >
                              {actionContent}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                );
              }

              if (meta.variant === "changes") {
                if (!hasSectionHeading) {
                  return null;
                }

                return (
                  <section key={section.title}>
                    <div className="rounded-xl border border-[#0A3019]/20 bg-[#0A3019]/5 px-[33px] py-[33px]">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#0A3019]/10">
                          <BellRing className="h-5 w-5 text-[#0A3019]" />
                        </div>
                        <div>
                          <h2 className="text-[24px] font-bold leading-8 tracking-[-0.5px] text-[#202326]">
                            {section.title}
                          </h2>
                          <p className="mt-4 text-[16px] leading-[26px] tracking-[-0.5px] text-[#374151]">
                            {section.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              }

              if (!hasSectionHeading) {
                return null;
              }

              return (
                <section key={section.title} className="space-y-6">
                  <SectionHeader icon={Icon} title={section.title} description={section.description} />

                  {meta.variant === "list" && hasBlockContent(primaryBlock) ? (
                    <div className="rounded-xl bg-[#F9FAFB] px-8 py-8">
                      <h3 className="text-[18px] font-semibold leading-7 tracking-[-0.5px] text-[#202326]">
                        {primaryBlock.title}
                      </h3>
                      <ul className="mt-5 space-y-3">
                        {primaryBlock.items.map((item) => (
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
                  ) : null}

                  {meta.variant === "cards" && visibleCardBlocks.length ? (
                    <div className="grid gap-6 md:grid-cols-3">
                      {visibleCardBlocks.map((block) => (
                        <div
                          key={`${block.title}-${block.description}`}
                          className="rounded-xl border border-[#E5E7EB] bg-white px-[25px] py-[25px]"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#DCFCE7]">
                            <CircleCheck className="h-5 w-5 text-[#0A3019]" />
                          </div>
                          <h3 className="mt-6 text-[18px] font-semibold leading-[22px] tracking-[-0.5px] text-[#202326]">
                            {block.title}
                          </h3>
                          <p className="mt-3 text-[14px] leading-[17px] tracking-[-0.5px] text-[#4B5563]">
                            {block.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {meta.variant === "callout" && hasBlockContent(primaryBlock) ? (
                    <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-[33px] py-[33px]">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-[#D97706]" />
                        <div className="space-y-4">
                          <h3 className="text-[18px] font-semibold leading-7 tracking-[-0.5px] text-[#202326]">
                            {primaryBlock.title}
                          </h3>
                          <ul className="space-y-3">{renderListItems(primaryBlock.items, "bg-[#F59E0B]")}</ul>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {meta.variant === "columns" && (hasBlockContent(primaryBlock) || hasBlockContent(secondaryBlock)) ? (
                    <div className="grid gap-8 md:grid-cols-[408px_1fr]">
                      <div>
                        <h3 className="text-[18px] font-semibold leading-7 tracking-[-0.5px] text-[#202326]">
                          {primaryBlock.title}
                        </h3>
                        <ul className="mt-4 space-y-4">
                          {primaryBlock.items.map((item) => (
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
                          {secondaryBlock.title}
                        </h3>
                        <div className="mt-4 rounded-lg bg-[#F9FAFB] px-6 py-6">
                          <p className="text-[14px] leading-[17px] tracking-[-0.5px] text-[#4B5563]">
                            {secondaryBlock.description}
                          </p>
                          <ul className="mt-4 space-y-2">{renderListItems(secondaryBlock.items)}</ul>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {meta.variant === "feature-cards" && visibleCardBlocks.length ? (
                    <div className="grid gap-6 md:grid-cols-3">
                      {visibleCardBlocks.map((block) => (
                        <div key={`${block.title}-${block.description}`} className="text-center">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#DBEAFE]">
                            <ShieldCheck className="h-5 w-5 text-[#2563EB]" />
                          </div>
                          <h3 className="mt-4 text-[18px] font-semibold leading-7 tracking-[-0.5px] text-[#202326]">
                            {block.title}
                          </h3>
                          <p className="mx-auto mt-2 max-w-[234px] text-[14px] leading-5 tracking-[-0.5px] text-[#4B5563]">
                            {block.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
