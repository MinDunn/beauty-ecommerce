import { useState, useEffect } from 'react';

export const CountdownClock = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      
      if (diff <= 0) return { hours: '00', minutes: '00', seconds: '00' };
      
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      
      return {
        hours: h < 10 ? `0${h}` : `${h}`,
        minutes: m < 10 ? `0${m}` : `${m}`,
        seconds: s < 10 ? `0${s}` : `${s}`
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1.5 ml-4 md:ml-6">
      <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:block">Kết thúc sau:</span>
      <div className="flex items-center gap-1 mt-0.5">
        <TimeUnit value={timeLeft.hours} label="H" />
        <span className="text-primary-500 font-bold">:</span>
        <TimeUnit value={timeLeft.minutes} label="M" />
        <span className="text-primary-500 font-bold">:</span>
        <TimeUnit value={timeLeft.seconds} label="S" />
      </div>
    </div>
  );
};

const TimeUnit = ({ value }: { value: string; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="bg-white border-2 border-primary-100 text-primary-600 min-w-[32px] md:min-w-[38px] h-8 md:h-10 flex items-center justify-center rounded-xl font-black text-base md:text-lg shadow-sm shadow-primary-100/50 tabular-nums">
      {value}
    </div>
  </div>
);
