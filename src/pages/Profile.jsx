import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import API from "../api/axios.js";

export default function Profile() {
  const { employee, updateEmployee } = useAuth();

  const [form, setForm] = useState({ name: "", payroll: "", experience: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name || "",
        payroll: employee.payroll || "",
        experience: employee.experience || "",
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.payroll) return "Payroll is required";
    if (form.experience === "") return "Experience is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) return toast.error(err);

    setLoading(true);
    try {
      const { data } = await API.put(`/employees/${employee._id}`, {
        name: form.name,
        payroll: Number(form.payroll),
        experience: Number(form.experience),
      });
      updateEmployee(data);
      toast.success("Profile updated successfully! ");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div style={s.layout}>
      <Sidebar />
      <main style={s.main}>
        <h1 style={s.heading}>My Profile </h1>
        <p style={s.subheading}>update your personal details</p>

        <div style={s.content}>
          <div style={s.banner}>
            <div style={s.bigAvatar}>{getInitials(employee?.name)}</div>
            <div>
              <h2 style={s.bannerName}>{employee?.name}</h2>
              <p style={s.bannerEmail}>{employee?.email}</p>
              <div style={s.tags}>
                <span style={s.tag}>{employee?.experience} yrs exp</span>
                <span style={s.tag}>
                  ₹{Number(employee?.payroll || 0).toLocaleString("en-IN")}/mo
                </span>
              </div>
            </div>
          </div>

          <div style={s.formCard}>
            <h3 style={s.formTitle}>Edit Details</h3>
            <p style={s.formNote}>
              {" "}
              Email and Password cannot be changed here.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={s.fieldWrap}>
                <label style={s.label}>Full Name</label>
                <input
                  style={s.input}
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div style={s.fieldWrap}>
                <label style={s.label}>
                  Email 
                  <span style={s.readOnly}> (read-only)</span>
                </label>
                <input
                  style={s.inputDisabled}
                  type="email"
                  value={employee?.email || ""}
                  disabled
                />
              </div>

              <div style={s.row}>
                <div style={{ ...s.fieldWrap, flex: 1 }}>
                  <label style={s.label}>Payroll (₹/month)</label>
                  <input
                    style={s.input}
                    type="number"
                    name="payroll"
                    placeholder="e.g.50000"
                    value={form.payroll}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ ...s.fieldWrap, flex: 1 }}>
                  <label style={s.label}>Experience (years)</label>
                  <input
                    style={s.input}
                    type="number"
                    name="experience"
                    placeholder="e.g. 3"
                    value={form.experience}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={loading ? s.btnDisabled : s.btn}
                disabled={loading}
              >
                {loading ? " Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

const s = {
  layout: { display: "flex", fontFamily: "'Segoe UI', sans-serif" },
  main: {
    marginLeft: "250px",
    flex: 1,
    padding: "32px",
    background: "#f0f9ff",
    minHeight: "100vh",
  },
  heading: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 4px",
  },
  subheading: { color: "#64748b", fontSize: "14px", margin: "0 0 28px" },

  content: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    maxWidth: "640px",
  },

  banner: {
    background: "linear-gradient(135deg, #0c4a6e, #0369a1)",
    borderRadius: "16px",
    padding: "28px 32px",
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  bigAvatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "26px",
    flexShrink: 0,
    border: "3px solid rgba(255,255,255,0.4)",
  },
  bannerName: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#fff",
    margin: "0 0 4px",
  },
  bannerEmail: { fontSize: "14px", color: "#bae6fd", margin: "0 0 12px" },
  tags: { display: "flex", gap: "8px", flexWrap: "wrap" },
  tag: {
    background: "rgba(255,255,255,0.15)",
    color: "#e0f2fe",
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 12px",
    borderRadius: "20px",
  },

  formCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "28px 32px",
    border: "1px solid #e2e8f0",
  },
  formTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 6px",
  },
  formNote: { fontSize: "13px", color: "#94a3b8", margin: "0 0 24px" },

  row: { display: "flex", gap: "16px" },
  fieldWrap: { marginBottom: "18px" },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
  },
  readOnly: { fontWeight: "400", color: "#94a3b8", fontSize: "12px" },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "9px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    color: "#0f172a",
  },
  inputDisabled: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "9px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    boxSizing: "border-box",
    background: "#f8fafc",
    color: "#94a3b8",
  },
  btn: {
    padding: "13px 32px",
    borderRadius: "9px",
    border: "none",
    background: "#0369a1",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnDisabled: {
    padding: "13px 32px",
    borderRadius: "9px",
    border: "none",
    background: "#7dd3fc",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "not-allowed",
  },
};
