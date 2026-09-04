"use client";

import SmartImage from "./SmartImage";

/**
 * Profile mark in the navbar.
 *
 * Save the photo to `public/images/profile.jpg` — square crop, centred on the
 * face. Until it exists, the monogram shows; no broken image ever renders.
 */
const Avatar = () => (
  <span className="avatar">
    <SmartImage
      src="/images/profile.jpg"
      alt=""
      width={42}
      height={42}
      fallback={<span className="avatar-fallback" aria-hidden="true">SS</span>}
    />
  </span>
);

export default Avatar;
