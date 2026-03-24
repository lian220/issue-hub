import { IssueDetail } from "@/features/issues/components/issue-detail";

export default async function IssueDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  return <IssueDetail issueId={id} />;
}
