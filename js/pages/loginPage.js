export function renderLoginPage(state) {
  const mode = state.authMode || "login";
  return `
    <section class="screen login-screen ${state.currentPage === "login" ? "active" : ""}" data-screen="login">
      <div class="page-stack">
        <div>
          <h1 class="login-hero-title">Plan beautifully.<br>Travel smoothly.</h1>
          <p class="subtitle">Create trips, search places on a live map, and save memories in one mobile app.</p>
        </div>

        <div class="hero-art">
          <div class="hero-avatar">
            <div class="hero-device"></div>
          </div>
        </div>

        <div class="segment">
          <button type="button" data-auth-mode="login" class="${mode === "login" ? "active" : ""}">LOG IN</button>
          <button type="button" data-auth-mode="signup" class="${mode === "signup" ? "active" : ""}">SIGN UP</button>
        </div>

        <div class="card">
          <form id="auth-form" class="form-grid">
            ${mode === "signup"
              ? `
              <label class="field">
                <span class="field-label">Name</span>
                <input class="input" name="name" type="text" placeholder="Your travel nickname">
              </label>
            `
              : ""}
            <label class="field">
              <span class="field-label">Email</span>
              <input class="input" name="email" type="email" placeholder="demo@tripflow.app">
            </label>
            <label class="field">
              <span class="field-label">Password</span>
              <input class="input" name="password" type="password" placeholder="1234">
            </label>
            <button class="primary-button" type="submit">${mode === "signup" ? "Create account" : "Start journey"}</button>
            <button class="ghost-button" id="demo-login" type="button">Use demo account</button>
            <div class="status-text ${state.authStatusType || ""}">${state.authStatus || "Demo login: demo@tripflow.app / 1234"}</div>
          </form>
        </div>

        <div class="helper-text">All data stays on this device with free local storage.</div>
      </div>
    </section>
  `;
}
