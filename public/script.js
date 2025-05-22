window.addEventListener("DOMContentLoaded", loadCart);
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

        //add to cart functionality
        const cartBtn = card.querySelector(".add_to_cart_btn");
        cartBtn.dataset.itemId = item.id;
        cartBtn.addEventListener("click", () => {
          addToCart(item.id);
        });

        // add to wishlist functionality

        const wishBtn = card.querySelector(".add_to_wish_btn");
        wishBtn.dataset.itemId = item.id;
        wishBtn.addEventListener("click", () => {
          addToWishlist(item.id);
        });

        container.appendChild(card);
      });
    }
  })
  .catch((error) => {
    console.error("Error fetching inventory:", error);
    document.getElementById("inventory").innerHTML =
      "<p>Error loading inventory.</p>";
  });

// retrive shopping cart
async function loadCart() {
  const container = document.getElementById("cart-container");
  const template = document.getElementById("cart-card-template");
  const total_amount = document.getElementById("cart-total");

  try {
    const res = await fetch("/api/cart");

    if (!res.ok) {
      throw new Error("Failed to fetch cart data");
    }

    const cartItems = await res.json();
    let total = 0;

    if (cartItems.length === 0) {
      container.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }

    cartItems.forEach((item) => {
      const card = template.content.cloneNode(true);

      // Set image source
      card.querySelector("img").src = `/${item.image_url}.png`;
      card.querySelector("img").alt = item.name;

      // Set name and description
      card.querySelector(".item-name").textContent = item.name;
      card.querySelector(".item-description").textContent = "Black";

      // Quantity
      card.querySelector(".item-quantity").textContent = item.quantity;

      // Price and tax
      const price = parseFloat(item.price);
      const tax = parseFloat((price * 0.1).toFixed(2));
      const priceWithTaxEach = price + tax;
      const unitTotal = priceWithTaxEach * item.quantity;

      // Update total
      total += unitTotal;

      card.querySelector(".item-price").textContent = `Price: $${(
        price * item.quantity
      ).toFixed(2)}`;
      card.querySelector(".item-tax").textContent = `Tax: $${(
        tax * item.quantity
      ).toFixed(2)}`;

      // quantity update

      const plusBtn = card.querySelector(".fa-plus");
      const minusBtn = card.querySelector(".fa-minus");

      plusBtn.style.cursor = "pointer";
      minusBtn.style.cursor = "pointer";

      plusBtn.addEventListener("click", () => {
        updateQuantity(item.id, "increase");
      });

      minusBtn.addEventListener("click", () => {
        updateQuantity(item.id, "decrease");
      });

      container.appendChild(card);
    });

    total_amount.textContent = `Total: $${total.toFixed(2)}`;
  } catch (err) {
    const loggedIn = await isUserLoggedIn();
    if (!loggedIn) {
      container.innerHTML = "<p>Please login to add items to cart!</p>";
    } else {
      console.error("Failed to load cart items:", err);
      container.innerHTML = "<p>Error loading cart.</p>";
    }
  }
}

// session check-in when loading pages

window.addEventListener("DOMContentLoaded", () => {
  fetch("/api/session-status")
    .then((res) => res.json())
    .then((data) => {
      if (data.loggedIn) {
        console.log("User is logged in:", data.username);
        document.getElementById("logout-btn")?.classList.remove("hidden");
        document.getElementById("profile-btn")?.classList.remove("hidden");
        document.getElementById("login-btn")?.classList.add("hidden");
        document.getElementById("user_name_context").textContent =
          data.username;
      } else {
        document.getElementById("logout-btn")?.classList.add("hidden");
        document.getElementById("profile-btn")?.classList.add("hidden");
        document.getElementById("login-btn")?.classList.remove("hidden");
      }
    })
    .catch((err) => {
      console.error("Session check failed:", err);
    });
});

// session check-in on request
async function isUserLoggedIn() {
  try {
    const res = await fetch("/api/session-status");
    const data = await res.json();
    return data.loggedIn === true;
  } catch (err) {
    console.error("Session check failed:", err);
    return false;
  }
}
//add to cart
async function addToCart(itemId) {
  const loggedIn = await isUserLoggedIn();
  if (!loggedIn) {
    alertbox.render({
      alertIcon: "warning",
      title: "Not Logged In",
      message: "Please log in to add items to your cart.",
      btnTitle: "Login",
      border: true,
    });
  } else {
    fetch("/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alertbox.render({
            alertIcon: "success",
            title: "Added!",
            message: "Item added to cart.",
            btnTitle: "OK",
            border: true,
          });
        }
      })
      .catch((err) => {
        console.error("Add to cart failed", err);
      });
  }
}
// update quantity
function updateQuantity(itemId, action) {
  fetch(`/cart/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ itemId }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        location.reload(); // Reload the cart with updated values
      }
    })
    .catch((err) => {
      console.error("Failed to update quantity:", err);
    });
}

// add to wishlist

async function addToWishlist(itemId) {
  const loggedIn = await isUserLoggedIn();
  if (!loggedIn) {
    alertbox.render({
      alertIcon: "warning",
      title: "Not Logged In",
      message: "Please log in to add items to your wishlist.",
      btnTitle: "Login",
      border: true,
    });
  } else {
    fetch("/wishlist/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.inWishlist) {
          alertbox.render({
            alertIcon: "info",
            title: "Already Saved",
            message: "Item is already in the wishlist",
            btnTitle: "OK",
            border: true,
          });
        } else if (data.success) {
          alertbox.render({
            alertIcon: "success",
            title: "Added!",
            message: "Item added to wishlist.",
            btnTitle: "OK",
            border: true,
          });
        }
      })
      .catch((err) => {
        console.error("Add to wishlist failed", err);
      });
  }
}

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
  } else if (status === "logged_out") {
    alertbox.render({
      alertIcon: "info",
      title: "Logged Out",
      message: "You have been logged out successfully.",
      btnTitle: "OK",
      border: true,
    });
  }
}
