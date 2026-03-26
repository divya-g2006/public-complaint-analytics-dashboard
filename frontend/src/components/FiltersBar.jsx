import "./FiltersBar.css";

export default function FiltersBar({
  value,
  onChange,
  onApply,
  onClear,
  showDepartment = true,
  showDistrict = false,
  districtOptions = []
}) {
  return (
    <div className="cad-filters gov-card">
      <div className="cad-filters__title">Filters</div>
      <div className="cad-filters__grid">
        {showDepartment ? (
          <label className="cad-filters__field">
            <div className="cad-field__label">Department</div>
            <input
              className="cad-input"
              value={value.department}
              onChange={(e) => onChange({ ...value, department: e.target.value })}
              placeholder="e.g. Water Supply"
            />
          </label>
        ) : null}

        {showDistrict ? (
          <label className="cad-filters__field">
            <div className="cad-field__label">District</div>
            <select
              className="cad-input"
              value={value.district}
              onChange={(e) => onChange({ ...value, district: e.target.value })}
            >
              <option value="">All</option>
              {districtOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="cad-filters__field">
          <div className="cad-field__label">Status</div>
          <select
            className="cad-input"
            value={value.status}
            onChange={(e) => onChange({ ...value, status: e.target.value })}
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting for User Confirmation">Waiting for User Confirmation</option>
            <option value="Resolved">Resolved</option>
          </select>
        </label>

        <label className="cad-filters__field">
          <div className="cad-field__label">Priority</div>
          <select
            className="cad-input"
            value={value.priority}
            onChange={(e) => onChange({ ...value, priority: e.target.value })}
          >
            <option value="">All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>
      </div>

      <div className="cad-filters__actions">
        <button type="button" className="cad-btnPrimary cad-filters__btn" onClick={onApply}>
          Apply
        </button>
        <button type="button" className="cad-btnRefresh" onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  );
}
