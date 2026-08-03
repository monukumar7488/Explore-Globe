// ==========================================
// Explore Globe 2.0
// Main JavaScript
// ==========================================

// -------------------------------
// Sticky Navbar
// -------------------------------

const navbar = document.querySelector(".glass-navbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 80) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// -------------------------------
// Scroll To Top Button
// -------------------------------

const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {
  if (window.pageYOffset > 300) {
    topBtn.style.display = "block";
  } else {
    topBtn.style.display = "none";
  }
});

topBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,

    behavior: "smooth",
  });
});

// -------------------------------
// Counter Animation
// -------------------------------

const counters = document.querySelectorAll(".counter");

const speed = 200;

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const counter = entry.target;

      const target = +counter.dataset.target;

      let count = 0;

      const update = () => {
        const increment = target / speed;

        if (count < target) {
          count += increment;

          counter.innerText = Math.ceil(count);

          requestAnimationFrame(update);
        } else {
          counter.innerText = target + "+";
        }
      };

      update();

      counterObserver.unobserve(counter);
    }
  });
});

counters.forEach((counter) => {
  counterObserver.observe(counter);
});

// -------------------------------
// Reveal Animation
// -------------------------------

const revealElements = document.querySelectorAll(
  ".category-card,.destination-card,.package-card,.gallery-img,.accordion-item,.card,.offer-section",
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-up");

        entry.target.classList.add("show");
      }
    });
  },
  {
    threshold: 0.15,
  },
);

revealElements.forEach((el) => {
  revealObserver.observe(el);
});

// -------------------------------
// Active Navbar
// -------------------------------

const sections = document.querySelectorAll("section");

const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 150;

    if (pageYOffset >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");

    if (link.href.includes(current)) {
      link.classList.add("active");
    }
  });
});

// -------------------------------
// Smooth Scroll
// -------------------------------

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const target = document.querySelector(this.getAttribute("href"));

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      });
    }
  });
});

// -------------------------------
// Loading Animation
// -------------------------------

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// -------------------------------
// Hero Text Animation
// -------------------------------

const heroTitle = document.querySelector(".hero h1");

if (heroTitle) {
  heroTitle.animate(
    [
      {
        opacity: 0,

        transform: "translateY(50px)",
      },

      {
        opacity: 1,

        transform: "translateY(0)",
      },
    ],

    {
      duration: 1200,

      easing: "ease-out",
    },
  );
}

// -------------------------------
// Newsletter Validation
// -------------------------------

const newsletterBtn = document.querySelector(".input-group button");

if (newsletterBtn) {
  newsletterBtn.addEventListener("click", () => {
    const email = document.querySelector(".input-group input").value;

    if (email === "") {
      alert("Please enter your email.");

      return;
    }

    alert("Thank you for subscribing!");
  });
}

// -------------------------------
// Search Button
// -------------------------------

const searchBtn = document.querySelector(".booking-card button");

if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    alert("Search feature will be connected with backend soon.");
  });
}
