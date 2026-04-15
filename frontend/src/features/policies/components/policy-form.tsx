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
        <CardTitle className="text-base">새 정책 생성</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            이름
          </label>
          <Input placeholder="예: SOC2 준수 검사" />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            카테고리
          </label>
          <div className="flex h-8 items-center rounded-lg border border-input bg-transparent px-2.5 text-sm">
            <span>보안</span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            설명
          </label>
          <Textarea
            placeholder="이 정책의 목적을 설명하세요..."
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Rule Logic */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            규칙 로직
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
            조건 추가
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button className="bg-blue-600 hover:bg-blue-700">
            정책 저장
          </Button>
          <button className="text-sm text-muted-foreground hover:text-foreground">
            임시 저장
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
