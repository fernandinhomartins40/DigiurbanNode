
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useSidebarScroll = () => {
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<Map<string, HTMLElement>>(new Map());

  const setMenuItemRef = (href: string, element: HTMLElement | null) => {
    if (element) {
      menuItemsRef.current.set(href, element);
    } else {
      menuItemsRef.current.delete(href);
    }
  };

  useEffect(() => {
    const scrollToActiveItem = () => {
      const currentPath = location.pathname;
      
      // Find the active menu item element
      let activeElement: HTMLElement | null = null;
      
      // First try exact match
      activeElement = menuItemsRef.current.get(currentPath) || null;
      
      // If no exact match, find the best matching parent path
      if (!activeElement) {
        const sortedPaths = Array.from(menuItemsRef.current.keys())
          .filter(path => currentPath.startsWith(path) && path !== '/')
          .sort((a, b) => b.length - a.length); // Sort by length desc to get most specific match
        
        if (sortedPaths.length > 0) {
          activeElement = menuItemsRef.current.get(sortedPaths[0]) || null;
        }
      }
      
      // Scroll to the active element
      if (activeElement && sidebarRef.current) {
        // Use a small delay to ensure the DOM has updated
        setTimeout(() => {
          activeElement!.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      }
    };

    scrollToActiveItem();
  }, [location.pathname]);

  return {
    sidebarRef,
    setMenuItemRef
  };
};
