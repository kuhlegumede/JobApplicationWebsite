const MessageList = ({ messages }) => {
  return (
    <div>
      {messages.length === 0 ? (
        <p>No messages to display.</p>
      ) : (
        messages.map((msg, index) => (
          <div key={index} className="message-item">
            <h4>{msg.sender}</h4>
            <p>{msg.text}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default MessageList;
