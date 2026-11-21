import { useLayoutEffect, useRef, useState } from 'react';

const W = 1920;
const H = 1080;

export default function ScaledStage({ children, className = '' }) {
  const hostRef = useRef(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const update = () => {
      const { width, height } = host.getBoundingClientRect();
      setScale(Math.min(width / W, height / H));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={hostRef} className={`stage-host ${className}`}>
      <div
        className="stage"
        style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
