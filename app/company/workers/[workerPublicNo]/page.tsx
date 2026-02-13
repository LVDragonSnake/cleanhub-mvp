import WorkerPageClient from "./WorkerPageClient";

export default async function Page({
  params,
}: {
  params: Promise<{ workerPublicNo: string }>;
}) {
  const { workerPublicNo } = await params;
  return <WorkerPageClient workerPublicNo={workerPublicNo} />;
}
