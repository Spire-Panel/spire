import { INode } from "@/lib/models/Node.model";
import { clerkClient } from "@clerk/nextjs/server";

export class ActionsError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(message);
    this.name = "ActionsError";
  }

  public get error() {
    return {
      success: false,
      message: this.message,
      details: this.details,
    };
  }
}

export const checkNewNode = async (nodeData: INode) => {
  const healthCheck = await fetch(`${nodeData.connectionUrl}/health`).catch(
    () => ({ ok: false })
  );
  if (!healthCheck.ok) throw new ActionsError("Server is not a Glide node");

  const secretCheck = await fetch(`${nodeData.connectionUrl}/`, {
    headers: {
      Authorization: `Bearer ${nodeData.secret}`,
    },
  }).catch(() => ({ ok: false }));
  if (!secretCheck.ok) throw new ActionsError("Invalid node secret");

  return true;
};
