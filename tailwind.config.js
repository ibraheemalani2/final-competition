/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./*.js"],
    theme: {
        extend: {
            fontFamily: {
                cairo: ['Cairo', 'sans-serif'],
                amiri: ['Amiri', 'serif'],
            },
            colors: {
                classic: {
                    bg: '#fdfbf7',
                    dark: '#1b4332',
                    green: '#2d6a4f',
                    gold: '#d4af37',
                    text: '#1f2937',
                    accent: '#b91c1c'
                }
            },
            boxShadow: {
                'classic': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'classic-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                'gold': '0 0 0 2px #d4af37',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                }
            }
        }
    },
    plugins: [],
}
