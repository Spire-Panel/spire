import { Errors, Responses } from "@/lib/api-utils";
import { withMiddleware } from "@/lib/middlewares";
import { SpireSettingsValidator } from "@/lib/models/SpireSettings.model";
import { ZodErrorFormatter } from "@/lib/utils";
import { Permissions } from "@/lib/Roles";

export const GET = withMiddleware(
  () => ({
    behaviour: Permissions.Behaviour.Or,
    permissions: [Permissions.Settings.Read],
  }),
  async (request, { models }) => {
    const settings = await models.SpireSettings.findOne({});

    if (!settings) {
      throw Errors.NotFound("Settings not found");
    }

    return Responses.Success(settings);
  }
);

export const PUT = withMiddleware(
  () => ({
    behaviour: Permissions.Behaviour.Or,
    permissions: [Permissions.Settings.Write],
  }),
  async (request, { models }) => {
    const settings = await models.SpireSettings.findOne({});

    if (!settings) {
      throw Errors.NotFound("Settings not found");
    }

    const body = await request.json().catch(() => {
      throw Errors.BadRequest("Invalid request body");
    });

    const validatedSettings = SpireSettingsValidator.safeParse(body);

    if (!validatedSettings.success) {
      throw Errors.BadRequest(
        "Invalid settings data",
        ZodErrorFormatter(SpireSettingsValidator, validatedSettings.error)
      );
    }

    const result = await models.SpireSettings.findOneAndUpdate(
      { _id: settings._id },
      {
        onboardingComplete: !!validatedSettings.data.onboardingComplete,
        apiKey: validatedSettings.data.apiKey || settings.apiKey,
      },
      {
        upsert: true,
        new: true,
      }
    );

    return Responses.Success(result);
  }
);
