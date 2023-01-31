document.getElementById("navbar__menu--js").addEventListener("click", () => {
  let navOpen = document.getElementById("navbar__js--open");
  let navClose = document.getElementById("navbar__js--close");
  navOpen.style.display = "block";
  navClose.style.display = "none";
});
document
  .getElementById("navbar__menu--js--open")
  .addEventListener("click", () => {
    let navOpen = document.getElementById("navbar__js--open");
    let navClose = document.getElementById("navbar__js--close");
    navOpen.style.display = "none";
    navClose.style.display = "";
  });
