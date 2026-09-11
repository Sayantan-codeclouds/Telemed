export default function ChatMessage({

  message,

  currentUserType,

}) {

  const isMine =
    message.senderType === currentUserType;

  const sender = message.senderId || {};


  const fullName =

    sender.firstName && sender.lastName

      ? `${sender.firstName} ${sender.lastName}`

      : "Unknown User";


      const displayName =

  message.senderType === "Doctor"

    ? `Dr. ${fullName}`

    : fullName;

  const initials = fullName

    .split(" ")

    .map((word) => word[0])

    .join("")

    .substring(0, 2)

    .toUpperCase();

  return (

    <div
      className={`flex mb-6 ${
        isMine
          ? "justify-end"
          : "justify-start"
      }`}
    >

      {/* LEFT AVATAR */}

      {!isMine && (

        <div className="mr-3">

          {sender.profileImage ? (

            <img

              src={sender.profileImage}

              alt={fullName}

              className="w-12 h-12 rounded-full object-cover border shadow"

            />

          ) : (

            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center border shadow">

              {initials}

            </div>

          )}

        </div>

      )}

      {/* MESSAGE */}

      <div className="max-w-[70%]">

        <div
          className={`flex items-center mb-2 ${
            isMine
              ? "justify-end"
              : "justify-start"
          }`}
        >

          {!isMine && (

            <span className="font-semibold text-slate-800">

              {displayName}

            </span>

          )}

          <span className="ml-3 text-xs text-slate-500">

            {new Date(message.createdAt).toLocaleTimeString([], {

              hour: "2-digit",

              minute: "2-digit",

            })}

          </span>

        </div>

        <div
          className={`rounded-3xl px-5 py-4 shadow-sm ${
            isMine

              ? "bg-green-500 text-white rounded-tr-md"

              : "bg-white border rounded-tl-md"

          }`}
        >

          <p className="leading-7 whitespace-pre-wrap break-words">

            {message.message}

          </p>

        </div>

      </div>

      {/* RIGHT AVATAR */}

      {isMine && (

        <div className="ml-3">

          {sender.profileImage ? (

            <img

              src={sender.profileImage}

              alt={fullName}

              className="w-12 h-12 rounded-full object-cover border shadow"

            />

          ) : (

            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center border shadow">

              {initials}

            </div>

          )}

        </div>

      )}

    </div>

  );

}