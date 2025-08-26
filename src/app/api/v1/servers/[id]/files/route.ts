import { withMiddleware } from "@/lib/middlewares";
import { APIResponse, Errors, Responses } from "@/lib/api-utils";
import { Permissions } from "@/lib/Roles";
import { GlideTypes } from "@/types/api";

export const GET = withMiddleware<{ id: string }>(
  ({ params }) => ({
    behaviour: Permissions.Behaviour.Or,
    permissions: [
      `servers:files:read:${params.id}`,
      Permissions.Servers.FilesRead,
    ],
  }),
  async (req, { models, params }) => {
    const query = req.nextUrl.searchParams.get("path");
    const server = await models.Server.findById(params.id).populate("node");
    if (!server) throw Errors.NotFound("Server not found");

    const res = await fetch(
      `${server.node.connectionUrl}/containers/${server._id}/files?path=${
        query ? query : "/"
      }`,
      {
        headers: {
          Authorization: `Bearer ${server.node.secret}`,
        },
      }
    );
    const {
      success,
      error,
      data: resData,
    } = (await res.json()) as APIResponse<GlideTypes.ContainerStatus>;
    if (!success)
      throw Errors.BadRequest("No such file or directory was found");
    if (!resData) throw Errors.BadRequest("Failed to get server files");
    return Responses.Success(resData);
  }
);
