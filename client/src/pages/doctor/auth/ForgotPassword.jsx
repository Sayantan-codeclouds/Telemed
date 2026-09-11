import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Mail, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import doctorApi from "@/api/doctorApi";
import AuthNavbar from "@/components/common/AuthNavbar";

export default function DoctorForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await doctorApi.post("/doctors/forgot-password", { email });
      toast.success(res.data.message || "Password reset link sent to your email!");
      setSent(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to send reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      <AuthNavbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md shadow-xl border-0 rounded-3xl bg-white overflow-hidden">
          <CardHeader className="text-center pb-2 pt-8">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <KeyRound className="w-7 h-7" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Doctor Password Recovery
            </CardTitle>
            <CardDescription className="text-gray-500">
              Enter your registered medical email to receive password reset instructions
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-4">
            {sent ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center space-y-3">
                <p className="text-sm font-semibold text-emerald-900">
                  Reset link dispatched!
                </p>
                <p className="text-xs text-emerald-700">
                  Please check your inbox at <strong>{email}</strong> for instructions.
                </p>
                <Link to="/doctor/login" className="block pt-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Return to Doctor Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Medical Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@hospital.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-11 shadow-md shadow-emerald-200 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <Link
                to="/doctor/login"
                className="text-sm text-slate-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Doctor Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        TeleClinic • Secure HIPAA-ready virtual healthcare
      </footer>
    </div>
  );
}