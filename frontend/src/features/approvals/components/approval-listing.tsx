"use client";

import { RefreshCw } from "lucide-react";

import { ApprovalCard, type ApprovalItem } from "./approval-card";

const MOCK_APPROVALS: ApprovalItem[] = [
  {
    prNumber: 4139,
    date: "2023. 10. 24.",
    title: "OAuth 2.1 프로토콜 지원을 위한 core-auth-provider 업데이트",
    author: "김민수",
    authorInitials: "김",
    aiReview: {
      type: "summary",
      text: "코드 변경 사항이 보안 정책을 준수합니다. OAuth 2.1 구현이 RFC 9126 표준을 따릅니다. 인증 흐름에서 breaking change가 감지되지 않았습니다.",
    },
    priority: "medium",
  },
  {
    prNumber: 4132,
    date: "2023. 10. 23.",
    title: "레거시 DB 마이그레이션: 1단계 스크립트",
    author: "이지은",
    authorInitials: "이",
    aiReview: {
      type: "warning",
      text: "정책 위반 감지: 마이그레이션 스크립트가 롤백 계획 없이 프로덕션 스키마를 수정합니다. 영향받는 3개 테이블에 활성 외래 키 제약 조건이 있어 다운타임이 발생할 수 있습니다.",
    },
    priority: "high",
  },
  {
    prNumber: 1091,
    date: "2023. 10. 22.",
    title: "프론트엔드 리디자인: 대시보드 글라스모피즘 셸",
    author: "박서준",
    authorInitials: "박",
    aiReview: {
      type: "summary",
      text: "디자인 시스템과의 UI 일관성이 확인되었습니다. 글라스모피즘 효과가 승인된 backdrop-filter 토큰을 사용합니다. 접근성 대비율이 WCAG 2.1 AA 기준을 충족합니다.",
    },
    priority: "low",
  },
];

export function ApprovalListing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">승인 대기열</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          PR 및 시스템 변경 사항을 검토합니다. 의사결정을 돕기 위해 각 항목에
          대한 AI 인사이트가 생성되었습니다.
        </p>
      </div>

      <div className="space-y-4">
        {MOCK_APPROVALS.map((item) => (
          <ApprovalCard key={item.prNumber} item={item} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-1 py-4 text-sm text-muted-foreground">
        <span>현재 대기열의 끝입니다</span>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-primary hover:underline"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="size-3" />
          새 PR 새로고침
        </button>
      </div>
    </div>
  );
}
