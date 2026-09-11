import { Send, Paperclip, Smile } from "lucide-react";

export default function ChatInput({

  message,

  setMessage,

  sendMessage,

  appointmentId,

  user,

  socket,

  typingTimeoutRef,

}) {

  const handleTyping = (e) => {

    setMessage(e.target.value);

    socket.emit("typing", {

      roomId: appointmentId,

      senderName: user.name,

    });

    if (typingTimeoutRef?.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (typingTimeoutRef) {
      typingTimeoutRef.current = setTimeout(() => {

        socket.emit("stop-typing", {

          roomId: appointmentId,

        });

      }, 1000);
    }

  };

  return (

    <div className="bg-white border-t p-5">

      <div className="flex items-end gap-3">

        {/* Emoji */}

        <button
          className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
        >

          <Smile size={22} />

        </button>

        {/* Attachment */}

        <button
          className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
        >

          <Paperclip size={22} />

        </button>

        {/* Input */}

        <textarea

          rows={1}

          value={message}

          onChange={handleTyping}

          onKeyDown={(e) => {

            if (e.key === "Enter" && !e.shiftKey) {

              e.preventDefault();

              sendMessage();

            }

          }}

          placeholder="Type your message..."

          className="flex-1 resize-none rounded-3xl border border-gray-300 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"

        />

        {/* Send */}

        <button

          onClick={sendMessage}

          disabled={!message.trim()}

          className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition ${
            message.trim()
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}

        >

          <Send size={22} />

        </button>

      </div>

    </div>

  );

}