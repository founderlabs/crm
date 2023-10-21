import React, { type PropsWithChildren } from "react";

const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex h-full w-full flex-1 flex-col px-2 py-4 md:py-10">
      {children}
    </div>
  );
};

export default MainLayout;
