import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { setTokens } from "../auth/auth";

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({username: "", password: ""});
    const [error, setError] = useState("");

    const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await api.post("/api/token/", form);
            setTokens({ access: res.data.access, refresh: res.data.refresh });
            navigate("/", { replace: true });
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="container" style={{ maxWidth: 420, marginTop: 80 }}>
            <h3 className="mb-3">Login</h3>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input className="form-control" name="username" value={form.username} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} required />
                </div>

                <button className="btn btn-dark w-100" type="submit">
                    Sign in
                </button>
            </form>
        </div>
    );
}