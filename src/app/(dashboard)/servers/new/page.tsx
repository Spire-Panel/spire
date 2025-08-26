"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Save,
  CheckCheckIcon,
  Users,
} from "lucide-react";
import { useNodes } from "@/hooks/useNodes";
import { createServerSchema } from "@/types/api";
import useNodeAllocations from "@/hooks/useNodeAllocation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { CheckIcon, ChevronsUpDown, NetworkIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClerkUsers } from "@/hooks/useClerkUsers";
import { useAuth } from "@clerk/nextjs";
import { useCreateServerMutation } from "@/hooks/useCreateServerMutation";
import { z } from "zod";
import { ServerValidator } from "@/lib/models/Server.model";

type FormValues = Omit<z.infer<typeof ServerValidator>, "_id">;

const memoryOptions = [
  { value: "1G", label: "1 GB" },
  { value: "2G", label: "2 GB" },
  { value: "4G", label: "4 GB" },
  { value: "6G", label: "6 GB" },
  { value: "8G", label: "8 GB" },
  { value: "12G", label: "12 GB" },
  { value: "16G", label: "16 GB" },
];

// Common Minecraft versions for suggestions
const minecraftVersions = [
  "1.20.4",
  "1.20.2",
  "1.20.1",
  "1.20",
  "1.19.4",
  "1.19.3",
  "1.19.2",
  "1.19.1",
  "1.19",
  "1.18.2",
  "1.18.1",
  "1.18",
  "1.17.1",
  "1.17",
  "1.16.5",
  "1.16.4",
  "1.16.3",
  "1.16.2",
  "1.16.1",
  "1.16",
  "1.15.2",
  "1.15.1",
  "1.15",
  "1.14.4",
  "1.14.3",
  "1.14.2",
  "1.14.1",
  "1.14",
];

const serverTypes = [
  { value: "VANILLA", label: "Vanilla" },
  { value: "PAPER", label: "Paper" },
  { value: "FORGE", label: "Forge" },
  { value: "FABRIC", label: "Fabric" },
  { value: "AUTO_CURSEFORGE", label: "CurseForge" },
  { value: "FTBA", label: "FTB App" },
];

const defaultValues: Partial<FormValues> = {
  name: "",
  version: "",
  type: "VANILLA",
  port: 0,
  memory: "2G",
};

