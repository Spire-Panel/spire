"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useCreateNode } from "@/hooks/useNodeMutation";
import { Loading } from "@/components/ui/loading";
import { NodeForm, type NodeFormValues } from "@/components/nodes/NodeForm";

export default function CreateNodePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: createNode, error, data } = useCreateNode();

  const onSubmit = async (data: NodeFormValues) => {
    try {
      setIsLoading(true);

      await createNode({
        name: data.name,
        connectionUrl: data.connectionUrl,
        portAllocations: data.portAllocations,
        secret: data.secret,
      });

      toast.success("Node created successfully");
      router.push("/nodes");
      router.refresh();
    } catch (error) {
      console.log({ error });
      console.error("Error creating node:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create node"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Create New Node</h1>
        </div>
      </div>
      <NodeForm onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
}
