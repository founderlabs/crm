import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment } from "react";

import { Menu } from "@mantine/core";
import { cn } from "~/ui/lib/utils";
import { NavBarType } from "~/ui/types";

export default function BottomNavbar({ navMenus }: { navMenus: NavBarType[] }) {
  const { asPath } = useRouter();
  const length = navMenus.length;

  const navBarWidth = () => {
    if (length >= 4) {
      const getLength = length + 1;
      return getLength + "00px";
    }
    return length + "00px";
  };
  return (
    <div className="fixed -bottom-1 z-40 h-[76px] w-full bg-white shadow-[0px_0px_10px_2px_rgba(48,157,244,0.10)] md:hidden ">
      <div className="overflow-visible overflow-x-scroll ">
        <div
          className="flex h-full items-start justify-start"
          style={{ width: `${navBarWidth()}` }}
        >
          {navMenus?.map((n) => {
            return (
              <Fragment key={Math.floor(Math.random() * 100000)}>
                {n.dropdownMenu === null ? (
                  <Link
                    href={n.link}
                    key={n.name}
                    className={cn(
                      "w-26 text-gray-600 flex h-20 w-20 flex-col items-center justify-center bg-white px-4 py-[20px]",
                      asPath.includes(n?.mainLink) && "bg-gray-600 text-white",
                    )}
                  >
                    <>
                      <div>
                        {asPath.includes(n.mainLink) ? n.activeIcon : n.icon}
                      </div>
                      <div className=" z-50 flex items-center text-xs md:text-base">
                        {n.name}
                      </div>
                    </>
                  </Link>
                ) : (
                  <div
                    className={cn(
                      "w-26 -1 flex h-full flex-col items-center justify-center bg-white py-[20px]",
                      n.name.length >= 8 && "w-36",
                      asPath.includes(n.mainLink) && "bg-gray-600 text-white",
                    )}
                  >
                    <div>
                      {asPath.includes(n.mainLink) ? n.activeIcon : n.icon}
                    </div>
                    <div className="z-50 flex items-center text-xs md:text-base">
                      <Menu
                        trigger="click"
                        shadow="md"
                        width={150}
                        zIndex={100}
                        styles={{
                          dropdown: {
                            width: "250px",
                            maxWidth: "100%",
                          },
                        }}
                      >
                        <Menu.Target>
                          <div className="flex w-full items-center justify-center gap-x-1">
                            <>
                              <span className="flex items-center text-xs md:text-base">
                                {n.name}
                              </span>
                            </>
                            <button>
                              <svg
                                width="10"
                                height="4"
                                viewBox="0 0 10 4"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M0 0L5 4L10 0H0Z"
                                  fill={
                                    asPath.includes(n.mainLink)
                                      ? "#ffff"
                                      : "#3D487D"
                                  }
                                />
                              </svg>
                            </button>
                          </div>
                        </Menu.Target>
                        <Menu.Dropdown className="">
                          {n?.dropdownMenu?.map((n, idx) => (
                            <Link key={idx} className="w-full " href={n.link}>
                              <Menu.Item>{n.name}</Menu.Item>
                            </Link>
                          ))}
                        </Menu.Dropdown>
                      </Menu>
                    </div>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
