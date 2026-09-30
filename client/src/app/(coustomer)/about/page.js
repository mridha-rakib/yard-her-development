import Image from "next/image";
import Banner from "@/app/component/Banner";
import {
  BriefcaseBusiness,
  Check,
  DollarSign,
  FileCheck,
  House,
  MapPin,
  UsersRound,
} from "lucide-react";

const storyParagraphs = [
  "We started with a simple observation: elders and busy homeowners often struggle to find quick, reliable help for yard work. Whether it's mowing the lawn, raking leaves, or trimming hedges, finding trustworthy Heroes can be stressful and time-consuming.",
  "At the same time, many young people in our communities want honest, flexible work that fits their availability. They're eager to earn money, build skills, and help their neighbors.",
  "That's why we created this platform. We connect both sides safely and simply, making yard work accessible for everyone while creating real earning opportunities for hardworking young people.",
  "Our platform is built on trust, transparency, and community. We believe in fair pay, clear communication, and making life easier for everyone involved.",
];

const HomeownersMissionIcon = () => (
  <svg width="54" height="48" viewBox="0 0 54 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M53.9812 23.9531C53.9812 25.6406 52.575 26.9625 50.9812 26.9625H47.9812L48.0469 41.9812C48.0656 45.3094 45.375 48.0094 42.0469 48.0094H12.0094C8.7 48.0094 6.00937 45.3188 6.00937 42.0094V26.9625H3C1.3125 26.9625 0 25.65 0 23.9531C0 23.1094 0.28125 22.3594 0.9375 21.7031L24.975 0.75C25.6312 0.09375 26.3812 0 27.0375 0C27.6937 0 28.4437 0.1875 29.0062 0.65625L52.95 21.7031C53.7 22.3594 54.075 23.1094 53.9812 23.9531ZM33 21C33 19.4087 32.3679 17.8826 31.2426 16.7574C30.1174 15.6321 28.5913 15 27 15C25.4087 15 23.8826 15.6321 22.7574 16.7574C21.6321 17.8826 21 19.4087 21 21C21 22.5913 21.6321 24.1174 22.7574 25.2426C23.8826 26.3679 25.4087 27 27 27C28.5913 27 30.1174 26.3679 31.2426 25.2426C32.3679 24.1174 33 22.5913 33 21ZM24 30C19.8563 30 16.5 33.3563 16.5 37.5C16.5 38.325 17.175 39 18 39H36C36.825 39 37.5 38.325 37.5 37.5C37.5 33.3563 34.1437 30 30 30H24Z"
      fill="currentColor"
    />
  </svg>
);

const EarningsMissionIcon = () => (
  <svg width="54" height="48" viewBox="0 0 54 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M29.25 2.25V3.23438C29.85 3.34687 30.4313 3.4875 30.9563 3.62813C32.1562 3.94688 32.8688 5.18437 32.55 6.38437C32.2313 7.58437 30.9937 8.29688 29.7937 7.97812C28.7719 7.70625 27.8156 7.51875 26.9625 7.50937C26.2781 7.5 25.5844 7.66875 25.1438 7.92188C24.9469 8.04375 24.8531 8.14688 24.8156 8.20312C24.7875 8.25 24.75 8.31563 24.75 8.46563C24.75 8.49375 24.75 8.5125 24.75 8.52188C24.7687 8.54063 24.8344 8.63437 25.0594 8.76562C25.6031 9.09375 26.4094 9.34688 27.6281 9.7125L27.7125 9.74063C28.7531 10.05 30.1406 10.4719 31.2656 11.175C32.55 11.9812 33.7125 13.3219 33.7406 15.3844C33.7687 17.4938 32.6719 19.0312 31.2375 19.9313C30.6094 20.3156 29.9344 20.5875 29.2406 20.7562V21.75C29.2406 22.9969 28.2375 24 26.9906 24C25.7437 24 24.7406 22.9969 24.7406 21.75V20.6813C23.85 20.4656 23.0344 20.1844 22.3406 19.95C22.1438 19.8844 21.9563 19.8188 21.7781 19.7625C20.5969 19.3687 19.9594 18.0938 20.3531 16.9125C20.7469 15.7312 22.0219 15.0938 23.2031 15.4875C23.4469 15.5719 23.6719 15.6469 23.8875 15.7219C25.1625 16.1531 26.0813 16.4625 27.0656 16.5C27.8156 16.5281 28.4812 16.35 28.8656 16.1156C29.0437 16.0031 29.1281 15.9094 29.1656 15.8438C29.2031 15.7875 29.25 15.675 29.2406 15.4594V15.4406C29.2406 15.3469 29.2406 15.2438 28.8656 15.0094C28.3312 14.6719 27.525 14.4094 26.325 14.0438L26.1469 13.9875C25.1344 13.6875 23.8031 13.2844 22.7344 12.6375C21.4688 11.8781 20.25 10.575 20.2406 8.50312C20.2312 6.35625 21.45 4.88438 22.8375 4.05937C23.4375 3.70312 24.0844 3.45937 24.7312 3.29062V2.25C24.7312 1.00312 25.7344 0 26.9812 0C28.2281 0 29.2312 1.00312 29.2312 2.25H29.25ZM53.2688 31.5281C54.4969 33.1969 54.1406 35.5406 52.4719 36.7688L40.6031 45.5156C38.4094 47.1281 35.7656 48 33.0375 48H18H3C1.34062 48 0 46.6594 0 45V39C0 37.3406 1.34062 36 3 36H6.45L10.6594 32.625C12.7875 30.9188 15.4312 30 18.1594 30H25.5H27H33C34.6594 30 36 31.3406 36 33C36 34.6594 34.6594 36 33 36H27H25.5C24.675 36 24 36.675 24 37.5C24 38.325 24.675 39 25.5 39H36.8063L48.0281 30.7312C49.6969 29.5031 52.0406 29.8594 53.2688 31.5281ZM18.15 36H18.0656C18.0938 36 18.1219 36 18.15 36Z"
      fill="currentColor"
    />
  </svg>
);

