"use client";

import { useMemo, useState } from "react";
import Countdown from "./Countdown";
import ImageStrip from "./ImageStrip";
import StatusTable, { StatusRow } from "./StatusTable";
import ConsentSection, { ConsentKey } from "./ConsentSection";

type Carrier = "KT" | "LGU" | "SKT" | "기타";

export default function Landing() {
  // 원본에 이미지 6장 링크가 노출되지만, 일부 환경에서 502가 나는 경우가 있어 fallback 처리 (원본 URL 형태 기반)  [oai_citation:2‡인터넷 티비 최대 140만원](https://175747947074214.dbcart.net/)
  const images = useMemo(
    () => [
      "https://img6.dbcart.net/fileupload_folder/landing_top_74214_1765432452_0_24695816.png",
      "https://img6.dbcart.net/fileupload_folder/landing_top_74214_1765432452_1_31450498.png",
      "https://img6.dbcart.net/fileupload_folder/landing_top_74214_1770188969_2_40679904.png",
      "https://img6.dbcart.net/fileupload_folder/landing_top_74214_1765432452_3_18816793.png",
      "https://img6.dbcart.net/fileupload_folder/landing_top_74214_1765432452_4_61805694.png",
      "https://img6.dbcart.net/fileupload_folder/landing_top_74214_1765432452_5_55939225.png",
    ],
    []
  );

  // 원본 예시 데이터(화면에 보이는 형태 그대로)  [oai_citation:3‡인터넷 티비 최대 140만원](https://175747947074214.dbcart.net/)
  const rows: StatusRow[] = useMemo(
    () => [
      { date: "2025-11-29", name: "남*준", phone: "010-4***-****", carrier: "기타" },
      { date: "2025-11-29", name: "광*", phone: "010-1***-****", carrier: "장기렌트/리스" },
      { date: "2025-11-29", name: "박*순", phone: "010-3***-****", carrier: "재출" },
      { date: "2025-11-29", name: "이*은", phone: "010-2***-****", carrier: "기타" },
      { date: "2025-11-29", name: "이*진", phone: "010-7***-****", carrier: "정책자금" },
    ],
    []
  );

  const [name, setName] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");
  const [carrier, setCarrier] = useState<Carrier | "">("");
  const [consents, setConsents] = useState<Record<ConsentKey, boolean>>({
    terms: false,
    privacy: false,
    thirdParty: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const allChecked = consents.terms && consents.privacy && consents.thirdParty;

  function toggleAll(next: boolean) {
    setConsents({ terms: next, privacy: next, thirdParty: next });
  }

  function toggleOne(key: ConsentKey, next: boolean) {
    setConsents((prev) => ({ ...prev, [key]: next }));
  }

  async function onSubmit() {
    if (submitting) return;

    const trimmedName = name.trim();
    const trimmedP2 = p2.trim();
    const trimmedP3 = p3.trim();

    if (!trimmedName) {
      // eslint-disable-next-line no-alert
      alert("이름을 입력해주세요.");
      return;
    }

    if (trimmedP2.length < 3 || trimmedP3.length < 4) {
      // eslint-disable-next-line no-alert
      alert("연락처를 정확히 입력해주세요.");
      return;
    }

    if (!carrier) {
      // eslint-disable-next-line no-alert
      alert("현재 통신사를 선택해주세요.");
      return;
    }

    if (!allChecked) {
      // eslint-disable-next-line no-alert
      alert("약관 및 개인정보 동의를 모두 체크해주세요.");
      return;
    }

    const payload = {
      name: trimmedName,
      phone: `010-${trimmedP2}-${trimmedP3}`,
      carrier,
      consents,
      submittedAt: new Date().toISOString(),
    };

    try {
      setSubmitting(true);
      
      // 정적 내보내기 모드에서는 API 라우트가 작동하지 않으므로 직접 webhook 호출
      const webhookUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error("Webhook URL이 설정되지 않았습니다.");
      }
      
      // Google Apps Script CORS 우회: 숨겨진 iframe을 사용하여 form 제출
      return new Promise<void>((resolve, reject) => {
        // 숨겨진 iframe 생성
        const iframe = document.createElement("iframe");
        iframe.name = "hidden-iframe-" + Date.now();
        iframe.style.display = "none";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        
        // iframe 로드 완료 시 처리
        iframe.onload = () => {
          try {
            // 성공 메시지 표시
            // eslint-disable-next-line no-alert
            alert("정상적으로 접수되었습니다. 감사합니다.");
            
            // 성공 후 입력값 초기화 + 페이지 상단으로 스크롤
            setName("");
            setP2("");
            setP3("");
            setCarrier("");
            setConsents({ terms: false, privacy: false, thirdParty: false });
            window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
            setSubmitting(false);
            
            // iframe 제거
            setTimeout(() => {
              if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
              }
            }, 1000);
            
            resolve();
          } catch (e) {
            setSubmitting(false);
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
            reject(e);
          }
        };
        
        iframe.onerror = () => {
          setSubmitting(false);
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
          // eslint-disable-next-line no-alert
          alert("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
          reject(new Error("iframe error"));
        };
        
        // iframe을 DOM에 추가
        document.body.appendChild(iframe);
        
        // form 생성 및 제출
        const form = document.createElement("form");
        form.method = "POST";
        form.action = webhookUrl;
        form.target = iframe.name;
        form.style.display = "none";
        form.enctype = "application/x-www-form-urlencoded";
        
        // payload를 form 데이터로 변환 (Google Apps Script가 기대하는 형식)
        const formData = new URLSearchParams();
        formData.append("name", payload.name);
        formData.append("phone", payload.phone);
        formData.append("carrier", payload.carrier);
        if (payload.consents) {
          formData.append("consents", JSON.stringify(payload.consents));
        }
        if (payload.submittedAt) {
          formData.append("submittedAt", payload.submittedAt);
        }
        
        // form에 데이터 추가
        formData.forEach((value, key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        // 타임아웃 설정 (10초 후 실패 처리)
        setTimeout(() => {
          if (iframe.parentNode) {
            // eslint-disable-next-line no-alert
            alert("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            setSubmitting(false);
            iframe.parentNode.removeChild(iframe);
            reject(new Error("timeout"));
          }
        }, 10000);
      });
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
    }
  }

  const canSubmit =
    name.trim().length > 0 &&
    p2.trim().length >= 3 &&
    p3.trim().length >= 4 &&
    carrier !== "" &&
    allChecked;

  return (
    <div className="w-full bg-white pb-10">
      {/* 상단 배너 + 이미지: 최대 800px */}
      <div className="mx-auto w-full max-w-[800px]">
        {/* Top banner (원본 느낌: 검은 바 + 주황 타이머) */}
        <div className="mb-3 w-full bg-black py-6 text-center text-[30px] font-extrabold leading-none text-white">
          최대 지원금 148만원 혜택{" "}
          <span className="tabular-nums text-orange-500">
            <Countdown />
          </span>{" "}
          남았습니다
        </div>

        {/* Images: 최대 800px, 그보다 작은 화면에서는 100% */}
        <ImageStrip urls={images} />
      </div>

      {/* 하단: 이미지와 동일하게 최대 800px */}
      <div className="mx-auto w-full max-w-[800px] px-4">
      {/* Status */}
      <div className="mt-7">
        <div className="rounded-lg bg-[#F8F8F8] p-4">
          <h3 className="text-center text-lg font-extrabold text-neutral-900">통신지원금 조회 현황</h3>
          <div className="mt-3">
            <StatusTable rows={rows} />
          </div>
        </div>
      </div>

      {/* Form (원본 느낌: 회색 패널) */}
      <div className="mt-6 bg-neutral-600 px-4 py-5">
        <div className="space-y-4">
        <label className="block">
          <div className="mb-1 text-sm font-semibold text-white">이름</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-neutral-300 bg-white px-3 py-3 text-base outline-none focus:border-neutral-500"
            placeholder=""
          />
        </label>

        <div>
          <div className="mb-1 text-sm font-semibold text-white">연락처</div>
          <div className="grid grid-cols-[80px_auto_1fr_auto_1fr] items-stretch gap-2">
            <select
              value="010"
              disabled
              className="rounded border border-neutral-300 bg-white px-2 py-3 text-center text-base text-neutral-700"
            >
              <option value="010">010</option>
            </select>
            <span className="flex items-center justify-center text-white">-</span>
            <input
              inputMode="numeric"
              value={p2}
              onChange={(e) => setP2(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="min-w-0 rounded border border-neutral-300 bg-white px-3 py-3 text-center text-base outline-none focus:border-neutral-500"
              placeholder="연락처"
            />
            <span className="flex items-center justify-center text-white">-</span>
            <input
              inputMode="numeric"
              value={p3}
              onChange={(e) => setP3(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="min-w-0 rounded border border-neutral-300 bg-white px-3 py-3 text-center text-base outline-none focus:border-neutral-500"
              placeholder="연락처"
            />
          </div>
        </div>

        <label className="block">
          <div className="mb-1 text-sm font-semibold text-white">현재 통신사</div>
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value as Carrier)}
            className="w-full rounded border border-neutral-300 bg-white px-3 py-3 text-base outline-none focus:border-neutral-500"
          >
            <option value="">-현재 통신사 선택-</option>
            <option value="KT">KT</option>
            <option value="LGU">LGU</option>
            <option value="SKT">SKT</option>
            <option value="기타">그 외 기타</option>
          </select>
        </label>

        {/* Consents */}
        <div className="mt-2 space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => toggleAll(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-bold text-white">전체동의(약관/수집/3자제공)</span>
          </label>

          <div className="space-y-2">
            <ConsentSection
              label="이용약관 동의"
              checked={consents.terms}
              onChange={(v: boolean) => toggleOne("terms", v)}
              // 원본 페이지에 노출된 약관 텍스트를 그대로 넣어둠(표시용)  [oai_citation:5‡인터넷 티비 최대 140만원](https://175747947074214.dbcart.net/)
              content={`제 1 장 총칙
제 1 조 (목적) 이 약관은 이페이지의 이용에 관한 조건 및 절차와 기타 필요한 사항을 규정 하는 것을 목적으로 합니다.
제 2 조 (용어의 정의) 이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
제 3 조 (약관의 효력과 변경)
제 4 조 (약관외 준칙)
제 5 조 (적용범위)
제 2 장 서비스 이용 계약
제 6 조 (이용계약의 성립)
제 7 조 (이용계약 승인의 유보)
제 3 장 서비스의 이용
제 8 조 (서비스 이용시간)
제 9 조 (이용계약의 해지 및 서비스 이용의 제한)
제 10 조 (이용자 게시물의 삭제 이용 제한)
제 11 조 (서비스의 중지 및 제한)
제 4 장 의무
제 12 조 (시스템의 의무)
제 12조의 1 (개인정보보호)
제 13 조 (이용자의 의무)
제 13 조의 1 (입력정보등)
제 5 장 저작권 및 면책
제 14 조 (게재된 자료에 대한 권리)
제 15 조 (면책)`}
            />

            <ConsentSection
              label="개인정보 수집·이용 동의"
              checked={consents.privacy}
              onChange={(v: boolean) => toggleOne("privacy", v)}
              content={`개인정보취급방침은 다음과 같은 내용을 담고 있습니다.
가. 수집하는 개인정보 항목 및 수집방법 - 신청자 이름, 핸드폰
나. 개인정보의 수집 및 이용목적 - 담당자들의 전화 상담
다. 개인정보의 보유 및 이용기간 - 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
라. 동의를 거부할 경우 신청정보가 제공되지 않습니다.`}
            />

            <ConsentSection
              label="개인정보 제3자제공 동의"
              checked={consents.thirdParty}
              onChange={(v: boolean) => toggleOne("thirdParty", v)}
              content={`① 개인정보를 제공받는 자 :
② 개인정보를 제공받는 자의 개인정보 이용 목적 :
③ 제공하는 개인정보의 항목 :
④ 개인정보를 제공받는 자의 개인정보 보유 및 이용 기간 :
⑤ 동의를 거부할 경우 신청정보가 제공되지 않습니다.`}
            />
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className={`mt-3 w-full rounded px-4 py-5 text-lg font-extrabold text-white ${
            submitting
              ? "bg-[#f44336]/70 cursor-wait"
              : "bg-[#f44336] hover:bg-[#e53935] active:bg-[#d32f2f]"
          }`}
        >
          {submitting ? "처리중입니다..." : "통신지원금 확인하기"}
        </button>
        </div>
      </div>

      {/* Footer business info (원본 표기)  [oai_citation:6‡인터넷 티비 최대 140만원](https://175747947074214.dbcart.net/) */}
      <div className="mt-8 border-t border-neutral-200 pt-5 text-xs sm:text-sm leading-6 text-neutral-700">
        <div>사업자 번호:586-20-02456</div>
        <div>상호명:유아이</div>
        <div>사업주:정제헌</div>
        <div>주소:경기도 시흥시 거북섬둘레길 36, 306호(정왕동, 웨이브스퀘어)</div>
        <div>전화번호:1555-6504</div>
      </div>
      </div>
    </div>
  );
}