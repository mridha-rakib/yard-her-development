import { FiLogOut } from "react-icons/fi";
import { BiChevronDown } from "react-icons/bi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import brandlogo from "../../assets/image/yard-new.jpeg";
import {
  AlignCenterVertical,
  ChartColumnIncreasing,
  Crown,
  DollarSign,
  MessageSquareQuote,
  Settings,
  Users,
} from "lucide-react";
import { BsBadgeAd } from "react-icons/bs";
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { useAuthStore } from "../../stores/use-auth-store";

const Sidebar = ({ closeDrawer }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  const menuItems = [
    {
      icon: <RiDashboardHorizontalLine className="w-5 h-5" />,
      label: "Dashboard",
      Link: "/",
      matchPaths: ["/", "/dashboard"],
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Bookings",
      Link: "/booking",
      matchPaths: ["/booking"],
    },
    {
      icon: <ChartColumnIncreasing className="w-5 h-5" />,
      label: "Heroes",
      Link: "/workers",
      matchPaths: ["/workers"],
    },
    {
      icon: <Crown className="w-5 h-5" />,
      label: "Payments",
      Link: "/payments",
      matchPaths: ["/payments", "/payment-details"],
    },

    {
      icon: <BsBadgeAd className="w-5 h-5"/>,
      label: "Customers",
      Link: "/customers",
      matchPaths: ["/customers", "/customer"],
    },
    {
      icon: <MessageSquareQuote className="w-5 h-5" />,
      label: "Reviews",
      Link: "/reviews",
      matchPaths: ["/reviews"],
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: "Pricing",
      Link: "/pricing",
      matchPaths: ["/pricing"],
    },
    {
      icon: <AlignCenterVertical className="w-5 h-5"/>,
      label: "Support",
      Link: "/support",
      matchPaths: ["/support"],
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      Link: "/settings",
      matchPaths: ["/settings"],
    },
  ];

  const handleLogout = async () => {
    await logout();
    closeDrawer?.();
    navigate("/sign-in", { replace: true });
  };

  const isRouteActive = (item) =>
    (item.matchPaths || [item.Link]).some((path) => {
      if (path === "/") {
        return location.pathname === "/" || location.pathname === "/dashboard";
      }

      return (
        location.pathname === path ||
        location.pathname.startsWith(`${path}/`)
      );
    });

  return (
    <div className="flex h-full w-72 flex-col bg-[#0a3019]">
      <div className="border-b-2 border-[#166534]">
         <div className="px-8 py-5 ">
        <img src={brandlogo} alt="Yard admin logo" className="h-14 w-14 rounded-lg object-cover" />
      </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const isActive = isRouteActive(item);

          return (
            <div key={item.label} className="px-4">
              <Link
                to={item.Link}
                onClick={() => closeDrawer?.()}
                className={`my-2 flex w-full items-center justify-between rounded-lg px-5 py-3 transition-all hover:bg-[#166534] hover:text-white hover:font-semibold ${
                  isActive
                    ? "bg-[#166534] text-white font-semibold"
                    : "text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  <p>{item.label}</p>
                  {item.isDropdown && (
                    <BiChevronDown
                      className={`${isActive ? "rotate-180" : ""}`}
                    />
                  )}
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-auto px-4 pb-6 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isInitializing}
          className="flex items-center justify-center w-full py-3 text-xl text-white rounded-lg cursor-pointer gap-x-5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiLogOut className="text-xl" />
          <p>{isInitializing ? "Logging out..." : "Log out"}</p>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
