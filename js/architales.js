(() => {
	"use strict";

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

	const preloader = document.getElementById("preloader");
	const header = document.getElementById("header");
	const navToggle = document.getElementById("navToggle");
	const siteNav = document.getElementById("siteNav");
	const cursor = document.getElementById("cursor");
	const cursorLabel = cursor ? cursor.querySelector(".cursor__label") : null;
	const yearEl = document.getElementById("year");
	const stickyBackToTop = document.getElementById("stickyBackToTop");

	// Set dynamic year in footer
	if (yearEl) yearEl.textContent = String(new Date().getFullYear());

	/* ——— Preloader & Intro Sequence ——— */
	/* ——— Preloader Sequence: Wait until whole logo is animated completely ——— */
	const bootSite = () => {
		if (preloader) preloader.classList.add("is-done");
		document.body.classList.add("is-ready");
		document.querySelectorAll(".hero .reveal-text, .hero .reveal-line").forEach((el) => {
			el.classList.add("is-inview");
		});
	};

	let logoAnimationDone = false;
	let pageDomReady = false;

	const tryBootSite = () => {
		if (logoAnimationDone && pageDomReady) {
			setTimeout(bootSite, 350); // Pause on fully drawn logo before unveiling page
		}
	};

	const lastLogoElement = document.querySelector(".preloader__text-svg");
	if (lastLogoElement) {
		lastLogoElement.addEventListener("animationend", () => {
			logoAnimationDone = true;
			tryBootSite();
		});
	}
	// Fallback to guarantee logo is fully animated (1.75s)
	setTimeout(() => {
		logoAnimationDone = true;
		tryBootSite();
	}, 1750);

	if (document.readyState === "complete") {
		pageDomReady = true;
		tryBootSite();
	} else {
		window.addEventListener("load", () => {
			pageDomReady = true;
			tryBootSite();
		});
	}

	/* ——— Header Scroll & Sticky Floating Back to Top ——— */
	const onScrollWindow = () => {
		const scY = window.scrollY;
		if (header) {
			header.classList.toggle("is-scrolled", scY > 40);
		}
		if (stickyBackToTop) {
			stickyBackToTop.classList.toggle("is-visible", scY > 350);
		}
	};
	onScrollWindow();
	window.addEventListener("scroll", onScrollWindow, { passive: true });

	if (stickyBackToTop) {
		stickyBackToTop.addEventListener("click", (e) => {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: "smooth" });
		});
	}

	/* ——— Mobile Navigation Menu ——— */
	if (navToggle && header && siteNav) {
		navToggle.addEventListener("click", () => {
			const open = header.classList.toggle("menu-open");
			navToggle.setAttribute("aria-expanded", open ? "true" : "false");
			navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
			document.body.style.overflow = open ? "hidden" : "";
		});

		siteNav.querySelectorAll("a").forEach((a) => {
			a.addEventListener("click", () => {
				header.classList.remove("menu-open");
				navToggle.setAttribute("aria-expanded", "false");
				document.body.style.overflow = "";
			});
		});
	}

	/* ——— Scroll Reveal Observer (Fast, Elegant, Non-delayed) ——— */
	const revealEls = document.querySelectorAll(
		".reveal-text, .reveal-line, .reveal-clip, .fade-up, .work-card, .gallery-item, .journal-card, .cat-item, .studio__figure"
	);

	// Add subtle stagger to grid & carousel items
	document.querySelectorAll(".gallery__grid, .journal__grid, .categories__nav-list").forEach((container) => {
		Array.from(container.children).forEach((child, i) => {
			child.style.transitionDelay = `${(i % 4) * 0.06}s`;
		});
	});

	if (reduceMotion) {
		revealEls.forEach((el) => el.classList.add("is-inview"));
	} else if ("IntersectionObserver" in window) {
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					entry.target.classList.add("is-inview");
					io.unobserve(entry.target);
				});
			},
			{ threshold: 0.04, rootMargin: "0px 0px -20px 0px" }
		);
		revealEls.forEach((el) => {
			// Check if already in viewport on load
			const rect = el.getBoundingClientRect();
			if (rect.top < window.innerHeight && rect.bottom > 0) {
				el.classList.add("is-inview");
			} else {
				io.observe(el);
			}
		});
	} else {
		revealEls.forEach((el) => el.classList.add("is-inview"));
	}

	/* ——— HERO BANNER SLIDESHOW & VERTICAL DOT CONTROLS (SEAMLESS CROSSFADE) ——— */
	const heroSlides = document.querySelectorAll(".hero__slide");
	const heroVerticalDots = document.querySelectorAll(".hero__vertical-dots .vertical-dot");
	const heroPrev = document.getElementById("heroPrev");
	const heroNext = document.getElementById("heroNext");
	const heroCounter = document.getElementById("heroCounter");
	let currentHeroSlide = 0;
	let previousHeroSlide = -1;
	let heroSlideTimer = null;
	let prevSlideCleanTimer = null;

	// Preload all hero slide images into memory
	heroSlides.forEach((slide) => {
		const img = slide.querySelector(".hero__slide-img");
		if (img && img.src) {
			const preloadImg = new Image();
			preloadImg.src = img.src;
		}
	});

	const showHeroSlide = (index) => {
		if (!heroSlides.length) return;
		if (index < 0) index = heroSlides.length - 1;
		if (index >= heroSlides.length) index = 0;
		if (index === currentHeroSlide && previousHeroSlide !== -1) return;

		previousHeroSlide = currentHeroSlide;
		currentHeroSlide = index;

		if (prevSlideCleanTimer) clearTimeout(prevSlideCleanTimer);

		heroSlides.forEach((slide, i) => {
			if (i === previousHeroSlide && previousHeroSlide !== currentHeroSlide) {
				slide.classList.add("is-prev");
				slide.classList.remove("is-active");
			} else if (i === currentHeroSlide) {
				slide.classList.remove("is-prev");
				slide.classList.add("is-active");
				const img = slide.querySelector(".hero__slide-img");
				if (img && !reduceMotion) {
					img.style.animation = "none";
					void img.offsetWidth;
					img.style.animation = "heroKenBurns 8s cubic-bezier(0.15, 0, 0.2, 1) forwards";
				}
			} else {
				slide.classList.remove("is-active", "is-prev");
			}
		});

		// Clean up is-prev after smooth crossfade has completely finished
		prevSlideCleanTimer = setTimeout(() => {
			heroSlides.forEach((slide, i) => {
				if (i !== currentHeroSlide) {
					slide.classList.remove("is-prev", "is-active");
				}
			});
		}, 1300);

		heroVerticalDots.forEach((dot, i) => {
			dot.classList.toggle("is-active", i === currentHeroSlide);
		});

		if (heroCounter) {
			const cur = String(currentHeroSlide + 1).padStart(2, "0");
			const tot = String(heroSlides.length).padStart(2, "0");
			heroCounter.textContent = `${cur} / ${tot}`;
		}
	};

	const startHeroAutoPlay = () => {
		stopHeroAutoPlay();
		heroSlideTimer = setInterval(() => {
			showHeroSlide(currentHeroSlide + 1);
		}, 3000); // 3-second autoplay per user request
	};

	const stopHeroAutoPlay = () => {
		if (heroSlideTimer) {
			clearInterval(heroSlideTimer);
			heroSlideTimer = null;
		}
	};

	if (heroSlides.length) {
		showHeroSlide(0);
		startHeroAutoPlay();

		if (heroPrev) {
			heroPrev.addEventListener("click", () => {
				showHeroSlide(currentHeroSlide - 1);
				startHeroAutoPlay();
			});
		}

		if (heroNext) {
			heroNext.addEventListener("click", () => {
				showHeroSlide(currentHeroSlide + 1);
				startHeroAutoPlay();
			});
		}

		heroVerticalDots.forEach((dot, i) => {
			dot.addEventListener("click", () => {
				showHeroSlide(i);
				startHeroAutoPlay();
			});
		});

		const heroSlider = document.getElementById("heroSlider");
		if (heroSlider) {
			heroSlider.addEventListener("mouseenter", stopHeroAutoPlay);
			heroSlider.addEventListener("mouseleave", startHeroAutoPlay);
			heroSlider.addEventListener("touchstart", stopHeroAutoPlay, { passive: true });
			heroSlider.addEventListener("touchend", startHeroAutoPlay, { passive: true });
		}
	}

	/* ——— ABOUT SECTION IMAGE (STATIC / NO PARALLAX) ——— */


	/* ——— SELECTED WORKS CARD CAROUSEL CONTROLS & AUTOPLAY ——— */
	const worksCarousel = document.getElementById("worksCarousel");
	const worksPrev = document.getElementById("worksPrev");
	const worksNext = document.getElementById("worksNext");
	const worksBar = document.getElementById("worksBar");
	let worksAutoTimer = null;

	if (worksCarousel) {
		const updateCarouselProgress = () => {
			if (!worksBar) return;
			const maxScroll = worksCarousel.scrollWidth - worksCarousel.clientWidth;
			if (maxScroll <= 0) {
				worksBar.style.width = "100%";
				return;
			}
			const pct = (worksCarousel.scrollLeft / maxScroll) * 100;
			const barWidth = Math.max(33.33, Math.min(100, pct + 33.33));
			worksBar.style.width = `${barWidth}%`;
		};

		worksCarousel.addEventListener("scroll", updateCarouselProgress, { passive: true });

		const getScrollStep = () => {
			const card = worksCarousel.querySelector(".work-card");
			if (!card) return 380;
			const style = window.getComputedStyle(worksCarousel);
			const gap = parseFloat(style.gap) || 24;
			return card.offsetWidth + gap;
		};

		const nextWorkSlide = () => {
			const maxScroll = worksCarousel.scrollWidth - worksCarousel.clientWidth;
			if (worksCarousel.scrollLeft >= maxScroll - 15) {
				worksCarousel.scrollTo({ left: 0, behavior: "smooth" });
			} else {
				worksCarousel.scrollBy({ left: getScrollStep(), behavior: "smooth" });
			}
		};

		const startWorksAutoPlay = () => {
			stopWorksAutoPlay();
			worksAutoTimer = setInterval(nextWorkSlide, 3000);
		};

		const stopWorksAutoPlay = () => {
			if (worksAutoTimer) {
				clearInterval(worksAutoTimer);
				worksAutoTimer = null;
			}
		};

		startWorksAutoPlay();
		// Autoplay does not stop on hover per user request

		if (worksPrev) {
			worksPrev.addEventListener("click", () => {
				stopWorksAutoPlay();
				worksCarousel.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
				startWorksAutoPlay();
			});
		}

		if (worksNext) {
			worksNext.addEventListener("click", () => {
				stopWorksAutoPlay();
				nextWorkSlide();
				startWorksAutoPlay();
			});
		}
	}

	/* ——— SPATIAL INDEX: SMOOTH BI-DIRECTIONAL STICKY SCROLLING ——— */
	const spatialTrack = document.querySelector(".categories-scroll-track");
	const spatialItems = document.querySelectorAll(".categories__nav-list .cat-item");
	const spatialVisualImgs = document.querySelectorAll(".cat-visual-img");
	const spatialTag = document.getElementById("spatialVisualTag");
	const spatialProgress = document.getElementById("spatialProgress");

	const spatialDisciplines = [
		{ name: "Architecture Discipline", key: "architecture" },
		{ name: "Interior Design Discipline", key: "interior" },
		{ name: "Residential Living Discipline", key: "residential" },
		{ name: "Commercial Realms Discipline", key: "commercial" },
	];

	let currentSpatialIndex = 0;

	const setSpatialActive = (index) => {
		if (index < 0) index = 0;
		if (index >= spatialItems.length) index = spatialItems.length - 1;
		if (index === currentSpatialIndex && spatialItems[index]?.classList.contains("is-active")) return;
		currentSpatialIndex = index;

		spatialItems.forEach((item, i) => {
			item.classList.toggle("is-active", i === currentSpatialIndex);
		});

		const key = spatialDisciplines[currentSpatialIndex]?.key || "architecture";
		spatialVisualImgs.forEach((img) => {
			img.classList.toggle("is-visible", img.getAttribute("data-cat-img") === key);
		});

		if (spatialTag) {
			spatialTag.textContent = spatialDisciplines[currentSpatialIndex]?.name || "Discipline";
		}

		if (spatialProgress) {
			const pct = ((currentSpatialIndex + 1) / spatialItems.length) * 100;
			spatialProgress.style.width = `${pct}%`;
		}
	};

	if (spatialTrack && spatialItems.length) {
		let isTicking = false;

		const updateSpatialOnScroll = () => {
			if (window.innerWidth <= 1024) return;
			const rect = spatialTrack.getBoundingClientRect();
			const totalTrackScroll = spatialTrack.offsetHeight - window.innerHeight;
			if (totalTrackScroll <= 0) return;

			const scrolledPast = -rect.top;
			if (scrolledPast <= 0) {
				setSpatialActive(0);
				return;
			}
			if (scrolledPast >= totalTrackScroll) {
				setSpatialActive(spatialItems.length - 1);
				return;
			}

			const progress = Math.max(0, Math.min(1, scrolledPast / totalTrackScroll));
			const index = Math.min(
				spatialItems.length - 1,
				Math.floor(progress * spatialItems.length)
			);
			setSpatialActive(index);
		};

		window.addEventListener(
			"scroll",
			() => {
				if (!isTicking) {
					requestAnimationFrame(() => {
						updateSpatialOnScroll();
						isTicking = false;
					});
					isTicking = true;
				}
			},
			{ passive: true }
		);

		// Click interactions (no hover switch per user request: only scroll or click)
		spatialItems.forEach((item, i) => {
			item.addEventListener("click", () => setSpatialActive(i));
		});
	}

	/* ——— CURATED GALLERY FILTERING & LIGHTBOX MODAL ——— */
	const galleryTabs = document.querySelectorAll(".gallery-tab");
	const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
	const galleryModal = document.getElementById("galleryModal");
	const modalBackdrop = document.getElementById("modalBackdrop");
	const modalClose = document.getElementById("modalClose");
	const modalPrev = document.getElementById("modalPrev");
	const modalNext = document.getElementById("modalNext");
	const modalImg = document.getElementById("modalImg");
	const modalTitle = document.getElementById("modalTitle");
	const modalCat = document.getElementById("modalCat");
	const modalLoc = document.getElementById("modalLoc");
	const modalDesc = document.getElementById("modalDesc");
	const modalCounter = document.getElementById("modalCounter");
	const modalInquire = document.getElementById("modalInquire");

	let currentFilter = "all";
	let visibleItems = [...galleryItems];
	let currentModalIndex = 0;

	// Tab filtering
	galleryTabs.forEach((tab) => {
		tab.addEventListener("click", () => {
			galleryTabs.forEach((t) => {
				t.classList.remove("is-active");
				t.setAttribute("aria-selected", "false");
			});
			tab.classList.add("is-active");
			tab.setAttribute("aria-selected", "true");

			currentFilter = tab.getAttribute("data-filter") || "all";

			visibleItems = galleryItems.filter((item) => {
				const categories = (item.getAttribute("data-category") || "").split(" ");
				const matches = currentFilter === "all" || categories.includes(currentFilter);
				if (matches) {
					item.classList.remove("is-hidden");
					item.style.animation = "none";
					void item.offsetWidth;
					item.style.animation = "revealItem 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards";
				} else {
					item.classList.add("is-hidden");
				}
				return matches;
			});
		});
	});

	// Lightbox Modal Functions
	const updateModalContent = (index) => {
		if (!visibleItems.length) return;
		if (index < 0) index = visibleItems.length - 1;
		if (index >= visibleItems.length) index = 0;
		currentModalIndex = index;

		const item = visibleItems[currentModalIndex];
		const imgUrl = item.getAttribute("data-img") || "";
		const title = item.getAttribute("data-title") || "Architectural Project";
		const cat = item.getAttribute("data-cat") || "Architecture";
		const loc = item.getAttribute("data-location") || "Gujarat, India";
		const desc = item.getAttribute("data-desc") || "Bespoke spatial design by The Architales Design.";

		if (modalImg) {
			modalImg.src = imgUrl;
			modalImg.alt = title;
		}
		if (modalTitle) modalTitle.textContent = title;
		if (modalCat) modalCat.textContent = cat;
		if (modalLoc) modalLoc.textContent = loc;
		if (modalDesc) modalDesc.textContent = desc;
		if (modalCounter) {
			const current = String(currentModalIndex + 1).padStart(2, "0");
			const total = String(visibleItems.length).padStart(2, "0");
			modalCounter.textContent = `${current} / ${total}`;
		}
	};

	const openModal = (item) => {
		const index = visibleItems.indexOf(item);
		if (index !== -1) {
			updateModalContent(index);
		} else {
			visibleItems = [...galleryItems];
			updateModalContent(galleryItems.indexOf(item));
		}
		if (galleryModal) {
			galleryModal.classList.add("is-open");
			galleryModal.setAttribute("aria-hidden", "false");
			document.body.style.overflow = "hidden";
		}
	};

	const closeModal = () => {
		if (galleryModal) {
			galleryModal.classList.remove("is-open");
			galleryModal.setAttribute("aria-hidden", "true");
			document.body.style.overflow = "";
		}
	};

	galleryItems.forEach((item) => {
		item.addEventListener("click", () => openModal(item));
	});

	if (modalClose) modalClose.addEventListener("click", closeModal);
	if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);

	if (modalPrev) {
		modalPrev.addEventListener("click", (e) => {
			e.stopPropagation();
			updateModalContent(currentModalIndex - 1);
		});
	}

	if (modalNext) {
		modalNext.addEventListener("click", (e) => {
			e.stopPropagation();
			updateModalContent(currentModalIndex + 1);
		});
	}

	if (modalInquire) {
		modalInquire.addEventListener("click", () => {
			closeModal();
		});
	}

	window.addEventListener("keydown", (e) => {
		if (!galleryModal || !galleryModal.classList.contains("is-open")) return;
		if (e.key === "Escape") {
			closeModal();
		} else if (e.key === "ArrowLeft") {
			updateModalContent(currentModalIndex - 1);
		} else if (e.key === "ArrowRight") {
			updateModalContent(currentModalIndex + 1);
		}
	});

	/* ——— Precision Custom Cursor & Micro-Interactions ——— */
	if (cursor && finePointer && !reduceMotion) {
		let x = window.innerWidth / 2;
		let y = window.innerHeight / 2;
		let cx = x;
		let cy = y;

		const tickCursor = () => {
			cx += (x - cx) * 0.22;
			cy += (y - cy) * 0.22;
			cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
			requestAnimationFrame(tickCursor);
		};

		window.addEventListener(
			"pointermove",
			(e) => {
				x = e.clientX;
				y = e.clientY;
				cursor.classList.add("is-on");
			},
			{ passive: true }
		);

		window.addEventListener("pointerleave", () => {
			cursor.classList.remove("is-on");
		});

		// Project Card Hover
		document.querySelectorAll("[data-cursor='project']").forEach((el) => {
			el.addEventListener("pointerenter", () => {
				cursor.classList.add("is-project");
				if (cursorLabel) cursorLabel.textContent = "View Project →";
			});
			el.addEventListener("pointerleave", () => cursor.classList.remove("is-project"));
		});

		// Gallery Item Hover
		document.querySelectorAll("[data-cursor='gallery']").forEach((el) => {
			el.addEventListener("pointerenter", () => {
				cursor.classList.add("is-gallery");
				if (cursorLabel) cursorLabel.textContent = "Enlarge ↗";
			});
			el.addEventListener("pointerleave", () => cursor.classList.remove("is-gallery"));
		});

		// Standard Interactive Links & Buttons
		document.querySelectorAll("a, button, [data-magnetic]").forEach((el) => {
			el.addEventListener("pointerenter", () => {
				if (!cursor.classList.contains("is-project") && !cursor.classList.contains("is-gallery")) {
					cursor.classList.add("is-link");
				}
			});
			el.addEventListener("pointerleave", () => cursor.classList.remove("is-link"));
		});

		requestAnimationFrame(tickCursor);
	}

	/* ——— Subtle Magnetic Links & Buttons ——— */
	if (finePointer && !reduceMotion) {
		document.querySelectorAll("[data-magnetic]").forEach((el) => {
			el.addEventListener("pointermove", (e) => {
				const r = el.getBoundingClientRect();
				const dx = (e.clientX - (r.left + r.width / 2)) * 0.16;
				const dy = (e.clientY - (r.top + r.height / 2)) * 0.16;
				el.style.transform = `translate(${dx}px, ${dy}px)`;
			});
			el.addEventListener("pointerleave", () => {
				el.style.transform = "";
			});
		});
	}
})();
