import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";

import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

const types = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-green-600",
    buttonColor: "bg-green-600 hover:bg-green-700",
  },

  error: {
    icon: XCircle,
    iconColor: "text-red-600",
    buttonColor: "bg-red-600 hover:bg-red-700",
  },

  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
    buttonColor: "bg-yellow-500 hover:bg-yellow-600",
  },

  info: {
    icon: Info,
    iconColor: "text-blue-600",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
  },
};

export default function AppDialog({
  open,
  onClose,

  type = "info",

  title,

  description,

  confirmText = "OK",

  cancelText,

  onConfirm,

  loading = false,
}) {
  const config = types[type];

  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>

      <DialogContent className="sm:max-w-md rounded-3xl">

        <DialogHeader className="items-center text-center">

          <div
            className={`w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5`}
          >
            <Icon
              className={`w-12 h-12 ${config.iconColor}`}
            />
          </div>

          <DialogTitle className="text-2xl">
            {title}
          </DialogTitle>

          <DialogDescription className="text-base mt-3 whitespace-pre-wrap">
            {description}
          </DialogDescription>

        </DialogHeader>

        <DialogFooter className="flex justify-center gap-3 mt-6">

          {cancelText && (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl border"
            >
              {cancelText}
            </button>
          )}

          <button
            disabled={loading}
            onClick={() => {

              if (onConfirm) {

                onConfirm();

              } else {

                onClose();

              }

            }}
            className={`text-white px-6 py-2 rounded-xl ${config.buttonColor}`}
          >
            {loading ? "Please wait..." : confirmText}
          </button>

        </DialogFooter>

      </DialogContent>

    </Dialog>
  );
}