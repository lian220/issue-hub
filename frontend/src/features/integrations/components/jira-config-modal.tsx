"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import type { Integration } from "../types/integration";

interface JiraConfigModalProps {
  integration: Integration;
  open: boolean;
  onClose: () => void;
}

export function JiraConfigModal({ integration, open, onClose }: JiraConfigModalProps) {
  const [projectKeys, setProjectKeys] = useState<string[]>(
    integration.config.projectKeys ?? []
  );
  const [newKey, setNewKey] = useState("");

  function addProjectKey() {
    const key = newKey.trim().toUpperCase();
    if (key && !projectKeys.includes(key)) {
      setProjectKeys([...projectKeys, key]);
      setNewKey("");
    }
  }

  function removeProjectKey(key: string) {
    setProjectKeys(projectKeys.filter((k) => k !== key));
  }

  function handleSave() {
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Jira 설정</SheetTitle>
          <SheetDescription>연동할 Jira 프로젝트를 설정합니다</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <label className="text-sm font-medium">프로젝트 키</label>
            <p className="text-xs text-muted-foreground mb-2">이슈를 감시할 Jira 프로젝트 키 (예: PAY, AUTH)</p>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="프로젝트 키 입력"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addProjectKey()}
              />
              <Button variant="outline" size="sm" onClick={addProjectKey}>추가</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {projectKeys.map((key) => (
                <span key={key} className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-1 text-xs font-medium">
                  {key}
                  <button onClick={() => removeProjectKey(key)}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">연동 방식</label>
            <div className="mt-2 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Webhook — 실시간 이슈 감지
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                폴링 — 5분 간격 누락 방지 (자동)
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                Jira Automation — 고급 (n8n에서 설정)
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>취소</Button>
            <Button onClick={handleSave}>저장</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
