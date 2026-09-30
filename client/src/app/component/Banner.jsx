import Link from "next/link";
import React from "react";

const Banner = () => {
  return (
    <div className="bg-emerald-950 px-6 py-16 text-center text-white">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-3xl font-bold">
          Ready to book with fixed pricing and proof-based trust?
        </h2>
        <p className="mb-10 text-lg text-emerald-200/80">
          Customers see the price before checkout. Workers submit photo and video proof before payout release.
        </p>
        <Link href="/book">
          <button className="mx-auto flex items-center justify-center gap-2 rounded-md bg-white px-10 py-4 text-lg font-bold text-emerald-950 transition-all hover:bg-emerald-50">
            Book Your Service Now
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Banner;
