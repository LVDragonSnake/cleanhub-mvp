import WorkerDetailsClient from "./workerDetailsClient";

export default function Page({
  params,
}: {
  params: { workerPublicNo: string };
}) {
  return <WorkerDetailsClient workerPublicNo={params.workerPublicNo} />;
}
