import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { createApp } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

const app = createApp();
const password = "Password123!";

const fixture = {};
let adminToken;
let clientToken;
let providerToken;
let pendingToken;
let clientAgent;
let providerAgent;
let adminAgent;

const login = async (agent, email) => {
  const response = await agent.post("/api/v1/auth/login").send({ email, password });
  expect(response.status).toBe(200);
  return response.body.data;
};

beforeAll(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.demoRequest.deleteMany();
  await prisma.verificationDocument.deleteMany();
  await prisma.projectImage.deleteMany();
  await prisma.project.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.specialty.deleteMany();

  const passwordHash = await argon2.hash(password);

  fixture.admin = await prisma.user.create({
    data: {
      name: "Test Admin",
      email: "admin@test.archng",
      passwordHash,
      role: "ADMIN",
    },
  });

  fixture.client = await prisma.user.create({
    data: {
      name: "Test Client",
      email: "client@test.archng",
      passwordHash,
      role: "USER",
    },
  });

  fixture.providerUser = await prisma.user.create({
    data: {
      name: "Ada Test",
      email: "ada@test.archng",
      passwordHash,
      role: "PROVIDER",
    },
  });

  const specialty = await prisma.specialty.create({
    data: { name: "Rammed Earth", slug: "rammed-earth" },
  });

  fixture.provider = await prisma.providerProfile.create({
    data: {
      userId: fixture.providerUser.id,
      slug: "ada-test-studio",
      firm: "Ada Test Studio",
      headline: "Climate-first practice",
      bio: "A verified test practice.",
      city: "Ikoyi, Lagos",
      state: "Lagos",
      yearsExperience: 14,
      worksCount: 28,
      feeTier: "TIER_150M",
      contactEmail: "hello@adatest.ng",
      contactPhone: "+234 800 000 0000",
      whatsapp: "+234 800 000 0000",
      website: "https://adatest.ng",
      showEmailToAccepted: true,
      showPhoneToAccepted: true,
      demoVideoUrl: "https://vimeo.com/123456",
      demoVideoSource: "vimeo",
      registrationNumber: "ARCON #TEST1",
      verificationStatus: "VERIFIED",
      verificationSubmittedAt: new Date("2026-01-01T00:00:00.000Z"),
      verificationReviewedAt: new Date("2026-01-02T00:00:00.000Z"),
      published: true,
      specialties: { connect: { id: specialty.id } },
      experiences: {
        create: {
          title: "Principal",
          organisation: "Ada Test Studio",
          year: 2011,
          description: "Founded the practice.",
          order: 1,
        },
      },
    },
  });

  fixture.project = await prisma.project.create({
    data: {
      providerId: fixture.provider.id,
      title: "Test Courtyard House",
      slug: "test-courtyard-house",
      typology: "Private Residence",
      city: "Epe, Lagos",
      state: "Lagos",
      year: 2024,
      gfa: "620 m²",
      budget: 450000000,
      structural: "Rammed earth",
      climate: "Cross ventilation",
      summary: "A test project with enough summary text to satisfy the API validation rules.",
      status: "PUBLISHED",
      images: {
        create: [
          {
            url: "https://images.example.com/cover.jpg",
            kind: "PHOTO",
            isCover: true,
            order: 0,
            alt: "Cover",
          },
          {
            url: "https://images.example.com/plate.jpg",
            kind: "PLATE",
            order: 1,
            plateLabel: "Plate 01",
            plateTitle: "Ground floor",
            plateYear: "2024",
            plateScale: "1:100",
          },
        ],
      },
    },
    include: { images: true },
  });
  const cover = fixture.project.images.find((image) => image.isCover);
  await prisma.project.update({ where: { id: fixture.project.id }, data: { coverImageId: cover.id } });

  const pendingUser = await prisma.user.create({
    data: {
      name: "Pending Practice",
      email: "pending@test.archng",
      passwordHash,
      role: "PROVIDER",
    },
  });
  fixture.pendingProvider = await prisma.providerProfile.create({
    data: {
      userId: pendingUser.id,
      slug: "pending-test-studio",
      firm: "Pending Test Studio",
      bio: "Awaiting verification.",
      city: "Abuja",
      state: "Abuja FCT",
      yearsExperience: 5,
      worksCount: 3,
      verificationStatus: "PENDING",
      verificationSubmittedAt: new Date("2026-02-01T00:00:00.000Z"),
      published: false,
      verificationDocuments: {
        create: {
          name: "Form B",
          fileType: "application/pdf",
          url: "https://files.example.com/form-b.pdf",
        },
      },
    },
  });

  adminAgent = request.agent(app);
  clientAgent = request.agent(app);
  providerAgent = request.agent(app);

  const admin = await login(adminAgent, "admin@test.archng");
  const client = await login(clientAgent, "client@test.archng");
  const provider = await login(providerAgent, "ada@test.archng");
  const pending = await login(request.agent(app), "pending@test.archng");
  adminToken = admin.accessToken;
  clientToken = client.accessToken;
  providerToken = provider.accessToken;
  pendingToken = pending.accessToken;
});

