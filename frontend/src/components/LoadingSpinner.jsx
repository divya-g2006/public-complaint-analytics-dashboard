import "./LoadingSpinner.css";

export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="cad-loading">
      <div className="cad-loading__spinner" aria-hidden="true" />
      <div className="cad-loading__label">{label}</div>
    </div>
  );
}

