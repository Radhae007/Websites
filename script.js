// main.js - consolidated and fixed JS for index.html

(function() {
  // robust cart initialization
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem('sonysPickleCart')) || [];
  } catch (e) {
    cart = [];
    try { localStorage.setItem('sonysPickleCart', JSON.stringify(cart)); } catch (err) {}
  }

  let currentSlideIndex = 0;
  let slideInterval = null;

  document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    initializeSlideshow();
    setupJarAnimations();
    syncCartAcrossPages();

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      const dropdown = document.getElementById('dropdownMenu');
      const hamburger = document.querySelector('.hamburger-menu');
      if (!dropdown || !hamburger) return;
      if (!hamburger.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('active');
        hamburger.classList.remove('active');
      }
    });
  });

  // -------------------------
  // Cart functions
  // -------------------------
  function initializeCart() {
    updateCartCounter();
  }

  function addToCart(name, price, image, productId) {
    // update cart array
    const existing = cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity = (existing.quantity || 0) + 1;
    } else {
      cart.push({ id: productId, name: name, price: price, image: image, quantity: 1 });
    }

    try {
      localStorage.setItem('sonysPickleCart', JSON.stringify(cart));
    } catch (e) {
      console.error('Could not save cart to localStorage', e);
    }

    updateCartCounter();
    showCartNotification();

    // Try to animate the button that triggered addToCart.
    try {
      let button = document.querySelector(`button[onclick*="${productId}"]`);
      if (!button) {
        // fallback: activeElement or nothing
        button = document.activeElement && (document.activeElement.tagName === 'BUTTON' ? document.activeElement : null);
      }
      if (button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => { button.style.transform = ''; }, 150);
      }
    } catch (e) {
      // silent
    }

    console.log('Added to cart:', name);
  }

  function updateCartCounter() {
    const counter = document.getElementById('cartCounter');
    if (!counter) return;
    let stored = [];
    try { stored = JSON.parse(localStorage.getItem('sonysPickleCart')) || []; } catch (e) { stored = []; }
    const totalItems = stored.reduce((sum, item) => sum + (item.quantity || 0), 0);
    if (totalItems > 0) {
      counter.textContent = totalItems;
      counter.classList.remove('hidden');
      // trigger animation
      counter.style.animation = 'none';
      // force reflow
      void counter.offsetWidth;
      counter.style.animation = 'cartPulse 0.5s ease-in-out';
    } else {
      counter.classList.add('hidden');
    }
  }

  function showCartNotification() {
    const notification = document.getElementById('cartNotification');
    if (!notification) return;
    notification.classList.add('show');
    setTimeout(() => { notification.classList.remove('show'); }, 3000);
  }

  // -------------------------
  // Dropdown (hamburger)
  // -------------------------
  function toggleDropdown() {
    const dropdown = document.getElementById('dropdownMenu');
    const hamburger = document.querySelector('.hamburger-menu');
    if (!dropdown || !hamburger) return;
    dropdown.classList.toggle('active');
    hamburger.classList.toggle('active');
  }

  // -------------------------
  // Slideshow functions
  // -------------------------
  function initializeSlideshow() {
    const slides = document.querySelectorAll('.slide');
    if (!slides || slides.length === 0) return;
    showSlide(0);
    startSlideshow();
  }

  function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    if (!slides || slides.length === 0) return;

    // normalize index
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;

    slides.forEach(s => s.classList.remove('active'));
    indicators.forEach(i => i.classList.remove('active'));

    if (slides[index]) slides[index].classList.add('active');
    if (indicators[index]) indicators[index].classList.add('active');

    currentSlideIndex = index;
  }

  function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    if (!slides || slides.length === 0) return;
    currentSlideIndex += direction;
    if (currentSlideIndex >= slides.length) currentSlideIndex = 0;
    if (currentSlideIndex < 0) currentSlideIndex = slides.length - 1;
    showSlide(currentSlideIndex);
    resetSlideshow();
  }

  // Note: markup uses currentSlide(1/2...) so keep this name
  function currentSlide(index) {
    showSlide(index - 1);
    resetSlideshow();
  }

  function startSlideshow() {
    stopSlideshow();
    slideInterval = setInterval(() => { changeSlide(1); }, 5000);
  }

  function stopSlideshow() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  function resetSlideshow() {
    stopSlideshow();
    startSlideshow();
  }

  // -------------------------
  // Jar hover animation
  // -------------------------
  function setupJarAnimations() {
    const jarContainers = document.querySelectorAll('.jar-container');
    if (!jarContainers) return;

    jarContainers.forEach(container => {
      const jarImage = container.querySelector('.jar-image');
      if (!jarImage) return;

      let originalSrc = jarImage.src;
      let isAnimating = false;

      container.addEventListener('mouseenter', function() {
        if (isAnimating) return;
        isAnimating = true;
        startJarAnimation(jarImage, originalSrc).finally(() => { isAnimating = false; });
      });

      container.addEventListener('mouseleave', function() {
        isAnimating = false;
        jarImage.style.opacity = '0';
        setTimeout(() => {
          jarImage.src = originalSrc;
          jarImage.style.opacity = '1';
        }, 150);
      });
    });

    function startJarAnimation(jarImage, originalSrc) {
      return new Promise((resolve) => {
        const stages = [
          originalSrc,
          'images/jar-3-4.jpeg',
          'images/jar-half.jpeg',
          'images/jar-empty.png'
        ];
        let currentStage = 0;

        function animateStage() {
          if (currentStage >= stages.length) {
            resolve();
            return;
          }
          jarImage.style.opacity = '0';
          setTimeout(() => {
            jarImage.src = stages[currentStage];
            jarImage.style.opacity = '1';
            currentStage++;
            if (currentStage < stages.length) {
              setTimeout(animateStage, 600);
            } else {
              setTimeout(resolve, 600);
            }
          }, 150);
        }

        animateStage();
      });
    }
  }

  // -------------------------
  // Sync cart across tabs + focus
  // -------------------------
  function syncCartAcrossPages() {
    window.addEventListener('storage', function(e) {
      if (e.key === 'sonysPickleCart') {
        try { cart = JSON.parse(localStorage.getItem('sonysPickleCart')) || []; } catch (err) { cart = []; }
        updateCartCounter();
      }
    });

    window.addEventListener('focus', function() {
      try { cart = JSON.parse(localStorage.getItem('sonysPickleCart')) || []; } catch (err) { cart = []; }
      updateCartCounter();
    });
  }

  // expose functions used by inline attributes
  window.addToCart = addToCart;
  window.toggleDropdown = toggleDropdown;
  window.changeSlide = changeSlide;
  window.currentSlide = currentSlide;

})();
