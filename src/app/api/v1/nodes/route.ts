import { createNode } from "@/actions/db.actions";
import { ActionsError, checkNewNode } from "@/actions/utils";
import { Errors, Responses } from "@/lib/api-utils";
import { withMiddleware } from "@/lib/middlewares";
import { NodeValidator } from "@/lib/models/Node.model";
import { Permissions } from "@/lib/Roles";

export const GET = withMiddleware(
  [Permissions.Nodes.Read, Permissions.Servers.Manage],
  async (req, { models }) => {
    const nodes = await models.Node.find({}).select("-secret");
    return Responses.Success(nodes);
  }
);

export const POST = withMiddleware(
  [Permissions.Nodes.Write],
  async (req, { models }) => {
    const body = await req.json().catch(() => {
      throw Errors.BadRequest("Invalid request body");
    });
    try {
      const isValidNode = await checkNewNode(body);
      if (!isValidNode) throw Errors.BadRequest("Invalid node");
    } catch (error) {
      const e = error as ActionsError;
      console.log({ e });
      throw Errors.BadRequest(e.message, e.details);
    }

    await createNode(body.connectionUrl, body.name, body.secret);
    return Responses.Success(body);
  }
);
