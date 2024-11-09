document.addEventListener("DOMContentLoaded", function () {
  const avatarButton = document.getElementById("avatarButton");
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (avatarButton && dropdownMenu) {
    // Toggle dropdown when avatar is clicked
    avatarButton.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (
        !avatarButton.contains(e.target) &&
        !dropdownMenu.contains(e.target)
      ) {
        dropdownMenu.classList.remove("show");
      }
    });

    // Close dropdown when pressing Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        dropdownMenu.classList.remove("show");
      }
    });
  }
});
