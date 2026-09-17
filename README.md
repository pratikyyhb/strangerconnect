# StrangerConnect

A production-oriented anonymous random video chat application built with Next.js App Router, React, WebRTC, Drizzle ORM, and PostgreSQL.

## What is included

- Modern responsive landing page and policy pages
- Adult age gate and visible community guidelines
- Anonymous guest access with session-scoped participant IDs
- Optional register, login, profile, logout, and JWT cookie authentication
- Race-safe random matchmaking queue
- Peer-to-peer WebRTC video/audio using Google STUN for development
- Offer, answer, and ICE signaling via secure same-origin APIs
- Real-time text chat with delivery polling and spam limits
- Microphone and camera controls
- Next Stranger and clean connection teardown
- Safety reporting and protected role-based admin dashboard
- User ban/unban, report deletion, and chat-session statistics
- Security headers, input validation, password hashing, throttling, and no media recording

## Architecture

This repository targets the platform-provided Next.js/PostgreSQL runtime rather than a separate Vite/Express/MongoDB deployment. App Router route handlers replace Express controllers. Drizzle/PostgreSQL stores users, queue state, signaling records, text messages, sessions, and reports. Media remains peer-to-peer and is never stored.

Important paths:

- `src/app/page.tsx` — public landing page
- `src/app/chat/page.tsx` — live chat room
- `src/components/ChatRoom.tsx` — matchmaking and room orchestration
- `src/hooks/useWebRTC.ts` — reusable WebRTC media/signaling hook
- `src/app/api/match/route.ts` — transaction-safe matchmaking and teardown
- `src/app/api/signals/route.ts` — WebRTC signal relay
- `src/app/api/messages/route.ts` — text delivery
- `src/app/api/auth/*` — authentication
- `src/app/api/reports/route.ts` — safety reporting
- `src/app/admin/page.tsx` — protected moderation dashboard
- `src/db/schema.ts` — complete Drizzle schema

## Local setup

1. Install Node.js 20+ and PostgreSQL 15+.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL` and a long random `JWT_SECRET`.
4. Create the database if necessary.
5. Apply the schema with `npx drizzle-kit push`.
6. Start development with `npm run dev`.
7. Open `http://localhost:3000`.

Camera and microphone APIs require localhost or HTTPS.

## Testing the chat flow

1. Open `/chat` in two different browsers or one normal and one private window.
2. Confirm the 18+ gate in each window and allow camera/microphone access.
3. Both users should move from waiting to connected.
4. Test text messages, mute, camera off, and Next Stranger.
5. Submit a report and verify the current peer is disconnected.
6. Close one tab and confirm the other returns to matchmaking.

For testing on one computer, browsers may select the same camera. Use virtual cameras or separate devices for the clearest result.

## Admin access

Register a normal account, then promote it directly in PostgreSQL:

`update users set role = 'admin' where email = 'admin@example.com';`

Log out and back in to refresh the signed role claim, then visit `/admin`.

## Production notes

- Deploy the Next.js app to a Node-compatible host such as Vercel, Render, or Railway.
- Use managed PostgreSQL and set `DATABASE_URL`, `JWT_SECRET`, and `NEXT_PUBLIC_APP_URL`.
- Run `npx drizzle-kit push` as a controlled release step.
- Configure HTTPS; camera/microphone access will not work on insecure public origins.
- Add a production TURN service to `iceServers` for users behind restrictive NAT/firewalls. STUN-only connectivity cannot cover every network.
- For very large traffic, replace short polling signaling with a dedicated authenticated Socket.IO/WebSocket service and Redis-backed presence while keeping the same WebRTC hook contract.
- In-memory route throttling is defense-in-depth per instance; put distributed rate limiting at the edge for multi-instance deployment.
- Same-origin API routing intentionally does not emit permissive CORS headers.

## Privacy and safety

StrangerConnect never records video or audio. WebRTC peers may learn network metadata inherent to direct connections. Text is stored for delivery in the current implementation; configure a retention job appropriate to your policy. The service is restricted to adults aged 18 and older.
