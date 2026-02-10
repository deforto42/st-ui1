"use client";

import { useState } from "react";

export default function ImageStrip(props: { urls: string[] }) {
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-0">
      {props.urls.map((url, idx) => {
        const isFailed = failed[idx];
        return (
          <div key={url} className="w-full">
            {!isFailed ? (
              <img
                src={url}
                alt="인터넷 티비 최대 140만원"
                loading={idx === 0 ? "eager" : "lazy"}
                decoding="async"
                referrerPolicy="no-referrer"
                className="block h-auto w-full"
                onError={() => setFailed((p) => ({ ...p, [idx]: true }))}
              />
            ) : (
              <div className="flex min-h-[120px] w-full items-center justify-center bg-neutral-50 text-sm text-neutral-500">
                이미지 로드 실패 (원본 CDN 응답 문제일 수 있음)
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}