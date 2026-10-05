// Explore Globe - shared login session helpers + navbar login state.
// Load this BEFORE any script that uses window.ExploreAuth.
(function () {
  // When you deploy the backend, change this to your live API URL.
  const API_BASE = 'http://localhost:5000/api';
  const TOKEN_KEY = 'eg_token';
  const USER_KEY = 'eg_user';

  function read(key) {
    try {
      return localStorage.getItem(key) ?? sessionStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function getToken() {
    return read(TOKEN_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(read(USER_KEY));
    } catch (e) {
      return null;
    }
  }

  function clearSession() {
    try {
      [localStorage, sessionStorage].forEach((store) => {
        store.removeItem(TOKEN_KEY);
        store.removeItem(USER_KEY);
      });
    } catch (e) {
      /* storage unavailable */
    }
  }

  // remember = true -> stays after the browser closes; false -> this tab only
  function setSession(token, user, remember) {
    clearSession();
    try {
      const store = remember ? localStorage : sessionStorage;
      store.setItem(TOKEN_KEY, token);
      store.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      /* storage unavailable */
    }
  }

  function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  window.ExploreAuth = {
    API_BASE,
    getToken,
    getUser,
    setSession,
    clearSession,
    authHeaders,
  };

  // "Hi, <name>" + Logout button
  function userWidget(user, buttonClass) {
    const firstName = String(user.name || 'there').split(' ')[0];

    const wrap = document.createElement('span');
    wrap.className = 'd-inline-flex align-items-center gap-2';
    wrap.setAttribute('data-eg-user', '');

    const hello = document.createElement('span');
    hello.className = 'text-white';
    hello.textContent = `Hi, ${firstName}`;

    const logout = document.createElement('button');
    logout.type = 'button';
    logout.className = buttonClass;
    logout.textContent = 'Logout';
    logout.addEventListener('click', () => {
      clearSession();
      window.location.reload();
    });

    wrap.append(hello, logout);
    return wrap;
  }

  // Works on any page that has a Bootstrap .navbar:
  //  - logged in : "Login" link becomes "Hi, name + Logout" (added if missing)
  //  - logged out: a "Login" link is added if the navbar has none
  function renderNav() {
    const user = getUser();
    const loggedIn = Boolean(user && getToken());

    document.querySelectorAll('.navbar').forEach((nav) => {
      const loginLinks = nav.querySelectorAll('a[href="login.html"]');
      const list = nav.querySelector('.navbar-nav');

      if (loggedIn) {
        if (nav.querySelector('[data-eg-user]')) return;

        if (loginLinks.length) {
          loginLinks.forEach((link) =>
            link.replaceWith(userWidget(user, link.className))
          );
        } else if (list) {
          const li = document.createElement('li');
          li.className = 'nav-item ms-lg-3 d-flex align-items-center';
          li.appendChild(userWidget(user, 'btn btn-outline-light btn-sm'));
          list.appendChild(li);
        }
      } else if (!loginLinks.length && list) {
        const li = document.createElement('li');
        li.className = 'nav-item ms-lg-3 d-flex align-items-center';
        const a = document.createElement('a');
        a.href = 'login.html';
        a.className = 'btn btn-outline-light btn-sm';
        a.textContent = 'Login';
        li.appendChild(a);
        list.appendChild(li);
      }
    });
  }

  // If the saved token has expired or is invalid, log out quietly.
  async function verifySession() {
    if (!getToken()) return;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() });
      if (res.status === 401) {
        clearSession();
        window.location.reload();
      }
    } catch (e) {
      /* server offline: keep the session, try again next time */
    }
  }

  renderNav();
  verifySession();
})();
