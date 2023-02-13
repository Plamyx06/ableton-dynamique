window.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("menuButton");
  let navOpenElement = document.getElementById("navbar__js--open");
  let allNavbarElement = document.getElementById("navbarAll");
  let logoElement = document.getElementById("main-nav__logo__image--js");

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("data-open") === "true";

    if (isOpen) {
      closeNavbar();
    } else {
      openNavbar();
    }
  });

  function openNavbar() {
    navOpenElement.style.display = "block";
    navOpenElement.style.zIndex = "1";
    menuButton.style.color = "white";
    logoElement.style.fill = "white";
    navOpenElement.style.color = "white";
    allNavbarElement.style.backgroundColor = "blue";
    navOpenElement.style.backgroundColor = "blue";
    menuButton.setAttribute("data-open", true);
  }

  function closeNavbar() {
    navOpenElement.style.display = "none";
    menuButton.style.color = "";
    logoElement.style.fill = "";
    navOpenElement.style.color = "";
    allNavbarElement.style.backgroundColor = "";
    navOpenElement.style.backgroundColor = "";
    menuButton.setAttribute("data-open", false);
  }
});
