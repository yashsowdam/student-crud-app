import { Link, useNavigate } from "react-router-dom";
import { clearTokens } from "../auth/auth";

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        clearTokens();
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
            <Link className="navbar-brand" to="/">
                Student CRUD
            </Link>
            <div className="ms-auto">
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}