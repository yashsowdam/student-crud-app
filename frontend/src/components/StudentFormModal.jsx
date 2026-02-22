import { useEffect, useState } from "react";

export default function StudentFormModal({show, onClose, onSubmit, initial}) {
    const [form, setForm] = useState({ name: "", email: "", course: ""});

    useEffect(() => {
        if (initial) setForm({ name: initial.name || "", email: initial.email || "", course: initial.course || "" });
        else setForm({ name: "", email: "", course: "" });
    }, [initial, show]);

    if (!show) return null;

    const handleChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{initial ? "Edit Student" : "Add Student"}</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Name</label>
                                <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Course</label>
                                <input className="form-control" name="course" value={form.course} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}