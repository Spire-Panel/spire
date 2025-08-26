import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileEntry, FileContent } from "@/types/files";
import { APIResponse } from "@/lib/api-utils";

// List of binary file extensions that shouldn't be displayed as text
const BINARY_EXTENSIONS = [
  "jar",
  "zip",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "pdf",
  "exe",
  "dll",
  "so",
  "dylib",
  "class",
  "war",
  "ear",
  "bin",
  "dat",
  "tar",
  "gz",
  "7z",
  "rar",
  "mp3",
  "mp4",
  "wav",
  "avi",
  "mov",
  "wmv",
  "flv",
  "mkv",
];

interface UseFileContentOptions {
  serverId: string;
  filePath: string | null;
  enabled?: boolean;
}

interface FileContentResponse {
  content: string;
  isBinary: boolean;
  filename: string;
  size: number;
}

export const useFileContent = ({
  serverId,
  filePath,
  enabled = true,
}: UseFileContentOptions) => {
  return useQuery<FileContentResponse, Error>({
    queryKey: ["file-content", serverId, filePath],
    queryFn: async () => {
      if (!filePath) {
        return {
          content: "",
          isBinary: false,
          filename: "",
          size: 0,
        };
      }

      const filename = filePath.split("/").pop() || "";
      const extension = filename.split(".").pop()?.toLowerCase() || "";
      const isBinary = BINARY_EXTENSIONS.includes(extension);

      if (isBinary) {
        return {
          content: `This is a binary file (${extension.toUpperCase()}) and cannot be displayed in the editor.`,
          isBinary: true,
          filename,
          size: 0,
        };
      }

      try {
        const res = await fetch(
          `/api/v1/servers/${serverId}/files?path=${encodeURIComponent(
            filePath
          )}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to load file: ${res.statusText}`);
        }

        const data = await res.json();
        return {
          content: data.data || "",
          isBinary: false,
          filename,
          size: data.size || 0,
        };
      } catch (error) {
        if (error instanceof SyntaxError) {
          return {
            content:
              "This file contains binary data and cannot be displayed as text.",
            isBinary: true,
            filename,
            size: 0,
          };
        }
        throw error;
      }
    },
    enabled: enabled && !!filePath,
    staleTime: 0,
  });
};

interface UseServerFilesOptions {
  serverId: string;
  path?: string[];
  enabled?: boolean;
}

export const useServerFiles = ({
  serverId,
  path = [],
  enabled = true,
}: UseServerFilesOptions) => {
  const queryClient = useQueryClient();
  const fullPath = path.join("/");

  const query = useQuery<FileEntry[]>({
    queryKey: ["server-files", serverId, ...path],
    queryFn: async () => {
      const queryPath = fullPath ? `?path=${fullPath}` : "?path=/";
      const res = await fetch(`/api/v1/servers/${serverId}/files${queryPath}`);

      if (!res.ok) {
        throw new Error("Failed to fetch files");
      }

      const items = await res.json();
      // Convert the API response to FileEntry format
      return items.map((item: { name: string; isDirectory: boolean }) => ({
        name: item.name,
        path: fullPath ? `${fullPath}/${item.name}` : item.name,
        type: item.isDirectory ? "directory" : "file",
      }));
    },
    enabled,
  });

  const readFile = useMutation({
    mutationFn: async (filePath: string) => {
      const res = await fetch(
        `/api/v1/servers/${serverId}/files?path=${
          filePath.startsWith("/") ? filePath : `/${filePath}`
        }`
      );

      if (!res.ok) {
        throw new Error("Failed to read file");
      }

      // For file content, we expect the raw content as the response
      const content = await res.text();
      return {
        path: filePath,
        content,
        encoding: "utf8",
        mimeType: res.headers.get("content-type") || "text/plain",
      } as FileContent;
    },
  });

  const writeFile = useMutation({
    mutationFn: async ({
      path,
      content,
    }: {
      path: string;
      content: string;
    }) => {
      // This is a placeholder - implement actual API call when backend is ready
      console.log("Would save file:", path, content);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["server-files", serverId, ...path],
      });
    },
  });

  return {
    ...query,
    readFile: readFile.mutateAsync,
    isReading: readFile.isPending,
    writeFile: writeFile.mutateAsync,
    isWriting: writeFile.isPending,
  };
};
