const { useEffect, useState } = require("react");

const THEME_KEY = "app-theme";

function useTheme() {
    const getInitialTheme = () => {
        if (typeof window === "undefined") return "light";

        const storedTheme = localStorage.getItem(THEME_KEY);
        if (storedTheme) return storedTheme;

        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        return prefersDark ? "dark" : "light";
    };

    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    useEffect(() => {
        const onStorageChange = (e) => {
            if (e.key === THEME_KEY && e.newValue) {
                setTheme(e.newValue);
            }
        };

        window.addEventListener("storage", onStorageChange);
        return () => window.removeEventListener("storage", onStorageChange);
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return {
        theme,
        toggleTheme,
        setLight: () => setTheme("light"),
        setDark: () => setTheme("dark"),
    };
}

module.exports = { useTheme };