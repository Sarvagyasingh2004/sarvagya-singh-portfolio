"use client";

import { useState } from "react";

// Falls back to a lettered monogram, so a company whose logo file isn't saved
// yet renders as a designed mark rather than a broken image.
const CompanyLogo = ({ src, name }) => {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (failed || !src) {
    return (
      <span className="company-monogram" aria-hidden="true">
        {initials}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width="48"
      height="48"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

export default CompanyLogo;