export default function NewServerPage() {
  const router = useRouter();
  const { data: nodes, isLoading: isLoadingNodes } = useNodes(true);
  const { data: users, isLoading: isLoadingUsers } = useClerkUsers();
  const { mutateAsync: createServer } = useCreateServerMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { userId: currentUserId } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(ServerValidator.omit({ _id: true })) as any,
    defaultValues: {
      ...defaultValues,
      node: nodes?.[0]?._id || "",
    },
    mode: "onChange",
  });

  const { data: allocations, isLoading: isLoadingAllocations } =
    useNodeAllocations(form.watch("node") as string);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      const userIds = data.userIds?.length ? data.userIds : [currentUserId];

      const {
        success,
        error,
        data: server,
      } = await createServer({
        ...data,
        userIds: userIds.filter((id) => id !== undefined) as string[],
      });

      toast.success("Server created successfully!");
      router.push(`/servers/${server._id}`);
    } catch (error) {
      console.error("Error creating server:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create server"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = form.watch("type");

  useEffect(() => {
    const nodeId = form.watch("node");
    if (nodeId && allocations && allocations.length > 0) {
      form.setValue("port", allocations[0]);
      form.clearErrors("port");
    } else if (nodeId && !isLoadingAllocations) {
      form.setError("port", {
        type: "manual",
        message:
          "This node has no available port allocations. Please add ports to the node first.",
      });
      form.setValue("port", 0);
    }
  }, [allocations, form, isLoadingAllocations]);

  const handleNodeSelect = (nodeId: string) => {
    form.setValue("node", nodeId);
    form.setValue("port", 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Server
          </h1>
          <p className="text-muted-foreground">
            Configure and deploy a new Minecraft server
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Server Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Server Details
                </CardTitle>
                <CardDescription>
                  Configure the basic settings for your Minecraft server
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Server Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Server" {...field} />
                      </FormControl>
                      <FormDescription>
                        A friendly name for your server (3-32 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Server Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a server type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serverTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Version</FormLabel>
                        <Popover
                          open={versionOpen}
                          onOpenChange={setVersionOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={
                                  selectedType === "AUTO_CURSEFORGE" ||
                                  selectedType === "FTBA"
                                }
                              >
                                {field.value ? (
                                  <div className="flex items-center">
                                    <span className="truncate">
                                      {field.value}
                                    </span>
                                  </div>
                                ) : (
                                  "Select or type a version..."
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search versions..."
                                onValueChange={(search) => {
                                  if (!minecraftVersions.includes(search)) {
                                    field.onChange(search);
                                  }
                                }}
                              />
                              <CommandEmpty>
                                No matching versions found.
                              </CommandEmpty>
                              <CommandGroup className="max-h-[200px] overflow-auto">
                                {minecraftVersions.map((version) => (
                                  <CommandItem
                                    value={version}
                                    key={version}
                                    onSelect={() => {
                                      field.onChange(version);
                                      setVersionOpen(false);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <CheckCheckIcon
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === version
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {version}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {(selectedType === "AUTO_CURSEFORGE" ||
                  selectedType === "FTBA") && (
                  <FormField
                    control={form.control}
                    name="modpackId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modpack ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              selectedType === "AUTO_CURSEFORGE"
                                ? "Enter CurseForge modpack URL"
                                : "Enter FTB modpack ID (e.g. 67)"
                            }
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the CurseForge project ID for the modpack
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Server Resources Card */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    Resource Allocation
                  </CardTitle>
                  <CardDescription>
                    Allocate resources for your server
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="memory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Memory Allocation</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select memory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {memoryOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Recommended: 2GB for vanilla, 4GB+ for modded
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Server Port</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  <div className="flex items-center">
                                    <NetworkIcon className="mr-2 h-4 w-4" />
                                    {field.value}
                                  </div>
                                ) : (
                                  "Select a port..."
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[300px] p-0"
                            align="start"
                          >
                            <Command
                              filter={(value, search) => {
                                if (search === "") return 1; // Show all items when search is empty
                                return value
                                  .toLowerCase()
                                  .includes(search.toLowerCase())
                                  ? 1
                                  : 0;
                              }}
                            >
                              <CommandInput placeholder="Search ports..." />
                              <CommandEmpty>
                                No matching ports found.
                              </CommandEmpty>
                              <CommandGroup className="max-h-[200px] overflow-auto">
                                {allocations && allocations.length > 0 ? (
                                  allocations.map((port) => (
                                    <CommandItem
                                      value={port.toString()}
                                      key={port.toString()}
                                      onSelect={() => {
                                        form.setValue("port", port);
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <CheckIcon
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          port === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <div className="flex items-center">
                                        <NetworkIcon className="mr-2 h-4 w-4" />
                                        {port}
                                      </div>
                                      <span className="ml-auto text-xs text-muted-foreground">
                                        {port === 25565 ? "Default" : ""}
                                      </span>
                                    </CommandItem>
                                  ))
                                ) : (
                                  <div className="text-center text-sm">
                                    {isLoadingNodes && (
                                      <div className="flex items-center justify-center">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading ports...
                                      </div>
                                    )}
                                  </div>
                                )}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          {field.value === 25565
                            ? "Default Minecraft port selected"
                            : "Select a port for your server"}
                        </FormDescription>
                        <FormMessage>
                          {form.formState.errors.port?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Node Selection Card */}
              {nodes && nodes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5" />
                      Deployment Node
                    </CardTitle>
                    <CardDescription>
                      Select a node to deploy this server on
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[250px] overflow-y-scroll">
                      {nodes.map((node) => {
                        const selected = node._id === form.watch("node");
                        return (
                          <div
                            key={node._id}
                            className={`flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors ${
                              selected ? "bg-muted/50" : ""
                            }`}
                          >
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{node.name}</span>
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    node.online ? "bg-green-500" : "bg-red-500"
                                  }`}
                                />
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {node.memoryUsageMB && node.memoryUsageTotal
                                  ? `${Math.round(
                                      (node.memoryUsageMB /
                                        node.memoryUsageTotal) *
                                        100
                                    )}% memory used`
                                  : "Memory usage unavailable"}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleNodeSelect(node._id)}
                              className="ml-auto cursor-pointer"
                            >
                              {selected ? "Selected" : "Select"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* User Access Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Access
                </CardTitle>
                <CardDescription>
                  Select which users should have access to this server
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="userIds"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Allowed Users</FormLabel>
                      <Popover open={usersOpen} onOpenChange={setUsersOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                            >
                              <div className="flex items-center gap-1">
                                <Users className="mr-2 h-4 w-4" />
                                {field.value && field.value?.length > 0
                                  ? `${field.value.length} user${
                                      field.value.length === 1 ? "" : "s"
                                    } selected`
                                  : "Select users..."}
                              </div>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search users..."
                              value={searchQuery}
                              onValueChange={setSearchQuery}
                            />
                            <CommandEmpty>No users found.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-auto">
                              {users
                                ?.filter(
                                  (user) =>
                                    searchQuery === "" ||
                                    user.username
                                      ?.toLowerCase()
                                      .includes(searchQuery.toLowerCase()) ||
                                    user.emailAddresses[0].emailAddress
                                      ?.toLowerCase()
                                      .includes(searchQuery.toLowerCase())
                                )
                                .map((user) => (
                                  <CommandItem
                                    key={user.id}
                                    onSelect={() => {
                                      const currentValue = field.value || [];
                                      const newValue = currentValue.includes(
                                        user.id
                                      )
                                        ? currentValue.filter(
                                            (id) => id !== user.id
                                          )
                                        : [...currentValue, user.id];
                                      field.onChange(newValue);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center">
                                      <div
                                        className={cn(
                                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                          field.value?.includes(user.id)
                                            ? "bg-primary text-primary-foreground"
                                            : "opacity-50 [&_svg]:invisible"
                                        )}
                                      >
                                        <CheckIcon className="h-4 w-4" />
                                      </div>
                                      <div className="flex flex-col">
                                        <span>
                                          {user.username ||
                                            user.emailAddresses[0].emailAddress?.split(
                                              "@"
                                            )[0]}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {user.emailAddresses[0].emailAddress}
                                        </span>
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        {field.value && field.value?.length > 0
                          ? `${field.value.length} user${
                              field.value.length === 1 ? "" : "s"
                            } selected`
                          : "No users selected. Only you will have access."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Server
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
