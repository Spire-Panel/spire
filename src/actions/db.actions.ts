"use server";
import SpireSettings, {
  ISpireSettings,
} from "@/lib/models/SpireSettings.model";
import Node, { INode, NodeValidator } from "@/lib/models/Node.model";
import { ActionsError } from "./utils";
import { ZodErrorFormatter } from "@/lib/utils";

export async function getSettings(): Promise<ISpireSettings> {
  const exists = await SpireSettings.findOne({});
  if (exists) return exists;
  const settings = await SpireSettings.create({ onboardingComplete: false });

  return settings;
}

export async function completeOnboarding() {
  const settings = await getSettings();
  settings.onboardingComplete = true;
  await settings.save();
}

export async function setApiKey(key: string) {
  const settings = await getSettings();
  settings.apiKey = key;
  await settings.save();
}

export async function createNode(nodeData: INode) {
  const validatedNode = NodeValidator.safeParse(nodeData);

  if (!validatedNode.success) {
    throw new ActionsError(
      "Invalid node data",
      ZodErrorFormatter(NodeValidator, validatedNode.error)
    );
  }

  const nodeExists = await Node.findOne({
    $or: [
      { connectionUrl: validatedNode.data.connectionUrl },
      { name: validatedNode.data.name },
    ],
  });

  if (nodeExists) {
    throw new ActionsError("Node already exists", {
      nodeExists,
    });
  }

  await Node.create(validatedNode.data);
}
