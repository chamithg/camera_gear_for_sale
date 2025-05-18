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
