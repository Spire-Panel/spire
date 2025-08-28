import { env } from "@/config/env";
import { INode } from "@/lib/models/Node.model";
import { IRole } from "@/lib/models/Role.model";
import { IServer } from "@/lib/models/Server.model";
import { Permissions } from "@/lib/Roles";
import { User } from "@clerk/backend";
import { z } from "zod";

export namespace APITypes {
  export interface Profile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
    role: string;
    permissions: Permissions.AllPermissions[];
  }

  export type Nodes = INode & {
    online?: boolean;
    uptime?: number;
    cpuUsage?: number;
    memoryUsageMB?: number;
    memoryUsagePercent?: number;
    memoryUsageTotal?: number;
    memoryUsageFree?: number;
    totalMemory?: number;
    cpuUsagePercent?: number;
    lastUpdated?: Date;
    storageFreeSpace?: number;
    storageUsedSpace?: number;
    storageTotalSpace?: number;
    storageUsedPercent?: number;
    _id: string;
    cpuCores?: number;
    cpuModel?: string;
    lastSeen?: Date;
  };

  export type Users = User[];

  export type Server = IServer & { status: GlideTypes.ContainerStatus };
  export type Servers = Server[];

  export type Roles = IRole[];
}

export const ServerTypeEnum = z.enum([
  "VANILLA",
  "PAPER",
  "FORGE",
  "FABRIC",
  "AUTO_CURSEFORGE",
  "FTBA",
]);
export const createServerSchema = z.object({
  name: z.string().min(3).max(32),
  version: z.string().min(1).default("1.20.1"),
  type: ServerTypeEnum.default("VANILLA"),
  port: z.number().int().min(1024).max(49151).optional().default(25565),
  memory: z.string().default(env.DEFAULT_MEMORY),
  modpackId: z.string().or(z.number()).optional(),
});

export namespace DockerTypes {
  export interface MemoryStats {
    // Linux Memory Stats
    stats: {
      total_pgmajfault: number;
      cache: number;
      mapped_file: number;
      total_inactive_file: number;
      pgpgout: number;
      rss: number;
      total_mapped_file: number;
      writeback: number;
      unevictable: number;
      pgpgin: number;
      total_unevictable: number;
      pgmajfault: number;
      total_rss: number;
      total_rss_huge: number;
      total_writeback: number;
      total_inactive_anon: number;
      rss_huge: number;
      hierarchical_memory_limit: number;
      total_pgfault: number;
      total_active_file: number;
      active_anon: number;
      total_active_anon: number;
      total_pgpgout: number;
      total_cache: number;
      inactive_anon: number;
      active_file: number;
      pgfault: number;
      inactive_file: number;
      total_pgpgin: number;
    };
    max_usage: number;
    usage: number;
    failcnt: number;
    limit: number;

    // Windows Memory Stats
    commitbytes?: number;
    commitpeakbytes?: number;
    privateworkingset?: number;
  }

  export interface CPUUsage {
    percpu_usage: number[];
    usage_in_usermode: number;
    total_usage: number;
    usage_in_kernelmode: number;
  }

  interface ThrottlingData {
    periods: number;
    throttled_periods: number;
    throttled_time: number;
  }

  export interface CPUStats {
    cpu_usage: CPUUsage;
    system_cpu_usage: number;
    online_cpus: number;
    throttling_data: ThrottlingData;
  }
}

export namespace GlideTypes {
  export interface Container {
    id: string;
    name: string;
    version: string;
    type: string;
    port: number;
    status: string;
    memory: string;
    createdAt: string;
  }
  export interface ContainerStatus {
    id: string;
    name: string;
    status: "RUNNING" | "STOPPED" | "STARTING" | "STOPPING";
    running: boolean;
    ipAddress: string;
    ports: {
      [portAndProtocol: string]: {
        HostIp: string;
        HostPort: string;
      }[];
    };
    memory: DockerTypes.MemoryStats;
    cpu: DockerTypes.CPUStats;
  }
  export type ContainerCommandResponse = Array<string>;
}
