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
  Row,
  Column,
  Font,
  Img,
} from "@react-email/components";

type Props = {
  signals: HotSignal[];
};

export default function HotSignalsDigest({ signals }: Props) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Montserrat"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Montserrat"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm459WlhywU.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      <Body
        style={{
          backgroundColor: "#0d0d0d",
          fontFamily: "'Montserrat', sans-serif",
          margin: 0,
          padding: "40px 16px",
        }}
      >
        <Container
          style={{
            maxWidth: 500,
            margin: "0 auto",
            backgroundColor: "#111111",
            border: "1px solid #222222",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <Section style={{ padding: "22px 28px 20px 28px" }}>
            <Row>
              <Column>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Img
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAKKADAAQAAAABAAAAKAAAAAB65masAAAFNElEQVRYCe2XXWwUVRTH/+fOLru02+5uu6W13ZYqHwpIUcAENcEPogJBxEjU+KjpixjfNL5qNL6I8mCMvPCuidEH8RVCRA0mJoQHRBspdCmCpbvtQtvdztzjf7YdUmBNphs2WdSbbu+dmXPO/d1z7jlzB/gvtyNARFeujE21Z3tq9YPUqhhGb7at52FABVZiuVT0x/7h4RIn1DC6gYwJBre7146OhFHZFFFZH6Hx7ER502LhfCZftz7NNmehbgYwHgQmAjlVy0R18yBcL0GgFEQSFhggZL6xAI2WGOJlUF1iFGvg2HLDADILGBnt4/82iM4SbACuxBoGcA5E1jJfZ5jBzQxz2oPpaxhAZqtldekiUI5wa/zeUcuSs/hWvyQBTjHULNBW2SYJ+hjxFl136waYl6tfE6iXYR4i1TKyDWiy7+7F+rBugG35/ISIfkywjYQ6DjFJ+u/ZhgFkeMVC0gzxEL04BWvPEe6VuQwPj1k3DzKsakSOqph1VnDRinuQHhxAW5+fNKFb3QArBFrMCfQrgm5XiyF67xi9uTs0HQXrC5hPllhuOvk2OeMY2azQbwj4SMMACoZn4EberWxHmPsN7AjDbPKp/lRYyFtOM5rq77fwnmdYHuDKW1i/xrjq4/Dcw1IcHQtrOJCTa2cvabr7gFXnJSM8G0LPp7xyJ58XNNm7AtHpyzI2Vgzkb+6pMNe4PyJo69ljVbYayK80NMwd4BByAz3wHFd+F8efI6H7JZebDvTC9MVE57KmaGy/Ue8sbRY8I3yzYBcX/wIX/xsc7JSxcxer2aoAEk5Kme7VRk1yyZXciWqCLLJ7VQgH36PuoEyM/lJNbuE92l2OePsqLG3KWFgu3LmPz/3wruaUzRVZ8Z1qv4W4r8v46MhCfX983YNfAs6LgDeb7n40AmcnN/cGeqydEn/yxXrEzJa/QMydhk18ypXvgfXeh7l2UFiQA6MEiqMpsxa9fTs0Ht8uBusxU05ivACUykq9+fko6f/xigvmUEf5XTAo+dx3ga2gvw7o39BMpgUaX0MwBx6aGI7VVN4lYnbSzlUresC4+gmPUNv4ZviIKg61fuLEl1iIl+ry3nXoyGwW1zOYKQGTRejUFMNTVi3xmkbmWgWQuBU419PZbdHCxWPzD2/oAo0bbt58oanuByHOB/ztIMgw3xH76eyTLMUPcRHruYgOTt6B1oTHs4FIX3YDlsbjaGYUCYjf/wAmmAeBA32fVa4MfWF/lsL5LQThwfvWFgowUNNU9k167kP+mrhvZmh9lM+i/I3zd5Jwq+ikdrizM5y/mznWjhZCtiSgDLO4LsHmgkp5DliG1dsn+ZHPeF21hQL0V1tqza6IteICJnmEcszbtLaVszGb7fcc0455huPLHP/FPVtkQjxNj/HIT8f4By4WBH8y2qo00vFST0OKW2R8fHL+9i1dKEBfS5Od90Ai+/wywZmOutaLRWA2cp69fJwmBOOIq9yf7yHujaIUeYo0r1L+SRjDzRagUarCphOE3y2Fkap7j1KVFhrQl9bOzmaUYoMsNy+LIstbDKUeJsi99FreWLwhxQtXKpbn/2mq5wmGeh9lHidZG2/z40lPMN7vsKz8sFC22nhRgIEBP+RozaYRK5Xhxg9xwhLyuddo7B+/3K5lerujqtkonCKunDtD2apJEcxxW3pNZ9/yUr2HCMxyU5/GNKqtTXd19fuflKYwMkhveLVZqaNWvj/8iaSOGHeoaVa1mpLrDl3u/9j/Pg/IYvZwzXWwVr8RrlbVxtT7G4o23zXzZfibAAAAAElFTkSuQmCC"
                    width={14}
                    height={14}
                    alt="Sparrow"
                    style={{ opacity: 0.65 }}
                  />
                  <span
                    style={{
                      color: "#555555",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      marginLeft: 5,
                    }}
                  >
                    Sparrow
                  </span>
                </div>
              </Column>
            </Row>
          </Section>

          <Hr style={{ borderColor: "#1f1f1f", margin: "0 28px" }} />

          <Section style={{ padding: "28px 28px 8px 28px" }}>
            <Text
              style={{
                color: "#e8e8e8",
                fontSize: 19,
                fontWeight: 700,
                margin: "0 0 6px 0",
                letterSpacing: "-0.3px",
              }}
            >
              {signals.length} hot lead{signals.length > 1 ? "s" : ""} detected
            </Text>
            <Text
              style={{
                color: "#555555",
                fontSize: 11,
                fontWeight: 400,
                margin: "0 0 24px 0",
                lineHeight: "1.5",
              }}
            >
              Sparrow found high-intent signals matching your keywords.
            </Text>

            {signals.map((signal, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "#161616",
                  border: "1px solid #222222",
                  borderLeft: "2px solid #991b1b",
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginBottom: i < signals.length - 1 ? 10 : 0,
                }}
              >
                <Text
                  style={{
                    color: "#d4d4d4",
                    fontSize: 12,
                    fontWeight: 700,
                    margin: "0 0 5px 0",
                    lineHeight: "1.4",
                  }}
                >
                  {signal.title}
                </Text>

                <Text
                  style={{
                    color: "#555555",
                    fontSize: 11,
                    fontWeight: 400,
                    margin: "0 0 12px 0",
                    lineHeight: "1.5",
                  }}
                >
                  {signal.reason}
                </Text>

                <Row>
                  <Column>
                    <span
                      style={{
                        color: "#dc2626",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {signal.score}/10
                    </span>
                    <span
                      style={{
                        color: "#333333",
                        fontSize: 10,
                        margin: "0 6px",
                      }}
                    >
                      ·
                    </span>
                    <span style={{ color: "#444444", fontSize: 10 }}>
                      {signal.platform === "reddit" ? "Reddit" : "Hacker News"}
                    </span>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Link
                      href={signal.url}
                      style={{
                        color: "#b91c1c",
                        fontSize: 11,
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      View post →
                    </Link>
                  </Column>
                </Row>
              </div>
            ))}
          </Section>

          <Hr style={{ borderColor: "#1f1f1f", margin: "20px 28px 0 28px" }} />
          <Section style={{ padding: "16px 28px" }}>
            <Text
              style={{
                color: "#333333",
                fontSize: 10,
                textAlign: "center",
                margin: 0,
                letterSpacing: "0.04em",
              }}
            >
              Sparrow · You are receiving this because you have keyword alerts
              enabled.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
