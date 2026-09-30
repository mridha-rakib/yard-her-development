"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { contentApi } from "@/lib/api/content-api";
import { LEGAL_DOCUMENTS, getLegalDocumentDefinition } from "@/lib/legal-documents";

const getDisplayTitle = (documentId, documentName, fallbackTitle) => {
  const normalizedName = String(documentName || "").trim();

  if (documentId === "terms-of-service" && /terms of service/i.test(normalizedName)) {
    return "Terms & Conditions";
  }

  return normalizedName || fallbackTitle;
};

const Footer = () => {
  const [legalLinks, setLegalLinks] = useState(LEGAL_DOCUMENTS);

  useEffect(() => {
    let ignore = false;

    const loadLegalLinks = async () => {
      try {
        const legalDocuments = await contentApi.getLegalDocuments();

        if (ignore) {
          return;
        }

        const nextLinks = legalDocuments
          .map((document) => {
            const definition = getLegalDocumentDefinition(document?.id);

            if (!definition) {
              return null;
            }

            return {
              ...definition,
              title: getDisplayTitle(document?.id, document?.name, definition.title),
            };
          })
          .filter(Boolean);

        if (nextLinks.length) {
          setLegalLinks(nextLinks);
        }
      } catch {
        // Keep the default legal links visible even if the content endpoint is unavailable.
      }
    };

    loadLegalLinks();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          <div>
            <Image
              src="/yaqrd-main.jpeg"
              alt="Yard Hero logo"
              width={56}
              height={56}
              className="rounded-lg object-cover"
            />
            <p className="mt-5 leading-relaxed text-slate-400">
              Professional yard care services when you need them most.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Services</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-400 transition-colors hover:text-emerald-400">
                  Lawn Mowing
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 transition-colors hover:text-emerald-400">
                  Leaf Raking
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 transition-colors hover:text-emerald-400">
                  Bush Trimming
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 transition-colors hover:text-emerald-400">
                  Yard Cleanup
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-slate-400 transition-colors hover:text-emerald-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-slate-400 transition-colors hover:text-emerald-400"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-slate-400 transition-colors hover:text-emerald-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 transition-colors hover:text-emerald-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Legal & Compliance</h3>
            <ul className="space-y-3">
              {legalLinks.map((document) => (
                <li key={document.id}>
                  <Link
                    href={document.href}
                    className="text-slate-400 transition-colors hover:text-emerald-400"
                  >
                    {document.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-white">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:yardheroinfo@gmail.com"
                  className="flex items-center gap-2 text-slate-400 transition-colors hover:text-emerald-400"
                >
                  yardheroinfo@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-slate-400">&copy; 2026 Yard Hero. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-6">
              {legalLinks.map((document) => (
                <Link
                  key={document.id}
                  href={document.href}
                  className="text-sm text-slate-400 transition-colors hover:text-emerald-400"
                >
                  {document.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
