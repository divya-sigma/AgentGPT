import { useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import "./Auth.css";

function AuthPage() {
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
        const body = isLogin
            ? { email: form.email, password: form.password }
            : { name: form.name, email: form.email, password: form.password };

        try {
            const response = await fetch(`http://localhost:8080${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Something went wrong.");
                setLoading(false);
                return;
            }

            login(data.user, data.token);
        } catch (err) {
            setError("Could not connect to server. Is the backend running?");
        }

        setLoading(false);
    };

    const switchMode = () => {
        setIsLogin(prev => !prev);
        setError("");
        setForm({ name: "", email: "", password: "" });
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <i className="fa-solid fa-robot"></i>
                </div>
                <h1 className="auth-title">AgentGPT</h1>
                <p className="auth-subtitle">
                    {isLogin ? "Welcome back! Sign in to continue." : "Create your account to get started."}
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="input-group">
                            <label>Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Your name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                autoComplete="name"
                            />
                        </div>
                    )}
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder={isLogin ? "Your password" : "At least 6 characters"}
                            value={form.password}
                            onChange={handleChange}
                            required
                            autoComplete={isLogin ? "current-password" : "new-password"}
                        />
                    </div>

                    {error && <p className="auth-error"><i className="fa-solid fa-circle-exclamation"></i> {error}</p>}

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading
                            ? <><i className="fa-solid fa-spinner fa-spin"></i> Please wait...</>
                            : isLogin ? "Sign In" : "Create Account"
                        }
                    </button>
                </form>

                <p className="auth-switch">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <span onClick={switchMode}>{isLogin ? " Sign up" : " Sign in"}</span>
                </p>
            </div>
        </div>
    );
}

export default AuthPage;
