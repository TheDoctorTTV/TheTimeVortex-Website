let darkmode = localStorage.getItem('darkmode');
const themeswitch = document.getElementById('darkmode-toggle');
const systemThemeElement = document.querySelector('.system-theme'); // Select the system-theme element
const darkModeIcon = document.querySelector('.darkmodeicon');
const lightModeIcon = document.querySelector('.lightmodeicon');
const systemModeIcon = document.querySelector('.system-theme');

// Functions for setting themes
const enableDarkmode = () => {
    document.body.classList.add('darkmode');
    document.body.classList.remove('systemmode');
    systemThemeElement.style.display = 'none';
    darkModeIcon.style.display = 'none';
    lightModeIcon.style.display = 'block';
    systemModeIcon.style.display = 'none';
    localStorage.setItem('darkmode', 'dark');
};

const enableLightmode = () => {
    document.body.classList.remove('darkmode');
    document.body.classList.remove('systemmode');
    systemThemeElement.style.display = 'none';
    darkModeIcon.style.display = 'block';
    lightModeIcon.style.display = 'none';
    systemModeIcon.style.display = 'none';
    localStorage.setItem('darkmode', 'light');
};

const enableSystemmode = () => {
    document.body.classList.add('systemmode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('darkmode', systemPrefersDark);
    systemThemeElement.style.display = 'block'; // Make system-theme visible
    darkModeIcon.style.display = 'none';
    lightModeIcon.style.display = 'none';
    systemModeIcon.style.display = 'block';
    localStorage.setItem('darkmode', 'system');
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
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (localStorage.getItem('darkmode') === 'system') {
        document.body.classList.toggle('darkmode', event.matches);
    }
});

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
