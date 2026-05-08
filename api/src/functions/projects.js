/* global process */
import { app } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import crypto from "crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database(process.env.COSMOS_DATABASE_NAME);
const container = database.container(process.env.COSMOS_CONTAINER_NAME);

function jsonResponse(status, jsonBody) {
  return {
    status,
    headers: corsHeaders,
    jsonBody,
  };
}

function validateProjectInput(project) {
  return Boolean(
    project?.title &&
      project?.githubUrl &&
      project?.description &&
      Array.isArray(project?.technologies) &&
      project.technologies.length > 0
  );
}

async function readRequestBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function findProjectById(id) {
  const querySpec = {
    query: "SELECT * FROM c WHERE c.id = @id",
    parameters: [{ name: "@id", value: id }],
  };

  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources[0];
}

app.http("projects", {
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  authLevel: "anonymous",
  route: "projects/{id?}",
  handler: async (request) => {
    if (request.method === "OPTIONS") {
      return {
        status: 204,
        headers: corsHeaders,
      };
    }

    const id = request.params.id;

    try {
      if (request.method === "GET" && !id) {
        const { resources } = await container.items
          .query("SELECT * FROM c")
          .fetchAll();

        return jsonResponse(200, resources);
      }

      if (request.method === "GET" && id) {
        const project = await findProjectById(id);

        if (!project) {
          return jsonResponse(404, { message: "Project not found." });
        }

        return jsonResponse(200, project);
      }

      if (request.method === "POST") {
        const body = await readRequestBody(request);

        if (!validateProjectInput(body)) {
          return jsonResponse(400, {
            message: "title, githubUrl, description, and technologies are required.",
          });
        }

        const timestamp = new Date().toISOString();
        const project = {
          id: crypto.randomUUID(),
          title: body.title,
          owner: body.owner || "N. Shrestha",
          technologies: body.technologies,
          rating: body.rating || 0,
          description: body.description,
          githubUrl: body.githubUrl,
          files: body.files || [],
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        const { resource } = await container.items.create(project);
        return jsonResponse(201, resource);
      }

      if (request.method === "PUT" && id) {
        const existingProject = await findProjectById(id);

        if (!existingProject) {
          return jsonResponse(404, { message: "Project not found." });
        }

        const body = await readRequestBody(request);

        if (!validateProjectInput(body)) {
          return jsonResponse(400, {
            message: "title, githubUrl, description, and technologies are required.",
          });
        }

        const updatedProject = {
          ...existingProject,
          title: body.title,
          owner: existingProject.owner,
          technologies: body.technologies,
          rating: body.rating ?? existingProject.rating,
          description: body.description,
          githubUrl: body.githubUrl,
          files: body.files || existingProject.files || [],
          updatedAt: new Date().toISOString(),
        };

        const { resource } = await container
          .item(existingProject.id, existingProject.owner)
          .replace(updatedProject);

        return jsonResponse(200, resource);
      }

      if (request.method === "DELETE" && id) {
        const existingProject = await findProjectById(id);

        if (!existingProject) {
          return jsonResponse(404, { message: "Project not found." });
        }

        await container.item(existingProject.id, existingProject.owner).delete();
        return jsonResponse(200, { message: "Project deleted successfully." });
      }

      return jsonResponse(405, { message: "Method not allowed." });
    } catch {
      return jsonResponse(500, { message: "Unable to process project request." });
    }
  },
});
