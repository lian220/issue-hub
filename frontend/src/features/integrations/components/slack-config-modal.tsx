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

interface SlackConfigModalProps {
  integration: Integration;
  open: boolean;
  onClose: () => void;
}

export function SlackConfigModal({ integration, open, onClose }: SlackConfigModalProps) {
  const channels = integration.config.channels;
  const [monitorChannels, setMonitorChannels] = useState<string[]>(
    channels?.monitorChannels ?? []
  );
  const [notifyChannel, setNotifyChannel] = useState(
    channels?.notifyChannel ?? ""
  );
  const [keywords, setKeywords] = useState<string[]>(
    (integration.config.keywords as string[]) ?? []
  );
  const [newChannel, setNewChannel] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

  function addChannel() {
    const ch = newChannel.trim();
    if (ch && !monitorChannels.includes(ch)) {
      setMonitorChannels([...monitorChannels, ch.startsWith("#") ? ch : `#${ch}`]);
      setNewChannel("");
    }
  }

  function removeChannel(ch: string) {
    setMonitorChannels(monitorChannels.filter((c) => c !== ch));
  }

  function addKeyword() {
    const kw = newKeyword.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setNewKeyword("");
    }
  }

  function removeKeyword(kw: string) {
    setKeywords(keywords.filter((k) => k !== kw));
  }

  function handleSave() {
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[90vw] sm:w-[540px] sm:max-w-[540px] overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>Slack 설정</SheetTitle>
          <SheetDescription>에러 감시 채널과 키워드를 설정합니다</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <label className="text-sm font-medium">감시 채널</label>
            <p className="text-xs text-muted-foreground mb-2">에러 메시지를 감지할 Slack 채널</p>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="#channel-name"
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addChannel()}
              />
              <Button variant="outline" size="sm" onClick={addChannel}>추가</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {monitorChannels.map((ch) => (
                <span key={ch} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                  {ch}
                  <button onClick={() => removeChannel(ch)}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">알림 채널</label>
            <p className="text-xs text-muted-foreground mb-2">IssueHub 처리 결과를 보낼 채널</p>
            <Input
              placeholder="#issuehub-notifications"
              value={notifyChannel}
              onChange={(e) => setNotifyChannel(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">감지 키워드</label>
            <p className="text-xs text-muted-foreground mb-2">이 키워드가 포함된 메시지만 감지합니다</p>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="error, 500, exception..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              />
              <Button variant="outline" size="sm" onClick={addKeyword}>추가</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <span key={kw} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                  {kw}
                  <button onClick={() => removeKeyword(kw)}><X className="h-3 w-3" /></button>
                </span>
              ))}
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
