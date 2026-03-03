import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
  index,
} from "drizzle-orm/pg-core";

export type PostContentItem =
  | { type: "text"; value: string }
  | { type: "image"; value: string }
  | { type: "ayah"; value: { surah: number; ayah?: number } };

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").notNull(),
    title: text("title").notNull(),
    poster: text("poster"),
    date: timestamp("date").defaultNow().notNull(),

    jsonData: jsonb("json_data").$type<PostContentItem[]>().notNull(),
  },
  (table) => ({
    titleIdx: index("title_idx").on(table.title),
  }),
);