afterAll(async () => {
  await prisma.$disconnect();
});

const auth = (token) => ({ Authorization: `Bearer ${token}` });

const GATED_KEYS = new Set([
  "contact",
  "contactEmail",
  "contactPhone",
  "whatsapp",
  "demoVideoUrl",
  "demoVideoSource",
  "registrationNumber",
  "passwordHash",
  "verificationDocuments",
  "verificationNote",
  "verificationDocUrl",
]);

const findGatedValues = (value, path = "data", found = []) => {
  if (!value || typeof value !== "object") return found;
  if (Array.isArray(value)) {
    value.forEach((item, index) => findGatedValues(item, `${path}[${index}]`, found));
    return found;
  }
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    if (GATED_KEYS.has(key) && child !== null && child !== "" && !(Array.isArray(child) && child.length === 0)) {
      found.push(childPath);
    }
    findGatedValues(child, childPath, found);
  }
  return found;
};

describe("health and discovery", () => {
  it("reports database health", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.database).toBe("ok");
  });

  it("lists only active, published and verified practices", async () => {
    const response = await request(app).get("/api/v1/providers");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].slug).toBe("ada-test-studio");
    expect(response.body.data[0].verified).toBe(true);
    expect(response.body.data[0].contact).toBeUndefined();
  });

  it("filters by specialty and search query", async () => {
    const response = await request(app).get("/api/v1/providers?specialty=Rammed%20Earth&q=Lagos");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta.total).toBe(1);
  });

  it("returns a public project with plates", async () => {
    const response = await request(app).get("/api/v1/projects/test-courtyard-house");
    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("Test Courtyard House");
    expect(response.body.data.plates).toHaveLength(1);
    expect(response.body.data.gallery).toEqual([]);
  });

  it("hides unpublished provider profiles", async () => {
    const response = await request(app).get("/api/v1/providers/pending-test-studio");
    expect(response.status).toBe(404);
  });

  it("hides projects belonging to unpublished providers", async () => {
    const project = await prisma.project.create({
      data: {
        providerId: fixture.pendingProvider.id,
        title: "Pending Provider Project",
        slug: "pending-provider-project",
        typology: "Cultural",
        city: "Abuja",
        state: "Abuja FCT",
        year: 2025,
        gfa: "200 m²",
        budget: 30000000,
        summary: "A published project belonging to an unpublished provider, used to verify discovery filtering.",
        status: "PUBLISHED",
      },
    });

    const list = await request(app).get("/api/v1/projects?provider=pending-test-studio");
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(0);

    const detail = await request(app).get("/api/v1/projects/pending-provider-project");
    expect(detail.status).toBe(404);

    await prisma.project.delete({ where: { id: project.id } });
  });

  it("never exposes gated values from public endpoints", async () => {
    const publicPaths = [
      "/api/v1/providers",
      "/api/v1/providers/ada-test-studio",
      "/api/v1/projects",
      "/api/v1/projects/test-courtyard-house",
      "/api/v1/specialties",
    ];
    for (const path of publicPaths) {
      const response = await request(app).get(path);
      expect(response.status).toBe(200);
      expect(findGatedValues(response.body)).toEqual([]);
    }
  });

  it("returns validation errors for bad query values", async () => {
    const response = await request(app).get("/api/v1/providers?pageSize=1000");
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("auth and gating", () => {
  it("rejects bad credentials", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "client@test.archng", password: "wrong-password" });
    expect(response.status).toBe(401);
  });

  it("rotates refresh tokens and revokes the old token", async () => {
    const agent = request.agent(app);
    const loginResponse = await agent.post("/api/v1/auth/login").send({
      email: "client@test.archng",
      password,
    });
    const oldCookie = loginResponse.headers["set-cookie"][0].split(";")[0];
    const refreshResponse = await agent.post("/api/v1/auth/refresh");
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.data.accessToken).toBeTruthy();

    const reused = await request(app).post("/api/v1/auth/refresh").set("Cookie", oldCookie);
    expect(reused.status).toBe(401);
  });

  it("creates a request, accepts it and unlocks gated contact details", async () => {
    const createResponse = await request(app)
      .post("/api/v1/demo-requests")
      .set(auth(clientToken))
      .send({
        providerSlug: "ada-test-studio",
        projectType: "Private Residence",
        state: "Lagos",
        location: "Lekki, Lagos",
        budgetRange: "50M_250M",
        brief: "A four-bedroom courtyard house with a shaded central garden and a separate guest wing.",
      });
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.request.status).toBe("Requested");
    fixture.requestId = createResponse.body.data.request.id;

    const duplicate = await request(app)
      .post("/api/v1/demo-requests")
      .set(auth(clientToken))
      .send({
        providerSlug: "ada-test-studio",
        projectType: "Private Residence",
        state: "Lagos",
        budgetRange: "50M_250M",
        brief: "A second duplicate request for the same project type with this practice.",
      });
    expect(duplicate.status).toBe(409);

    const publicProfile = await request(app).get("/api/v1/providers/ada-test-studio");
    expect(publicProfile.body.data.contact).toBeNull();
    expect(publicProfile.body.data.video.url).toBeNull();
    expect(publicProfile.body.data.registrationNumber).toBeNull();

    const leads = await request(app).get("/api/v1/me/leads").set(auth(providerToken));
    expect(leads.status).toBe(200);
    expect(leads.body.data.some((lead) => lead.id === fixture.requestId)).toBe(true);

    const accepted = await request(app)
      .patch(`/api/v1/me/leads/${fixture.requestId}`)
      .set(auth(providerToken))
      .send({ status: "ACCEPTED", note: "We would be glad to help." });
    expect(accepted.status).toBe(200);
    expect(accepted.body.data.status).toBe("Accepted");

    const gatedProfile = await request(app)
      .get("/api/v1/providers/ada-test-studio")
      .set(auth(clientToken));
    expect(gatedProfile.status).toBe(200);
    expect(gatedProfile.body.data.contact.email).toBe("hello@adatest.ng");
    expect(gatedProfile.body.data.video.url).toBe("https://vimeo.com/123456");
    expect(gatedProfile.body.data.registrationNumber).toBe("ARCON #TEST1");

    const gatedEndpoint = await request(app)
      .get("/api/v1/providers/ada-test-studio/gated")
      .set(auth(clientToken));
    expect(gatedEndpoint.status).toBe(200);
    expect(gatedEndpoint.body.meta.access).toBe("gated");

    const anonymous = await request(app).get("/api/v1/providers/ada-test-studio/gated");
    expect(anonymous.status).toBe(401);
  });
});

