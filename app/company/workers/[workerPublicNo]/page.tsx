import WorkerDetailClient from "./WorkerDetailClient";

export default async function Page({
  params,
}: {
  params: Promise<{ workerPublicNo: string }>;
}) {
  const { workerPublicNo } = await params;
  return <WorkerDetailClient workerPublicNo={workerPublicNo} />;
}
