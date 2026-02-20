interface LogoProps {
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "text-3xl",
  md: "text-5xl",
  lg: "text-7xl",
};

export default function Logo({ size = "md" }: LogoProps) {
  return (
    <h1 className={`${sizeMap[size]} font-bold tracking-tight`} style={{ fontFamily: "OngleipParkDahyeon" }}>
      <span className="text-primary">머꼬</span>
      <span className="text-foreground">머꼬</span>
    </h1>
  );
}
