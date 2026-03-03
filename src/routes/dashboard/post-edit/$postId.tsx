import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useRef } from "react";
import * as z from "zod";
import { eq } from "drizzle-orm";
import { toFile } from "@imagekit/nodejs";

import { adminOnlyMiddleware, protectRoute } from "@/lib/auth/middleware";
import { getImageKitServer } from "@/lib/imagekit/imagekit.server";
import { getDb } from "@/db/index";
import { posts, type PostContentItem } from "@/db/schema/post-schema";
import { Button } from "@/components/ui/button";
// ─────────────────────────────────────────────────────────

const MAX_IMAGES = 5;

const GetPostSchema = z.object({ id: z.uuid() });

const UpdatePostSchema = z.object({
  id: z.uuid(),
  title: z.string().min(2, "Title must be at least 2 characters"),
  poster: z.url().optional().or(z.literal("")),
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
    .min(1),
});

const UploadImageSchema = z.object({
  fileBase64: z.string(),
  fileName: z.string(),
  uploadedFileIds: z.array(z.string()),
});

type UpdatePostInput = z.infer<typeof UpdatePostSchema>;

type RawItem =
  | { id: string; type: "text"; value: string }
  | { id: string; type: "ayah"; surah: string; ayah: string }
  | {
      id: string;
      type: "image";
      // existing image from DB
      existingUrl: string | null;
      // new file (if user picked a replacement)
      file: File | null;
      preview: string | null;
    };

// ─── Server Fn: load post ─────────────────────────────────

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

// ─── Server Fn: upload single image (with rollback) ───────

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
        throw new Error("Upload returned no url/fileId");
      }

      return { url: result.url, fileId: result.fileId } as {
        url: string;
        fileId: string;
      };
    } catch (uploadError) {
      // rollback all previously uploaded images this session
      if (data.uploadedFileIds.length > 0) {
        console.log(
          `[Rollback] Deleting ${data.uploadedFileIds.length} file(s)...`,
        );
        for (const fileId of data.uploadedFileIds) {
          try {
            await ik.files.delete(fileId);
            console.log(`[Rollback] Deleted: ${fileId}`);
          } catch (e) {
            console.error(`[Rollback] Failed to delete ${fileId}:`, e);
          }
        }
      }
      throw new Error(
        `Image "${data.fileName}" failed: ${(uploadError as Error).message}`,
      );
    }
  });

// ─── Server Fn: update post in DB ─────────────────────────

export const updatePost = createServerFn({ method: "POST" })
  .middleware([adminOnlyMiddleware])
  .inputValidator(UpdatePostSchema)
  .handler(async ({ data }) => {
    const db = getDb({ DATABASE_URL: process.env.DATABASE_URL! });
    const [updated] = await db
      .update(posts)
      .set({
        title: data.title,
        username: data.username,
        poster: data.poster ?? "",
        jsonData: data.jsonData as PostContentItem[],
      })
      .where(eq(posts.id, data.id))
      .returning();
    if (!updated) throw new Error("Post not found or update failed");
    return updated;
  });

// ─── Route ────────────────────────────────────────────────

export const Route = createFileRoute("/dashboard/post-edit/$postId")({
  beforeLoad: () => protectRoute({ data: "admin" }),
  loader: ({ params }) => getPost({ data: { id: params.postId } }),
  component: EditPage,
});

// ─── Helpers ──────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(new Error(`Could not read: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

// convert DB PostContentItem → RawItem for the UI
function dbItemToRaw(item: PostContentItem): RawItem {
  if (item.type === "text") {
    return { id: makeId(), type: "text", value: item.value };
  }
  if (item.type === "image") {
    return {
      id: makeId(),
      type: "image",
      existingUrl: item.value, // keep the existing CDN url
      file: null,
      preview: null,
    };
  }
  // ayah
  return {
    id: makeId(),
    type: "ayah",
    surah: String(item.value.surah),
    ayah: item.value.ayah != null ? String(item.value.ayah) : "",
  };
}

// ─── Component ────────────────────────────────────────────

