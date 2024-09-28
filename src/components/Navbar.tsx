import React, { useEffect, useState } from 'react';

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); 
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-primary text-white p-4 flex justify-between items-center z-50">
      <div className="text-white font-bold text-2xl ml-5 cursor-pointer hover:opacity-80 transition-opacity duration-300">
        <div onClick={() => window.location.href = '/'}>SellScaleHood</div>
      </div>

      <div className="flex space-x-8 text-base font-medium">
        <div
          onClick={() => window.location.href = '/portfolio'}
          className="cursor-pointer hover:text-gray-300 transition-colors duration-300"
        >
          Portfolio
        </div>
        {isLoggedIn ? (
          <div
            onClick={handleLogout}
            className="cursor-pointer hover:text-gray-300 transition-colors duration-300"
          >
            Logout
          </div>
        ) : (
          <div
            onClick={() => window.location.href = '/login'}
            className="cursor-pointer hover:text-gray-300 transition-colors duration-300"
          >
            Login
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
