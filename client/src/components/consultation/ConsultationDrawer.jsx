import { X } from "lucide-react";

export default function ConsultationDrawer({

  open,

  title,

  children,

  onClose,

}) {

  return (

    <>

      {/* Overlay */}

      <div

        onClick={onClose}

        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300 z-40 ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}

      />

      {/* Drawer */}

      <div

        className={`fixed top-0 right-0 h-screen w-[430px] bg-white shadow-2xl z-50 transition-transform duration-300 ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}

      >

        <div className="h-full flex flex-col">

          {/* Header */}

          <div className="border-b px-6 py-5 flex justify-between items-center">

            <h2 className="text-2xl font-bold">

              {title}

            </h2>

            <button

              onClick={onClose}

              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"

            >

              <X />

            </button>

          </div>

          {/* Body */}

          <div className="flex-1 overflow-y-auto p-6">

            {children}

          </div>

        </div>

      </div>

    </>

  );

}