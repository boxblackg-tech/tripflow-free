export const SHEET_BACKEND = {
  spreadsheetId: "1aueJX_coe3TeHoBLwge5Ww9C15T5lg8MlBmfLrLj_T8",
  webAppUrl: ""
};

export function getSheetBackendConfig() {
  const overrideUrl = localStorage.getItem("tripflow_free_web_app_url") || "";
  return {
    ...SHEET_BACKEND,
    webAppUrl: overrideUrl || SHEET_BACKEND.webAppUrl
  };
}
