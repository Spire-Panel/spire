import { Errors, Responses } from "@/lib/api-utils";
import { withMiddleware } from "@/lib/middlewares";
import { Permissions } from "@/lib/Roles";
import { getUserPermissions } from "@/actions/roles.actions";

export const GET = withMiddleware(
  [Permissions.Profile.Self],
  async (request, { models, clerk, userId }) => {
    const user = await clerk.users.getUser(userId);
    if (!user) throw Errors.NotFound("User not found");
    return Responses.Success({
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      role: user.publicMetadata.role,
      permissions: await getUserPermissions(userId),
    });
  }
);
