import Image from "next/image";

type BrandHeaderProps = {
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
};

export function BrandHeader({ 
  title = "おかえり、Istriへ", 
  subtitle = "だいじななかまと、おなじばしょで。",
  size = "md",
  align = "left"
}: BrandHeaderProps) {
  const logoWidth = size === "sm" ? 120 : size === "lg" ? 240 : 200;
  const titleSize = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-xl md:text-2xl";
  const alignment = align === "center" ? "text-center items-center" : "text-center md:text-left items-center md:items-start";

  return (
    <div className={`flex flex-col justify-center ${alignment}`}>
      <div className={`relative ${size === "sm" ? "w-[120px] h-[120px]" : size === "lg" ? "w-[240px] h-[240px]" : "w-[140px] h-[140px] md:w-[200px] md:h-[200px]"} ${align === "left" ? "mx-auto md:ml-0" : "mx-auto"}`}>
        <Image 
          src="/pic/istri_logo.png" 
          alt="istri" 
          width={logoWidth} 
          height={logoWidth} 
          priority={true}
          className="object-contain"
        />
      </div>
      <div className="space-y-0.5">
         <h1 className={`${titleSize} font-black text-orange-950 leading-tight`}>{title}</h1>
         <p className="text-orange-300 text-[10px] font-black italic tracking-wider">{subtitle}</p>
      </div>
    </div>
  );
}
