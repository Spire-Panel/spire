"use server";
import SpireSettings, {
  ISpireSettings,
  ISpireSettingsDocument,
} from "@/lib/models/SpireSettings.model";
import Node, { INode, NodeValidator } from "@/lib/models/Node.model";
import { ActionsError } from "./utils";
import { ZodErrorFormatter } from "@/lib/utils";

export async function getSettings(): Promise<ISpireSettingsDocument> {
  const exists = await SpireSettings.findOne({});
  if (exists) return exists;
  const settings = await SpireSettings.create({ onboardingComplete: false });

  return settings;
}

export async function updateSettings(settingsData: Partial<ISpireSettings>) {
  const settings = await getSettings();
  settings.onboardingComplete =
    settingsData.onboardingComplete || !!settings.onboardingComplete;
  settings.apiKey = settingsData.apiKey || settings.apiKey;
  await settings.save();
}

export async function setApiKey(key: string) {
  const settings = await getSettings();
  settings.apiKey = key;
  await settings.save();
}

export async function createNode(
  connectionUrl: string,
  name: string,
  secret: string
) {
  const validatedNode = NodeValidator.safeParse({
    connectionUrl,
    name,
    secret,
  });

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
