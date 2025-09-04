let darkmode = localStorage.getItem('darkmode');
const themeswitch = document.getElementById('darkmode-toggle');
const darkModeIcon = document.querySelector('.darkmodeicon');
const lightModeIcon = document.querySelector('.lightmodeicon');
const systemModeIcon = document.querySelector('.system-theme');

// Functions for setting themes
const enableDarkmode = () => {
    document.documentElement.classList.add('darkmode');
    document.documentElement.classList.remove('systemmode');
    darkModeIcon.style.display = 'block';
    lightModeIcon.style.display = 'none';
    systemModeIcon.style.display = 'none';
    localStorage.setItem('darkmode', 'dark');
};

const enableLightmode = () => {
    document.documentElement.classList.remove('darkmode');
    document.documentElement.classList.remove('systemmode');
    darkModeIcon.style.display = 'none';
    lightModeIcon.style.display = 'block';
    systemModeIcon.style.display = 'none';
    localStorage.setItem('darkmode', 'light');
};

const enableSystemmode = () => {
    document.documentElement.classList.add('systemmode');
    document.documentElement.classList.toggle('darkmode', window.matchMedia('(prefers-color-scheme: dark)').matches);
    darkModeIcon.style.display = 'none';
    lightModeIcon.style.display = 'none';
    systemModeIcon.style.display = 'block';
    localStorage.setItem('darkmode', 'system');
};

// Update the system theme dynamically
const updateSystemTheme = () => {
    if (localStorage.getItem('darkmode') === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('darkmode', systemPrefersDark);
    }
};

// Initialize theme based on saved preference or system default
if (darkmode === 'dark') {
    enableDarkmode();
} else if (darkmode === 'light') {
    enableLightmode();
} else {
    enableSystemmode();
}

// Listen for system theme changes when in system mode
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateSystemTheme);

// Cycle through themes on button click
themeswitch.addEventListener('click', () => {
    darkmode = localStorage.getItem('darkmode');
    if (darkmode === 'light') {
        enableDarkmode();
    } else if (darkmode === 'dark') {
        enableSystemmode();
    } else {
        enableLightmode();
    }
});