function EditPage() {
  const post = Route.useLoaderData();

  // initialise form state from DB data
  const [title, setTitle] = useState(post.title);
  const [username, setUsername] = useState(post.username);
  const [poster, setPoster] = useState(post.poster ?? "");
  const [items, setItems] = useState<RawItem[]>(() =>
    (post.jsonData as PostContentItem[]).map(dbItemToRaw),
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetId = useRef<string | null>(null); // which image block triggered the picker

  const imageCount = items.filter((i) => i.type === "image").length;

  // ── item helpers ──────────────────────────────────────

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: string, patch: Partial<RawItem>) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? ({ ...i, ...patch } as RawItem) : i)),
    );

  // ── add new blocks ────────────────────────────────────

  const addText = () =>
    setItems((prev) => [...prev, { id: makeId(), type: "text", value: "" }]);

  const addAyah = () =>
    setItems((prev) => [
      ...prev,
      { id: makeId(), type: "ayah", surah: "", ayah: "" },
    ]);

  // add brand new image block
  const addImage = () => {
    if (imageCount >= MAX_IMAGES) {
      setError(`Max ${MAX_IMAGES} images allowed`);
      return;
    }
    replaceTargetId.current = null; // null = new block
    setError(null);
    fileInputRef.current?.click();
  };

  // replace existing image block's file
  const replaceImage = (id: string) => {
    replaceTargetId.current = id;
    fileInputRef.current?.click();
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    const targetId = replaceTargetId.current;

    if (targetId) {
      // replacing existing block's image
      updateItem(targetId, {
        file,
        preview,
        existingUrl: null,
      } as Partial<RawItem>);
    } else {
      // adding a new image block
      setItems((prev) => [
        ...prev,
        { id: makeId(), type: "image", existingUrl: null, file, preview },
      ]);
    }

    e.target.value = "";
    replaceTargetId.current = null;
  };

  // ── submit ────────────────────────────────────────────

  const handleUpdate = async () => {
    setError(null);
    setSuccess(false);
    setUploadProgress(null);

    if (!title.trim()) return setError("Title দাও");
    if (!username.trim()) return setError("Username দাও");
    if (items.length === 0) return setError("কমপক্ষে একটা block রাখো");
    if (imageCount > MAX_IMAGES)
      return setError(`Max ${MAX_IMAGES} images allowed`);

    setLoading(true);

    const uploadedFileIds: string[] = []; // for rollback
    const newImageItems = items.filter(
      (i) => i.type === "image" && i.file != null,
    );
    let imagesDone = 0;

    try {
      const jsonData: UpdatePostInput["jsonData"] = [];

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
            throw new Error(`Ayah block #${i + 1}: Ayah number invalid`);
          jsonData.push({
            type: "ayah",
            value: { surah, ...(ayahNum ? { ayah: ayahNum } : {}) },
          });
          continue;
        }

        // ── image ──
        if (item.type === "image") {
          // CASE A: user kept the existing image — use url directly, no upload
          if (!item.file && item.existingUrl) {
            jsonData.push({ type: "image", value: item.existingUrl });
            continue;
          }

          // CASE B: user picked a new file — upload it
          if (!item.file)
            throw new Error(
              `Image block #${i + 1}: no file and no existing url`,
            );

          imagesDone++;
          setUploadProgress(
            `Uploading image ${imagesDone} of ${newImageItems.length}: "${item.file.name}"...`,
          );

          const fileBase64 = await fileToBase64(item.file);

          const result = await uploadImage({
            data: {
              fileBase64,
              fileName: item.file.name,
              uploadedFileIds: [...uploadedFileIds],
            },
          });

          uploadedFileIds.push(result.fileId);
          jsonData.push({ type: "image", value: result.url });
          continue;
        }
      }

      setUploadProgress("Saving changes...");

      const parsed = UpdatePostSchema.safeParse({
        id: post.id,
        title: title.trim(),
        username: username.trim(),
        poster: poster.trim(),
        jsonData,
      });

      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Validation failed");
      }

      const result = await updatePost({ data: parsed.data });
      console.log("✅ Updated:", result);

      setSuccess(true);
      setUploadProgress(null);

      // re-sync items so existingUrl reflects the newly uploaded urls
      setItems((result.jsonData as PostContentItem[]).map(dbItemToRaw));
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
      setUploadProgress(null);
    } finally {
      setLoading(false);
    }
  };

  // ─── UI ── replace styling with your own ──────────────
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <h1 style={{ flex: 1 }}>Edit Post</h1>
        {/* post id for reference */}
        <span style={{ fontFamily: "monospace", fontSize: 11, opacity: 0.3 }}>
          {post.id.slice(0, 8)}...
        </span>
      </div>

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
            {/* block label */}
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

            {/* text */}
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

            {/* ayah */}
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

            {/* image */}
            {item.type === "image" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* show preview (new file) or existing url */}
                {(item.preview || item.existingUrl) && (
                  <img
                    src={item.preview ?? item.existingUrl ?? ""}
                    alt="preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      borderRadius: 6,
                      objectFit: "cover",
                      border: item.preview
                        ? "2px solid #f59e0b" // orange = new/changed
                        : "2px solid #22c55e", // green  = existing/unchanged
                    }}
                  />
                )}

                {/* status badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: item.preview ? "#fef3c7" : "#dcfce7",
                      color: item.preview ? "#92400e" : "#15803d",
                    }}
                  >
                    {item.preview
                      ? "⚡ New image — will upload"
                      : "✓ Existing image — unchanged"}
                  </span>

                  {/* replace button */}
                  <button
                    onClick={() => replaceImage(item.id)}
                    disabled={loading}
                    style={{
                      fontSize: 12,
                      cursor: "pointer",
                      background: "none",
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      padding: "2px 8px",
                    }}
                  >
                    Replace
                  </button>
                </div>
              </div>
            )}

            {/* remove block */}
            <button
              onClick={() => removeItem(item.id)}
              disabled={loading}
              style={{
                alignSelf: "flex-end",
                color: "red",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Remove block
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

      {/* hidden file input — shared for add + replace */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFileSelect}
      />

      {/* ── Progress / feedback ── */}
      {uploadProgress && (
        <p style={{ color: "#2563eb", fontSize: 14, margin: "12px 0" }}>
          ⏳ {uploadProgress}
        </p>
      )}
      {error && <p style={{ color: "red", margin: "8px 0" }}>❌ {error}</p>}
      {success && (
        <p style={{ color: "green", margin: "8px 0" }}>✅ Changes saved!</p>
      )}

      <Button
        onClick={handleUpdate}
        disabled={loading}
        style={{ marginTop: 12 }}
      >
        {loading ? "Saving..." : "Save Changes"}
      </Button>

      {/* ── Dev jsonData preview ── */}
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
                  ? {
                      type: "image",
                      value: i.preview
                        ? `[NEW] ${i.file?.name}`
                        : i.existingUrl,
                    }
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
