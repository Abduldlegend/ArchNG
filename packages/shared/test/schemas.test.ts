import { describe, expect, it } from "vitest";
import {
  demoVideoUpdateSchema,
  demoRequestCreateSchema,
  projectCreateSchema,
  providerListQuerySchema,
  specialtyCreateSchema,
} from "../src/schemas.js";

describe("shared schemas", () => {
  it("accepts YouTube and Vimeo demo links only", () => {
    expect(demoVideoUpdateSchema.safeParse({ url: "https://youtu.be/abc123" }).success).toBe(true);
    expect(demoVideoUpdateSchema.safeParse({ url: "https://www.youtube.com/watch?v=abc123" }).success).toBe(true);
    expect(demoVideoUpdateSchema.safeParse({ url: "https://vimeo.com/123456" }).success).toBe(true);
    expect(demoVideoUpdateSchema.safeParse({ url: "https://example.com/video" }).success).toBe(false);
    expect(demoVideoUpdateSchema.safeParse({ url: "" }).success).toBe(true);
  });

  it("applies provider discovery defaults and experience filters", () => {
    const parsed = providerListQuerySchema.parse({ minYears: "5", maxYears: "20" });
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(12);
    expect(parsed.sort).toBe("recommended");
    expect(parsed.minYears).toBe(5);
    expect(parsed.maxYears).toBe(20);
  });

  it("applies project defaults and rejects short summaries", () => {
    const project = projectCreateSchema.parse({
      title: "Courtyard House",
      typology: "Private Residence",
      city: "Lagos",
      state: "Lagos",
      year: "2025",
      gfa: "200 m²",
      budget: "25000000",
      summary: "A courtyard house with a shaded central garden.",
    });
    expect(project.status).toBe("DRAFT");
    expect(project.images).toEqual([]);
    expect(project.year).toBe(2025);

    const invalid = projectCreateSchema.safeParse({ ...project, summary: "Too short" });
    expect(invalid.success).toBe(false);
  });

  it("requires a provider reference on demo requests", () => {
    const result = demoRequestCreateSchema.safeParse({
      projectType: "Private Residence",
      state: "Lagos",
      budgetRange: "50M_250M",
      brief: "A four-bedroom courtyard house with a shaded garden and guest wing.",
    });
    expect(result.success).toBe(false);
  });

  it("accepts known specialty names", () => {
    expect(specialtyCreateSchema.safeParse({ name: "Adaptive Reuse" }).success).toBe(true);
    expect(specialtyCreateSchema.safeParse({ name: "Unknown Specialty" }).success).toBe(false);
  });
});
