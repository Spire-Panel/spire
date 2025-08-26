import { createNode } from "@/actions/db.actions";
import { ActionsError, checkNewNode } from "@/actions/utils";
import { Errors, Fetch, Responses } from "@/lib/api-utils";
import { withMiddleware } from "@/lib/middlewares";
import { INode, INodeDocument, NodeValidator } from "@/lib/models/Node.model";
import { Permissions } from "@/lib/Roles";
import { APITypes } from "@/types/api";

export const GET = withMiddleware(
  () => ({
    behaviour: Permissions.Behaviour.And,
    permissions: [Permissions.Nodes.Read],
  }),
  async (req, { models }) => {
    const query = req.nextUrl.searchParams;
    const includeStatus = query.get("includeStatus");
    if (includeStatus) {
      const timeout = query.get("timeout") || "1000";
      try {
        const nodes: INodeDocument[] = await models.Node.find({}).select(
          "-secret"
        );

        const statuses = await Promise.all(
          nodes.map(async (node) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(
              () => controller.abort(),
              Number(timeout)
            );
            try {
              const res = await Fetch<APITypes.Nodes>(
                `${node.connectionUrl}/health`,
                {
                  signal: controller.signal,
                }
              );
              clearTimeout(timeoutId);

              return {
                _id: node._id,
                name: node.name,
                connectionUrl: node.connectionUrl,
                portAllocations: node.portAllocations,
                createdAt: node.createdAt,
                updatedAt: node.updatedAt,
                memoryUsageMB: res.data?.memoryUsageMB || 0,
                memoryUsagePercent: res.data?.memoryUsagePercent || 0,
                memoryUsageTotal: res.data?.memoryUsageTotal || 0,
                memoryUsageFree: res.data?.memoryUsageFree || 0,
                totalMemory: res.data?.totalMemory || 0,
                cpuUsagePercent: res.data?.cpuUsagePercent || 0,
                online: !!res.success,
                uptime: res.data?.uptime || 0,
                storageFreeSpace: res.data?.storageFreeSpace || 0,
                storageUsedSpace: res.data?.storageUsedSpace || 0,
                storageTotalSpace: res.data?.storageTotalSpace || 0,
                storageUsedPercent: res.data?.storageUsedPercent || 0,
                cpuCores: res.data?.cpuCores || 0,
                cpuModel: res.data?.cpuModel || "",
                lastSeen: res.data?.lastSeen || new Date(),
              };
            } catch (error) {
              clearTimeout(timeoutId);
              return {
                _id: node._id,
                online: false,
              };
            }
          })
        );

        return Responses.Success(statuses);
      } catch (error) {
        console.log(error);
        throw Errors.InternalServerError("Failed to get nodes");
      }
    }
    const nodes = await models.Node.find({}).select("-secret");
    return Responses.Success(nodes);
  }
);

export const POST = withMiddleware(
  () => ({
    behaviour: Permissions.Behaviour.Or,
    permissions: [Permissions.Nodes.Manage, Permissions.Nodes.Write],
  }),
  async (req, { models }) => {
    const body = await req.json().catch(() => {
      throw Errors.BadRequest("Invalid request body");
    });
    try {
      const isValidNode = await checkNewNode(body);
      if (!isValidNode) throw Errors.BadRequest("Invalid node");
      await createNode(body.connectionUrl, body.name, body.secret);
    } catch (error) {
      const e = error as ActionsError;
      console.log({ e });
      throw Errors.BadRequest(e.message, e.details);
    }

    return Responses.Success(body);
  }
);
