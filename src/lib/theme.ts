export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "soan-nhan:giao-dien";
export const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark";

// Chạy trước khi trang được vẽ để tránh chớp nền sáng khi đã chọn giao diện tối.
export const THEME_INIT_SCRIPT = `(function(){var t;try{t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t})();`;
