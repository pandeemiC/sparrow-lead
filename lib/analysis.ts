import Anthropic from "@anthropic-ai/sdk";
import { AiAnalysis, AnalyzePostInput } from "@/types";

const anthropic = new Anthropic();

export async function analyzePost({
  keyword,
  title,
  body,
}: AnalyzePostInput): Promise<AiAnalysis> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `You are a lead generation analyst. A user is tracking the keyword "${keyword}" to find potential customers for their business.
        
        Analyze this social media post and determine if the author could be a potential lead: 

        Title: ${title}
        Body: ${body}

        Respond in JSON only, no other text:
        {
        "relevance": <number 0-100>,
        "reasoning": "<one sentence explaining why this is or isn't a good lead>",
        "suggested_reply": "<a helpful, non-spammy reply the user could post>"
        }`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  try {
    return JSON.parse(text);
  } catch {
    return {
      relevance: 0,
      reasoning: "Could not analyze this post",
      suggested_reply: "",
    };
  }
}
