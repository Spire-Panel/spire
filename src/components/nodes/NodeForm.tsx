"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PortAllocation } from "./PortAllocation";
import { useCallback, useEffect } from "react";

// Form values type
export type NodeFormValues = {
  name: string;
  connectionUrl: string;
  secret: string;
  portAllocations: number[];
};

// Schema for editing a node
const nodeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  connectionUrl: z
    .string()
    .url("Must be a valid URL")
    .min(1, "Connection URL is required"),
  portAllocations: z
    .array(z.number())
    .min(1, "At least one port allocation is required"),
  secret: z.string().min(1, "Node secret is required"),
});

interface NodeFormProps {
  defaultValues?: Partial<NodeFormValues>;
  onSubmit: (data: NodeFormValues) => Promise<void>;
  isLoading: boolean;
  isEdit?: boolean;
}

export function NodeForm({
  defaultValues = {},
  onSubmit,
  isLoading,
  isEdit,
}: NodeFormProps) {
  type FormValues = z.infer<typeof nodeFormSchema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(nodeFormSchema),
    defaultValues: {
      name: "",
      connectionUrl: "",
      portAllocations: [],
      secret: isEdit ? "0" : "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setValue,
    control,
  } = form;

  // Log form state changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log("Form value changed:", { name, type, value });
      console.log("Form errors:", form.formState.errors);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const portAllocations = form.watch("portAllocations") || [];

  const handlePortsChange = useCallback(
    (newPorts: number[]) => {
      const uniquePorts = [...new Set(newPorts)].sort((a, b) => a - b);

      if (JSON.stringify(portAllocations) !== JSON.stringify(uniquePorts)) {
        setValue("portAllocations", uniquePorts, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    },
    [portAllocations, setValue]
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(onSubmit)(e);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Node" : "Create Node"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., US West"
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="connectionUrl">Connection URL</Label>
            <Input
              id="connectionUrl"
              placeholder="e.g., http://node1.example.com"
              {...register("connectionUrl")}
              disabled={isLoading}
            />
            {errors.connectionUrl && (
              <p className="text-sm text-destructive">
                {errors.connectionUrl.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Port Allocations</Label>
            <PortAllocation
              initialPorts={portAllocations}
              onChange={handlePortsChange}
              disabled={isLoading}
            />
            {errors.portAllocations && (
              <p className="text-sm text-destructive">
                {errors.portAllocations.message}
              </p>
            )}
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="secret">Node Secret</Label>
              <Input
                id="secret"
                placeholder="e.g., your-node-secret"
                {...register("secret")}
                disabled={isLoading}
              />
              {errors.secret && (
                <p className="text-sm text-destructive">
                  {errors.secret.message}
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
