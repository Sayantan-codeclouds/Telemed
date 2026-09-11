import {
  Calendar,
  Clock,
 User,
  CheckCircle,
  XCircle,
  Video,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function DoctorAppointmentCard({
  appointment,
  onAccept,
  onReject,
  onJoin,
  onView,
}) {
  const patient = appointment.patient;

  const badge = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-green-100 text-green-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-gray-100 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-3xl shadow-sm border p-6 hover:shadow-lg transition">

      <div className="flex justify-between">

        <div className="flex gap-5">

          <img
            src={
              patient.profileImage ||
              `https://ui-avatars.com/api/?name=${patient.firstName}+${patient.lastName}&background=16a34a&color=fff`
            }
            className="w-20 h-20 rounded-full object-cover"
          />

          <div>

            <h2 className="text-2xl font-bold">
              {patient.firstName} {patient.lastName}
            </h2>

            <div className="flex gap-5 mt-3 text-gray-500">

              <div className="flex items-center gap-2">
                <Calendar size={18} />
                {new Date(
                  appointment.appointmentDate
                ).toLocaleDateString()}
              </div>

              <div className="flex items-center gap-2">
                <Clock size={18} />
                {appointment.slot.start}
              </div>

            </div>

          </div>

        </div>

        <span
          className={`px-5 py-2 rounded-full h-fit font-semibold ${badge[appointment.status]}`}
        >
          {appointment.status}
        </span>

      </div>

      <div className="mt-6">

        <p className="text-sm text-gray-500">
          Consultation Reason
        </p>

        <div className="mt-2 bg-gray-50 rounded-xl p-4">
          {appointment.reason}
        </div>

      </div>

      <div className="flex flex-wrap gap-3 mt-8">

        <button
          onClick={() => onView(appointment)}
          className="border rounded-xl px-5 py-3"
        >
          View Details
        </button>

        {appointment.status === "PENDING" && (
          <>
            <button
              onClick={() => onAccept(appointment)}
              className="bg-green-600 text-white rounded-xl px-5 py-3 flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Accept
            </button>

            <button
              onClick={() => onReject(appointment)}
              className="bg-red-600 text-white rounded-xl px-5 py-3 flex items-center gap-2"
            >
              <XCircle size={18} />
              Reject
            </button>
          </>
        )}

        {(appointment.status === "CONFIRMED" ||
          appointment.status === "IN_PROGRESS") && (
          <button
  onClick={() =>
    navigate(
      `/doctor/consultation/${appointment._id}`
    )
  }
  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-3 flex items-center gap-2"
>
  <Video size={18} />
  Join Consultation
</button>
        )}

      </div>

    </div>
  );
}