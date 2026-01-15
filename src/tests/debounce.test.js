import { describe, it, expect, vi } from 'vitest';
import { debounce } from '../utils/debounce.js';

describe('debounce', () => {
    it('should delay function execution', () => {
        vi.useFakeTimers();
        const func = vi.fn();
        const debouncedFunc = debounce(func, 100);

        debouncedFunc();
        expect(func).not.toHaveBeenCalled();

        vi.advanceTimersByTime(50);
        expect(func).not.toHaveBeenCalled();

        vi.advanceTimersByTime(50);
        expect(func).toHaveBeenCalledTimes(1);
    });

    it('should execute only once for multiple calls within wait time', () => {
        vi.useFakeTimers();
        const func = vi.fn();
        const debouncedFunc = debounce(func, 100);

        debouncedFunc();
        debouncedFunc();
        debouncedFunc();

        vi.advanceTimersByTime(100);
        expect(func).toHaveBeenCalledTimes(1);
    });
});
