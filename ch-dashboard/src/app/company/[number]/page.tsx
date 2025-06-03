"use client";

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { useParams } from "next/navigation";

type FilingItem = {
  transaction_id: string;
  type: string;                            // e.g. "PSC01"
  description?: string;                    // human-readable string
  description_values?: Record<string,string>;
  date: string;
  links: {
    document_metadata: string;             // path to metadata endpoint
  };
};

type OfficerItem = {
  name: string;
  officer_role: string;
  appointed_on: string;
  resigned_on?: string;
  links: {
    officer: { appointments: string };     // "/officers/{id}/appointments"
  };
};

export default function CompanyPage() {
  // 1) Grab & validate the dynamic company number
  const { number } = useParams() as { number?: string };
  if (!number) {
    return <div className="p-6">Invalid company number.</div>;
  }

  // 2) Pull in the refresh interval
  const refreshInterval = Number(process.env.NEXT_PUBLIC_POLL_INTERVAL);

  // 3) Fetch profile, officers, filings
  const { data: profile, error: profErr } = useSWR(
    `/api/company/${number}`,
    fetcher,
    { refreshInterval }
  );
  const { data: officersData, error: offErr } = useSWR(
    `/api/company/${number}/officers`,
    fetcher,
    { refreshInterval }
  );
  const { data: filingsData, error: fileErr } = useSWR(
    `/api/company/${number}/filings`,
    fetcher,
    { refreshInterval }
  );

  // 4) Handle loading & errors
  if (!profile || !officersData || !filingsData) {
    return <div className="p-6">Loading company data…</div>;
  }
  if (profErr || offErr || fileErr) {
    return (
      <div className="p-6 text-red-600">
        Error loading company information. Please try again later.
      </div>
    );
  }

  // 5) Group officers by name
  const officers: OfficerItem[] = officersData.items || [];
  type Group = { officerId: string; roles: { role: string; active: boolean }[] };
  const grouped: Record<string, Group> = {};
  officers.forEach((o) => {
    const [, , officerId] = o.links.officer.appointments.split("/");
    if (!grouped[o.name]) {
      grouped[o.name] = { officerId, roles: [] };
    }
    grouped[o.name].roles.push({
      role: o.officer_role,
      active: !o.resigned_on,
    });
  });

  // 6) Prepare filings list
  const filings: FilingItem[] = filingsData.items || [];

  // 7) New client-side PDF downloader via /api/document
  const handleDownload = async (item: FilingItem) => {
    const metaPath = item.links.document_metadata;
    const url = `/api/document?metaPath=${encodeURIComponent(metaPath)}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Network error: ${res.status}`);
      const blob = await res.blob();

      // Build a safe filename
      const safeType = item.type.replace(/[^a-zA-Z0-9]/g, "");
      const filename = `${safeType}_${item.transaction_id}.pdf`;

      // Trigger browser download
      const objURL = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objURL;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objURL);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* ───── Company Header ───── */}
      <header>
        <h1 className="text-3xl font-bold">{profile.company_name}</h1>
        <p className="text-gray-500">Company Number: {number}</p>
      </header>

      {/* ───── Officers ───── */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Officers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(grouped).map(([name, info]) => (
            <div
              key={info.officerId}
              className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition"
            >
              <Link
                href={`/officer/${encodeURIComponent(info.officerId)}`}
                className="text-xl font-medium text-blue-600 hover:underline"
              >
                {name}
              </Link>
              <ul className="mt-2 space-y-1">
                {info.roles.map((r, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{r.role.replace(/_/g, " ")}</span>
                    <span
                      className={
                        r.active
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {r.active ? "Active" : "Inactive"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Filings ───── */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Filings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filings.map((f) => (
            <div
              key={f.transaction_id}
              className="bg-white rounded-2xl shadow p-4 flex flex-col hover:shadow-md transition"
            >
              {/* Raw code */}
              <span className="text-xs text-gray-400">{f.type}</span>

              {/* Description */}
              {f.description && (
                <p className="font-medium mt-1">{f.description}</p>
              )}

              {/* Extra details */}
              {f.description_values && (
                <ul className="mt-2 list-disc ml-6 text-sm text-gray-600 space-y-1">
                  {Object.entries(f.description_values).map(([k, v]) => (
                    <li key={k}>
                      <strong>{k.replace(/_/g, " ")}:</strong> {v}
                    </li>
                  ))}
                </ul>
              )}

              {/* Date */}
              <span className="text-gray-500 mt-2 mb-4">{f.date}</span>

              {/* Download button */}
              <button
                onClick={() => handleDownload(f)}
                className="mt-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Download PDF
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
