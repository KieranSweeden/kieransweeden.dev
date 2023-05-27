const activeNavLinkElements: HTMLAnchorElement[] = Array.from(
  document.querySelectorAll(`a[href="${window.location.pathname}"]`)
);

if (activeNavLinkElements && activeNavLinkElements.length) {
  for (const link of activeNavLinkElements) {
    link.classList.remove("text-zinc-500");
    link.classList.add("text-zinc-200");
  }
} else {
  console.error("Could not find active nav link element");
}
