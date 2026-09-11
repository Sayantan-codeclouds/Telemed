import { Wifi, WifiOff } from "lucide-react";

export default function ChatHeader({

  connected,

  doctor,

}) {

  return (

    <div className="border-b bg-white px-8 py-5 flex justify-between items-center">

      <div>

        <h2 className="text-2xl font-bold">

          Consultation Chat

        </h2>

        <p className="text-sm text-gray-500 mt-1">

          {doctor
            ? `Consulting with Dr. ${doctor.firstName} ${doctor.lastName}`
            : "Secure medical consultation"}

        </p>

      </div>

      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          connected
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >

        {connected ? (

          <>

            <Wifi size={18} />

            Connected

          </>

        ) : (

          <>

            <WifiOff size={18} />

            Disconnected

          </>

        )}

      </div>

    </div>

  );

}