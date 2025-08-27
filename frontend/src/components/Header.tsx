
import { FC } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { MobileSidebar } from "./MobileSidebar";
import { Breadcrumb } from "./Breadcrumb";
import NotificacoesRealTime from "./NotificacoesRealTime";

export const Header: FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center flex-1">
          <MobileSidebar />
          <h2 className="ml-2 text-xl font-medium text-gray-800 dark:text-white md:hidden">
            DigiUrbis
          </h2>
          <div className="hidden md:block ml-4">
            <Breadcrumb />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              className="py-2 pl-10 pr-4 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <div className="absolute left-3 top-2.5">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <NotificacoesRealTime />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
