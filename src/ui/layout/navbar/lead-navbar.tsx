import { Menu } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { NavBarType } from "~/ui/types";

export default function LeadsNavbar({ navMenus }: { navMenus: NavBarType[] }) {
  const { asPath } = useRouter();

  return (
    <div className=" my-4 hidden h-14 w-full justify-between rounded-md bg-white shadow-[0px_0px_7px_rgba(48,157,244,0.1)] md:flex">
      {navMenus?.map((menu, index) => {
        return (
          <Link
            href={menu.link}
            key={index}
            className={`flex w-full items-center justify-center gap-2 border-r-[1px] py-3 text-gray-600 ${
              asPath.includes(menu.mainLink) &&
              "rounded-md border-0 bg-gray-600 text-white"
            } text-gray-600`}
          >
            {menu.dropdownMenu !== null ? (
              <>
                <Menu
                  trigger="hover"
                  shadow="md"
                  width={140}
                  styles={{
                    dropdown: {
                      width: "250px",
                      maxWidth: "100%",
                    },
                  }}
                >
                  <Menu.Target>
                    <div className="flex w-full items-center justify-center gap-2">
                      <span className="shrink-0">
                        {asPath.includes(menu.mainLink)
                          ? menu.activeIcon
                          : menu.icon}
                      </span>
                      <>
                        <span className="flex items-center text-xs md:text-base">
                          {menu.name}
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
                            fill={`${
                              asPath.includes(menu.mainLink)
                                ? "#ffff"
                                : "#3D487D"
                            } `}
                          />
                        </svg>
                      </button>
                    </div>
                  </Menu.Target>

                  <Menu.Dropdown className="w-full ">
                    {menu.dropdownMenu.map((n, idx) => (
                      <Link key={idx} className="w-full" href={n.link}>
                        <Menu.Item className="w-full whitespace-nowrap px-3 ">
                          {n.name}
                        </Menu.Item>
                      </Link>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              </>
            ) : (
              <>
                <span className="shrink-0">
                  {asPath.includes(menu.mainLink) ? menu.activeIcon : menu.icon}
                </span>
                <>
                  <span className="flex items-center text-xs md:text-base">
                    {menu.name}
                  </span>
                </>
              </>
            )}
          </Link>
        );
      })}
    </div>
  );
}
