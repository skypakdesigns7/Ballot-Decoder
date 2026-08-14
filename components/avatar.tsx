import Image from "next/image";

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: number; // px
  className?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic background color from name
const BG_COLORS = [
  "#2e5120", "#2D6A4F", "#40916C", "#52B788",
  "#0D9488", "#7C3AED", "#D97706", "#6B7280",
];
function bgColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return BG_COLORS[h % BG_COLORS.length];
}

export function Avatar({ name, photoUrl, size = 40, className = "" }: AvatarProps) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: "50%",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: size * 0.38,
    fontWeight: 700,
    color: "#fff",
    backgroundColor: photoUrl ? "transparent" : bgColor(name),
    position: "relative",
  };

  if (photoUrl) {
    return (
      <div style={style} className={className}>
        <Image
          src={photoUrl}
          alt={name}
          fill
          sizes={`${size}px`}
          className="object-cover object-top"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div style={style} className={className}>
      {getInitials(name)}
    </div>
  );
}
