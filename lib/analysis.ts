import { generateContent } from "./gemini";
import type { AnalyzePostInput } from "@/types";

export async function analyzePost({
  keyword,
  title,
  body,
  listenerContext,
}: AnalyzePostInput): Promise<{ score: number; reason: string; type: string }> {
  const response = await generateContent({
    model: "gemini-3.1-flash-lite",
    contents: `You are analyzing social media posts for buyer intent.
    Post: "${title} - ${body?.slice(0, 500)}"
    Keywords tracked: "${keyword}"
    ${listenerContext ? `User context: "${listenerContext}" - use this to judge the given information specifically in relevance to the user` : ""}
    Return JSON only, no other text:
    {
      "score": <number 1-10 buyer intent>,
      "reason": "<one sentence why>",
      "type": "<seeking_recommendation|pain_point|competitor_complaint|question|general>"
    }`,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 200,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const text = response.text ?? "";

  try {
    return JSON.parse(text);
  } catch {
    return { score: 1, reason: "Could not analyze this post", type: "general" };
  }
}

//  GROQ SDK
// export async function analyzePost({
//   keyword,
//   title,
//   body,
//   listenerContext,
// }: AnalyzePostInput): Promise<{ score: number; reason: string; type: string }> {
//   const completion = await groq.chat.completions.create({
//     model: "openai/gpt-oss-120b",
//     max_tokens: 200,
//     messages: [
//       {
//         role: "user",
//         content: `You are analyzing social media posts for buyer intent.
//         Post: "${title} - ${body?.slice(0, 500)}"
//         Keyword tracked: "${keyword}"
//         ${listenerContext ? `User context: "${listenerContext}" - use this to judge the given information specifically in relevance to the user` : ""}
//         Return JSON only, no other text:
//         {
//           "score": <number 1-10 buyer intent>,
//           "reason": "<one sentence why>",
//           "type": "<seeking_recommendation|pain_point|competitor_complaint|question|general>"
//         }`,
//       },
//     ],
//   });

//   const text = completion.choices[0]?.message?.content ?? "";

//   try {
//     return JSON.parse(text);
//   } catch {
//     return { score: 1, reason: "Could not analyze this post", type: "general" };
//   }
// }

// ----------------------- ANTHROPIC ---------------------- //

// import Anthropic from "@anthropic-ai/sdk";
// import { AiAnalysis, AnalyzePostInput } from "@/types";

// const anthropic = new Anthropic();

// export async function analyzePost({
//   keyword,
//   title,
//   body,
// }: AnalyzePostInput): Promise<AiAnalysis> {
//   const message = await anthropic.messages.create({
//     model: "claude-sonnet-4-6",
//     max_tokens: 300,
//     messages: [
//       {
//         role: "user",
//         content: `You are a lead generation analyst. A user is tracking the keyword "${keyword}" to find potential customers for their business.

//         Analyze this social media post and determine if the author could be a potential lead:

//         Title: ${title}
//         Body: ${body}

//         Respond in JSON only, no other text:
//         {
//         "relevance": <number 0-100>,
//         "reasoning": "<one sentence explaining why this is or isn't a good lead>",
//         "suggested_reply": "<a helpful, non-spammy reply the user could post>"
//         }`,
//       },
//     ],
//   });

//   const text =
//     message.content[0].type === "text" ? message.content[0].text : "";

//   try {
//     return JSON.parse(text);
//   } catch {
//     return {
//       relevance: 0,
//       reasoning: "Could not analyze this post",
//       suggested_reply: "",
//     };
//   }
// }
