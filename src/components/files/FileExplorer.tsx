import { useState, useEffect } from "react";
import { FileEntry, FileContent, BreadcrumbItem } from "@/types/files";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Folder,
  Save,
  FileEdit,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useFileContent } from "@/hooks/useServerFiles";

interface FileExplorerProps {
  serverId: string;
  initialPath?: string;
  onFileSelect?: (file: FileEntry) => void;
  className?: string;
}

export function FileExplorer({
  serverId,
  initialPath = "/",
  className,
}: FileExplorerProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [editedContent, setEditedContent] = useState<string>("");

  // Use the useFileContent hook to fetch file content reactively
  const {
    data: fileContent,
    isLoading: isFileLoading,
    error: fileError,
  } = useFileContent({
    serverId,
    filePath: selectedFile?.path || null,
    enabled: !!selectedFile && selectedFile.type === "file",
  });

  // Update edited content when file content changes
  useEffect(() => {
    if (fileContent) {
      setEditedContent(fileContent.content || "");
    }
  }, [fileContent]);

  // Fetch files when path changes
  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // change to ?path= format
        const pathParam = currentPath === "/" ? "" : `?path=${currentPath}`;
        const res = await fetch(
          `/api/v1/servers/${serverId}/files${pathParam}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch files");
        }

        const items = await res.json();

        // Convert API response to FileEntry format
        const fileEntries: FileEntry[] = items.data.map(
          (item: { name: string; isDirectory: boolean }) => ({
            name: item.name,
            path:
              currentPath === "/"
                ? `/${item.name}`
                : `${currentPath}/${item.name}`,
            type: item.isDirectory ? "directory" : "file",
          })
        );

        setFiles(fileEntries);

        // Update breadcrumbs
        const parts = currentPath.split("/").filter(Boolean);
        const crumbs: BreadcrumbItem[] = [{ name: "Root", path: "/" }];

        let currentPathStr = "";
        parts.forEach((part) => {
          currentPathStr += `${part}/`;
          crumbs.push({
            name: part,
            path: currentPathStr.endsWith("/")
              ? currentPathStr
              : `${currentPathStr}/`,
          });
        });

        setBreadcrumbs(crumbs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load files");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [currentPath, serverId]);

  const handleFileClick = (file: FileEntry) => {
    if (file.type === "directory") {
      setCurrentPath(file.path.endsWith("/") ? file.path : `${file.path}/`);
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
      setIsEditing(false);
      // In a real implementation, you would fetch the file content here
      // setFileContent(
      //   `// Content of ${file.name}\n// This is a preview. Actual file content would be loaded here.`
      // );
    }
  };

  const handleBreadcrumbClick = (path: string) => {
    setCurrentPath(path);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    try {
      // In a real implementation, you would save the file content here
      console.log("Saving file:", selectedFile.path, editedContent);

      // Here you would typically make an API call to save the file
      // await saveFile(selectedFile.path, editedContent);

      setIsEditing(false);
      alert("File saved successfully!");
    } catch (err) {
      console.error("Error saving file:", err);
      alert(
        `Failed to save file: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
  };

  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined) return "N/A";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className={cn("flex h-full bg-card rounded-lg border", className)}>
      {/* File Browser */}
      <div className="w-1/3 border-r h-full flex flex-col">
        <div className="p-3 border-b flex items-center space-x-2 overflow-x-auto">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
              )}
              <button
                onClick={() => handleBreadcrumbClick(crumb.path)}
                className={cn(
                  "text-sm px-2 py-1 rounded hover:bg-accent",
                  currentPath === crumb.path && "font-medium text-primary"
                )}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-auto">
          <div className="min-h-full">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
              </div>
            ) : error ? (
              <div className="p-4 text-destructive text-sm">{error}</div>
            ) : files.length === 0 ? (
              <div className="p-4 text-muted-foreground text-sm">
                This directory is empty
              </div>
            ) : (
              <div className="divide-y">
                {files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => handleFileClick(file)}
                    className={cn(
                      "w-full text-left px-4 py-2 flex items-center hover:bg-accent transition-colors",
                      selectedFile?.path === file.path && "bg-accent"
                    )}
                  >
                    {file.type === "directory" ? (
                      <Folder className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                    ) : (
                      <FileText className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    )}
                    <div className="truncate flex-1 text-left">{file.name}</div>
                    <div className="text-xs text-muted-foreground ml-2">
                      {file.size !== undefined ? formatFileSize(file.size) : ""}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Preview/Editor */}
      <div className="flex-1 flex flex-col h-full">
        {selectedFile ? (
          <>
            <div className="p-3 border-b flex justify-between items-center">
              <div className="flex items-center">
                {selectedFile.type === "directory" ? (
                  <Folder className="h-5 w-5 text-yellow-500 mr-2" />
                ) : (
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                )}
                <span className="font-medium">{selectedFile.name}</span>
                {selectedFile.size !== undefined && (
                  <span className="text-sm text-muted-foreground ml-2">
                    {formatFileSize(selectedFile.size)}
                  </span>
                )}
              </div>

              {selectedFile.type === "file" && (
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <FileEdit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto p-4">
              {selectedFile.type === "directory" ? (
                <div className="text-muted-foreground text-center py-8">
                  Select a file to view its contents
                </div>
              ) : isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-full p-2 font-mono text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  spellCheck="false"
                />
              ) : (
                <div className="p-4 text-sm font-mono whitespace-pre overflow-auto">
                  {fileError ? (
                    <div className="text-red-500">
                      Error loading file: {fileError.message}
                    </div>
                  ) : fileContent?.isBinary ? (
                    <div className="text-yellow-600 italic">
                      {fileContent.content}
                    </div>
                  ) : (
                    fileContent?.content || "Loading content..."
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a file to view its contents
          </div>
        )}
      </div>
    </div>
  );
}
