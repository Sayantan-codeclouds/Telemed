import { useState } from "react";
import { Settings as Bell, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/api/axios";

export default function PatientSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New passwords do not match.");
    }
    if (passwordForm.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters.");
    }

    setSavingPassword(true);
    try {
      await api.patch("/patients/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password updated successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Manage your account credentials, security preferences, and communications
        </p>
      </div>

      {/* Security & Password */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-bold">Change Password</CardTitle>
          </div>
          <CardDescription>
            Ensure your account is using a secure, unique password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currPass">Current Password</Label>
              <Input
                id="currPass"
                type="password"
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPass">New Password</Label>
                <Input
                  id="newPass"
                  type="password"
                  placeholder="Min 8 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confPass">Confirm New Password</Label>
                <Input
                  id="confPass"
                  type="password"
                  placeholder="Repeat new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={savingPassword}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {savingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-bold">Notification Preferences</CardTitle>
          </div>
          <CardDescription>Control alerts for appointments and prescription updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">Email Notifications</p>
              <p className="text-xs text-gray-500">Receive appointment confirmations and digital prescription alerts</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => {
                setEmailNotifications(e.target.checked);
                toast.success("Preferences updated");
              }}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">Consultation Reminders</p>
              <p className="text-xs text-gray-500">Send reminder 15 minutes prior to scheduled video call</p>
            </div>
            <input
              type="checkbox"
              checked={reminders}
              onChange={(e) => {
                setReminders(e.target.checked);
                toast.success("Reminder preferences updated");
              }}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
