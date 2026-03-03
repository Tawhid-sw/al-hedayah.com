import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useRef } from "react";
import * as z from "zod";

// ─── replace these with your actual imports ───────────────
import { adminOnlyMiddleware, protectRoute } from "@/lib/auth/middleware";
import { getImageKitServer } from "@/lib/imagekit/imagekit.server";
import { toFile } from "@imagekit/nodejs";
import { getDb } from "@/db/index";
import { posts, type PostContentItem } from "@/db/schema/post-schema";
import { Button } from "@/components/ui/button";

const MAX_IMAGES = 5;

const PostContentSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  poster: z.string().url("Invalid URL").optional().or(z.literal("")),
  username: z.string().min(1, "Username is required"),
  jsonData: z
    .array(
      z.discriminatedUnion("type", [
        z.object({ type: z.literal("text"), value: z.string().min(1) }),
        z.object({ type: z.literal("image"), value: z.string().url() }),
        z.object({
          type: z.literal("ayah"),
          value: z.object({
            surah: z.number().min(1).max(114),
            ayah: z.number().min(1).optional(),
          }),
        }),
      ]),
    )
    .min(1, "Add at least one content block"),
});

// type PostInput = z.infer<typeof PostContentSchema>;

const UploadImageSchema = z.object({
  fileBase64: z.string(),
  fileName: z.string(),
  uploadedFileIds: z.array(z.string()),
});

type RawItem =
  | { id: string; type: "text"; value: string }
  | { id: string; type: "image"; file: File | null; preview: string | null }
  | { id: string; type: "ayah"; surah: string; ayah: string };

export const uploadImage = createServerFn({ method: "POST" })
  .middleware([adminOnlyMiddleware])
  .inputValidator(UploadImageSchema)
  .handler(async ({ data }) => {
    const ik = getImageKitServer();

    try {
      const buffer = Buffer.from(data.fileBase64, "base64");
      const wrappedFile = await toFile(buffer, data.fileName);

      const result = await ik.files.upload({
        file: wrappedFile,
        fileName: data.fileName,
        folder: "/posts",
        useUniqueFileName: true,
      });

      if (!result.url || !result.fileId) {
        throw new Error("Upload succeeded but url/fileId missing in response");
      }

      return { url: result.url, fileId: result.fileId } as {
        url: string;
        fileId: string;
      };
    } catch (uploadError) {
      if (data.uploadedFileIds.length > 0) {
        console.log(
          `[Rollback] Upload failed for "${data.fileName}". ` +
            `Deleting ${data.uploadedFileIds.length} previously uploaded file(s)...`,
        );

        for (const fileId of data.uploadedFileIds) {
          try {
            await ik.files.delete(fileId);
            console.log(`[Rollback] Deleted fileId: ${fileId}`);
          } catch (deleteErr) {
            console.error(
              `[Rollback] Could not delete fileId ${fileId}:`,
              deleteErr,
            );
          }
        }
      }

      throw new Error(
        `Image "${data.fileName}" failed to upload: ${(uploadError as Error).message}`,
      );
    }
  });

export const PostContent = createServerFn({ method: "POST" })
  .middleware([adminOnlyMiddleware])
  .inputValidator(PostContentSchema)
  .handler(async ({ data }) => {
    const db = getDb({ DATABASE_URL: process.env.DATABASE_URL! });
    const [post] = await db
      .insert(posts)
      .values({
        title: data.title,
        username: data.username,
        poster: data.poster ?? "",
        jsonData: data.jsonData,
      })
      .returning();
    return post;
  });

