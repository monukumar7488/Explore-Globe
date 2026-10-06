// Explore Globe - sends the booking form on register.html to the backend.
// Needs js/session.js loaded first.
(function () {
  const Auth = window.ExploreAuth;
  if (!Auth) {
    console.error('session.js must be loaded before booking.js');
    return;
  }

  const PHONE_RE = /^\+?[0-9\s-]{10,15}$/;

  const form = document.getElementById('registerForm');
  const box = document.getElementById('bookingAlert');
  if (!form || !box) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const field = (name) => form.querySelector(`[name="${name}"]`);

  function showAlert(message, type) {
    box.className = `alert alert-${type}`;
    box.textContent = message;
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showLoginPrompt() {
    box.className = 'alert alert-info';
    box.textContent = 'Please ';

    const login = document.createElement('a');
    login.href = 'login.html?next=register.html';
    login.className = 'alert-link';
    login.textContent = 'log in';

    const signup = document.createElement('a');
    signup.href = 'signup.html?next=register.html';
    signup.className = 'alert-link';
    signup.textContent = 'create an account';

    box.append(login, ' or ', signup, ' to book your trip.');
  }

  // Fill in the name and email of the logged-in user
  function prefill() {
    const user = Auth.getUser();
    if (!user || !Auth.getToken()) return;
    if (field('myname1') && !field('myname1').value) field('myname1').value = user.name || '';
    if (field('myemail') && !field('myemail').value) field('myemail').value = user.email || '';
  }

  if (!Auth.getToken()) showLoginPrompt();
  prefill();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!Auth.getToken()) {
      showLoginPrompt();
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const destinations = Array.from(
      form.querySelectorAll('input[name="td"]:checked')
    ).map((el) => el.value);
    const gender = form.querySelector('input[name="mygender"]:checked');
    const pkg = form.querySelector('input[name="locations"]:checked');
    const phone = field('myphone').value.trim();

    if (!PHONE_RE.test(phone)) {
      return showAlert('Please enter a valid phone number (10-15 digits).', 'danger');
    }
    if (!destinations.length) {
      return showAlert('Please choose at least one destination.', 'danger');
    }
    if (!gender || !pkg) {
      return showAlert('Please select your gender and a package.', 'danger');
    }

    const payload = {
      name: field('myname1').value.trim(),
      email: field('myemail').value.trim(),
      phone,
      age: Number(field('myage').value),
      gender: gender.value,
      departure: field('departuredate').value,
      returnDate: field('returndate').value,
      destinations,
      package: pkg.value,
    };

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Booking...';

    try {
      const res = await fetch(`${Auth.API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...Auth.authHeaders() },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        /* response was not JSON */
      }

      if (res.status === 401) {
        Auth.clearSession();
        showLoginPrompt();
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (!res.ok) {
        return showAlert(data.message || 'Booking failed. Please try again.', 'danger');
      }

      showAlert(data.message || 'Booking received!', 'success');
      form.reset();
      prefill();
    } catch (err) {
      showAlert('Cannot reach the server. Make sure the backend is running.', 'danger');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
})();
