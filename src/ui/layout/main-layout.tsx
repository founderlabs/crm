import { useRouter } from "next/router";
import React, { type PropsWithChildren } from "react";

const MainLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  return (
    <div
      className={`flex h-full w-full flex-1 flex-col p-4 ${
        !router.asPath.includes("/leads") && "md:py-10"
      }`}
    >
      {children}
    </div>
  );
};

export default MainLayout;
