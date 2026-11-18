import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.js";

const here = dirname(fileURLToPath(import.meta.url));
const routesRoot = resolve(here, "../modules");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "ArchNG API",
      version: "0.1.0",
      description:
        "Verified architecture marketplace API. Access tokens are returned in the response body; refresh tokens are httpOnly cookies scoped to /api/v1/auth.",
    },
    servers: [{ url: env.PUBLIC_API_URL, description: env.NODE_ENV }],
    tags: [
      { name: "Auth" },
      { name: "Providers" },
      { name: "Projects" },
      { name: "Requests" },
      { name: "Favorites" },
      { name: "Specialties" },
      { name: "Uploads" },
      { name: "Admin" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    resolve(routesRoot, "auth/auth.routes.js"),
    resolve(routesRoot, "providers/provider.routes.js"),
    resolve(routesRoot, "projects/project.routes.js"),
    resolve(routesRoot, "requests/request.routes.js"),
    resolve(routesRoot, "favorites/favorite.routes.js"),
    resolve(routesRoot, "specialties/specialty.routes.js"),
    resolve(routesRoot, "uploads/upload.routes.js"),
    resolve(routesRoot, "admin/admin.routes.js"),
  ],
};

export const openapiSpec = swaggerJsdoc(options);
