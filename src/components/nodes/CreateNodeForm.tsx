"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { PortAllocation } from "./PortAllocation";
import { useCallback } from "react";

// Schema for creating a new node (includes nodeSecret)
const createNodeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  connectionUrl: z
    .string()
    .url("Must be a valid URL")
    .min(1, "Connection URL is required"),
  portAllocations: z
    .array(z.number())
    .min(1, "At least one port allocation is required"),
  nodeSecret: z.string().min(1, "Node secret is required"),
});

type CreateNodeValues = z.infer<typeof createNodeSchema>;

interface CreateNodeFormProps {
  defaultValues?: Partial<CreateNodeValues>;
  onSubmit: (data: CreateNodeValues) => Promise<void>;
  isLoading: boolean;
}

export function CreateNodeForm({
  defaultValues = {},
  onSubmit,
  isLoading,
}: CreateNodeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<CreateNodeValues>({
    resolver: zodResolver(createNodeSchema),
    defaultValues: {
      name: "",
      connectionUrl: "",
      portAllocations: [],
      nodeSecret: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const portAllocations = watch("portAllocations") || [];

  const handlePortsChange = useCallback(
    (ports: number[]) => {
      setValue("portAllocations", ports, { shouldValidate: true });
    },
    [setValue]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Node Details</CardTitle>
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

          <div className="space-y-2">
            <Label>Node Secret</Label>
            <Input
              id="nodeSecret"
              placeholder="Enter node secret"
              {...register("nodeSecret")}
              autoComplete="off"
              disabled={isLoading}
            />
            {errors.nodeSecret && (
              <p className="text-sm text-destructive">
                {errors.nodeSecret.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              This secret will be used to authenticate with the node. Make sure
              to save it securely.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Node"
          )}
        </Button>
      </div>
    </form>
  );
}
