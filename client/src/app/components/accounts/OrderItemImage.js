'use client';

import { useEffect, useMemo, useState } from 'react';
import { getItemImageCandidates, getItemName } from './orderUtils';

const PLACEHOLDER_IMAGE = '/file.svg';

export default function OrderItemImage({ item, className = '' }) {
  const candidates = useMemo(
    () => getItemImageCandidates(item),
    [item?.image, item?.images, item?.name, item?.productId]
  );
  const [src, setSrc] = useState(candidates[0] || PLACEHOLDER_IMAGE);

  useEffect(() => {
    setSrc(candidates[0] || PLACEHOLDER_IMAGE);
  }, [candidates]);

  return (
    <img
      src={src}
      alt={getItemName(item)}
      className={className}
      onError={() => {
        const currentIndex = candidates.indexOf(src);
        const nextSrc =
          currentIndex >= 0 && currentIndex < candidates.length - 1
            ? candidates[currentIndex + 1]
            : PLACEHOLDER_IMAGE;
        if (nextSrc !== src) setSrc(nextSrc);
      }}
    />
  );
}
