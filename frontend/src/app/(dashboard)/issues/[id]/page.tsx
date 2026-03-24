import Link from "next/link";
import { ArrowLeft, ExternalLink, MessageSquare, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/issues" aria-label="이슈 목록으로 돌아가기">
          <Button variant="ghost" size="icon" render={<span />}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              로그인 페이지 보안 취약점 수정
            </h1>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              열림
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {id} | Jira PROJ-101
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          원본 보기
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">설명</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                로그인 페이지에서 XSS 취약점이 발견되었습니다.
                사용자 입력 값에 대한 sanitization이 누락되어 있으며,
                즉시 수정이 필요합니다. 보안 감사에서 심각도 높음으로 분류되었습니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">댓글 (2)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">김철수</span>
                  <span className="text-xs text-muted-foreground">2시간 전</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  입력 필드에 DOMPurify 적용하겠습니다. PR 올리면 리뷰 부탁드립니다.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">이영희</span>
                  <span className="text-xs text-muted-foreground">1시간 전</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  CSP 헤더도 같이 적용해주세요. 관련 정책 문서 확인 부탁드립니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">세부 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-xs text-muted-foreground">우선순위</span>
                <div>
                  <Badge className="bg-red-100 text-red-800 mt-1">심각</Badge>
                </div>
              </div>
              <Separator />
              <div>
                <span className="text-xs text-muted-foreground">담당자</span>
                <p className="text-sm font-medium mt-1">김철수</p>
              </div>
              <Separator />
              <div>
                <span className="text-xs text-muted-foreground">보고자</span>
                <p className="text-sm font-medium mt-1">보안팀</p>
              </div>
              <Separator />
              <div>
                <span className="text-xs text-muted-foreground">소스</span>
                <p className="text-sm font-medium mt-1">Jira</p>
              </div>
              <Separator />
              <div>
                <span className="text-xs text-muted-foreground">라벨</span>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline">security</Badge>
                  <Badge variant="outline">frontend</Badge>
                </div>
              </div>
              <Separator />
              <div>
                <span className="text-xs text-muted-foreground">생성일</span>
                <p className="text-sm mt-1">2026. 03. 20.</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">업데이트</span>
                <p className="text-sm mt-1">2026. 03. 21.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Link2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">연결된 이슈</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                연결된 이슈가 없습니다.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
