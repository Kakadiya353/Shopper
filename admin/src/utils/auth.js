/**
 * Authentication utility functions
 */

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const adminToken = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');
  
  return !!(adminToken && adminUser);
};

/**
 * Get the current admin user data
 * @returns {Object|null} The admin user data or null if not authenticated
 */
export const getAdminUser = () => {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    return JSON.parse(localStorage.getItem('adminUser'));
  } catch (error) {
    console.error('Error parsing admin user data:', error);
    return null;
  }
};

/**
 * Logout the current user
 * @param {Function} navigate - React Router navigate function
 */
export const logout = (navigate) => {
  // Clear all admin data from localStorage
  localStorage.removeItem('adminUser');
  localStorage.removeItem('adminToken');
  
  // Redirect to login page if navigate function is provided
  if (navigate) {
    navigate('/admin/login');
  } else {
    window.location.href = '/admin/login';
  }
}; 