import { withMiddleware } from "@/lib/middlewares";
import { Permissions } from "@/lib/Roles";
import { Errors, Responses } from "@/lib/api-utils";
import { updateRole } from "@/actions/clerk.actions";

export const PATCH = withMiddleware<{
  id: string;
}>(
  ({ params }) => ({
    behaviour: Permissions.Behaviour.Or,
    permissions: [Permissions.Users.Write, `users:write:${params.id}`],
  }),
  async (req, { models, clerk, params }) => {
    const body = await req.json().catch(() => {
      throw Errors.BadRequest("Invalid request body");
    });
    const user = await clerk.users.getUser(params.id);
    if (!user) throw Errors.NotFound("User not found");

    await updateRole(user.id, body.role);
    return Responses.Success({
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      role: body.role,
    });
  }
);
