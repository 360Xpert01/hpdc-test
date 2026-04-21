const BASE = import.meta.env.BASE_URL;

export function PIFLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src={`${BASE}pif-logo.png`}
      alt="صندوق الاستثمارات العامة — Public Investment Fund"
      className={className}
    />
  );
}
