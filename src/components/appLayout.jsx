import Sidebar from "./sidebar.jsx";
import { useState, useEffect } from "react";
import { LayoutDashboard } from "lucide-react";

export function AppLayout({ children }) {
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1100) setSidebarVisible(true);
            else setSidebarVisible(false);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

    return (
        <div className="w-full min-h-screen ">
            {/* Sidebar */}
            {isSidebarVisible && (
                <div className="fixed md:relative z-40">
                    <Sidebar
                        active={window.location.pathname}
                        setVisibility={setSidebarVisible}
                        isVisible={isSidebarVisible}
                    />
                </div>
            )}

            {/* Main content area - Uses flex for centering */}
            <main className={`flex-1 min-h-screen transition-all duration-300 ${isSidebarVisible ? "lg:ml-64" : ""
                }`}>
                
                
                {/* Toggle button */}
                <button
                    className={` fixed top-4 left-4 z-50 p-3  text-black rounded-full shadow-sm hover:bg-blue-700 transition-colors ${isSidebarVisible ? "ml-50" : ""
                        }`}
                    onClick={toggleSidebar}
                >
                    <LayoutDashboard size={20} />
                </button>

               

                <div className="grid grid-cols-1  justify-items-center w-full">
                    <div className="w-full md:p-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}