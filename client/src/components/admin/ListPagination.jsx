import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Previous / next pager shown under the admin list tables. */
export default function ListPagination({ page, pages, total, pageSize, onPageChange, loading = false, noun = "records" }) {
  if (!total) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-4 text-xs text-slate-500">
      <span className="flex items-center gap-2">
        Showing <strong className="text-slate-700">{first}–{last}</strong> of{" "}
        <strong className="text-slate-700">{total}</strong> {noun}
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
          className="rounded-xl gap-1 h-8"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Previous
        </Button>
        <span className="font-semibold text-slate-600">
          Page {page} of {pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages || loading}
          onClick={() => onPageChange(page + 1)}
          className="rounded-xl gap-1 h-8"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
