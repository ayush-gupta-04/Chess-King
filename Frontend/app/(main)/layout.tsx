import AppBar from "@/components/simple/appbar";
import SideBar from "@/components/simple/sidebar";

export default function MainLayout({children} : {children : React.ReactNode}){
    return (
        <div className="flex-1 flex flex-col lg:flex-row bg-base-black-0">
            <div className="hidden lg:block h-full w-1/8">
                <SideBar></SideBar>
            </div>
            <div className="block lg:hidden h-12 w-full">
                <AppBar></AppBar>
            </div>
            {children}
        </div>
    )
}