const PricingMissionIcon = () => (
  <svg width="54" height="48" viewBox="0 0 54 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.875 7.18125C13.875 3.21562 17.0906 0 21.0563 0C22.9594 0 24.7875 0.759375 26.1281 2.1L27 2.97188L27.8719 2.1C29.2125 0.759375 31.0406 0 32.9437 0C36.9094 0 40.125 3.21562 40.125 7.18125C40.125 9.08437 39.3656 10.9125 38.025 12.2531L28.3219 21.9469C27.5906 22.6781 26.4 22.6781 25.6687 21.9469L15.975 12.2531C14.6344 10.9125 13.875 9.08437 13.875 7.18125ZM53.2688 31.5281C54.4969 33.1969 54.1406 35.5406 52.4719 36.7688L40.6031 45.5156C38.4094 47.1281 35.7656 48 33.0375 48H18H3C1.34062 48 0 46.6594 0 45V39C0 37.3406 1.34062 36 3 36H6.45L10.6594 32.625C12.7875 30.9188 15.4312 30 18.1594 30H25.5H27H33C34.6594 30 36 31.3406 36 33C36 34.6594 34.6594 36 33 36H27H25.5C24.675 36 24 36.675 24 37.5C24 38.325 24.675 39 25.5 39H36.8063L48.0281 30.7312C49.6969 29.5031 52.0406 29.8594 53.2688 31.5281ZM18.15 36H18.0656C18.0938 36 18.1219 36 18.15 36Z"
      fill="currentColor"
    />
  </svg>
);

const missionItems = [
  {
    title: "Help Homeowners & Elders",
    description:
      "Provide reliable, easy-to-book yard work services for those who need it most.",
    Icon: HomeownersMissionIcon,
  },
  {
    title: "Create Fast Earning Opportunities",
    description:
      "Give young people flexible jobs that fit their availability and pay fairly.",
    Icon: EarningsMissionIcon,
  },
  {
    title: "Transparent & Fair Pricing",
    description:
      "Keep pricing clear and honest with no hidden fees or surprises.",
    Icon: PricingMissionIcon,
  },
];

const helpItems = [
  {
    title: "Homeowners & Elders",
    description:
      "Get reliable help with your yard work without the hassle. Our platform makes it easy to book trusted local Heroes.",
    bullets: [
      "Reliable help when you need it",
      "Easy booking in just a few clicks",
      "Pay only after job completion",
      "Vetted local Heroes you can trust",
    ],
    Icon: House,
  },
  {
    title: "Heroes",
    description:
      "Find flexible yard work jobs in your area and earn money around your availability. It's simple, safe, and rewarding.",
    bullets: [
      "Flexible jobs that fit your availability",
      "Fast payouts after each job",
      "Keep 88% of your earnings",
      "Build your reputation and skills",
    ],
    Icon: BriefcaseBusiness,
  },
];