describe("provider workspace", () => {
  it("enforces the protected-route permission matrix", async () => {
    const protectedRoutes = [
      ["get", "/api/v1/me/provider-profile"],
      ["get", "/api/v1/me/leads"],
      ["get", "/api/v1/me/favorites"],
      ["post", "/api/v1/me/projects"],
      ["get", "/api/v1/admin/stats"],
      ["post", "/api/v1/admin/specialties"],
    ];
    for (const [method, path] of protectedRoutes) {
      const anonymous = await request(app)[method](path);
      expect(anonymous.status).toBe(401);
    }

    expect((await request(app).get("/api/v1/me/provider-profile").set(auth(clientToken))).status).toBe(403);
    expect((await request(app).get("/api/v1/me/leads").set(auth(clientToken))).status).toBe(403);
    expect((await request(app).post("/api/v1/me/projects").set(auth(clientToken)).send({})).status).toBe(403);
    expect((await request(app).get("/api/v1/admin/stats").set(auth(providerToken))).status).toBe(403);
    expect(
      (await request(app).post("/api/v1/admin/specialties").set(auth(providerToken)).send({ name: "Adaptive Reuse" }))
        .status,
    ).toBe(403);

    const otherOwner = await request(app)
      .patch(`/api/v1/me/projects/${fixture.project.id}`)
      .set(auth(pendingToken))
      .send({ title: "Not Pending Owned" });
    expect(otherOwner.status).toBe(404);
  });

  it("reads and updates the provider profile", async () => {
    const before = await request(app).get("/api/v1/me/provider-profile").set(auth(providerToken));
    expect(before.status).toBe(200);
    expect(before.body.data.canManage).toBe(true);

    const updated = await request(app)
      .patch("/api/v1/me/provider-profile")
      .set(auth(providerToken))
      .send({ bio: "Updated test practice biography.", acceptingLeads: true });
    expect(updated.status).toBe(200);
    expect(updated.body.data.bio).toBe("Updated test practice biography.");
  });

  it("validates and derives the demo video source", async () => {
    const invalid = await request(app)
      .put("/api/v1/me/demo-video")
      .set(auth(providerToken))
      .send({ url: "https://example.com/not-a-video" });
    expect(invalid.status).toBe(422);

    const saved = await request(app)
      .put("/api/v1/me/demo-video")
      .set(auth(providerToken))
      .send({ url: "https://www.youtube.com/watch?v=test-video" });
    expect(saved.status).toBe(200);
    expect(saved.body.data.video.url).toBe("https://www.youtube.com/watch?v=test-video");
    expect(saved.body.data.video.source).toBe("youtube");

    await request(app)
      .put("/api/v1/me/demo-video")
      .set(auth(providerToken))
      .send({ url: "https://vimeo.com/123456" });
  });

  it("creates, updates and deletes a draft project", async () => {
    const createResponse = await request(app)
      .post("/api/v1/me/projects")
      .set(auth(providerToken))
      .send({
        title: "Test Draft Annex",
        typology: "Cultural",
        city: "Ibadan, Oyo",
        state: "Oyo",
        year: 2025,
        gfa: "120 m²",
        budget: 25000000,
        summary: "A small draft annex used to verify the provider project workflow end to end.",
        status: "DRAFT",
        images: [
          {
            url: "https://images.example.com/annex.jpg",
            kind: "PHOTO",
            isCover: true,
          },
        ],
      });
    expect(createResponse.status).toBe(201);
    const projectId = createResponse.body.data.id;
    expect(createResponse.body.data.slug).toBe("test-draft-annex");
    expect(createResponse.body.data.status).toBe("DRAFT");

    const updateResponse = await request(app)
      .patch(`/api/v1/me/projects/${projectId}`)
      .set(auth(providerToken))
      .send({ status: "PUBLISHED" });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.status).toBe("PUBLISHED");

    const listResponse = await request(app).get("/api/v1/me/projects").set(auth(providerToken));
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.meta.counts.total).toBeGreaterThanOrEqual(2);

    const deleteResponse = await request(app)
      .delete(`/api/v1/me/projects/${projectId}`)
      .set(auth(providerToken));
    expect(deleteResponse.status).toBe(204);
  });

  it("blocks publishing for an unverified provider", async () => {
    const createResponse = await request(app)
      .post("/api/v1/me/projects")
      .set(auth(pendingToken))
      .send({
        title: "Pending Practice Draft",
        typology: "Institutional",
        city: "Abuja",
        state: "Abuja FCT",
        year: 2026,
        gfa: "300 m²",
        budget: 90000000,
        summary: "A draft project created by an unverified practice to test publish permissions.",
        status: "DRAFT",
        images: [{ url: "https://images.example.com/pending.jpg", kind: "PHOTO", isCover: true }],
      });
    expect(createResponse.status).toBe(201);
    const projectId = createResponse.body.data.id;

    const publish = await request(app)
      .patch(`/api/v1/me/projects/${projectId}`)
      .set(auth(pendingToken))
      .send({ status: "PUBLISHED" });
    expect(publish.status).toBe(403);

    await request(app).delete(`/api/v1/me/projects/${projectId}`).set(auth(pendingToken));
  });
});

