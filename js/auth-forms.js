// Explore Globe - connects login.html and signup.html to the backend API.
// Needs js/session.js loaded first.
(function () {
  const Auth = window.ExploreAuth;
  if (!Auth) {
    console.error('session.js must be loaded before auth-forms.js');
    return;
  }

  const PHONE_RE = /^\+?[0-9\s-]{10,15}$/;

  const byId = (id) => document.getElementById(id);
  const val = (id) => (byId(id) ? byId(id).value.trim() : '');

  function showAlert(box, message, type) {
    box.className = `alert alert-${type}`;
    box.textContent = message;
  }

  function setBusy(button, busy, label) {
    if (!button) return;
    if (busy) {
      button.dataset.label = button.textContent;
      button.textContent = label;
    } else if (button.dataset.label) {
      button.textContent = button.dataset.label;
    }
    button.disabled = busy;
  }

  // Only allow redirecting to a simple page name like "register.html"
  function nextPage() {
    const next = new URLSearchParams(window.location.search).get('next');
    return next && /^[A-Za-z0-9_-]+\.html$/.test(next) ? next : 'index.html';
  }

  async function postJson(path, body) {
    const res = await fetch(`${Auth.API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      /* response was not JSON */
    }
    return { ok: res.ok, data };
  }

  // ---------------- Sign up ----------------
  const signupForm = byId('signupForm');
  if (signupForm) {
    const box = byId('signupAlert');
    const btn = byId('signupSubmit');

    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      const firstName = val('signupFirstName');
      const lastName = val('signupLastName');
      const email = val('signupEmail');
      const phone = val('signupPhone');
      const country = val('signupCountry');
      const password = byId('signupPassword').value;
      const confirm = byId('signupConfirm').value;

      if (password.length < 8) {
        return showAlert(box, 'Password must be at least 8 characters.', 'danger');
      }
      if (password !== confirm) {
        return showAlert(box, 'Passwords do not match.', 'danger');
      }
      if (!PHONE_RE.test(phone)) {
        return showAlert(box, 'Please enter a valid phone number (10-15 digits).', 'danger');
      }

      setBusy(btn, true, 'Creating account...');
      let redirecting = false;

      try {
        const { ok, data } = await postJson('/auth/register', {
          name: `${firstName} ${lastName}`.trim(),
          email,
          password,
          phone,
          country,
        });

        if (!ok) {
          showAlert(box, data.message || 'Could not create your account.', 'danger');
          return;
        }

        Auth.setSession(data.token, data.user, true);
        showAlert(box, 'Account created! Redirecting...', 'success');
        redirecting = true;
        setTimeout(() => {
          window.location.href = nextPage();
        }, 800);
      } catch (err) {
        showAlert(
          box,
          'Cannot reach the server. Make sure the backend is running.',
          'danger'
        );
      } finally {
        if (!redirecting) setBusy(btn, false);
      }
    });
  }

  // ---------------- Login ----------------
  const loginForm = byId('loginForm');
  if (loginForm) {
    const box = byId('loginAlert');
    const btn = byId('loginSubmit');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      const email = val('loginEmail');
      const password = byId('password').value;
      const remember = byId('rememberMe') ? byId('rememberMe').checked : false;

      setBusy(btn, true, 'Logging in...');
      let redirecting = false;

      try {
        const { ok, data } = await postJson('/auth/login', { email, password });

        if (!ok) {
          showAlert(box, data.message || 'Login failed.', 'danger');
          return;
        }

        Auth.setSession(data.token, data.user, remember);
        showAlert(box, 'Logged in! Redirecting...', 'success');
        redirecting = true;
        setTimeout(() => {
          window.location.href = nextPage();
        }, 500);
      } catch (err) {
        showAlert(
          box,
          'Cannot reach the server. Make sure the backend is running.',
          'danger'
        );
      } finally {
        if (!redirecting) setBusy(btn, false);
      }
    });
  }
})();
