import { withMiddleware } from "@/lib/middlewares";
import { Permissions } from "@/lib/Roles";

export const POST = withMiddleware(
  () => [Permissions.Servers.Create],
  async (req, { models, userId }) => {
    return new Response("Hello", {
      status: 200,
    });
  }
);
