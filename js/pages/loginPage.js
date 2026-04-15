export function renderLoginPage(state) {
  const mode = state.authMode || "login";

  return `
    <section class="screen login-screen ${state.currentPage === "login" ? "active" : ""}" data-screen="login">
      <div class="page-stack">
        <div>
          <h1 class="login-hero-title">${state.t("login_title")}</h1>
          <p class="subtitle">${state.t("login_subtitle")}</p>
        </div>

        <div class="hero-art">
          <div class="hero-avatar">
            <div class="hero-device"></div>
          </div>
        </div>

        <div class="segment">
          <button type="button" data-auth-mode="login" class="${mode === "login" ? "active" : ""}">${state.t("auth_login")}</button>
          <button type="button" data-auth-mode="signup" class="${mode === "signup" ? "active" : ""}">${state.t("auth_signup")}</button>
        </div>

        <div class="card">
          <form id="auth-form" class="form-grid">
            ${mode === "signup"
              ? `
              <label class="field">
                <span class="field-label">${state.t("field_name")}</span>
                <input class="input" name="name" type="text" placeholder="${state.t("placeholder_nickname")}">
              </label>
            `
              : ""}
            <label class="field">
              <span class="field-label">${state.t("field_email")}</span>
              <input class="input" name="email" type="email" placeholder="demo@tripflow.app">
            </label>
            <label class="field">
              <span class="field-label">${state.t("field_password")}</span>
              <input class="input" name="password" type="password" placeholder="1234">
            </label>
            <button class="primary-button" type="submit">${mode === "signup" ? state.t("action_create_account") : state.t("action_start_journey")}</button>
            <button class="ghost-button" id="demo-login" type="button">${state.t("action_use_demo")}</button>
            <div class="status-text ${state.authStatusType || ""}">${state.authStatus || state.t("status_demo_login")}</div>
          </form>
        </div>

        <div class="helper-text">${state.t("helper_local_storage")}</div>
      </div>
    </section>
  `;
}
