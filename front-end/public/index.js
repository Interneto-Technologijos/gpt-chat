const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const inputPrompt = (event) => {
  console.log(event);
  if (event.key === "Enter") {
    promptMessage();
  }
};

const promptChat = (chatId) => {
  const promptInput = document.getElementById("promptInput");
  const message = promptInput.value;
  const chat = document.getElementById("chat");
  chat.innerHTML += `<p class="userMessage">${escapeHtml(message)}</p>`;
  promptInput.value = "";
  return fetch(`/prompt-chat/${chatId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const pId = generateUniqueId();
    chat.innerHTML += `<p id="${pId}" class="agentMessage" />`;
    const p = document.getElementById(pId);

    var reader = response.body.getReader();
    var decoder = new TextDecoder();

    const readChunk = () => {
      return reader.read().then(appendChunks);
    };

    const appendChunks = (result) => {
      var chunk = decoder.decode(result.value || new Uint8Array(), {
        stream: !result.done,
      });
      console.log("got chunk of", chunk.length, "bytes");
      p.innerHTML += chunk;
      if (result.done) {
        return;
      } else {
        return readChunk();
      }
    };

    return readChunk();
  });
};

let chatId = null;

const promptMessage = () => {
  if (!chatId) {
    fetch("/new-chat", {
      method: "POST",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error creating new chat");
        }
        return response.json();
      })
      .then((response) => {
        chatId = response.chatId;
        return promptChat(chatId);
      });
  } else {
    promptChat(chatId);
  }
};
