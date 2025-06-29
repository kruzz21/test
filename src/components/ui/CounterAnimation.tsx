import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface CounterAnimationProps {
  end: number;
  duration?: number;
}

const CounterAnimation = ({ end, duration = 2 }: CounterAnimationProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!isInView) return;
    
    let startTimestamp: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [end, duration, isInView]);
  
  return <span ref={ref}>{count.toLocaleString()}</span>;
};

export default CounterAnimation;