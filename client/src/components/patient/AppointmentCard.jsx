import {
  Calendar,
  Clock,
  Hospital,
  Video,
  IndianRupee,
  Eye,
  XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useCurrency } from "../../contexts/CurrencyContext";

export default function AppointmentCard({
  appointment,
}) {
  const { formatPrice } = useCurrency();
  const doctor = appointment.doctor;
  const navigate = useNavigate();

  const badgeColors = {

    PENDING:
      "bg-yellow-100 text-yellow-700",

    CONFIRMED:
      "bg-green-100 text-green-700",

    IN_PROGRESS:
      "bg-blue-100 text-blue-700",

    COMPLETED:
      "bg-gray-100 text-gray-700",

    CANCELLED:
      "bg-red-100 text-red-700",

    REJECTED:
      "bg-red-100 text-red-700",

  };

  return (

    <div className="bg-white rounded-3xl shadow-sm border hover:shadow-lg transition">

      {/* Header */}

      <div className="p-6 flex justify-between">

        <div className="flex gap-5">

          <img

            src={
              doctor.profileImage ||

              `https://ui-avatars.com/api/?name=${doctor.firstName}+${doctor.lastName}&background=16a34a&color=fff`
            }

            className="w-24 h-24 rounded-full object-cover border"

          />

          <div>

            <h2 className="text-2xl font-bold">

              Dr. {doctor.firstName} {doctor.lastName}

            </h2>

            <p className="text-green-600 font-medium mt-1">

              {doctor.specialization || "General Physician"}

            </p>

            <div className="flex items-center gap-2 mt-3 text-gray-500">

              <Hospital size={18} />

              {doctor.hospital || "-"}

            </div>

          </div>

        </div>

        <span
          className={`px-5 py-2 rounded-full text-sm font-semibold h-fit ${badgeColors[appointment.status]}`}
        >
          {appointment.status}
        </span>

      </div>

      {/* Body */}

      <div className="px-6 pb-6">

        <div className="grid md:grid-cols-4 gap-5">

          <div className="border rounded-2xl p-4">

            <div className="flex items-center gap-2 text-gray-500">

              <Calendar size={18} />

              Date

            </div>

            <p className="mt-3 font-semibold">

              {new Date(
                appointment.appointmentDate
              ).toLocaleDateString()}

            </p>

          </div>

          <div className="border rounded-2xl p-4">

            <div className="flex items-center gap-2 text-gray-500">

              <Clock size={18} />

              Time

            </div>

            <p className="mt-3 font-semibold">

              {appointment.slot.start}

              {" - "}

              {appointment.slot.end}

            </p>

          </div>

          <div className="border rounded-2xl p-4">

            <div className="flex items-center gap-2 text-gray-500">

              <Video size={18} />

              Consultation

            </div>

            <p className="mt-3 font-semibold">

              Video Call

            </p>

          </div>

          <div className="border rounded-2xl p-4">

            <div className="flex items-center gap-2 text-gray-500">

              <IndianRupee size={18} />

              Fee

            </div>

            <p className="mt-3 font-semibold">

              {formatPrice(doctor?.consultationFee ?? 0)}

            </p>

          </div>

        </div>

        {/* Reason */}

        <div className="mt-6">

          <h3 className="font-semibold">

            Consultation Reason

          </h3>

          <div className="mt-2 bg-gray-50 rounded-xl p-4">

            {appointment.reason}

          </div>

        </div>

        {/* Footer */}

        <div className="flex flex-wrap gap-3 mt-8">

          <button
            className="flex items-center gap-2 bg-white border rounded-xl px-5 py-3 hover:bg-gray-50"
          >
            <Eye size={18} />

            View Details

          </button>

          {appointment.status ===
            "PENDING" && (

            <button
              className="flex items-center gap-2 bg-red-600 text-white rounded-xl px-5 py-3 hover:bg-red-700"
            >
              <XCircle size={18} />

              Cancel Appointment

            </button>

          )}

          {(appointment.status ===
            "CONFIRMED" ||

            appointment.status ===
              "IN_PROGRESS") && (

            <button
  onClick={() =>
    navigate(
      `/patient/consultation/${appointment._id}`
    )
  }
  className="flex items-center gap-2 bg-green-600 text-white rounded-xl px-5 py-3 hover:bg-green-700"
>
  <Video size={18} />

  Join Consultation
</button>

          )}

          {appointment.status ===
            "COMPLETED" && (

            <>
              <button
                className="bg-blue-600 text-white rounded-xl px-5 py-3"
              >
                View Prescription
              </button>

              <button
                className="bg-purple-600 text-white rounded-xl px-5 py-3"
              >
                AI Summary
              </button>
            </>

          )}

        </div>

      </div>

    </div>

  );

}