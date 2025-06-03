"use client";

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { useParams } from "next/navigation";

type AppointmentItem = {
  officer_name?: string;
  company_name?: string;
  company_number?: string;
  links?: {
    company?: string;  // e.g. "/company/05788582"
    self?: string;
  };
};

export default function OfficerPage() {
  // 1) Grab and validate the officer ID from the URL
  const { id } = useParams() as { id?: string };
  if (!id) {
    return <div className="p-6">Loading officer data…</div>;
  }

  // 2) Fetch appointments via SWR
  const refreshInterval = Number(process.env.NEXT_PUBLIC_POLL_INTERVAL);
  const { data, error, isLoading } = useSWR(
    `/api/officer/${encodeURIComponent(id)}/appointments`,
    fetcher,
    { refreshInterval }
  );

  // 3) Handle loading & errors
  if (isLoading) {
    return <div className="p-6">Loading appointments…</div>;
  }
  if (error) {
    return (
      <div className="p-6 text-red-600">
        Failed to load officer appointments.
      </div>
    );
  }

  const appointments: AppointmentItem[] = data?.items || [];
  if (appointments.length === 0) {
    return <div className="p-6">No appointments found for this officer.</div>;
  }

  // 4) Show the officer’s name (falls back to “Officer #{id}”)
  const officerName =
    appointments[0].officer_name || `Officer #${id}`;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{officerName}</h1>
      <h2 className="text-lg text-gray-600">Officer ID: {id}</h2>

      <section>
        <h3 className="text-xl font-semibold mt-4">Other Appointments</h3>
        <ul className="list-disc ml-6 space-y-2 mt-2">
          {appointments.map((a) => {
            // 5) Derive the company number
            let companyNumber = a.company_number;
            if (!companyNumber && a.links?.company) {
              const parts = a.links.company.split("/");
              companyNumber = parts[2]; // ["", "company", "05788582"]
            }
            if (!companyNumber) return null;

            // 6) Derive a display name for the company
            const companyName = a.company_name || `#${companyNumber}`;

            return (
              <li key={a.links?.self || companyNumber}>
                <Link
                  href={`/company/${encodeURIComponent(companyNumber)}`}
                  className="text-blue-600 hover:underline"
                >
                  {companyNumber} ({companyName})
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
