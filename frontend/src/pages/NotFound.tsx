
import { useLocation } from "react-router-dom";
import { useEffect } from "react";


const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">Oops! Página não encontrada</p>
          <a href="/" className="text-primary-700 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 underline">
            Voltar para o Início
          </a>
        </div>
      </div>
    
  );
};

export default NotFound;
