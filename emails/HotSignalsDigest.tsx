import type { HotSignal } from "@/types";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from "@react-email/components";

type Props = {
  signals: HotSignal[];
};

export default function HotSignalsDigest({ signals }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#0d0d0d", fontFamily: "sans-serif" }}>
        <Container
          style={{ maxWidth: 560, margin: "0 auto", padding: "32px 16px" }}
        >
          <Section style={{ marginBottom: 4 }}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#ef4444"
                strokeWidth="1.5"
              />
              <circle
                cx="12"
                cy="12"
                r="6"
                stroke="#ef4444"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="12" r="2" fill="#ef4444" />
              <line
                x1="12"
                y1="2"
                x2="12"
                y2="6"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="18"
                x2="12"
                y2="22"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="2"
                y1="12"
                x2="6"
                y2="12"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="18"
                y1="12"
                x2="22"
                y2="12"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <Text
              style={{
                color: "#ffffff",
                fontSize: 20,
                fontWeight: "bold",
                margin: "8px 0 0 0",
              }}
            >
              {signals.length} hot lead{signals.length > 1 ? "s" : ""} found
            </Text>
          </Section>
          <Text style={{ color: "#999999", fontSize: 13, marginTop: 0 }}>
            Sparrow detected these high-intent signals for your keywords.
          </Text>

          <Hr style={{ borderColor: "#222222", margin: "24px 0" }} />

          {signals.map((signal, i) => (
            <Section
              key={i}
              style={{
                marginBottom: 20,
                padding: "16px",
                backgroundColor: "#1a1a1a",
                borderRadius: 8,
                borderLeft: "3px solid #ef4444",
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: "bold",
                  margin: "0 0 6px 0",
                }}
              >
                {signal.title}
              </Text>
              <Text
                style={{ color: "#999999", fontSize: 12, margin: "0 0 10px 0" }}
              >
                {signal.reason}
              </Text>
              <Text
                style={{
                  color: "#ef4444",
                  fontSize: 12,
                  fontWeight: "bold",
                  margin: "0 0 8px 0",
                }}
              >
                Score: {signal.score}/10 ·{" "}
                {signal.platform === "reddit" ? "Reddit" : "Hacker News"}
              </Text>
              <Link
                href={signal.url}
                style={{ color: "#ef4444", fontSize: 12 }}
              >
                View post →
              </Link>
            </Section>
          ))}

          <Hr style={{ borderColor: "#222222", margin: "24px 0" }} />
          <Text style={{ color: "#555555", fontSize: 11, textAlign: "center" }}>
            Sparrow · You are receiving this because you have keyword alerts
            enabled.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
