import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, RefreshCw, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import adminApi from "@/api/adminApi";

const PAGE_SIZE = 50;

const METHOD_STYLES = {
  POST: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PUT: "bg-indigo-50 text-indigo-700 border-indigo-200",
  PATCH: "bg-amber-50 text-amber-700 border-amber-200",
  DELETE: "bg-rose-50 text-rose-700 border-rose-200",
};

const formatChanges = (changes) => {
  const entries = Object.entries(changes || {});
  if (entries.length === 0) return "—";
  return entries
    .map(([key, value]) => `${key}: ${value === null || value === undefined ? "∅" : String(value)}`)
    .join(" · ");
};

export default function AdminAuditLog() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-audit-logs", page],
    queryFn: async () => {
      const res = await adminApi.get("/admin/audit-logs", { params: { page, limit: PAGE_SIZE } });
      return { logs: res.data?.data || [], pagination: res.data?.pagination || { pages: 1, total: 0 } };
    },
    meta: { errorMessage: "Failed to load the audit log." },
  });

  const logs = data?.logs || [];
  const pages = data?.pagination?.pages || 1;
  const total = data?.pagination?.total || 0;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-indigo-600" />
            Audit Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Every change made by an admin: who, when, what, and which fields. Secret values are never stored.
          </p>
        </div>

        <Button
          onClick={() => refetch()}
          variant="outline"
          className="rounded-2xl h-10 px-4 text-xs font-bold border-slate-200 hover:bg-slate-50 gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading audit log...
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center py-16 text-sm text-slate-500">No admin actions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 text-left">When</th>
                  <th className="p-3 text-left">Admin</th>
                  <th className="p-3 text-left">Action</th>
                  <th className="p-3 text-left">Target</th>
                  <th className="p-3 text-left">Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="align-top">
                    <td className="p-3 whitespace-nowrap text-slate-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800">{log.adminEmail || "—"}</p>
                      <p className="text-[10px] text-slate-400">{log.adminRole}</p>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block mr-1.5 px-1.5 py-0.5 rounded-md border font-bold text-[10px] ${
                          METHOD_STYLES[log.method] || "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {log.method}
                      </span>
                      <span className="font-mono text-slate-700 break-all">
                        {log.action === "LOGIN" ? "Signed in" : log.action.replace(/^[A-Z]+ /, "")}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{log.targetId || "—"}</td>
                    <td className="p-3 text-slate-600 max-w-md break-words">{formatChanges(log.changes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {total} entr{total === 1 ? "y" : "ies"} · page {page} of {pages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Newer
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pages || isFetching}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl gap-1"
          >
            Older <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
