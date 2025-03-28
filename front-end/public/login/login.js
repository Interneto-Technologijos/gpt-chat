const login = () => {
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: document.getElementById("usernameInput").value,
      password: document.getElementById("passwordInput").value,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        alert("Invalid username or password");
        throw new Error("Invalid username or password");
      }
      return response.json();
    })
    .then((_response) => {
      window.location.href = "/index.html";
    });
};
