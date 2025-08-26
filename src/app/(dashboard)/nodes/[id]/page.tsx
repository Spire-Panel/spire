"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { useNode } from "@/hooks/useNodes";
import { useNodeMutation } from "@/hooks/useNodeMutation";
import { Loading } from "@/components/ui/loading";
import { NodeForm, type NodeFormValues } from "@/components/nodes/NodeForm";

export default function NodeEditPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const { data: node, isLoading: nodeLoading } = useNode(params.id as string);
  const { mutateAsync: nodeMutateAsync } = useNodeMutation();

  const onSubmit = async (data: NodeFormValues) => {
    console.log(data);
    try {
      setIsLoading(true);

      await nodeMutateAsync({
        _id: params.id as string,
        name: data.name,
        connectionUrl: data.connectionUrl,
        portAllocations: data.portAllocations,
      });

      toast.success(`Node updated successfully`);
      router.push("/nodes");
      router.refresh();
    } catch (error) {
      console.error("Error saving node:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save node"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (nodeLoading || !node) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Edit Node</h1>
        </div>
      </div>

      <NodeForm
        defaultValues={{
          name: node.name,
          connectionUrl: node.connectionUrl,
          portAllocations: node.portAllocations || [],
        }}
        onSubmit={onSubmit}
        isLoading={isLoading}
        isEdit={true}
      />
    </div>
  );
}
