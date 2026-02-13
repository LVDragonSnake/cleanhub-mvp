// app/company/workers/[workerPublicNo]/page.tsx
import WorkerDetailsClient from "./WorkerDetailsClient";

export default async function Page(props: any) {
  // Next può passare params come oggetto oppure come Promise: gestiamo entrambi
  const p = props?.params;
  const params = p && typeof p.then === "function" ? await p : p;

  const workerPublicNo = params?.workerPublicNo;

  return <WorkerDetailsClient workerPublicNo={String(workerPublicNo ?? "")} />;
}
