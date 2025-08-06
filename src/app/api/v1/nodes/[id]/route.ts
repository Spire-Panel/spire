import { Errors, Responses } from "@/lib/api-utils";
import { withMiddleware } from "@/lib/middlewares";
import { isValidObjectId } from "mongoose";

export const GET = withMiddleware<{ id: string }>(
  async (req, { models, params }) => {
    if (!isValidObjectId(params.id)) throw Errors.BadRequest("Invalid node id");
    const node = await models.Node.findById(params.id).select("-secret");
    if (!node) throw Errors.NotFound("Node not found");
    return Responses.Success(node);
  }
);
