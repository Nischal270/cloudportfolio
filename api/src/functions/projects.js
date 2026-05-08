/* global Buffer, process */
import { app } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { BlobServiceClient } from "@azure/storage-blob";
import crypto from "crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Expose-Headers": "Content-Disposition",
};

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database(process.env.COSMOS_DATABASE_NAME);
const container = database.container(process.env.COSMOS_CONTAINER_NAME);
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const blobContainerClient = blobServiceClient.getContainerClient(
  process.env.BLOB_CONTAINER_NAME
);

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

function parseTechnologies(technologies) {
  if (Array.isArray(technologies)) {
    return technologies.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof technologies === "string") {
    return technologies.split(",").map((tag) => tag.trim()).filter(Boolean);
  }

  return [];
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

async function uploadFiles(projectId, files) {
  const fileMetadata = [];

  for (const file of files) {
    const blobName = `${projectId}/${Date.now()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "application/octet-stream";
    const blockBlobClient = blobContainerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    fileMetadata.push({
      fileName: file.name,
      blobName,
      contentType,
      size: file.size,
    });
  }

  return fileMetadata;
}

async function buildProjectFromMultipartRequest(request) {
  const formData = await request.formData();
  const projectId = crypto.randomUUID();
  const files = formData
    .getAll("files")
    .filter((file) => file && typeof file.arrayBuffer === "function");
  const uploadedFiles = await uploadFiles(projectId, files);
  const timestamp = new Date().toISOString();

  return {
    id: projectId,
    title: formData.get("title"),
    owner: formData.get("owner") || "N. Shrestha",
    technologies: parseTechnologies(formData.get("technologies")),
    rating: 0,
    description: formData.get("description"),
    githubUrl: formData.get("githubUrl"),
    files: uploadedFiles,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

async function buildProjectFromJsonRequest(request) {
  const body = await readRequestBody(request);
  const timestamp = new Date().toISOString();

  if (!body) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    title: body.title,
    owner: body.owner || "N. Shrestha",
    technologies: parseTechnologies(body.technologies),
    rating: body.rating || 0,
    description: body.description,
    githubUrl: body.githubUrl,
    files: Array.isArray(body.files) ? body.files : [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function getContentType(request) {
  return request.headers.get("content-type") || "";
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
        const project = getContentType(request).includes("multipart/form-data")
          ? await buildProjectFromMultipartRequest(request)
          : await buildProjectFromJsonRequest(request);

        if (!validateProjectInput(project)) {
          return jsonResponse(400, {
            message: "title, githubUrl, description, and technologies are required.",
          });
        }

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
          technologies: parseTechnologies(body.technologies),
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

app.http("projectDownload", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  route: "projects/{id}/download",
  handler: async (request) => {
    if (request.method === "OPTIONS") {
      return {
        status: 204,
        headers: corsHeaders,
      };
    }

    try {
      const project = await findProjectById(request.params.id);

      if (!project) {
        return jsonResponse(404, { message: "Project not found." });
      }

      if (!Array.isArray(project.files) || project.files.length === 0) {
        return jsonResponse(404, {
          message: "No files available for this project.",
        });
      }

      const storedFile = project.files[0];

      if (!storedFile?.blobName) {
        return jsonResponse(404, {
          message: "No files available for this project.",
        });
      }

      const blockBlobClient = blobContainerClient.getBlockBlobClient(storedFile.blobName);
      const fileBuffer = await blockBlobClient.downloadToBuffer();
      const fileName = String(storedFile.fileName || "project-file").replaceAll('"', "");

      return {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": storedFile.contentType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
        body: fileBuffer,
      };
    } catch {
      return jsonResponse(500, { message: "Unable to download project file." });
    }
  },
});
