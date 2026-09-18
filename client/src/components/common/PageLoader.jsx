import { Loader2 } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[50vh] py-16">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
}
