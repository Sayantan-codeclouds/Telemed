import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import doctorApi from "@/api/doctorApi";
import AuthNavbar from "@/components/common/AuthNavbar";

export default function DoctorVerifyEmail() {
  const [status, setStatus] = useState("loading");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          setStatus("failed");
          return;
        }

        await doctorApi.post("/doctors/verify-email", { token });
        setStatus("success");

        setTimeout(() => {
          navigate("/doctor/login");
        }, 3000);
      } catch (error) {
        console.error(error);
        setStatus("failed");
      }
    };

    verify();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      <AuthNavbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md shadow-xl border-0 rounded-3xl bg-white text-center p-8">
          <CardContent className="pt-4 space-y-4">
            {status === "loading" && (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto" />
                <h2 className="text-xl font-bold text-gray-900">Verifying Doctor Account...</h2>
                <p className="text-xs text-gray-500">Please wait while we confirm your medical credentials</p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Email Verified! 🎉</h2>
                <p className="text-sm text-gray-600">
                  Your Doctor account has been verified. Redirecting you to sign in...
                </p>
                <Link to="/doctor/login" className="inline-block pt-2">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                    Proceed to Doctor Sign In
                  </Button>
                </Link>
              </div>
            )}

            {status === "failed" && (
              <div className="space-y-4">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <XCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
                <p className="text-sm text-gray-600">
                  This doctor verification link is invalid or has expired.
                </p>
                <Link to="/doctor/login" className="inline-block pt-2">
                  <Button variant="outline" className="rounded-xl">
                    Back to Doctor Login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        TeleClinic • Secure HIPAA-ready virtual healthcare
      </footer>
    </div>
  );
}