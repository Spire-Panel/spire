import { cn } from "@/lib/utils";

interface ConsoleOutputProps {
  logs: string[];
  className?: string;
}

const getLogLevel = (line: string) => {
  if (line.includes("ERROR") || line.includes("error")) return "error";
  if (line.includes("WARN") || line.includes("warning")) return "warn";
  if (line.includes("INFO") || line.includes("info")) return "info";
  if (line.includes("DEBUG") || line.includes("debug")) return "debug";
  return "default";
};

export function ConsoleOutput({ logs, className }: ConsoleOutputProps) {
  const formatLine = (line: string) => {
    // Handle ANSI color codes if present
    const ansiRegex = /\x1b\[([0-9;]*)m/g;
    let formattedLine = line.replace(ansiRegex, (match, code) => {
      // Map ANSI color codes to Tailwind classes
      const codes = code.split(";");
      const styles: string[] = [];

      for (const c of codes) {
        switch (c) {
          case "1":
            styles.push("font-bold");
            break;
          case "30":
            styles.push("text-gray-700");
            break;
          case "31":
            styles.push("text-red-500");
            break;
          case "32":
            styles.push("text-green-500");
            break;
          case "33":
            styles.push("text-yellow-500");
            break;
          case "34":
            styles.push("text-blue-500");
            break;
          case "35":
            styles.push("text-purple-500");
            break;
          case "36":
            styles.push("text-cyan-500");
            break;
          case "37":
            styles.push("text-gray-200");
            break;
          case "90":
            styles.push("text-gray-400");
            break;
          case "91":
            styles.push("text-red-400");
            break;
          case "92":
            styles.push("text-green-400");
            break;
          case "93":
            styles.push("text-yellow-400");
            break;
          case "94":
            styles.push("text-blue-400");
            break;
          case "95":
            styles.push("text-purple-400");
            break;
          case "96":
            styles.push("text-cyan-400");
            break;
          case "97":
            styles.push("text-white");
            break;
        }
      }

      return `</span><span class="${styles.join(" ")}">`;
    });

    // Wrap the formatted line in spans for styling
    return `<span>${formattedLine}</span>`;
  };

  return (
    <div
      className={cn(
        "font-mono text-sm leading-relaxed overflow-auto",
        className
      )}
    >
      {logs.length === 0 ? (
        <div className="text-muted-foreground p-2">
          No logs available. The server may be starting up or there might be an
          issue.
        </div>
      ) : (
        <div className="space-y-0.5 p-2">
          {logs.map((line, i) => {
            const level = getLogLevel(line);
            const isSystemMessage = line.startsWith("===");

            return (
              <div
                key={i}
                className={cn(
                  "whitespace-pre-wrap break-words px-1 rounded",
                  isSystemMessage && "text-blue-400 italic",
                  level === "error" && "text-red-400",
                  level === "warn" && "text-yellow-400",
                  level === "info" && "text-blue-400",
                  level === "debug" && "text-gray-400 text-xs",
                  !isSystemMessage && level === "default" && "text-gray-300"
                )}
                dangerouslySetInnerHTML={{ __html: formatLine(line) }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
