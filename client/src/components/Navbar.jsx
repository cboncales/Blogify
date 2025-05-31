import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PenSquare, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const NavLink = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
    >
      {children}
    </Link>
  );

  const MobileNavLink = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <PenSquare className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Blogify</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/">Home</NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/create-post">Create Post</NavLink>
                <NavLink to="/dashboard">Dashboard</NavLink>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    <User className="h-4 w-4" />
                    <span>{user?.username}</span>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        My Posts
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="h-4 w-4 inline mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <MobileNavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </MobileNavLink>

              {isAuthenticated ? (
                <>
                  <MobileNavLink
                    to="/create-post"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Create Post
                  </MobileNavLink>
                  <MobileNavLink
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </MobileNavLink>
                  <div className="px-3 py-2">
                    <div className="text-sm text-gray-500">
                      Signed in as {user?.username}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 inline mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </MobileNavLink>
                  <MobileNavLink
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </MobileNavLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
