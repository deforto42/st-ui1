"use client";

import { useEffect, useState } from "react";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** 현재 시각 기준 다음 0시(자정)까지 남은 초 */
function getSecondsUntilMidnight(): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
}

export default function Countdown() {
  // 초기값을 null로 설정하여 서버/클라이언트 불일치 방지
  const [left, setLeft] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 클라이언트에서만 마운트 후 초기값 설정
    setMounted(true);
    setLeft(getSecondsUntilMidnight);
    
    const t = setInterval(() => {
      setLeft(getSecondsUntilMidnight);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // 서버 렌더링 시 또는 마운트 전에는 기본값 표시
  if (!mounted || left === null) {
    return <span>00:00:00</span>;
  }

  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;

  return (
    <span>
      {pad2(h)}:{pad2(m)}:{pad2(s)}
    </span>
  );
}
