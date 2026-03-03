import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getDb } from "@/db/index";
import { posts, type PostContentItem } from "@/db/schema/post-schema";
import { eq } from "drizzle-orm";

// ─── Server fn: fetch single post ────────────────────────
import * as z from "zod";

const GetPostSchema = z.object({ id: z.uuid() });

export const getPost = createServerFn({ method: "GET" })
  .inputValidator(GetPostSchema)
  .handler(async ({ data }) => {
    const db = getDb({ DATABASE_URL: process.env.DATABASE_URL! });
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, data.id))
      .limit(1);
    if (!post) throw new Error("Post not found");
    return post;
  });

// ─── Route ────────────────────────────────────────────────
export const Route = createFileRoute("/library/id/$postId")({
  loader: ({ params }) => getPost({ data: { id: params.postId } }),
  component: PostPage,
});

// ─── Types ────────────────────────────────────────────────
type Post = Awaited<ReturnType<typeof getPost>>;

// ─── Helpers ──────────────────────────────────────────────
function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// detect if string is mostly Arabic/RTL
function isRTL(text: string) {
  const rtlChars = (text.match(/[\u0600-\u06FF\u0750-\u077F]/g) || []).length;
  return rtlChars / text.length > 0.3;
}

// ─── Content Block Renderer ───────────────────────────────
function ContentBlock({ item }: { item: PostContentItem }) {
  if (item.type === "text") {
    const rtl = isRTL(item.value);
    return (
      <p
        dir={rtl ? "rtl" : "ltr"}
        style={{
          fontFamily: rtl
            ? "'Amiri', 'Scheherazade New', Georgia, serif"
            : "'Spectral', Georgia, serif",
          fontSize: rtl ? 22 : 17,
          lineHeight: rtl ? 2.2 : 1.85,
          color: "#c8c8c0",
          margin: "0 0 28px 0",
          textAlign: rtl ? "right" : "left",
          letterSpacing: rtl ? "0.02em" : "0.01em",
        }}
      >
        {item.value}
      </p>
    );
  }

  if (item.type === "image") {
    return (
      <figure style={{ margin: "36px 0", padding: 0 }}>
        <div
          style={{
            borderRadius: 4,
            overflow: "hidden",
            background: "#111",
            aspectRatio: "16/9",
            position: "relative",
          }}
        >
          <img
            src={item.value}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "opacity 0.4s ease",
            }}
            loading="lazy"
          />
        </div>
      </figure>
    );
  }

  if (item.type === "ayah") {
    return (
      <div
        style={{
          margin: "40px 0",
          padding: "28px 32px",
          borderLeft: "3px solid #8b6c3e",
          background: "linear-gradient(135deg, #1a1610 0%, #141210 100%)",
          borderRadius: "0 6px 6px 0",
          position: "relative",
        }}
      >
        {/* decorative bismillah-style dot */}
        <div
          style={{
            position: "absolute",
            top: -1,
            left: -6,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#8b6c3e",
          }}
        />
        <div
          style={{
            fontFamily: "'Amiri', 'Scheherazade New', serif",
            fontSize: 13,
            color: "#8b6c3e",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 12,
            fontStyle: "normal",
          }}
        >
          Surah {item.value.surah}
          {item.value.ayah != null ? ` · Ayah ${item.value.ayah}` : ""}
        </div>
        <div
          style={{
            fontFamily: "'Amiri', 'Scheherazade New', serif",
            fontSize: 26,
            lineHeight: 2.1,
            color: "#e8dcc8",
            direction: "rtl",
            textAlign: "right",
          }}
        >
          {/* placeholder — replace with actual ayah text from your Quran API */}
          {`﴿ ${item.value.surah} : ${item.value.ayah ?? "—"} ﴾`}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Main Page ────────────────────────────────────────────
function PostPage() {
  const post = Route.useLoaderData() as Post;
  const jsonData = post.jsonData as PostContentItem[];

  return (
    <>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { background: #0d0d0b; }

        body {
          background: #0d0d0b;
          color: #c8c8c0;
          font-family: 'Spectral', Georgia, serif;
          -webkit-font-smoothing: antialiased;
        }

        img { max-width: 100%; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .post-animate {
          animation: fadeUp 0.7s ease both;
        }

        .post-animate-delay {
          animation: fadeUp 0.7s ease 0.15s both;
        }

        .post-animate-delay2 {
          animation: fadeUp 0.7s ease 0.3s both;
        }
      `}</style>

      <div style={{ background: "#0d0d0b", minHeight: "100vh" }}>
        {/* ── Poster / Hero ── */}
        {post.poster && (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "55vh",
              minHeight: 320,
              overflow: "hidden",
            }}
          >
            <img
              src={post.poster}
              alt={post.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                filter: "brightness(0.45)",
              }}
            />
            {/* gradient overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, transparent 30%, #0d0d0b 100%)",
              }}
            />
          </div>
        )}

        {/* ── Container ── */}
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: post.poster ? "0 24px 80px" : "80px 24px 80px",
            marginTop: post.poster ? -120 : 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* ── Header ── */}
          <header className="post-animate" style={{ marginBottom: 48 }}>
            {/* meta row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              {/* avatar initial */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #8b6c3e, #5c3d1e)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#e8dcc8",
                  flexShrink: 0,
                }}
              >
                {post.username[0].toUpperCase()}
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 12,
                    color: "#8b6c3e",
                    letterSpacing: "0.08em",
                  }}
                >
                  {post.username}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    color: "#444",
                    marginTop: 2,
                  }}
                >
                  {formatDate(post.date)}
                </div>
              </div>
            </div>

            {/* title */}
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(28px, 5vw, 48px)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "#f0ede8",
                marginBottom: 20,
              }}
            >
              {post.title}
            </h1>

            {/* divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ height: 1, flex: 1, background: "#1e1e1a" }} />
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: "#333",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                {jsonData.length} blocks
              </div>
              <div style={{ height: 1, flex: 1, background: "#1e1e1a" }} />
            </div>
          </header>

          {/* ── Content blocks ── */}
          <main className="post-animate-delay">
            {jsonData.map((item, i) => (
              <ContentBlock key={i} item={item} />
            ))}
          </main>

          {/* ── Footer ── */}
          <footer
            className="post-animate-delay2"
            style={{
              marginTop: 64,
              paddingTop: 24,
              borderTop: "1px solid #1e1e1a",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: "#333",
                letterSpacing: "0.08em",
              }}
            >
              {post.id.slice(0, 8)}...
            </div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: "#333",
              }}
            >
              {formatDate(post.date)}
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
