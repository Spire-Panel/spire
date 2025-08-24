"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useTestNodeConnection } from "@/hooks/useTestNodeConnection";
import { useTestNodeSecret } from "@/hooks/useTestNodeSecret";
import { createNode, updateSettings } from "@/actions/db.actions";
import { useRouter } from "next/navigation";
import { ActionsError } from "@/actions/utils";
import { v4 } from "uuid";
import { updateRole } from "@/actions/clerk.actions";
import { useAuth } from "@clerk/nextjs";
import { createRole } from "@/actions/roles.actions";
import { Permissions } from "@/lib/Roles";

type OnboardingFormData = {
  nodeConnectionUrl: string;
  nodeName: string;
  nodeSecret: string;
};

type OnboardingField = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required: {
    condition: boolean;
  };

  description?: string;
  accept?: string;
  maxLength?: number;
  children?: () => React.ReactNode;
};

type OnboardingStep = {
  title: string;
  description: string;
  emoji: string;
  fields: OnboardingField[];
  children?: () => React.ReactNode;
};

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [apiErrors, setApiErrors] = useState<ActionsError[]>([]);
  const [miscErrors, setMiscErrors] = useState<string[]>([]);
  const [generatedApiKey, setGeneratedApiKey] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<OnboardingFormData>({
    defaultValues: {
      nodeConnectionUrl: "",
      nodeName: "",
      nodeSecret: "",
    },
  });

  const { isLoading, error, isValid } = useTestNodeConnection(
    getValues("nodeConnectionUrl")
  );
  const {
    isLoading: isLoadingSecret,
    error: errorSecret,
    isValid: isValidSecret,
  } = useTestNodeSecret(
    getValues("nodeConnectionUrl"),
    getValues("nodeSecret")
  );

  useEffect(() => {
    setGeneratedApiKey(v4());
  }, []);

  const onboardingSteps: OnboardingStep[] = [
    {
      title: "Welcome to Spire",
      description:
        "Let's get you set up with your new instance. We'll guide you through the process step by step.",
      emoji: "👋",
      fields: [],
    },
    {
      title: "First Glide Connection",
      description: "We'll start by getting your first node up and connected.",
      emoji: "🕊️",
      fields: [
        {
          name: "nodeConnectionUrl",
          label: "Node Connection URL",
          type: "text",
          placeholder: "http://localhost:1317",
          required: {
            condition: isValid && !isLoading,
          },
        },
      ],
      children: () => {
        return (
          <div className="w-full flex items-center justify-center pb-4">
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : error ? (
              <div className="text-destructive">
                {(error as unknown as Error)?.message ||
                  "Invalid node connection"}
              </div>
            ) : isValid ? (
              <div className="text-green-300">Node connection is valid</div>
            ) : (
              <div className="text-destructive">Node connection is invalid</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Name Your Node",
      description: "Give your node a name so you can easily identify it.",
      emoji: "🚀",
      fields: [
        {
          name: "nodeName",
          label: "Node Name",
          type: "text",
          required: {
            condition: !!getValues("nodeName") && getValues("nodeName") !== "",
          },
        },
      ],
    },
    {
      title: "Node API Key",
      description:
        'Let\'s make sure you have proper access to this node. Paste your API key from the file found at the root of your glide daemon named "spire_config.json"',
      emoji: "🔑",
      fields: [
        {
          name: "nodeSecret",
          label: "Node API Key",
          type: "text",
          required: {
            condition: isValidSecret && !isLoadingSecret,
          },
        },
      ],
      children: () => {
        return (
          <div className="w-full flex items-center justify-center pb-4">
            {isLoadingSecret ? (
              <Loader2 className="animate-spin" />
            ) : errorSecret ? (
              <div className="text-destructive">
                {(errorSecret as unknown as Error)?.message ||
                  "Invalid node API key"}
              </div>
            ) : isValidSecret ? (
              <div className="text-green-300">Node API key is valid</div>
            ) : (
              <div className="text-destructive">Node API key is invalid</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Spire Panel API Key",
      description:
        "Below is your generated API key. You will be able to use this to authenticate with your spire panel to automate tasks if you wish to do so. Do not lose this, you will be able to generate a new one but this one can never be recovered.",
      emoji: "🔑",
      fields: [],
      children: () => {
        return (
          <div className="w-full flex flex-col items-center justify-center pb-4 gap-4">
            <Label className="text-destructive text-center">
              Do not share this key with anyone.
            </Label>
            <Textarea disabled value={generatedApiKey} rows={1} />
          </div>
        );
      },
    },
    {
      title: "You're All Set!",
      description:
        "You're ready to start using Spire. Click 'Get Started' to begin hosting!",
      emoji: "🎉",
      fields: [],
    },
  ];

  const totalSteps = onboardingSteps.length;
  const router = useRouter();
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;
    updateRole(userId, "admin");
  }, [userId]);

  const nextStep = async () => {
    const currentStepFields = onboardingSteps[currentStep]?.fields || [];
    const requiredFields = currentStepFields.filter((field) => field.required);
    const hasEmptyRequiredFields = requiredFields.some((field) => {
      const value = watch(field.name as keyof OnboardingFormData);
      return !value || (Array.isArray(value) && value.length === 0);
    });

    if (hasEmptyRequiredFields) {
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      try {
        await updateSettings({
          onboardingComplete: true,
          apiKey: generatedApiKey,
        });

        await createNode(
          data.nodeConnectionUrl,
          data.nodeName,
          data.nodeSecret
        );

        await Promise.all([
          createRole("user", 0, [
            Permissions.Profile.Self,
            Permissions.Servers.Self,
          ]),
          createRole("admin", 1, ["*"]),
        ]);

        router.push("/dashboard");
      } catch (error) {
        console.error("Error creating node:", error);
        setIsSubmitting(false);
        if (error instanceof ActionsError) {
          setApiErrors((prev) => [...prev, error]);
        } else if (error instanceof Error) {
          setMiscErrors((prev) => [...prev, error.message]);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const currentStepFields = onboardingSteps[currentStep]?.fields || [];

    // If no fields, can continue
    if (currentStepFields.length === 0) {
      setCanContinue(true);
      return;
    }

    // Check each field's required.condition
    const allConditionsMet = currentStepFields.every((field) => {
      // If field is not required, skip validation
      if (!field.required) return true;

      // Use the required.condition from the field definition
      return field.required.condition;
    });

    setCanContinue(allConditionsMet);
  }, [currentStep, onboardingSteps]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-3xl">
        <div className="relative w-full h-[32rem] overflow-hidden">
          <AnimatePresence initial={false} custom={currentStep} mode="wait">
            {onboardingSteps.map((step, index) => (
              <OnboardingCard
                key={index}
                index={index}
                currentIndex={currentStep}
              >
                <div className="p-8">
                  {apiErrors?.length > 0 && (
                    <div className="text-destructive flex flex-col gap-1">
                      {apiErrors.map((error) => (
                        <div key={error.message}>{error.message}</div>
                      ))}
                    </div>
                  )}
                  {miscErrors?.length > 0 && (
                    <div className="text-destructive flex flex-col gap-1">
                      {miscErrors.map((error) => (
                        <div key={error}>{error}</div>
                      ))}
                    </div>
                  )}
                  <div className="text-6xl mb-6 text-center">{step.emoji}</div>
                  <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
                    {step.title}
                  </h2>
                  <p className="text-muted-foreground mb-8 text-center">
                    {step.description}
                  </p>

                  {step.children?.()}

                  <div className="space-y-6 max-w-md mx-auto">
                    {step.fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        {field.children?.()}
                        <Label htmlFor={field.name}>
                          {field.label}
                          {field.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </Label>
                        {field.type === "textarea" ? (
                          <Textarea
                            id={field.name}
                            placeholder={field.placeholder}
                            {...register(
                              field.name as keyof OnboardingFormData,
                              {
                                required: !!field.required,
                                maxLength: field.maxLength,
                              }
                            )}
                            className="min-h-[100px]"
                          />
                        ) : (
                          <Input
                            id={field.name}
                            type={field.type || "text"}
                            placeholder={field.placeholder}
                            {...register(
                              field.name as keyof OnboardingFormData,
                              {
                                required: !!field.required,
                              }
                            )}
                          />
                        )}
                        {errors[field.name as keyof OnboardingFormData] && (
                          <p className="text-sm text-destructive">
                            {field.label} is required
                          </p>
                        )}
                        {field.description && (
                          <p className="text-xs text-muted-foreground">
                            {field.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {index === totalSteps - 1 && (
                    <div className="mt-8 text-center">
                      <Button
                        type="submit"
                        size="lg"
                        className="gap-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Setting up your instance...
                          </>
                        ) : (
                          <>
                            Get Started
                            <CheckCircle2 className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </OnboardingCard>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentStep(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {currentStep < totalSteps - 1 ? (
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={nextStep}
              className="gap-2"
              disabled={!canContinue}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
