"use client";

import { useState } from "react";

/**
 * Profile mark in the navbar.
 *
 * Falls back to initials if the photo is missing, so the header never shows a
 * broken image. Save the photo to `public/images/profile.jpg` — cropped square
 * and centred on the face; `object-position: center 22%` biases toward the top
 * of the frame, which is where the face sits in a standing photo.
 */
const Avatar = () => {
  const [failed, setFailed] = useState(false);

  return (
    <span className="avatar">
      {failed ? (
        <span className="avatar-fallback" aria-hidden="true">SS</span>
      ) : (
        <img
          src="/images/profile.jpg"
          alt=""
          width="42"
          height="42"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
};

export default Avatar;
