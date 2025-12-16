import React from "react";

const LogoutButton = () => {
  const handleLogout = () => {
    const [loggingOut, setLoggingOut] = useState(false);
  };

  return (
    <button
      className="link logout-btn"
      onClick={() => setShowLogoutModal(true)}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
