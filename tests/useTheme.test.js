import { renderHook, act } from "@testing-library/react-hooks";
import { useTheme } from "../src/useTheme";

test("should toggle theme", () => {
    const { result } = renderHook(() => useTheme());

    const initialTheme = result.current.theme;

    act(() => {
        result.current.toggleTheme();
    });

    expect(result.current.theme).not.toBe(initialTheme);
});
``