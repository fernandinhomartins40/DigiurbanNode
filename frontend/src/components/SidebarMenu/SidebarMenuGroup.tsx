
import { FC, ReactNode } from "react";

type SidebarMenuGroupProps = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
};

export const SidebarMenuGroup: FC<SidebarMenuGroupProps> = ({ title, icon, children }) => {
  return (
    <div className="px-3 py-2">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
        {icon && <span className="mr-1">{icon}</span>}
        {title}
      </h3>
      <ul className="mt-2 space-y-1">
        {children}
      </ul>
    </div>
  );
};
