console.log("Script loaded");
fetch("/api/inventory")
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("inventory");
    const template = document.getElementById("store-card-template");

    if (data.length === 0) {
      container.innerHTML = "<p>No inventory available.</p>";
    } else {
      data.forEach((item) => {
        const card = template.content.cloneNode(true);

        // Fill in the content
        card.querySelector("img").src = `/${item.image_url}.png`;
        card.querySelector("img").alt = item.name;
        card.querySelector(".item-name").textContent = item.name;
        card.querySelector(".item-description").textContent = item.description;
        card.querySelector(
          ".item-price"
        ).textContent = `Price: $${item.price.toFixed(2)}`;

        container.appendChild(card);
      });
    }
  })
  .catch((error) => {
    console.error("Error fetching inventory:", error);
    document.getElementById("inventory").innerHTML =
      "<p>Error loading inventory.</p>";
  });

// alerts

function showAlertFromParams() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");
  const status = params.get("status");

  if (error === "password_mismatch") {
    alertbox.render({
      alertIcon: "warning",
      title: "Attention!",
      message: "Password does not match",
      btnTitle: "Ok",
      border: true,
    });
  } else if (error === "username_exists") {
    alertbox.render({
      alertIcon: "warning",
      title: "Attention!",
      message: "User Exists",
      btnTitle: "Ok",
      border: true,
    });
  } else if (error === "server_error") {
    alertbox.render({
      alertIcon: "warning",
      title: "Attention!",
      message: "Internal server error occured, Please try again",
      btnTitle: "Ok",
      border: true,
    });
  } else if (error === "invalid_credentials") {
    alertbox.render({
      alertIcon: "error",
      title: "Login Failed",
      message: "Invalid username or password.",
      btnTitle: "Try Again",
      border: true,
    });
  } else if (error === "missing_fields") {
    alertbox.render({
      alertIcon: "error",
      title: "Login Failed",
      message: "Missing fields.",
      btnTitle: "Try Again",
      border: true,
    });
  }
  if (status === "created") {
    alertbox.render({
      alertIcon: "success",
      title: "Success!",
      message: "User Created. Please Login!",
      btnTitle: "Ok",
      border: true,
    });
  } else if (status === "loggedin") {
    alertbox.render({
      alertIcon: "success",
      title: "Success!",
      message: "Logged in!",
      btnTitle: "Ok",
      border: true,
    });
  }
}
