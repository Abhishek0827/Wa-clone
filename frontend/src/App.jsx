import { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useMediaQuery } from "react-responsive";

import DefaultChatWindow from "./component/defautChatWindow";
import ContactList from "./component/conatctList";
import ChatWindow from "./component/chatWindow";

export default function App() {
  // const LINK = "http://localhost:5000";
  const LINK = "https://wa-clone-bfhi.onrender.com";

  const [Login, setLogin] = useState(false);
  const [account, setAccount] = useState({ loaded: false, data: null });
  const [accountSelected, setAccountSelected] = useState("");
  const [contact, setContact] = useState({ loaded: false, data: null });
  const [chat, setChat] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [currentRoom, setCurrentRoom] = useState("");

  const isMobile = useMediaQuery({ maxWidth: 500 });
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io(LINK);

    socket.current.on("connect", () => {
      console.log("Connected:", socket.current.id);
    });

    // socket.current.on("receive_message", (data) => {
    //   alert(1);
    //   // console.log("📥 Received:", data);

    //   // Send back delivery confirmation
    //   socket.current.emit("message_delivered", {
    //     messageId: data.messageId,
    //     senderSocketId: data.senderSocketId,
    //   });

    //   setChat((prev) => [
    //     ...prev,
    //     {
    //       ...data,
    //       status: "delivered", // will be updated after delivery ack
    //     },
    //   ]);
    // });

    // socket.current.on("message_delivered_ack", (data) => {
    //   console.log(`✅ Delivered: ${data.messageId}`);
    //   setChat((prev) =>
    //     prev.map((msg) =>
    //       msg.messageId === data.messageId ? { ...msg, status: "read" } : msg
    //     )
    //   );
    // });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const sendMessage = async (msg) => {
    if (!selectedPerson) return;

    const now = new Date();
    const messageId = Date.now().toString();

    const payload = {
      messageId,
      message: msg,
      room: currentRoom,
      status: "sent",
      senderId: contact?.data?._id,
      senderName: contact?.data?.name,
      receiverId: selectedPerson.user,
      receiverName: selectedPerson.name,
      date: formatDate(now),
      time: now.toLocaleTimeString(),
    };

    try {
      socket.current.emit("Send_message", payload);
      await axios.post(`${LINK}/api/send-msg`, payload);
      setChat((prev) => [...prev, payload]);
    } catch (err) {
      console.error("❌ Send message failed:", err);
    }
  };

  const joinRoom = (roomId) => {
    if (currentRoom) socket.current.emit("leave_room", currentRoom);
    socket.current.emit("join_room", roomId);
    setCurrentRoom(roomId);
  };

  const formatDate = (date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const fetchChats = async (roomId, receiver) => {
    try {
      const res = await axios.get(`${LINK}/api/chats`, {
        params: { roomId, receiver },
      });
      setChat(res.data || []);
      socket.current.emit("message_opened",{roomId,receiver});
    } catch (err) {
      console.error("❌ Fetch chats failed:", err);
    }
  };

  const handleSubChildClick = (person) => {
    console.log(person);
    setSelectedPerson(person);
    setChatOpen(true);
    joinRoom(person.contactId);
    setChat([]);
    fetchChats(person.contactId, person.user);
  };

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await axios.get(`${LINK}/api/accounts`);
        setAccount({ loaded: true, data: res.data });
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchAccount();
  }, []);

  const userLogin = async (e) => {
    e.preventDefault();
    if (accountSelected) {
      try {
        const res = await axios.get(`${LINK}/api/contacts`, {
          params: { accountSelected },
        });
        setContact({ loaded: true, data: res.data });
        setLogin(true);
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
      }
    }
  };

  return (
    <main>
      {Login ? (
        <section id="postLogin">
          <section id="contactList">
            {contact.loaded ? (
              <ContactList
                selectedPerson={selectedPerson}
                list={contact?.data?.contacts}
                onSubChildClick={handleSubChildClick}
              />
            ) : (
              <h1 className="Loading">Loading...</h1>
            )}
          </section>
          <section
            id="chatWindow"
            style={{
              display: isMobile ? (chatOpen ? "block" : "none") : "block",
            }}
          >
            {chatOpen ? (
              <ChatWindow
                details={selectedPerson}
                ower={contact.data}
                closeChat={() => {
                  setChatOpen(false), setSelectedPerson(null);
                }}
                msg={sendMessage}
                loadChats={chat}
              />
            ) : (
              <DefaultChatWindow />
            )}
          </section>
        </section>
      ) : (
        <section id="loginScreen">
          {account.loaded ? (
            <form onSubmit={userLogin}>
              <h1>Select account to login</h1>
              {account.data?.map((e) => (
                <div key={e._id}>
                  <input
                    type="radio"
                    name="account"
                    value={e._id}
                    onChange={(ev) => setAccountSelected(ev.target.value)}
                  />
                  <h4>{e.name}</h4>
                </div>
              ))}
              <button type="submit">Login</button>
            </form>
          ) : (
            <h1 className="Loading">Loading...</h1>
          )}
        </section>
      )}
    </main>
  );
}
