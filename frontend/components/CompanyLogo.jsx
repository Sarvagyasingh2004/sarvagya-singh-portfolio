"use client";

import SmartImage from "./SmartImage";

// Lettered monogram until a real logo file is saved — see
// public/images/companies/README.md.
const CompanyLogo = ({ src, name }) => {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SmartImage
      src={src}
      alt=""
      width={48}
      height={48}
      fallback={
        <span className="company-monogram" aria-hidden="true">
          {initials}
        </span>
      }
    />
  );
};

export default CompanyLogo;
