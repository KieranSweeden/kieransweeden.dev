const activeNavLinkElement = document.querySelector(
  `a[href="${window.location.pathname}"]`
);

if (activeNavLinkElement) {
  activeNavLinkElement.classList.remove("text-zinc-500");
  activeNavLinkElement.classList.add("text-zinc-200");
} else {
  console.error("Could not find active nav link element");
}
