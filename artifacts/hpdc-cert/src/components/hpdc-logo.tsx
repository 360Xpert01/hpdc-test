interface HPDCLogoProps {
  variant?: "dark" | "light";
  className?: string;
}

const BASE = import.meta.env.BASE_URL;

export function HPDCLogo({ variant = "dark", className = "h-10 w-auto" }: HPDCLogoProps) {
  if (variant === "light") {
    return (
      <div className="inline-flex items-center">
        <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm">
          <img
            src={`${BASE}hpdc-logo-transparent.png`}
            alt="HALAL DEVCO. - شركة تطوير منتجات الحلال"
            className={className}
          />
        </div>
      </div>
    );
  }

  return (
    <img
      src={`${BASE}hpdc-logo-transparent.png`}
      alt="HALAL DEVCO. - شركة تطوير منتجات الحلال"
      className={className}
    />
  );
}
