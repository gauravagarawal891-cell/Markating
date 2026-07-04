// Contact Form Submit Handler
const contactForm = document.getElementById('contactForm');
const successMsg = document.getElementById('successMsg');
const errorMsg = document.getElementById('errorMsg');

function setMessageVisibility(element, visible) {
  if (!element) return;
  element.style.display = visible ? 'block' : 'none';
}

function showSuccess() {
  setMessageVisibility(errorMsg, false);
  setMessageVisibility(successMsg, true);
  setTimeout(() => {
    setMessageVisibility(successMsg, false);
  }, 4000);
}

function showError(message) {
  if (errorMsg) {
    errorMsg.textContent = message || 'Oops, something went wrong. Please try again.';
    setMessageVisibility(successMsg, false);
    setMessageVisibility(errorMsg, true);
  }
}

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const btn = contactForm.querySelector('.submit-btn');
    if (btn) {
      btn.textContent = 'Sending...';
      btn.disabled = true;
    }

    setMessageVisibility(successMsg, false);
    setMessageVisibility(errorMsg, false);

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(contactForm.action || '/api/inquiry', {
        method: contactForm.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const errorText = body?.error || body?.message || `${response.status} ${response.statusText}`;
        throw new Error(errorText);
      }

      showSuccess();
      contactForm.reset();
    } catch (error) {
      showError(error.message);
    } finally {
      if (btn) {
        btn.textContent = 'Send Message →';
        btn.disabled = false;
      }
    }
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Scroll reveal animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .pkg-card, .step').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
