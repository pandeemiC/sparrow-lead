import { Resend } from "resend";
import { render } from "@react-email/render";
import React from "react";
import HotSignalsDigest from "@/emails/HotSignalsDigest";
import type { HotSignal } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDigestEmail(to: string, signals: HotSignal[]) {
  const html = await render(<HotSignalsDigest signals={signals} />);
  await resend.emails.send({
    from: "Sparrow <onboarding@resend.dev",
    to,
    subject: `${signals.length} hot lead${signals.length > 1 ? "s" : ""} found on Sparrow`,
    html,
  });
}
