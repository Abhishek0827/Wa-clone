import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function ChatWindow({ details, closeChat, msg, loadChats }) {
  const [message, setMessage] = useState("");

  const loadMessage = async (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      // alert(1)
      msg(message);
      setMessage("");
    }
  };

  return (
    <>
      <div id="chatWindowMain">
        <div className="menuBar">
          <div className="left">
            <FontAwesomeIcon icon={faArrowLeft} onClick={closeChat} />
            <div>
              <img src="/DP_icon.jpg" alt="" />
              <div>
                <h2 className="name"> {details.name}</h2>
                <h6 className="mobile">{details.mobile}</h6>
              </div>
            </div>
          </div>
          <div className="right"></div>
        </div>
        <div className="messageSection">
          {loadChats?.map((x, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent:
                  details.user !== x.receiverId ? "flex-start" : "flex-end",
                marginBottom: "10px",
                padding: "10px",
              }}
            >
              <div>
                <div style={{}}>
                  <h1
                    style={{
                      wordWrap: "break-word",
                      whiteSpace: "nowrap",
                      fontSize: "13px",
                      fontWeight: "400",
                      backgroundColor:
                        details.user !== x.receiverId ? "#262626" : "#027902ff",
                      color: "white",
                      padding: "10px",
                      borderRadius: "7px",
                      // maxWidth: "60%",
                      // display: "flex",
                      // alignItems:"baseline"
                    }}
                  >
                    {x.message}
                    <sub
                      style={{
                        padding: "0px 0px 0px 10px",
                        fontSize: "9px",
                        color: "#ffffff5d",
                      }}
                    >
                      {x.time.split(":")[0] +
                        ":" +
                        x.time.split(":")[1] +
                        " " +
                        x.time.split(" ")[1]}
                    </sub>
                  </h1>
                </div>

                <h5
                  style={{
                    display: details.user !== x.receiverId ? "none" : "flex",

                    justifyContent:
                      details.user !== x.receiverId ? "flex-start" : "flex-end",
                  }}
                >
                  <small>{x.status}</small>
                </h5>
              </div>
            </div>
          ))}
        </div>

        <div className="textIputSection">
          <form onSubmit={loadMessage}>
            <input
              type="text"
              id="messageInput"
              placeholder="Type a message"
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              value={message}
            />
            <button type="submit">
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
