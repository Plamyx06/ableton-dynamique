window.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("menuButton");
  const navOpenElement = document.getElementById("navbar__js--open");
  const allNavbarElement = document.getElementById("navbarAll");
  const logoElement = document.getElementById("main-nav__logo__image--js");
  const arrowMenu = document.getElementById("arrowMenu");

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
    arrowMenu.style.transform = `rotate(${180}deg)`;
  }

  function closeNavbar() {
    navOpenElement.style.display = "none";
    menuButton.style.color = "";
    logoElement.style.fill = "";
    navOpenElement.style.color = "";
    allNavbarElement.style.backgroundColor = "";
    navOpenElement.style.backgroundColor = "";
    menuButton.setAttribute("data-open", false);
    arrowMenu.style.transform = `rotate(${0}deg)`;
  }
});
