"use client";

import { useParams } from "next/navigation";
import WorkerDetailsClient from "./WorkerDetailsClient";

export default function Page() {
  const params = useParams<{ workerPublicNo: string }>();
  return <WorkerDetailsClient workerPublicNo={params.workerPublicNo} />;
}
