import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import StudentFormModal from "../components/StudentFormModal";

export default function Home() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/students/");
            setStudents(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const openAdd = () => {
        setEditing(null);
        setShowModal(true);
    };

    const openEdit = (s) => {
        setEditing(s);
        setShowModal(true);
    };

    const handleSubmit = async (form) => {
        if (editing) {
            await api.put(`/api/students/${editing.id}/`, form);
        } else {
            await api.post("/api/students/", form);
        }
        setShowModal(false);
        await fetchStudents();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this student?")) return;
        await api.delete(`/api/students/${id}/`);
        await fetchStudents();
    };

    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="m-0">Students</h3>
                    <button className="btn btn-primary" onClick={openAdd}>
                        + Add Student
                    </button>
                </div>

                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped align-middle">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Course</th>
                                    <th style={{ width: 180 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            No students yet
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((s) => (
                                        <tr key={s.id}>
                                            <td>{s.id}</td>
                                            <td>{s.name}</td>
                                            <td>{s.email}</td>
                                            <td>{s.course}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEdit(s)}>
                                                    Edit
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id)}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <StudentFormModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
                initial={editing}
            />
        </>
    );

}