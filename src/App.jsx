import React, { Fragment, useState, useRef, useEffect } from "react";
// https://github.com/fkhadra/react-toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "http://localhost:8080";

export default function App() {
  const sendExternalRef = useRef();
  const [serverNotification, setServerNotification] = useState("");
  const toastId = React.useRef(null);

  // connect to stream
  useEffect(() => {
    const eventSource = new EventSource(`${BASE_URL}/smart-message`);
    eventSource.onmessage = (event) => setNotification(`${event.data}`);
    eventSource.onerror = (error) => eventSource.close();

    // const eventSourceSse = new EventSource(`${BASE_URL}/smart-message-sse`);
    // eventSourceSse.onmessage = (event) => setNotification(`type: ${event.type} - data: ${event.data}`);
    // eventSourceSse.onerror = (error) => eventSourceSse.close();

    // listen custom event type on backend
    // const eventSourceSseTyped = new EventSource(`${BASE_URL}/smart-message-sse-typed` );
    // eventSourceSseTyped.addEventListener("message-updated", (event) => setNotification(`type: ${event.type} - data: ${event.data}`) );
    // eventSourceSseTyped.onerror = (error) => eventSourceSseTyped.close();
  }, []);

  const sendExternalEvent = () => {
    const message = sendExternalRef.current.value;
    const messageActive = message ? "X" : "-";
    sendExternalRef.current.value = "";
    sendExternalEventToRestApi({ message, messageActive });
  };

  const sendExternalEventToRestApi = async ({ message, messageActive }) => {
    let url = `${BASE_URL}/external/smartMessage`;
    url += `?messageActive=${encodeURIComponent(messageActive)}`;
    url += `&message=${encodeURIComponent(message)}`;
    setServerNotification("Sending to de backend...");
    await fetch(url, { method: "GET" })
      .then((response) => response.text())
      .then((response) => setServerNotification(response))
      .catch((err) => console.log(err));
  };

  const setNotification = (message) => {
    // delete if any
    toast.dismiss(toastId.current);
    if (message) {
      // add if text is present
      toast.warn(message, {
        position: "bottom-right",
        autoClose: 10000,
        closeOnClick: true,
      });
    }
  };

  return (
    <Fragment>
      <h1 align="center">Test Server Send Events</h1>
      <hr />
      <div align="center">
        <h3>Send external event for reset configuration</h3>
        <label htmlFor="sendMessageInput"></label>
        <input
          name="sendMessageInput"
          type="text"
          ref={sendExternalRef}
          placeholder="Empty for inactive"
        />
        <button onClick={sendExternalEvent}>Send</button>
        <br />
        <p>{serverNotification}</p>
      </div>

      <ToastContainer />
    </Fragment>
  );
}