export const Route = createFileRoute("/dashboard/post-content/")({
  beforeLoad: () => protectRoute({ data: "admin" }),
  component: RouteComponent,
});

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () =>
      reject(new Error(`Could not read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function RouteComponent() {
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [poster, setPoster] = useState("");
  const [items, setItems] = useState<RawItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageCount = items.filter((i) => i.type === "image").length;

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: string, patch: Partial<RawItem>) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? ({ ...i, ...patch } as RawItem) : i)),
    );

  const addText = () =>
    setItems((prev) => [...prev, { id: makeId(), type: "text", value: "" }]);

  const addAyah = () =>
    setItems((prev) => [
      ...prev,
      { id: makeId(), type: "ayah", surah: "", ayah: "" },
    ]);

  const addImage = () => {
    if (imageCount >= MAX_IMAGES) {
      setError(`Max ${MAX_IMAGES} images allowed per post`);
      return;
    }
    setError(null);
    fileInputRef.current?.click();
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setItems((prev) => [
      ...prev,
      { id: makeId(), type: "image", file, preview: URL.createObjectURL(file) },
    ]);
    e.target.value = "";
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);
    setUploadProgress(null);

    if (!title.trim()) return setError("Title দাও");
    if (!username.trim()) return setError("Username দাও");
    if (items.length === 0) return setError("কমপক্ষে একটা content add করো");
    if (imageCount > MAX_IMAGES)
      return setError(`Max ${MAX_IMAGES} images allowed`);

    setLoading(true);

    // keeps track of successfully uploaded fileIds
    // passed to each uploadImage() call so server can rollback on failure
    const uploadedFileIds: string[] = [];

    try {
      const jsonData: PostContentItem[] = [];

      const imageItems = items.filter((i) => i.type === "image");
      let imagesDone = 0;

      // ── sequential loop ───────────────────────────────
      // text/ayah resolve instantly
      // image: base64 → server → ImageKit (one at a time)
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // ── text ──
        if (item.type === "text") {
          if (!item.value.trim())
            throw new Error(`Text block #${i + 1} is empty`);
          jsonData.push({ type: "text", value: item.value.trim() });
          continue;
        }

        // ── ayah ──
        if (item.type === "ayah") {
          const surah = Number(item.surah);
          if (!surah || surah < 1 || surah > 114)
            throw new Error(`Ayah block #${i + 1}: Surah must be 1–114`);
          const ayahNum = item.ayah ? Number(item.ayah) : undefined;
          if (item.ayah && (!ayahNum || ayahNum < 1))
            throw new Error(`Ayah block #${i + 1}: Ayah number is invalid`);
          jsonData.push({
            type: "ayah",
            value: { surah, ...(ayahNum ? { ayah: ayahNum } : {}) },
          });
          continue;
        }

        // ── image ──
        if (item.type === "image") {
          if (!item.file)
            throw new Error(`Image block #${i + 1}: No file selected`);

          imagesDone++;
          setUploadProgress(
            `Uploading image ${imagesDone} of ${imageItems.length}: "${item.file.name}"...`,
          );

          // convert to base64 on client before sending to server
          const fileBase64 = await fileToBase64(item.file);

          // server upload — if this throws, rollback already happened server-side
          const result = await uploadImage({
            data: {
              fileBase64,
              fileName: item.file.name,
              uploadedFileIds: [...uploadedFileIds],
            },
          });

          // only reach here if upload succeeded
          uploadedFileIds.push(result.fileId);
          jsonData.push({ type: "image", value: result.url });
          continue;
        }
      }

      // ── all images done, save to DB ───────────────────
      setUploadProgress(`All ${imagesDone} image(s) uploaded. Saving post...`);

      const parsed = PostContentSchema.safeParse({
        title: title.trim(),
        username: username.trim(),
        poster: poster.trim(),
        jsonData,
      });

      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Validation failed");
      }

      const result = await PostContent({ data: parsed.data });
      console.log("✅ Post saved:", result);

      // reset form
      setTitle("");
      setUsername("");
      setPoster("");
      setItems([]);
      setSuccess(true);
      setUploadProgress(null);
    } catch (err: any) {
      // server already rolled back uploaded images if an upload failed
      // just show the error message
      setError(err.message ?? "Something went wrong");
      setUploadProgress(null);
    } finally {
      setLoading(false);
    }
  };

  // ─── UI ── replace styling with your own ──────────────
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <h1>Create Post</h1>

      {/* ── Meta ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 24,
        }}
      >
        <input
          placeholder="Title *"
          value={title}
          disabled={loading}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Username *"
          value={username}
          disabled={loading}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Poster image URL (optional)"
          value={poster}
          disabled={loading}
          onChange={(e) => setPoster(e.target.value)}
        />
      </div>

      {/* ── Content blocks ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                opacity: 0.4,
              }}
            >
              {item.type} #{index + 1}
            </div>

            {item.type === "text" && (
              <textarea
                rows={3}
                placeholder="Text লেখো..."
                value={item.value}
                disabled={loading}
                onChange={(e) => updateItem(item.id, { value: e.target.value })}
                style={{ width: "100%", resize: "vertical" }}
              />
            )}

            {item.type === "ayah" && (
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  placeholder="Surah (1–114) *"
                  value={item.surah}
                  min={1}
                  max={114}
                  disabled={loading}
                  onChange={(e) =>
                    updateItem(item.id, { surah: e.target.value })
                  }
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="Ayah (optional)"
                  value={item.ayah}
                  min={1}
                  disabled={loading}
                  onChange={(e) =>
                    updateItem(item.id, { ayah: e.target.value })
                  }
                  style={{ flex: 1 }}
                />
              </div>
            )}

            {item.type === "image" && (
              <>
                {item.preview && (
                  <img
                    src={item.preview}
                    alt="preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      borderRadius: 6,
                      objectFit: "cover",
                    }}
                  />
                )}
                <span style={{ fontSize: 13, opacity: 0.6 }}>
                  {item.file?.name}
                </span>
              </>
            )}

            <button
              onClick={() => removeItem(item.id)}
              disabled={loading}
              style={{
                alignSelf: "flex-end",
                color: "red",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* ── Add buttons ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <Button variant="outline" onClick={addText} disabled={loading}>
          + Text
        </Button>
        <Button variant="outline" onClick={addAyah} disabled={loading}>
          + Ayah
        </Button>
        <Button
          variant="outline"
          onClick={addImage}
          disabled={loading || imageCount >= MAX_IMAGES}
        >
          + Image {imageCount > 0 ? `(${imageCount}/${MAX_IMAGES})` : ""}
        </Button>
      </div>

      {imageCount >= MAX_IMAGES && (
        <p style={{ fontSize: 12, color: "orange", marginBottom: 8 }}>
          ⚠ Max {MAX_IMAGES} images reached
        </p>
      )}

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFileSelect}
      />

      {/* ── Progress ── */}
      {uploadProgress && (
        <p style={{ color: "#2563eb", fontSize: 14, margin: "12px 0" }}>
          ⏳ {uploadProgress}
        </p>
      )}

      {/* ── Feedback ── */}
      {error && <p style={{ color: "red", margin: "8px 0" }}>❌ {error}</p>}
      {success && (
        <p style={{ color: "green", margin: "8px 0" }}>✅ Post saved!</p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: 12 }}
      >
        {loading ? "Saving..." : "Post"}
      </Button>

      {/* ── Dev jsonData preview — remove in production ── */}
      <details style={{ marginTop: 32 }}>
        <summary style={{ cursor: "pointer", opacity: 0.4, fontSize: 12 }}>
          jsonData preview (dev only)
        </summary>
        <pre
          style={{
            fontSize: 12,
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 6,
            overflow: "auto",
          }}
        >
          {JSON.stringify(
            items.map((i) =>
              i.type === "ayah"
                ? {
                    type: "ayah",
                    value: { surah: i.surah, ayah: i.ayah || undefined },
                  }
                : i.type === "image"
                  ? { type: "image", value: i.file?.name ?? "pending" }
                  : { type: "text", value: i.value },
            ),
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  );
}
