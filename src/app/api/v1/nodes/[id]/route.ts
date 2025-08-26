import { Errors, Responses } from "@/lib/api-utils";
import { withMiddleware } from "@/lib/middlewares";
import { isValidObjectId } from "mongoose";
import { Permissions } from "@/lib/Roles";

export const GET = withMiddleware<{ id: string }>(
  ({ params }) => ({
    behaviour: Permissions.Behaviour.Or,
    permissions: [`nodes:read:${params.id}`, Permissions.Nodes.Read],
  }),
  async (req, { models, params }) => {
    if (!isValidObjectId(params.id)) throw Errors.BadRequest("Invalid node id");
    const node = await models.Node.findById(params.id).select("-secret");
    if (!node) throw Errors.NotFound("Node not found");
    return Responses.Success(node);
  }
);

export const PATCH = withMiddleware<{ id: string }>(
  ({ params }) => ({
    behaviour: Permissions.Behaviour.Or,
    permissions: [`nodes:write:${params.id}`, Permissions.Nodes.Write],
  }),
  async (req, { models, params }) => {
    if (!isValidObjectId(params.id)) throw Errors.BadRequest("Invalid node id");

    const body = await req.json().catch(() => {
      throw Errors.BadRequest("Invalid request body");
    });

    // Find and update the node in one operation
    const updatedNode = await models.Node.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedNode) {
      throw Errors.NotFound("Node not found");
    }

    // Return the updated node (excluding the secret)
    const { secret, ...nodeWithoutSecret } = updatedNode.toObject();
    return Responses.Success(nodeWithoutSecret);
  }
);
