"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  AlertTriangle,
  Sparkles,
  FileText,
  History,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AiAnalysisPanel } from "./ai-analysis-panel";
import { AutoDevSection } from "./auto-dev-section";
import { SOURCE_CONFIG, PRIORITY_CONFIG } from "@/constants/mock-data";
import { useIssueDetail } from "../hooks/useIssueDetail";

interface IssueDetailProps {
  issueId: string;
}

type Tab = "detail" | "ai" | "history" | "comments";

export function IssueDetail({ issueId }: IssueDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("ai");
  const { data: detail } = useIssueDetail(issueId);

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p>이슈를 찾을 수 없습니다.</p>
        <Link href="/issues" className="mt-2 text-sm text-blue-600 hover:underline">
          이슈 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const { issue, analysis, codingTasks: tasks, assignee } = detail;
  const source = SOURCE_CONFIG[issue.source];
  const priority = PRIORITY_CONFIG[issue.priority];

  const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key: "detail", label: "상세", icon: FileText },
    { key: "ai", label: "AI 분석", icon: Sparkles },
    { key: "history", label: "히스토리", icon: History },
    { key: "comments", label: "댓글", icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      {/* 뒤로가기 */}
      <Link
        href="/issues"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        이슈 목록
      </Link>

      {/* 헤더 */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">{issue.title}</h1>
          {issue.sourceUrl && (
            <a
              href={issue.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`${priority.color} border-0`}>
            {priority.label}
          </Badge>
          <Badge variant="outline">
            {issue.status === "OPEN" ? "열림" : issue.status === "IN_PROGRESS" ? "진행 중" : issue.status === "RESOLVED" ? "해결됨" : issue.status}
          </Badge>
          <Badge variant="outline" className={`${source.bgColor} ${source.color} border-0`}>
            {source.label}
          </Badge>
          {issue.externalId && (
            <span className="text-sm text-muted-foreground">{issue.externalId}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {assignee && <span>담당: {assignee.name}</span>}
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {new Date(issue.createdAt).toLocaleDateString("ko-KR")} 생성
          </span>
          {issue.slaBreach && (
            <span className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              SLA 위반
            </span>
          )}
          {issue.slaDeadline && !issue.slaBreach && (
            <span className="flex items-center gap-1 text-yellow-600">
              <Clock className="h-3.5 w-3.5" />
              SLA 마감: {new Date(issue.slaDeadline).toLocaleString("ko-KR")}
            </span>
          )}
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.key === "ai" && analysis && (
                <span className="ml-1 h-2 w-2 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* 탭 내용 */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          {activeTab === "detail" && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm leading-relaxed">
                  {issue.description || "설명이 없습니다."}
                </p>
                {issue.labels.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {issue.labels.map((label) => (
                      <Badge key={label} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "ai" && <AiAnalysisPanel analysis={analysis} />}

          {activeTab === "history" && (
            <Card>
              <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                <p className="text-sm">히스토리 기능은 추후 구현됩니다.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === "comments" && (
            <Card>
              <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                <p className="text-sm">댓글 기능은 추후 구현됩니다.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 사이드 패널 */}
        <div className="space-y-4">
          <AutoDevSection
            tasks={tasks}
            onStartAutoDev={() => toast.info("자동 개발 시작! (목업)")}
          />

          <Card>
            <CardContent className="pt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">프로젝트</span>
                <span className="font-medium">
                  {issue.projectKey === "proj-1" ? "결제 서비스" :
                   issue.projectKey === "proj-2" ? "쇼핑 API" :
                   issue.projectKey === "proj-3" ? "관리자 포털" : "블로그"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">담당자</span>
                <span className="font-medium">{assignee?.name ?? "미배정"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">소스</span>
                <span className="font-medium">{source.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">생성일</span>
                <span>{new Date(issue.createdAt).toLocaleDateString("ko-KR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">수정일</span>
                <span>{new Date(issue.updatedAt).toLocaleDateString("ko-KR")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
