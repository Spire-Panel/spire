import { withMiddleware } from "@/lib/middlewares";
import { Permissions } from "@/lib/Roles";
import { Responses } from "@/lib/api-utils";

export const GET = withMiddleware(
  () => ({
    behaviour: Permissions.Behaviour.And,
    permissions: [Permissions.Roles.Read],
  }),
  async (req, { models }) => {
    const roles = await models.Role.find({});
    return Responses.Success(roles);
  }
);
