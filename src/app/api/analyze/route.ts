import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const SentimentSchema = z.object({
  dominantEmotion: z.enum(["joy", "peace", "sadness", "anxiety", "anger"]).describe("가장 지배적인 감정 키"),
  dominantEmotionKo: z.string().describe("지배적인 감정의 한글 이름 (예: 기쁨, 평온, 슬픔, 불안, 분노)"),
  dominantEmotionDetail: z.string().describe("지배 감정에 대한 보조 설명 (예: 기쁨 / 환희)"),
  emotions: z.array(
    z.object({
      key: z.enum(["joy", "peace", "sadness", "anxiety", "anger"]),
      label: z.string(),
      emoji: z.string(),
      percentage: z.number().int().min(0).max(100),
      isDominant: z.boolean(),
    })
  ).length(5).describe("5개 감정(기쁨, 평온, 슬픔, 불안, 분노)의 강도 백분율"),
  summary: z.string().describe("공감과 격려가 담긴 1-2문장의 감정 리포트 총평"),
  highlightWords: z.array(z.string()).describe("총평 중에서 강조(볼드/보라색) 처리할 핵심 키워드 목록 (예: ['자기 효능감', '감사'])"),
  keywords: z.array(
    z.object({
      word: z.string().describe("해시태그 키워드"),
      percentage: z.number().int().min(0).max(100).describe("관련도 %"),
      color: z.enum(["purple", "amber", "emerald"]).describe("칩 색상 테마"),
    })
  ).describe("감정/활동 핵심 해시태그 3개"),
  prescription: z.string().describe("마음 챙김을 위한 오늘 밤의 따뜻한 1문장 처방/조언"),
  detectedTags: z.array(z.string()).describe("일기 본문 내용 기반 자동 추출된 2~3개의 태그 (예: ['산책', '업무해결', '감사'])"),
});

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "일기 내용을 작성해주세요." },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Google Gemini API 키가 설정되지 않았습니다. .env.local 파일에 GEMINI_API_KEY(또는 GOOGLE_GENERATIVE_AI_API_KEY)를 등록해 주세요.",
        },
        { status: 500 }
      );
    }

    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    // gemini-3.1-flash-lite 모델 사용
    const model = google("gemini-3.1-flash-lite");

    const result = await generateObject({
      model: model,
      schema: SentimentSchema,
      prompt: `당신은 사용자의 감정을 깊이 공감하고 위로하는 AI 심리 분석 전문가입니다.
사용자가 작성한 일기를 읽고 5가지 감정(기쁨, 평온, 슬픔, 불안, 분노)의 비율과 따뜻한 리포트를 도출하세요.
반드시 5가지 감정의 키("joy", "peace", "sadness", "anxiety", "anger")를 모두 포함하고, 가장 강한 감정 하나를 dominantEmotion으로 지정하세요.

[사용자의 일기 내용]:
"""
${content}
"""
`,
    });

    return NextResponse.json(result.object);
  } catch (error: any) {
    console.error("Gemini 감정 분석 오류:", error);
    return NextResponse.json(
      { error: "감정 분석 처리 중 오류가 발생했습니다: " + (error?.message || "알 수 없는 오류") },
      { status: 500 }
    );
  }
}
