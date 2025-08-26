import { withMiddleware } from "@/lib/middlewares";
import { Permissions } from "@/lib/Roles";
import {
  getUserPermissions,
  isUserAllowed,
  userHasPermissions,
} from "@/actions/roles.actions";
import { APIResponse, Errors, Fetch, Responses } from "@/lib/api-utils";
import {
  CreateServerValidator,
  IServer,
  ServerValidator,
} from "@/lib/models/Server.model";
import { GlideTypes } from "@/types/api";
import mongoose from "mongoose";

export const POST = withMiddleware(
  ({ params }) => ({
    behaviour: Permissions.Behaviour.Or,
    permissions: [
      Permissions.Servers.Restart,
      `servers:stop:${params.id}`,
      Permissions.Servers.Manage,
    ],
  }),
  async (req, { models, userId, params }) => {
    const server = await models.Server.findById(params.id).populate("node");
    if (!server) throw Errors.NotFound("Server not found");

    const res = await fetch(
      `${server.node.connectionUrl}/containers/${params.id}/status/stop`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${server.node.secret}`,
        },
        body: JSON.stringify({}),
      }
    );

    const {
      success,
      error,
      data: resData,
    } = (await res.json()) as APIResponse<GlideTypes.Container>;

    console.log({ success, error, data: resData });

    if (!success) throw Errors.BadRequest(error);
    if (!resData) throw Errors.BadRequest("Failed to stop server");

    return Responses.Success(resData);
  }
);
