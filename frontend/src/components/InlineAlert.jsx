import "./InlineAlert.css";

export default function InlineAlert({ type = "info", title, message }) {
  return (
    <div className={`cad-alert cad-alert--${type}`}>
      {title ? <div className="cad-alert__title">{title}</div> : null}
      <div className="cad-alert__message">{message}</div>
    </div>
  );
}

