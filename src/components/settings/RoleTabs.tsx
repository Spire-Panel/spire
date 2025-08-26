'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleList } from "@/components/settings/RoleList";
import { RoleAssignments } from "@/components/settings/RoleAssignments";

export function RoleTabs() {
  return (
    <Tabs defaultValue="roles" className="space-y-4">
      <TabsList>
        <TabsTrigger value="roles">Roles</TabsTrigger>
        <TabsTrigger value="assignments">Role Assignments</TabsTrigger>
      </TabsList>
      <TabsContent value="roles" className="space-y-4">
        <RoleList />
      </TabsContent>
      <TabsContent value="assignments">
        <RoleAssignments />
      </TabsContent>
    </Tabs>
  );
}