const reasonItems = [
  {
    title: "Local Heroes",
    description: "Connect with trusted Heroes in your neighborhood",
    Icon: MapPin,
    titleClassName: "max-w-[156px]",
    descriptionClassName: "max-w-[156px]",
    iconClassName: "h-9 w-9",
  },
  {
    title: "No Long Contracts",
    description: "Book jobs as needed with no commitments",
    Icon: FileCheck,
    titleClassName: "max-w-[188px]",
    descriptionClassName: "max-w-[188px]",
    iconClassName: "h-9 w-9",
  },
  {
    title: "Clear Pricing",
    description: "Transparent rates with no hidden fees",
    Icon: DollarSign,
    titleClassName: "max-w-[186px]",
    descriptionClassName: "max-w-[186px]",
    iconClassName: "h-8 w-8",
  },
  {
    title: "Community-Focused",
    description: "Built to strengthen local communities",
    Icon: UsersRound,
    titleClassName: "max-w-[202px]",
    descriptionClassName: "max-w-[172px]",
    iconClassName: "h-10 w-10",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[#202326]">
      <section className="relative overflow-hidden">
        <div className="relative h-[260px] w-full sm:h-[320px] lg:h-[400px]">
          <Image
            src="/about_top.png"
            alt="Neighborhood view"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(246,249,243,0.18),rgba(246,249,243,0.56))]" />

          <div className="relative mx-auto flex h-full max-w-5xl items-center justify-center px-6 text-center sm:px-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#202326] sm:text-5xl lg:text-6xl">
                About Us
              </h1>
              <p className="mt-4 text-lg leading-8 text-[#374151] sm:text-xl">
                Helping homeowners get reliable yard work while helping young people
                earn fast money.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,420px)] lg:gap-16">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#202326] sm:text-4xl">
                Our Story
              </h2>
              <div className="mt-6 space-y-5 text-[15px] leading-8 text-[#4b5563] sm:text-base">
                {storyParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="w-full overflow-hidden rounded-[24px] border border-[#d8e3d6]">
              <div className="relative min-h-[320px] w-full sm:min-h-[420px]">
                <Image
                  src="/img.png"
                  alt="Our team"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 420px, 100vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[linear-gradient(180deg,#123121_0%,#0d2417_100%)] px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Our Mission
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#d8e8dc]">
              Our mission is to make yard work simple, affordable, and accessible for
              everyone.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3">
            {missionItems.map(({ title, description, Icon }) => (
              <div
                key={title}
                className="rounded-[28px] border border-white/10 bg-white/8 p-7 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-white">{title}</h3>
                <p className="mt-4 leading-7 text-[#d8e8dc]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-semibold tracking-[-0.03em] text-[#202326] sm:text-4xl">
            Who We Help
          </h2>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {helpItems.map(({ title, description, bullets, Icon }) => (
              <div
                key={title}
                className="rounded-[30px] border border-[#d9e4d8] bg-white p-8 sm:p-10"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef4ed] text-[#0A3019]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#202326]">{title}</h3>
                </div>

                <p className="mt-6 leading-7 text-[#4b5563]">{description}</p>

                <ul className="mt-8 space-y-4">
                  {bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-[#374151]">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A3019] text-white">
                        <Check className="h-4 w-4" />
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-[36px] font-bold leading-10 tracking-[-0.005em] text-[#202326]">
            Why Choose Us
          </h2>

          <div className="mt-16 grid gap-y-12 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
            {reasonItems.map(
              ({
                title,
                description,
                Icon,
                titleClassName,
                descriptionClassName,
                iconClassName,
              }) => (
              <div
                key={title}
                className="mx-auto flex w-full max-w-[216px] flex-col items-center px-[7px] text-center"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[rgba(10,48,25,0.1)] text-[#0A3019]">
                  <Icon className={iconClassName} strokeWidth={2.2} />
                </div>
                <h3
                  className={`mt-[14px] text-[20px] font-semibold leading-[33px] tracking-[-0.005em] text-[#202326] ${titleClassName}`}
                >
                  {title}
                </h3>
                <p
                  className={`mt-[14px] text-base leading-[26px] tracking-[-0.5px] text-[#4b5563] ${descriptionClassName}`}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Banner />
    </div>
  );
}
