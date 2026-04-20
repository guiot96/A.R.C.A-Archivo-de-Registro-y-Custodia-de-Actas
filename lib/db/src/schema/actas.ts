import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const actasTable = pgTable("actas", {
  id: serial("id").primaryKey(),
  mesa_id: text("mesa_id").notNull(),
  departamento: text("departamento"),
  municipio: text("municipio"),
  image_path: text("image_path").notNull(),
  image_hash: text("image_hash").notNull(),
  ocr_result: text("ocr_result"),
  status: text("status", { enum: ["valid", "suspicious", "inconsistent"] })
    .notNull()
    .default("valid"),
  prev_hash: text("prev_hash"),
  block_hash: text("block_hash").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertActaSchema = createInsertSchema(actasTable).omit({
  id: true,
  timestamp: true,
});
export type InsertActa = z.infer<typeof insertActaSchema>;
export type Acta = typeof actasTable.$inferSelect;
