export const getShadows = (theme?: string) => {
    const isDark = theme === 'dark';
    const rim = isDark ? `0px 0px 0px 1px rgba(255, 255, 255, 0.15)` : `0px 0px 0px 1px rgba(0, 0, 0, 0.08)`;
    
    return {
        none: "none",
        subtle: `
            ${rim},
            0px 1px 1px rgba(14, 30, 37, 0.05),
            0px 2px 4px rgba(14, 30, 37, 0.06)
        `,
        card: `
            ${rim},
            0px 1px 1px rgba(14, 30, 37, 0.05),
            0px 2px 4px rgba(14, 30, 37, 0.07),
            0px 5px 10px rgba(14, 30, 37, 0.05)
        `,
        elevated: `
            ${rim},
            0px 1px 2px rgba(14, 30, 37, 0.06),
            0px 2px 4px rgba(14, 30, 37, 0.07),
            0px 4px 8px rgba(14, 30, 37, 0.07),
            0px 8px 16px rgba(14, 30, 37, 0.06)
        `
    };
};

export const shadows = getShadows('light');
