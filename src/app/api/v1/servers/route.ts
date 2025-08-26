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

export const GET = withMiddleware(
  () => ({
    behaviour: Permissions.Behaviour.Or,
    permissions: [Permissions.Servers.Read, Permissions.Servers.Self],
  }),
  async (req, { models, userId }) => {
    if (!userHasPermissions(userId, Permissions.Servers.Read)) {
      const servers = await models.Server.find({
        userIds: {
          $in: [userId],
        },
      }).populate("node");
      return Responses.Success(servers);
    }

    const servers = await models.Server.find({}).populate("node");

    const serverData = await Promise.all(
      servers.map(async (server) => {
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
        return {
          ...server._doc,
          status: resData,
        };
      })
    );

    return Responses.Success(serverData);
  }
);

export const POST = withMiddleware(
  () => ({
    behaviour: Permissions.Behaviour.And,
    permissions: [Permissions.Servers.Create],
  }),
  async (req, { models }) => {
    const body = (await req.json()) as {
      node: string;
      userIds: string[];
      data: IServer;
    };
    const data = CreateServerValidator.safeParse(body);
    if (!data.success) throw Errors.BadRequest(data.error.message);

    const node = await models.Node.findById(body.node);
    if (!node) throw Errors.NotFound("Node not found");

    const res = await fetch(`${node.connectionUrl}/containers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${node.secret}`,
      },
      body: JSON.stringify(data.data),
    });

    const {
      success,
      error,
      data: resData,
    } = (await res.json()) as APIResponse<GlideTypes.Container>;

    if (!success) throw Errors.BadRequest(error);
    if (!resData) throw Errors.BadRequest("Failed to create server");
    const ServerModel = models.Server as mongoose.Model<IServer>;

    const server = await ServerModel.findOneAndUpdate(
      {
        _id: resData.id,
      },
      {
        ...data.data,
        node: node._id,
        userIds: body.userIds,
      },
      {
        upsert: true,
        new: true,
      }
    ).catch(async () => {
      await fetch(`${node.connectionUrl}/containers/${resData.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${node.secret}`,
        },
      });
      throw Errors.BadRequest("Failed to create server");
    });

    return Responses.Success(server);
  }
);
