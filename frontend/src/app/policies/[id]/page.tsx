import Link from "next/link";
import { ArrowLeft, Edit, History, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/policies" aria-label="정책 목록으로 돌아가기">
          <Button variant="ghost" size="icon" render={<span />}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              보안 인시던트 대응 정책
            </h1>
            <Badge>활성</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {id} | 보안 | 버전 3
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Edit className="h-4 w-4" />
          수정
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">정책 내용</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
                <h3 className="text-foreground font-semibold">1. 목적</h3>
                <p>
                  본 정책은 보안 인시던트 발생 시 신속하고 체계적인 대응을 통해
                  피해를 최소화하고 재발을 방지하기 위한 절차를 정의합니다.
                </p>
                <h3 className="text-foreground font-semibold">2. 적용 범위</h3>
                <p>
                  모든 시스템, 네트워크, 데이터에 대한 보안 인시던트에 적용됩니다.
                  외부 서비스 연동 관련 인시던트도 포함됩니다.
                </p>
                <h3 className="text-foreground font-semibold">3. 대응 절차</h3>
                <p>
                  탐지 - 분석 - 봉쇄 - 제거 - 복구 - 사후 검토의 6단계로 진행합니다.
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
                <span className="text-xs text-muted-foreground">카테고리</span>
                <p className="text-sm font-medium mt-1">보안</p>
              </div>
              <Separator />
              <div>
                <span className="text-xs text-muted-foreground">작성자</span>
                <p className="text-sm font-medium mt-1">보안팀</p>
              </div>
              <Separator />
              <div>
                <span className="text-xs text-muted-foreground">승인자</span>
                <p className="text-sm font-medium mt-1">CTO</p>
              </div>
              <Separator />
              <div>
                <span className="text-xs text-muted-foreground">시행일</span>
                <p className="text-sm mt-1">2026. 01. 01.</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">최근 수정</span>
                <p className="text-sm mt-1">2026. 03. 20.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">변경 이력</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { version: "v3", date: "2026-03-20", summary: "클라우드 환경 대응 절차 추가" },
                  { version: "v2", date: "2026-01-15", summary: "에스컬레이션 기준 변경" },
                  { version: "v1", date: "2025-06-01", summary: "최초 작성" },
                ].map((v) => (
                  <div key={v.version} className="text-sm">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{v.version}</Badge>
                      <span className="text-xs text-muted-foreground">{v.date}</span>
                    </div>
                    <p className="text-muted-foreground mt-1">{v.summary}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
