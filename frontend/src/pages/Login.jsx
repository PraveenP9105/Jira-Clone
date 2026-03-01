import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await api.post("/auth/login",
                { email, password }
            );

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);

            navigate("/dashboard");
        } catch (error) {
            alert("Login failed");
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#f4f6f8",
            }}
        >
            <form
                onSubmit={handleLogin}
                style={{
                    padding: "30px",
                    background: "white",
                    borderRadius: "8px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    width: "300px",
                }}
            >
                <h2 style={{ textAlign: "center" }}>Login</h2>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "8px",
                        background: "#0052cc",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    Login
                </button>
            </form>
        </div>
    );
}

export default Login;