describe("favorites and uploads", () => {
  it("saves, lists and removes a favorite", async () => {
    const add = await request(app)
      .post("/api/v1/me/favorites")
      .set(auth(clientToken))
      .send({ providerId: fixture.provider.id });
    expect(add.status).toBe(201);
    expect(add.body.data.provider.slug).toBe("ada-test-studio");

    const list = await request(app).get("/api/v1/me/favorites").set(auth(clientToken));
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    const remove = await request(app)
      .delete(`/api/v1/me/favorites/${fixture.provider.id}`)
      .set(auth(clientToken));
    expect(remove.status).toBe(204);
  });

  it("blocks non-provider uploads", async () => {
    const response = await request(app)
      .post("/api/v1/uploads/sign")
      .set(auth(clientToken))
      .send({ folder: "projects", fileName: "annex.jpg", contentType: "image/jpeg", size: 1024 });
    expect(response.status).toBe(403);
  });

  it("signs and accepts a local image upload", async () => {
    const sign = await request(app)
      .post("/api/v1/uploads/sign")
      .set(auth(providerToken))
      .send({ folder: "projects", fileName: "annex.jpg", contentType: "image/jpeg", size: 1024 });
    expect(sign.status).toBe(200);
    expect(sign.body.data.provider).toBe("local");

    const uploadPath = new URL(sign.body.data.uploadUrl).pathname;
    const upload = await request(app)
      .put(uploadPath)
      .set("Content-Type", "image/jpeg")
      .send(Buffer.from("test-image-bytes"));
    expect(upload.status).toBe(201);
    expect(upload.body.data.url).toMatch(/\/uploads\/projects\//);

    const assetPath = new URL(upload.body.data.url).pathname;
    const asset = await request(app).get(assetPath);
    expect(asset.status).toBe(200);
  });
});

describe("admin", () => {
  it("returns dashboard stats", async () => {
    const response = await request(app).get("/api/v1/admin/stats").set(auth(adminToken));
    expect(response.status).toBe(200);
    expect(response.body.data.verifications.pending).toBe(1);
    expect(response.body.data.projects.published).toBe(1);
  });

  it("approves a pending verification", async () => {
    const list = await request(app)
      .get("/api/v1/admin/verifications?status=PENDING")
      .set(auth(adminToken));
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    const decision = await request(app)
      .patch(`/api/v1/admin/verifications/${fixture.pendingProvider.id}`)
      .set(auth(adminToken))
      .send({ status: "VERIFIED", note: "Documents check out." });
    expect(decision.status).toBe(200);
    expect(decision.body.data.status).toBe("Verified");
  });

  it("creates a specialty", async () => {
    const response = await request(app)
      .post("/api/v1/admin/specialties")
      .set(auth(adminToken))
      .send({ name: "Adaptive Reuse" });
    expect(response.status).toBe(201);
    expect(response.body.data.slug).toBe("adaptive-reuse");

    const list = await request(app).get("/api/v1/specialties");
    expect(list.status).toBe(200);
    expect(list.body.data.some((specialty) => specialty.name === "Adaptive Reuse")).toBe(true);
  });

  it("hides a project from public discovery", async () => {
    const hide = await request(app)
      .patch(`/api/v1/admin/projects/${fixture.project.id}`)
      .set(auth(adminToken))
      .send({ adminHidden: true });
    expect(hide.status).toBe(200);
    expect(hide.body.data.adminHidden).toBe(true);

    const hidden = await request(app).get("/api/v1/projects/test-courtyard-house");
    expect(hidden.status).toBe(404);

    await request(app)
      .patch(`/api/v1/admin/projects/${fixture.project.id}`)
      .set(auth(adminToken))
      .send({ adminHidden: false });
  });

  it("suspends and reactivates an account", async () => {
    const suspend = await request(app)
      .patch(`/api/v1/admin/users/${fixture.client.id}/status`)
      .set(auth(adminToken))
      .send({ status: "SUSPENDED" });
    expect(suspend.status).toBe(200);

    const blocked = await request(app)
      .get("/api/v1/auth/me")
      .set(auth(clientToken));
    expect(blocked.status).toBe(403);

    const reactivate = await request(app)
      .patch(`/api/v1/admin/users/${fixture.client.id}/status`)
      .set(auth(adminToken))
      .send({ status: "ACTIVE" });
    expect(reactivate.status).toBe(200);
  });
});
