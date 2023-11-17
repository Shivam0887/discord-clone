import SideNavBar from "@/components/Navigation/SideNavBar";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <div className="hidden md:flex flex-col h-full w-[72px] fixed z-30 inset-y-0 ">
        <SideNavBar />
      </div>
      <main className="h-full md:pl-[72px]">{children}</main>
    </div>
  );
};

export default MainLayout;
