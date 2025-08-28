import { withMiddleware } from "@/lib/middlewares";
import { APIResponse, Errors, Responses } from "@/lib/api-utils";
import { Permissions } from "@/lib/Roles";
import { GlideTypes } from "@/types/api";

export const GET = withMiddleware<{ id: string }>(
  ({ params }) => ({
    behaviour: Permissions.Behaviour.Or,
    permissions: [`servers:read:${params.id}`, Permissions.Servers.Read],
  }),
  async (req, { models, params }) => {
    const server = await models.Server.findById(params.id).populate("node");
    if (!server) throw Errors.NotFound("Server not found");

    const res = await fetch(
      `${server.node.connectionUrl}/containers/${server._id}/status`,
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
    if (!success) throw Errors.BadRequest(error);
    if (!resData) throw Errors.BadRequest("Failed to get server status");
    return Responses.Success({
      ...server._doc,
      status: resData,
    });
  }
);

export const DELETE = withMiddleware<{ id: string }>(
  ({ params }) => ({
    behaviour: Permissions.Behaviour.Or,
    permissions: [Permissions.Servers.Delete, `servers:delete:${params.id}`],
  }),
  async (req, { models, params }) => {
    const server = await models.Server.findById(params.id).populate("node");
    if (!server) throw Errors.NotFound("Server not found");

    const res = await fetch(
      `${server.node.connectionUrl}/containers/${server._id}`,
      {
        method: "DELETE",
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
    if (!success) throw Errors.BadRequest(error);
    if (!resData) throw Errors.BadRequest("Failed to delete server");

    await models.Server.findByIdAndDelete(params.id);

    return Responses.Success(resData);
  }
);
