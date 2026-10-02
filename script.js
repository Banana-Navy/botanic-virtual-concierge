(() => {
  const header = document.querySelector("[data-header]");
  const heroImage = document.querySelector(".hero-image");
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".main-navigation");
  const dialog = document.querySelector("#concierge-dialog");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const menuLabel = menuToggle?.querySelector(".sr-only");

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const setMenuLabel = (label) => {
    menuToggle?.setAttribute("aria-label", label);
    if (menuLabel) menuLabel.textContent = label;
  };

  const closeMenu = ({ restoreFocus = false } = {}) => {
    menuToggle?.setAttribute("aria-expanded", "false");
    navigation?.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    setMenuLabel("Open navigation");
    if (restoreFocus) menuToggle?.focus({ preventScroll: true });
  };

  menuToggle?.addEventListener("click", () => {
    const opening = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(opening));
    navigation?.classList.toggle("is-open", opening);
    document.body.classList.toggle("menu-open", opening);
    setMenuLabel(opening ? "Close navigation" : "Open navigation");
  });

  navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1020) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
      closeMenu({ restoreFocus: true });
    }
  });

  let scrollFrame = 0;
  const updateScrollEffects = () => {
    scrollFrame = 0;
    const scrollY = window.scrollY;
    header?.classList.toggle("is-scrolled", scrollY > 12);
    if (heroImage && !reducedMotion.matches) {
      heroImage.style.setProperty("--hero-shift", `${Math.min(scrollY * 0.055, 46)}px`);
    }
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollEffects);
    },
    { passive: true },
  );
  updateScrollEffects();

  const revealNodes = [...document.querySelectorAll(".reveal")];
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );
    revealNodes.forEach((node) => revealObserver.observe(node));
  }

  if (finePointer.matches && !reducedMotion.matches) {
    document.querySelectorAll("[data-bento]").forEach((card) => {
      const reset = () => {
        card.style.setProperty("--bento-x", "50%");
        card.style.setProperty("--bento-y", "50%");
        card.style.setProperty("--bento-rotate-x", "0deg");
        card.style.setProperty("--bento-rotate-y", "0deg");
      };

      const move = (event) => {
        const bounds = card.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
        const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
        card.style.setProperty("--bento-x", `${(x * 100).toFixed(1)}%`);
        card.style.setProperty("--bento-y", `${(y * 100).toFixed(1)}%`);
        card.style.setProperty("--bento-rotate-x", `${((0.5 - y) * 3.2).toFixed(2)}deg`);
        card.style.setProperty("--bento-rotate-y", `${((x - 0.5) * 4).toFixed(2)}deg`);
      };

      const pointerOut = (event) => {
        if (!event.relatedTarget || !card.contains(event.relatedTarget)) reset();
      };

      card.addEventListener("pointermove", move, { passive: true });
      card.addEventListener("pointerleave", reset);
      card.addEventListener("pointerout", pointerOut);
    });
  }

  const openConcierge = () => {
    closeMenu();
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  };

  const closeConcierge = () => {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
  };

  document.querySelectorAll("[data-open-concierge]").forEach((button) => {
    button.addEventListener("click", openConcierge);
  });

  document.querySelectorAll("[data-close-concierge]").forEach((button) => {
    button.addEventListener("click", closeConcierge);
  });

  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeConcierge();
  });

})();
