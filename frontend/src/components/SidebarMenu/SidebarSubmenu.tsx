
import { FC, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useSidebar } from "@/contexts/SidebarContext";

type SidebarSubmenuProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  basePath: string;
};

export const SidebarSubmenu: FC<SidebarSubmenuProps> = ({ 
  title, 
  icon, 
  children,
  basePath
}) => {
  const location = useLocation();
  const { isMenuOpen, toggleMenu, shouldMenuBeOpen } = useSidebar();
  
  const isActiveSection = shouldMenuBeOpen(basePath);
  const isOpen = isMenuOpen(basePath) || isActiveSection;

  return (
    <details className="mt-1 group" open={isOpen}>
      <summary
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
          isActiveSection 
            ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        onClick={(e) => {
          e.preventDefault();
          toggleMenu(basePath);
        }}
      >
        {icon}
        <span className="flex-1">{title}</span>
        <svg
          className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </summary>
      <ul className="pl-10 mt-1 space-y-1">
        {children}
      </ul>
    </details>
  );
};
