"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type StatusRow = {
  date: string;
  name: string;
  phone: string;
  carrier: string;
};

const ROLL_INTERVAL_MS = 3000;

export default function StatusTable(props: { rows: StatusRow[] }) {
  const [order, setOrder] = useState(() => props.rows.map((_, i) => i));
  const [offsetY, setOffsetY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rowHeight, setRowHeight] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);

  const orderedRows = order.map((i) => props.rows[i]);
  const listRows = orderedRows.length > 0 ? [...orderedRows, orderedRows[0]] : [];
  // 행 높이는 화면 크기/폰트 크기에 따라 바뀌므로, 리사이즈 시마다 다시 계산
  useEffect(() => {
    function updateHeight() {
      if (!rowRef.current) return;
      const h = rowRef.current.offsetHeight;
      if (h && h !== rowHeight) {
        setRowHeight(h);
      }
    }
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [rowHeight]);

  const runRoll = useCallback(() => {
    if (props.rows.length <= 1 || !rowRef.current || rowHeight <= 0) return;
    setIsAnimating(true);
    setOffsetY(-rowHeight);
  }, [props.rows.length, rowHeight]);

  useEffect(() => {
    if (props.rows.length <= 1) return;
    const t = setInterval(runRoll, ROLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [props.rows.length, runRoll]);

  const handleTransitionEnd = useCallback(() => {
    if (!isAnimating) return;
    setOrder((prev) => [...prev.slice(1), prev[0]]);
    setOffsetY(0);
    setIsAnimating(false);
  }, [isAnimating]);

  const viewportHeight = rowHeight > 0 ? rowHeight * 5 : undefined;

  return (
    <div className="overflow-hidden rounded border border-neutral-200 bg-[#F8F8F8]">
      <div className="grid grid-cols-4 bg-black px-3 py-2 text-center text-[11px] sm:text-xs font-bold text-white">
        <div>접수일</div>
        <div>이름</div>
        <div>연락처</div>
        <div>현재 통신사</div>
      </div>
      <div
        className="relative overflow-hidden"
        style={viewportHeight != null ? { height: viewportHeight } : undefined}
      >
        <div
          className={`divide-y divide-neutral-200 ease-out ${isAnimating ? "transition-transform duration-500" : ""}`}
          style={{
            transform: `translateY(${offsetY}px)`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {listRows.map((r, i) => (
            <div
              ref={i === 0 ? rowRef : undefined}
              key={i === listRows.length - 1 ? `tail-${order[0]}` : `${order[i]}-${i}`}
              className="grid grid-cols-4 px-3 py-2 text-center text-xs sm:text-sm bg-white text-neutral-800"
            >
              <div>{r.date}</div>
              <div className="font-semibold">{r.name}</div>
              <div className="tabular-nums">{r.phone}</div>
              <div>{r.carrier}</div>
            </div>
          ))}
        </div>
        {/* 고정 오버레이: 첫 번째 행 위치에 살짝 작은 검정 테두리 박스 */}
        {rowHeight > 0 && (
          <div
            className="pointer-events-none absolute inset-x-1 top-1 z-10 box-border border-2 border-black bg-transparent"
            style={{ height: Math.max(0, rowHeight - 8) }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
