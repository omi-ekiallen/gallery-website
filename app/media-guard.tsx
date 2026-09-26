'use client';

import { useEffect } from 'react';

/**
 * Blocks the context menu and drag-to-save on every image and video in the app,
 * including frames rendered after this mounts.
 *
 * This is a deterrent, not protection: devtools, the network tab and screenshots
 * all walk straight past it. The actual guard is server-side — locked galleries
 * are only ever sent a blurred rendering (see lib/images.ts).
 */
export default function MediaGuard() {
  useEffect(() => {
    const isMedia = (target: EventTarget | null) =>
      target instanceof Element && !!target.closest('img, video');

    const block = (e: Event) => {
      if (isMedia(e.target)) e.preventDefault();
    };

    document.addEventListener('contextmenu', block);
    document.addEventListener('dragstart', block);

    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('dragstart', block);
    };
  }, []);

  return null;
}
