import { Link, useNavigate } from "react-router-dom";

function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          background: "#172b4d",
          color: "white",
          padding: "20px",
        }}
      >
        <h2>JIRA Clone</h2>

        <nav style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "15px" }}>
          <Link to="/dashboard" style={linkStyle}>
            Dashboard
          </Link>

          <Link to="/reports" style={linkStyle}>
            Reports
          </Link>

          <button
            onClick={handleLogout}
            style={{
              marginTop: "20px",
              padding: "8px",
              background: "#ff4d4f",
              border: "none",
              color: "white",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "30px",
          background: "#f4f6f8",
          overflowY: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
};

export default Layout;