<p align="center">
  <img src=".github/readme/logo.png" alt="" width="160">
</p>

<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/readme/title-dark.png">
    <img src=".github/readme/title-light.png" alt="Sparrow" height="72">
  </picture>
</h1>

![ci](https://github.com/pandeemiC/sparrow-lead/actions/workflows/ci.yml/badge.svg)

Sparrow is a social listener. You give it keywords and it goes through Reddit, Hacker News and Bluesky looking for posts that match what you offer or what you're looking for. Then the AI scores each post on how relevant it is, so the good ones float to the top and you don't have to scroll through everything yourself.

Live here: https://sparrow-self.vercel.app

## what it does

- tracks your keywords across Reddit, Hacker News and Bluesky
- scores every post from 1 to 10 with AI
- scans on its own every 6 hours, or you can hit scan now
- hunt profile, where you tell the AI who you're after and what to ignore
- hunt board to move good leads along (hunting, interested, engaged, hunted)
- drafts a reply for you in your own tone

## built with

- Next.js 16, React 19, Tailwind v4
- Clerk for auth
- Neon (Postgres) for the database
- Trigger.dev for the background scans
- Gemini for the scoring and replies
- GSAP and Lenis for the homepage animations
- Zustand for state

## running it locally

```bash
npm install
npm run dev
```

The scans run on Trigger.dev, so open a second terminal and run this too:

```bash
npm run trigger
```

You'll need a `.env.local` with these:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
DATABASE_URL=
GEMINI_API_KEY=
TRIGGER_SECRET_KEY=
RESEND_API_KEY=
BLUESKY_HANDLE=
BLUESKY_APP_PASSWORD=
```

Reddit is optional. Without `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` it just skips Reddit and searches the other two.

## notes

Paid plans are not live yet, everyone is on the free plan for now.

## license

All rights reserved. The code is public so you can look through it since it was made for educational (at the time being) purposes, but please don't re-use it without asking.
