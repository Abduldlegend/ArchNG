import { Router } from "express";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { adminRoutes } from "./modules/admin/admin.routes.js";
import { favoriteMeRoutes } from "./modules/favorites/favorite.routes.js";
import { healthHandler } from "./modules/health.js";
import { projectMeRoutes, projectRoutes } from "./modules/projects/project.routes.js";
import { providerMeRoutes, providerRoutes } from "./modules/providers/provider.routes.js";
import { requestMeRoutes, requestRoutes } from "./modules/requests/request.routes.js";
import { specialtyRoutes } from "./modules/specialties/specialty.routes.js";
import { uploadRoutes } from "./modules/uploads/upload.routes.js";

export const apiRoutes = Router();

apiRoutes.get("/", (_req, res) => {
  res.json({
    data: {
      name: "ArchNG API",
      version: "0.1.0",
      docs: "/api/docs",
      health: "/api/v1/health",
    },
  });
});

apiRoutes.get("/health", healthHandler);
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/providers", providerRoutes);
apiRoutes.use("/projects", projectRoutes);
apiRoutes.use("/specialties", specialtyRoutes);
apiRoutes.use("/uploads", uploadRoutes);
apiRoutes.use("/me", providerMeRoutes);
apiRoutes.use("/me", projectMeRoutes);
apiRoutes.use("/me", requestMeRoutes);
apiRoutes.use("/me", favoriteMeRoutes);
apiRoutes.use("/admin", adminRoutes);
apiRoutes.use("/", requestRoutes);
