import { APIResponse, Errors, Responses } from "@/lib/api-utils";
import { Permissions } from "@/lib/Roles";
import { withMiddleware } from "@/lib/middlewares";
import { IServer } from "@/lib/models/Server.model";
import mongoose from "mongoose";

export const POST = withMiddleware(
  ({ params }) => ({
    behaviour: Permissions.Behaviour.Or,
    permissions: [Permissions.Servers.Rcon, `servers:rcon:${params.id}`],
  }),
  async (req, { models, params }) => {
    const server = await (models.Server as mongoose.Model<IServer>)
      .findById(params.id)
      .populate("node");
    if (!server) throw Errors.NotFound("Server not found");

    try {
      const body = await req.json();
      const { command } = body;
      const res = await fetch(
        `${server.node.connectionUrl}/containers/${server._id}/command`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${server.node.secret}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ command }),
        }
      );

      const {
        success,
        error,
        data: resData,
      } = (await res.json()) as APIResponse<string>;
      if (!success) throw Errors.BadRequest(error);
      if (!resData) throw Errors.BadRequest("Failed to execute command");
      return Responses.Success(resData);
    } catch (error) {
      console.error("Error executing command:", error);
      throw Errors.InternalServerError("Failed to execute command");
    }
  }
);
