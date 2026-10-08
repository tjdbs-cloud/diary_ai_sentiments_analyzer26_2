"use client";

import React, { useState, useEffect } from "react";

interface EmotionItem {
  key: "joy" | "peace" | "sadness" | "anxiety" | "anger";
  label: string;
  emoji: string;
  percentage: number;
  isDominant: boolean;
}

interface AnalysisResult {
  dominantEmotion: string;
  dominantEmotionKo: string;
  dominantEmotionDetail?: string;
  emotions: EmotionItem[];
  summary: string;
  highlightWords?: string[];
  keywords: Array<{
    word: string;
    percentage: number;
    color: "purple" | "amber" | "emerald";
  }>;
  prescription: string;
  detectedTags?: string[];
}

interface DiaryRecord {
  timestamp: string;
  datetime: string;
  content: string;
}

export default function Home() {
  const [diaryText, setDiaryText] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // 구글 시트 연동 상태
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showDiaryModal, setShowDiaryModal] = useState<boolean>(false);
  const [diaryList, setDiaryList] = useState<DiaryRecord[]>([]);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [editingDiary, setEditingDiary] = useState<DiaryRecord | null>(null);
  const [editContentText, setEditContentText] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [deletingTimestamp, setDeletingTimestamp] = useState<string | null>(null);

  const googleScriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

  // 실시간 날짜 및 시간 설정 (요일, 시, 분만 표시)
  useEffect(() => {
    setCurrentDate(new Date());
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateString = (date: Date | null) => {
    if (!date) return "날짜 불러오는 중...";
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ];
    const weekday = weekdays[date.getDay()];
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}년 ${month}월 ${day}일 ${weekday} ${hours}:${minutes}`;
  };

  // [구글 시트 C: Create] 일기 저장
  const handleSaveDiary = async () => {
    if (!diaryText.trim()) {
      alert("저장할 일기 내용을 작성해주세요!");
      return;
    }
    if (!googleScriptUrl) {
      alert("구글 스크립트 URL(NEXT_PUBLIC_GOOGLE_SCRIPT_URL)이 설정되지 않았습니다.");
      return;
    }

    setIsSaving(true);
    const now = new Date();
    const currentDateTimeStr = formatDateString(currentDate || now);
    const timestampStr = String(now.getTime());

    try {
      const response = await fetch(googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "create",
          timestamp: timestampStr,
          datetime: currentDateTimeStr,
          content: diaryText,
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        alert("일기가 구글 시트에 성공적으로 저장되었습니다!");
      } else {
        throw new Error(resData.message || resData.error || "저장에 실패했습니다.");
      }
    } catch (err: any) {
      console.error(err);
      alert("일기 저장 중 오류 발생: " + (err.message || err.toString()));
    } finally {
      setIsSaving(false);
    }
  };

  // [구글 시트 R: Read] 일기 목록 조회
  const handleOpenDiaryList = async () => {
    setShowDiaryModal(true);
    if (!googleScriptUrl) {
      alert("구글 스크립트 URL(NEXT_PUBLIC_GOOGLE_SCRIPT_URL)이 설정되지 않았습니다.");
      return;
    }

    setIsLoadingList(true);
    try {
      const response = await fetch(`${googleScriptUrl}?action=read`);
      const resData = await response.json();
      if (resData.success && Array.isArray(resData.data)) {
        // 최신순 정렬
        setDiaryList(resData.data.reverse());
      } else {
        throw new Error(resData.message || resData.error || "일기를 불러오지 못했습니다.");
      }
    } catch (err: any) {
      console.error(err);
      alert("일기 목록 조회 실패: " + (err.message || err.toString()));
    } finally {
      setIsLoadingList(false);
    }
  };

  // [구글 시트 U: Update] 일기 내용 수정 저장
  const handleUpdateDiary = async () => {
    if (!editingDiary) return;
    if (!editContentText.trim()) {
      alert("수정할 내용을 입력해주세요.");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "update",
          timestamp: editingDiary.timestamp,
          content: editContentText,
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        setDiaryList((prev) =>
          prev.map((item) =>
            item.timestamp === editingDiary.timestamp
              ? { ...item, content: editContentText }
              : item
          )
        );
        setEditingDiary(null);
        alert("일기가 성공적으로 수정되었습니다.");
      } else {
        throw new Error(resData.message || "수정에 실패했습니다.");
      }
    } catch (err: any) {
      alert("일기 수정 실패: " + (err.message || err.toString()));
    } finally {
      setIsUpdating(false);
    }
  };

  // [구글 시트 D: Delete] 일기 삭제
  const handleDeleteDiary = async (timestamp: string) => {
    if (!confirm("이 일기를 정말 삭제하시겠습니까?")) return;

    setDeletingTimestamp(timestamp);
    try {
      const response = await fetch(googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "delete",
          timestamp: timestamp,
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        setDiaryList((prev) => prev.filter((item) => item.timestamp !== timestamp));
        alert("일기가 삭제되었습니다.");
      } else {
        throw new Error(resData.message || "삭제에 실패했습니다.");
      }
    } catch (err: any) {
      alert("일기 삭제 실패: " + (err.message || err.toString()));
    } finally {
      setDeletingTimestamp(null);
    }
  };

  // 목록에서 일기 불러와 작성창에 넣기
  const handleLoadToEditor = (content: string) => {
    if (diaryText.trim() && !confirm("현재 작성 중인 일기 내용이 바뀝니다. 계속할까요?")) {
      return;
    }
    setDiaryText(content);
    setShowDiaryModal(false);
  };

  // AI 분석 실행
  const handleAnalyze = async () => {
    if (!diaryText.trim()) {
      alert("일기 내용을 작성해주세요!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: diaryText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "분석에 실패했습니다.");
      }

      setResult(data);

      if (data.detectedTags && data.detectedTags.length > 0) {
        setTags(data.detectedTags);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "분석 도중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 재시작 (작성 초기화)
  const handleReset = () => {
    if (confirm("일기 작성 내용을 초기화하고 재시작하시겠습니까?")) {
      setDiaryText("");
      setTags([]);
      setResult(null);
    }
  };

  // 일기 본문 텍스트 변경
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDiaryText(e.target.value);
  };

  // 총평 내 강조 키워드 하이라이팅 렌더링
  const renderSummaryWithHighlights = (
    summaryText: string,
    highlightWords?: string[]
  ) => {
    if (!highlightWords || highlightWords.length === 0) {
      return `"${summaryText}"`;
    }

    const escapedWords = highlightWords.map((w) =>
      w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    const regex = new RegExp(`(${escapedWords.join("|")})`, "g");
    const parts = summaryText.split(regex);

    return (
      <>
        &ldquo;
        {parts.map((part, idx) => {
          if (highlightWords.includes(part)) {
            return (
              <span key={idx} className="font-semibold text-[#735BF2]">
                {part}
              </span>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
        &rdquo;
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-[#1A1B20] flex flex-col justify-between">
      {/* 1. 상단 내비게이션 바 (모바일 반응형 최적화) */}
      <header className="w-full bg-[#FAF9FF]/90 backdrop-blur-md border-b border-[#ECEAF5] px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between sticky top-0 z-30 transition-all">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#735BF2] flex items-center justify-center text-white shadow-xs shrink-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-bold text-sm sm:text-base md:text-lg text-[#1A1B20] tracking-tight truncate">
                Diary AI Sentiments Analyzer
              </h1>
              <span className="hidden xs:inline-flex px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-[#EFEBFD] text-[#735BF2] shrink-0">
                Gemini 3.1 Flash-Lite
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#787586] truncate">
              AI 감정 다이어리 & 멘탈 웰니스 가이드
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-[#787586]">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#735BF2] animate-pulse"></span>
            <span className="hidden sm:inline">Gemini 연동됨</span>
          </div>
          <button
            title="프로필"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#EAE8F2] flex items-center justify-center text-[#484555] hover:bg-[#E0DDEB] transition"
          >
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>
        </div>
      </header>

      {/* 2. 메인 컨텐츠 영역 */}
      <main className="max-w-4xl w-full mx-auto px-4 py-8 flex-1 flex flex-col gap-6">
        {/* 일기 작성 카드 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(115,91,242,0.04)] border border-[rgba(115,91,242,0.08)] flex flex-col justify-between min-h-[300px]">
          {/* 일기 작성 영역 상단 바: 좌측(날짜, 요일, 시간, 날씨) + 우측(저장, 일기보기 버튼) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-[#F6F5FA]">
            {/* 좌측: 날짜 네비게이션 및 요일, 시:분, 날씨 뱃지 */}
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-1.5 sm:gap-2.5">
              <div className="flex items-center gap-0.5 sm:gap-1 text-[#1A1B20]">
                <button
                  className="p-1 rounded-full text-[#787586] hover:bg-[#EFEBFD] transition"
                  title="이전 날짜"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-bold text-xs sm:text-sm md:text-base tracking-tight text-[#1A1B20]">
                  {formatDateString(currentDate)}
                </span>
                <button
                  className="p-1 rounded-full text-[#787586] hover:bg-[#EFEBFD] transition"
                  title="다음 날짜"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5">
                <button className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-[#EFEBFD] text-[#735BF2] hover:bg-[#E0D9FB] transition">
                  오늘
                </button>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FAF9FF] text-[10px] sm:text-xs text-[#484555] border border-[#ECEAF5]">
                  <span className="text-amber-500">☀️</span>
                  <span>맑음 23°C</span>
                </div>
              </div>
            </div>

            {/* 우측: 저장 & 일기보기 버튼 */}
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={handleSaveDiary}
                disabled={isSaving}
                className="px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold bg-[#735BF2] text-white hover:bg-[#6045E2] disabled:bg-[#B9ACFA] transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>저장 중...</span>
                  </>
                ) : (
                  <span>저장</span>
                )}
              </button>
              <button
                type="button"
                onClick={handleOpenDiaryList}
                className="px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold bg-[#EFEBFD] text-[#735BF2] border border-[#E0D9FB] hover:bg-[#E4DCFC] transition shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>일기보기</span>
              </button>
            </div>
          </div>

          <textarea
            value={diaryText}
            onChange={handleTextChange}
            placeholder="오늘 하루는 어떠셨나요? 당신의 솔직한 감정과 소소한 순간들을 편안하게 적어보세요..."
            className="w-full flex-1 resize-none border-none outline-none text-[#1A1B20] text-base sm:text-lg leading-relaxed placeholder-[#A5A2B5] bg-transparent min-h-[160px] pt-3"
          />

          <div className="pt-6 border-t border-[#F1EFF7] flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-[#F4F3F9] text-[#787586] font-medium"
                >
                  #{tag}
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-[#A5A2B5]">#일기 태그</span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[#787586]">
              <span>{diaryText.length}자</span>
            </div>
          </div>
        </div>

        {/* 액션 버튼 바: AI 감정 분석 / 재시작 */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className={`flex-1 w-full sm:w-auto py-3.5 px-6 rounded-full font-semibold text-white shadow-[0_4px_16px_rgba(115,91,242,0.25)] flex items-center justify-center gap-2 transition duration-200 ${
              isLoading
                ? "bg-[#9B89F7] cursor-not-allowed"
                : "bg-[#735BF2] hover:bg-[#6247E6] active:scale-[0.99]"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Gemini가 감정을 분석하고 있습니다...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>AI 감정 분석</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full font-medium text-[#484555] bg-white border border-[#ECEAF5] hover:bg-[#F4F3F9] active:scale-95 transition text-sm shadow-xs"
          >
            재시작
          </button>
        </div>

        {/* AI 분석 완료 후에만 나타나는 영역 (감정 이모지 스펙트럼 & AI 감정 리포트) */}
        {result && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* 감정 스펙트럼 섹션 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base sm:text-lg text-[#1A1B20]">
                  감정 스펙트럼
                </h3>
                <span className="text-xs sm:text-sm text-[#787586]">
                  주 감정:{" "}
                  <strong className="text-[#1A1B20] font-semibold">
                    {result.dominantEmotionDetail ||
                      `${result.dominantEmotionKo} / 환희`}
                  </strong>
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {result.emotions.map((item) => {
                  const isDominant =
                    item.isDominant ||
                    item.key === result.dominantEmotion;

                  return (
                    <div
                      key={item.key}
                      className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl transition-all duration-300 ${
                        isDominant
                          ? "bg-[#FFF9EE] border-2 border-[#FFD27D] shadow-[0_4px_16px_rgba(255,183,77,0.2)] scale-102"
                          : "bg-white border border-[#ECEAF5] shadow-xs hover:border-[#DED9F2]"
                      }`}
                    >
                      <span
                        className={`text-2xl sm:text-3xl mb-1.5 transition-transform ${
                          isDominant ? "scale-115" : ""
                        }`}
                      >
                        {item.emoji}
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-semibold mb-0.5 ${
                          isDominant ? "text-[#E65100]" : "text-[#1A1B20]"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          isDominant ? "text-[#E65100]" : "text-[#787586]"
                        }`}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI 일기 감성 분석 결과 영역 (AI 감정 리포트) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(115,91,242,0.04)] border border-[rgba(115,91,242,0.08)] flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#EFEBFD] text-[#735BF2] flex items-center justify-center text-sm font-bold">
                    📍
                  </span>
                  <h4 className="font-bold text-base text-[#1A1B20]">
                    AI 감정 리포트
                  </h4>
                </div>
                <span className="text-xs text-[#787586]">Gemini 3.1 Flash-Lite</span>
              </div>

              <p className="text-[#1A1B20] text-base sm:text-lg leading-relaxed">
                {renderSummaryWithHighlights(
                  result.summary,
                  result.highlightWords
                )}
              </p>

              {/* 감정/성취 해시태그 키워드 */}
              <div className="flex flex-wrap items-center gap-2">
                {result.keywords.map((kw, idx) => {
                  let colorClass = "bg-[#F3E8FF] text-[#7E22CE]";
                  if (kw.color === "amber") {
                    colorClass = "bg-[#FEF3C7] text-[#B45309]";
                  } else if (kw.color === "emerald") {
                    colorClass = "bg-[#D1FAE5] text-[#047857]";
                  }

                  return (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${colorClass}`}
                    >
                      #{kw.word} ({kw.percentage}%)
                    </span>
                  );
                })}
              </div>

              {/* 따뜻한 처방 제안 */}
              <div className="pt-4 border-t border-[#F1EFF7] flex items-center justify-between text-xs sm:text-sm text-[#787586]">
                <div className="flex items-center gap-2">
                  <span className="text-[#735BF2]">🌿</span>
                  <span>{result.prescription}</span>
                </div>
                <button
                  onClick={() => alert(`마음 처방: ${result.prescription}`)}
                  className="text-[#735BF2] font-semibold hover:underline"
                >
                  처방 보관
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. 구글 시트 일기 목록 모달 (CRUD) */}
      {showDiaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-[#ECEAF5]">
            {/* 모달 헤더 */}
            <div className="px-6 py-4 border-b border-[#ECEAF5] flex items-center justify-between bg-[#FAF9FF]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#EFEBFD] text-[#735BF2] flex items-center justify-center text-sm font-bold">
                  📖
                </span>
                <div>
                  <h3 className="font-bold text-base text-[#1A1B20]">구글 시트 일기 저장소</h3>
                  <p className="text-xs text-[#787586]">저장된 일기 목록을 확인, 수정, 삭제하거나 불러올 수 있습니다.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDiaryModal(false);
                  setEditingDiary(null);
                }}
                className="p-1.5 rounded-full text-[#787586] hover:bg-[#EFEBFD] transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 본문 (일기 리스트 또는 수정 폼) */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              {/* 일기 수정 모드 */}
              {editingDiary ? (
                <div className="flex flex-col gap-3 bg-[#FAF9FF] p-4 rounded-2xl border border-[#E0D9FB]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#735BF2]">
                      ✏️ 일기 수정 ({editingDiary.datetime})
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingDiary(null)}
                      className="text-xs text-[#787586] hover:underline cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                  <textarea
                    value={editContentText}
                    onChange={(e) => setEditContentText(e.target.value)}
                    rows={5}
                    className="w-full p-3 bg-white rounded-xl border border-[#ECEAF5] text-sm text-[#1A1B20] focus:outline-[#735BF2] resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingDiary(null)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium text-[#787586] bg-white border border-[#ECEAF5] hover:bg-[#F4F3F9] cursor-pointer"
                    >
                      닫기
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateDiary}
                      disabled={isUpdating}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#735BF2] text-white hover:bg-[#6045E2] disabled:bg-[#B9ACFA] transition cursor-pointer"
                    >
                      {isUpdating ? "수정 중..." : "수정 완료"}
                    </button>
                  </div>
                </div>
              ) : null}

              {isLoadingList ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#787586]">
                  <svg className="animate-spin h-7 w-7 text-[#735BF2]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm font-medium">구글 시트에서 일기를 불러오는 중...</span>
                </div>
              ) : diaryList.length === 0 ? (
                <div className="py-12 text-center text-[#787586] flex flex-col items-center gap-2">
                  <span className="text-3xl">📭</span>
                  <p className="text-sm font-medium">저장된 일기가 아직 없습니다.</p>
                  <p className="text-xs text-[#A5A2B5]">일기를 작성하고 [저장] 버튼을 눌러보세요.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {diaryList.map((item) => (
                    <div
                      key={item.timestamp}
                      className="p-4 rounded-2xl border border-[#ECEAF5] bg-white hover:border-[#D5CFF7] transition shadow-2xs flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between text-xs text-[#787586]">
                        <span className="font-semibold text-[#1A1B20] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#735BF2]"></span>
                          {item.datetime || "날짜 미지정"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleLoadToEditor(item.content)}
                            className="text-[#735BF2] hover:underline font-medium cursor-pointer"
                            title="작성창으로 불러오기"
                          >
                            작성창에 불러오기
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDiary(item);
                              setEditContentText(item.content);
                            }}
                            className="text-[#484555] hover:text-[#735BF2] font-medium cursor-pointer"
                          >
                            수정
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteDiary(item.timestamp)}
                            disabled={deletingTimestamp === item.timestamp}
                            className="text-red-500 hover:text-red-700 font-medium cursor-pointer"
                          >
                            {deletingTimestamp === item.timestamp ? "삭제 중..." : "삭제"}
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-[#1A1B20] whitespace-pre-wrap leading-relaxed line-clamp-4 bg-[#FAF9FF] p-3 rounded-xl border border-[#F4F3F9]">
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="px-6 py-3 border-t border-[#ECEAF5] bg-[#FAF9FF] flex items-center justify-between text-xs text-[#787586]">
              <span>총 {diaryList.length}개의 기록</span>
              <button
                type="button"
                onClick={handleOpenDiaryList}
                className="text-[#735BF2] hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                🔄 새로고침
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. 세련된 푸터 영역 (글자 크기 감소 & 한 줄 레이아웃 & 모바일 최적화) */}
      <footer className="w-full border-t border-[#ECEAF5] bg-[#FAF9FF] mt-10 sm:mt-12 py-5 sm:py-6 px-4 sm:px-6 text-[11px] sm:text-xs text-[#787586]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
          {/* 브랜드 & 카피라이트 */}
          <div className="flex items-center gap-2 text-center md:text-left flex-wrap justify-center md:justify-start">
            <span className="w-4 h-4 rounded-md bg-[#735BF2]/10 text-[#735BF2] flex items-center justify-center font-bold text-[9px] shrink-0">
              INU
            </span>
            <span className="font-semibold text-[#1A1B20] text-[11px] sm:text-xs">
              Diary AI Sentiments Analyzer
            </span>
            <span className="text-[#D5D2E3]">|</span>
            <p className="text-[#656372] tracking-tight whitespace-nowrap text-[10.5px] sm:text-[11.5px]">
              Copyright INU Diary AI Sentiments Analyzer by seoyun
            </p>
          </div>

          {/* AI 모델 뱃지 */}
          <div className="flex items-center text-[#787586] text-[10.5px] sm:text-[11.5px] whitespace-nowrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EFEBFD] text-[#735BF2] font-medium text-[10px] sm:text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#735BF2]"></span>
              Powered by Google Gemini 3.1 Flash-Lite
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}


