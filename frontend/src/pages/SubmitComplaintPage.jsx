import { useState } from "react";
import "./SubmitComplaintPage.css";
import InlineAlert from "../components/InlineAlert.jsx";
import { complaintService } from "../services/complaintService.js";
import { TAMIL_NADU_DISTRICTS } from "../constants/tamilNaduDistricts.js";
import axios from "axios";

export default function SubmitComplaintPage() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [image, setImage] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const nameClean = name.trim();
      const phoneClean = phoneNumber.trim();
      if (phoneClean && !/^[0-9]{10}$/.test(phoneClean)) {
        setError("Phone number must be exactly 10 digits.");
        setSubmitting(false);
        return;
      }

      const location = {
        address: `${city.trim()}, ${district.trim()}, Tamil Nadu`,
        district,
        city
      };

      // Debug frontend (requested)
      // eslint-disable-next-line no-console
      console.log("SENDING DATA:", {
        name: nameClean,
        phoneNumber: phoneClean,
        title,
        description,
        department,
        priority,
        location
      });

      const token = localStorage.getItem("token") || localStorage.getItem("cad_token") || "";

      let response;

      if (image) {
        const fd = new FormData();
        if (nameClean) fd.append("name", nameClean);
        if (phoneClean) fd.append("phoneNumber", phoneClean);
        fd.append("title", title);
        fd.append("description", description);
        fd.append("department", department);
        fd.append("priority", priority);
        fd.append("image", image);
        // Location (FormData bracket notation)
        fd.append("location[address]", location.address);
        fd.append("location[district]", district);
        fd.append("location[city]", city);
        response = await complaintService.create(fd);
      } else {
        // JSON submission exactly as requested
        const payload = {
          title,
          description,
          department,
          priority,
          location,
          ...(nameClean ? { name: nameClean } : {}),
          ...(phoneClean ? { phoneNumber: phoneClean } : {})
        };
        const { data } = await axios.post(
          "/api/complaints",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        response = data;
      }

      // Debug step after submitting (requested)
      // eslint-disable-next-line no-console
      console.log("Create complaint response:", response);

      setSuccess("Complaint submitted successfully.");
      setName("");
      setPhoneNumber("");
      setTitle("");
      setDescription("");
      setDepartment("");
      setDistrict("");
      setCity("");
      setPriority("Medium");
      setImage(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit complaint.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="cad-page">
      <div className="cad-page__head">
        <div className="cad-page__title">Submit complaint</div>
        <div className="cad-page__sub">Provide clear information. Attach an image if relevant (max 2 MB).</div>
      </div>

      <div className="cad-formCard gov-card">
        {error ? <InlineAlert type="error" title="Submission error" message={error} /> : null}
        {success ? <InlineAlert type="success" title="Submitted" message={success} /> : null}

        <form className="cad-gridForm" onSubmit={onSubmit}>
          <label className="cad-field">
            <div className="cad-field__label">Name (optional)</div>
            <input
              className="cad-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={120}
            />
          </label>

          <label className="cad-field">
            <div className="cad-field__label">Phone number (optional)</div>
            <input
              className="cad-input"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="10 digits"
              inputMode="numeric"
              maxLength={10}
              pattern="[0-9]{10}"
            />
          </label>

          <label className="cad-field">
            <div className="cad-field__label">Title</div>
            <input
              className="cad-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary"
              required
              maxLength={200}
            />
          </label>

          <label className="cad-field">
            <div className="cad-field__label">Department</div>
            <select className="cad-input" value={department} onChange={(e) => setDepartment(e.target.value)} required>
              <option value="" disabled>
                -- Select Department --
              </option>
              <option value="Electricity">Electricity</option>
              <option value="Roads">Roads</option>
              <option value="School">School</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Transport">Transport</option>
              <option value="Housing">Housing</option>
              <option value="Environment">Environment</option>
              <option value="Health">Health</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="cad-field">
            <div className="cad-field__label">District (Tamil Nadu)</div>
            <select className="cad-input" value={district} onChange={(e) => setDistrict(e.target.value)} required>
              <option value="" disabled>
                -- Select District --
              </option>
              {TAMIL_NADU_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label className="cad-field">
            <div className="cad-field__label">Area / City</div>
            <input
              className="cad-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Pollachi"
              required
              maxLength={120}
            />
            <div className="cad-field__hint">
              Address will be saved as: <span className="cad-addr">{city || "City"}</span>,{" "}
              <span className="cad-addr">{district || "District"}</span>, <span className="cad-addr">Tamil Nadu</span>
            </div>
          </label>

          <label className="cad-field">
            <div className="cad-field__label">Priority</div>
            <select className="cad-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>

          <label className="cad-field">
            <div className="cad-field__label">Image (optional)</div>
            <input
              className="cad-input cad-file"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </label>

          <label className="cad-field cad-field--full">
            <div className="cad-field__label">Description</div>
            <textarea
              className="cad-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              required
              maxLength={5000}
              rows={7}
            />
          </label>

          <div className="cad-actions">
            <button className="cad-btnPrimary" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
