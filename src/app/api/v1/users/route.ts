import { withMiddleware } from "@/lib/middlewares";
import { Permissions } from "@/lib/Roles";
import { Errors, Responses } from "@/lib/api-utils";

export const GET = withMiddleware(
  () => ({
    behaviour: Permissions.Behaviour.And,
    permissions: [Permissions.Users.Read],
  }),
  async (req, { models, clerk }) => {
    const users = await clerk.users.getUserList();
    return Responses.Success(users.data);
  }
);
