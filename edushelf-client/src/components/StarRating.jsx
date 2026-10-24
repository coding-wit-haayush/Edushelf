import { useState } from 'react';
import { HiStar } from 'react-icons/hi';

export default function StarRating({ value = 0, onChange, size = 'md', readOnly = false }) {
  const [hover, setHover] = useState(0);
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
        >
          <HiStar className={`${sz} ${
            star <= (hover || value) ? 'text-amber-500' : 'text-slate-300'
          }`} />
        </button>
      ))}
    </div>
  );
}
