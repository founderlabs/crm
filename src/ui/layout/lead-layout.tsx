import { useRouter } from "next/router";
import { type FC, type ReactNode, useEffect } from "react";

import { useLeadStore } from "~/store";

import BottomNavbar from "./navbar/bottom-navbar";
import LeadsNavbar from "./navbar/lead-navbar";

import { ClockIcon, FileStackIcon, InfoIcon } from "lucide-react";

interface LeadsLayoutProps {
  children: ReactNode;
  leadsHeaderTitle?: string;
  className?: string;
  rightSideComponent?: ReactNode;
}

const navMenus = [
  {
    icon: <InfoIcon />,
    link: "/dashboard/leads/general",
    activeIcon: <InfoIcon className="text-white" />,
    name: "General",
    dropdownMenu: null,
    disabled: false,
    mainLink: "/dashboard/leads/general",
  },
  {
    icon: <ClockIcon />,
    link: "/dashboard/leads/timeline",
    activeIcon: <ClockIcon className="text-white" />,
    name: "Timeline",
    dropdownMenu: null,
    disabled: false,
    mainLink: "/dashboard/leads/timeline",
  },
  // {
  //   icon: <NfcIcon />,
  //   link: "/dashboard/leads/communication/email",
  //   activeIcon: <NfcIcon className="text-white" />,
  //   name: "Communication",
  //   dropdownMenu: [
  //     {
  //       name: "Email",
  //       link: "/dashboard/leads/communication/email",
  //     },
  //     {
  //       name: "SMS",
  //       link: "/dashboard/leads/communication/sms",
  //     },
  //     {
  //       name: "Scheduling",
  //       link: "/dashboard/leads/communication/scheduling",
  //     },
  //   ],
  //   mainLink: "/dashboard/leads/communication",
  //   disabled: false,
  // },
  {
    icon: <FileStackIcon />,
    link: "/dashboard/leads/files",
    activeIcon: <FileStackIcon className="text-white" />,
    name: "Files",
    dropdownMenu: null,
    disabled: false,
    mainLink: "/dashboard/leads/files",
  },
];

const LeadsLayout: FC<LeadsLayoutProps> = ({
  children,
  leadsHeaderTitle,
  className,
  rightSideComponent,
}) => {
  const router = useRouter();
  const { leadId } = useLeadStore();

  useEffect(() => {
    (leadId === undefined || leadId === "" || leadId === null) &&
      void router.push("/dashboard/leads");
  }, [leadId, router]);

  return (
    <>
      <div className=" bg-primary flex w-full h-full flex-col md:px-2 xl:px-4">
        <LeadsNavbar navMenus={navMenus} />
        <div className={`bg-primary flex ${!router.pathname.includes('timeline') && "h-full"} ${className}`}>
          <div className="flex w-full h-full flex-col pb-20 md:flex-1 md:p-0 md:pb-0">
            <div className="flex h-full rounded-md bg-white md:flex-1">
              <div className="flex justify-center">
                <p className="text-2xl font-semibold">{leadsHeaderTitle}</p>
              </div>
              <div className="flex w-full md:flex-1">
                {children}
              </div>
            </div>
          </div>
          {rightSideComponent ? rightSideComponent : null}
        </div>
      </div>
      <BottomNavbar navMenus={navMenus} />
    </>
  );
};

export default LeadsLayout;
