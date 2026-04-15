"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PolicyForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Create New Policy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Name
          </label>
          <Input placeholder="e.g. SOC2 Compliance Check" />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Category
          </label>
          <div className="flex h-8 items-center rounded-lg border border-input bg-transparent px-2.5 text-sm">
            <span>Security</span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Description
          </label>
          <Textarea
            placeholder="Explain the intent of this policy..."
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Rule Logic */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rule Logic
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">
                IF
              </span>
              <Input
                defaultValue='issue.severity == "CRITICAL"'
                className="font-mono text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">
                AND
              </span>
              <Input
                defaultValue='label.contains("db-access")'
                className="font-mono text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">
                THEN
              </span>
              <div className="flex flex-1 items-center">
                <Badge className="bg-blue-600 text-white hover:bg-blue-700">
                  BLOCK_DEPLOYMENT
                </Badge>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
            <Plus className="h-3 w-3" />
            ADD CONDITION
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Save Policy
          </Button>
          <button className="text-sm text-muted-foreground hover:text-foreground">
            Save as Draft
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
