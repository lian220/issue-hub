import { test, expect } from "@playwright/test";

test.describe("프로젝트 목록 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects");
  });

  test("페이지 제목과 설명이 표시된다", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "프로젝트" })).toBeVisible();
    await expect(page.getByText("연결된 프로젝트와 코드 저장소를 관리합니다.")).toBeVisible();
  });

  test("프로젝트 추가 버튼이 표시된다", async ({ page }) => {
    await expect(page.getByRole("button", { name: "프로젝트 추가" })).toBeVisible();
  });

  test("4개의 프로젝트가 테이블에 표시된다", async ({ page }) => {
    await expect(page.getByText("총 4개의 프로젝트")).toBeVisible();
    await expect(page.getByText("결제 서비스")).toBeVisible();
    await expect(page.getByText("쇼핑 API")).toBeVisible();
    await expect(page.getByText("관리자 포털")).toBeVisible();
    await expect(page.getByText("블로그")).toBeVisible();
  });

  test("동기화 상태 뱃지가 올바르게 표시된다", async ({ page }) => {
    await expect(page.getByText("동기화됨").first()).toBeVisible();
    await expect(page.getByRole("table").getByText("오류")).toBeVisible();
  });

  test("검색으로 프로젝트를 필터링할 수 있다", async ({ page }) => {
    await page.getByPlaceholder("프로젝트 검색...").fill("결제");
    await expect(page.getByText("결제 서비스")).toBeVisible();
    await expect(page.getByText("쇼핑 API")).not.toBeVisible();
    await expect(page.getByText("총 1개의 프로젝트")).toBeVisible();
  });

  test("LLM 필터로 프로젝트를 필터링할 수 있다", async ({ page }) => {
    // 필터 영역에서 Ollama 클릭
    const filterArea = page.locator(".flex.flex-wrap.items-center.gap-4");
    await filterArea.getByText("Ollama").click();

    await expect(page.getByText("결제 서비스")).toBeVisible();
    await expect(page.getByText("쇼핑 API")).not.toBeVisible();
    await expect(page.getByText("총 1개의 프로젝트")).toBeVisible();
  });

  test("동기화 필터로 오류 프로젝트만 볼 수 있다", async ({ page }) => {
    const filterArea = page.locator(".flex.flex-wrap.items-center.gap-4");
    await filterArea.getByText("오류", { exact: true }).click();

    await expect(page.getByText("관리자 포털")).toBeVisible();
    await expect(page.getByText("결제 서비스")).not.toBeVisible();
    await expect(page.getByText("총 1개의 프로젝트")).toBeVisible();
  });

  test("초기화 버튼으로 필터를 리셋할 수 있다", async ({ page }) => {
    await page.getByPlaceholder("프로젝트 검색...").fill("결제");
    await expect(page.getByText("총 1개의 프로젝트")).toBeVisible();

    await page.getByRole("button", { name: "초기화" }).click();
    await expect(page.getByText("총 4개의 프로젝트")).toBeVisible();
  });

  test("테이블 헤더가 올바르게 표시된다", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "프로젝트" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Git" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "코드 인텔" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "LLM" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "이슈" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "동기화", exact: true })).toBeVisible();
  });
});
