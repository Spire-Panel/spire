import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePortAllocation } from "@/hooks/usePortAllocation";
import { toast } from "sonner";

interface PortAllocationProps {
  initialPorts?: number[];
  onChange: (ports: number[]) => void;
  className?: string;
  disabled?: boolean;
}

export function PortAllocation({
  initialPorts = [],
  onChange,
  className = "",
  disabled = false,
}: PortAllocationProps) {
  const {
    ports,
    inputValue,
    setInputValue,
    error,
    addPorts,
    removePort,
    clearPorts,
  } = usePortAllocation(initialPorts);

  const handleAddPorts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Save the current input value before clearing it
    const portsToAdd = inputValue;

    // Clear the input immediately for better UX
    setInputValue("");

    // Add the ports and get the success status
    const success = addPorts(portsToAdd);

    if (success) {
      // Calculate what the new ports array should be
      const newPorts = [...new Set([...ports, ...parsePorts(portsToAdd)])].sort(
        (a, b) => a - b
      );
      onChange(newPorts);
    } else if (error) {
      toast(error);
    }
  };

  // Helper function to parse port strings into an array of numbers
  const parsePorts = (portString: string): number[] => {
    const result: number[] = [];
    const portStrings = portString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const portStr of portStrings) {
      if (portStr.includes("-")) {
        // Handle ranges (e.g., 25565-25570)
        const [start, end] = portStr.split("-").map(Number);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1024 && i <= 65535) {
              result.push(i);
            }
          }
        }
      } else {
        // Handle single port
        const port = parseInt(portStr, 10);
        if (!isNaN(port) && port >= 1024 && port <= 65535) {
          result.push(port);
        }
      }
    }

    return result;
  };

  const handleRemovePort = (port: number) => {
    // Update local state first for immediate UI feedback
    const newPorts = ports.filter((p) => p !== port);

    // Call the hook's removePort function
    removePort(port);

    // Notify parent of the change
    onChange(newPorts);
  };

  const handleClearAll = () => {
    // Update local state first for immediate UI feedback
    const newPorts: number[] = [];

    // Call the hook's clearPorts function
    clearPorts();

    // Notify parent of the change
    onChange(newPorts);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddPorts(e);
              }
            }}
            placeholder="Add ports (e.g., 25565, 25566-25570)"
            className="flex-1"
            disabled={disabled}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddPorts}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter single ports (25565) or ranges (25565-25570), separated by
          commas
        </p>
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>

      {ports.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">
              Allocated Ports ({ports.length})
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              disabled={disabled}
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {ports.map((port) => (
              <Badge
                key={port}
                variant="secondary"
                className="px-3 py-1 text-sm font-mono"
              >
                {port}
                <button
                  type="button"
                  onClick={() => handleRemovePort(port)}
                  className="ml-2 rounded-full hover:bg-muted p-0.5"
                  aria-label={`Remove port ${port}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
