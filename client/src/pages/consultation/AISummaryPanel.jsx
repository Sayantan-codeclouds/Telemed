import { useState } from "react";
import { Sparkles, Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/api/axios";
import doctorApi from "@/api/doctorApi";

export default function AISummaryPanel({ appointmentId, isDoctor }) {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const client = isDoctor ? doctorApi : api;
      const { data } = await client.post("/ai/consultation-summary", { appointmentId });
      if (data?.data) {
        setSummaryData(data.data);
        toast.success("AI consultation summary generated!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate AI summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-4">
      {/* AI Disclaimer Banner */}
      <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
            AI-Assisted Clinical Documentation
          </h4>
          <p className="text-xs text-purple-700 mt-0.5 leading-relaxed">
            Synthesizes patient intake, chat history, and clinical notes. Information is intended as an aid and does not constitute a formal diagnosis.
          </p>
        </div>
      </div>

      {!summaryData && !loading && (
        <div className="text-center py-10 px-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">Generate Consultation Summary</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1 mb-5">
            Click below to generate an AI summary of this session's diagnosis, chat, and recommendations.
          </p>
          <Button
            onClick={generateSummary}
            className="bg-purple-600 hover:bg-purple-700 text-white gap-2 px-6"
          >
            <Sparkles className="w-4 h-4" /> Generate Summary
          </Button>
        </div>
      )}

      {loading && (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">Synthesizing clinical summary...</p>
          <p className="text-xs text-gray-400 mt-1">Analyzing chat messages and consultation records</p>
        </div>
      )}

      {summaryData && !loading && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Summary Report
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={generateSummary}
              className="h-8 gap-1.5 text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate
            </Button>
          </div>

          {/* Chief Complaint */}
          <Card className="border shadow-none rounded-xl">
            <CardContent className="p-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chief Complaint</span>
              <p className="text-sm font-semibold text-gray-900 mt-1">{summaryData.chiefComplaint}</p>
            </CardContent>
          </Card>

          {/* History of Present Illness */}
          <Card className="border shadow-none rounded-xl">
            <CardContent className="p-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Present Illness History</span>
              <p className="text-sm text-gray-800 mt-1 leading-relaxed">{summaryData.historyOfPresentIllness}</p>
            </CardContent>
          </Card>

          {/* Doctor Observations */}
          {summaryData.doctorObservations && (
            <Card className="border shadow-none rounded-xl bg-slate-50/50">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Observations</span>
                <p className="text-sm text-gray-800 mt-1">{summaryData.doctorObservations}</p>
              </CardContent>
            </Card>
          )}

          {/* Key Recommendations */}
          {summaryData.keyRecommendations?.length > 0 && (
            <Card className="border shadow-none rounded-xl">
              <CardContent className="p-4 space-y-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Key Recommendations</span>
                <div className="space-y-2 pt-1">
                  {summaryData.keyRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-gray-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Follow-Up Advice */}
          {summaryData.followUpAdvice && (
            <div className="p-4 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Follow-up & Precautions</span>
                <p className="text-xs text-amber-800 mt-0.5">{summaryData.followUpAdvice}</p>
              </div>
            </div>
          )}

          {/* Narrative Summary */}
          {summaryData.summaryText && (
            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Narrative Report</span>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{summaryData.summaryText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
