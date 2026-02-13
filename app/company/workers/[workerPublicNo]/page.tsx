import WorkerDetailsClient from "./WorkerDetailsClient";

export default function Page({
  params,
}: {
  params: { workerPublicNo: string };
}) {
  return <WorkerDetailsClient workerPublicNo={params.workerPublicNo} />;
}
