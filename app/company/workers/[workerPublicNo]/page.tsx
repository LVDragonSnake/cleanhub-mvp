import WorkerDetailsClient from "./WorkerDetailsClient";

export default async function Page({
  params,
}: {
  params: Promise<{ workerPublicNo: string }>;
}) {
  const { workerPublicNo } = await params;
  return <WorkerDetailsClient workerPublicNo={workerPublicNo} />;
}
