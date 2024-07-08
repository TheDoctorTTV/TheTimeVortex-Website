class GlobalFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer>
                <ul>
                    <li><a href="https://www.youtube.com/@thedoctorttv" target="_blank"><img src="icons/youtube.svg"
                        alt="Youtube"></a></li>
                    <li><a href="https://www.twitch.tv/thedoctorttv" target="_blank"><img src="icons/twitch.svg"
                        alt="Twitch"></a></li>
                    <li><a href="https://twitter.com/TheDoctorTTV" target="_blank"><img src="icons/twitter.svg"
                        alt="Twitter"></a></li>
                    <li><a class="github" href="https://github.com/TheDoctor121027" target="_blank"><img
                        src="icons/github-mark-c791e9551fe4/github-mark/github-mark.png" alt="GitHub"></a></li>
                    <li><a href='https://throne.com/thedoctorttv' target='_blank'><img
                        src='icons/Throne Icon - Single (Gradient).png' alt='My Wishlist' /></a></li>
                    <li><a href='https://ko-fi.com/W7W85M9HD' target='_blank'><img
                        src='https://assets-global.website-files.com/5c14e387dab576fe667689cf/64f1a9ddd0246590df69e9ef_ko-fi_logo_02-p-500.png'
                        alt='Buy Me a Coffee at ko-fi.com' /></a></li>
                </ul>
        <p>&copy; TheDoctorTTV 2024.</p>
</footer>
        `
    }
}


class GlobalHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <header>
            <img class="long_logo" src="backgrounds/TheTimeVortex-Long-Logo.png" alt="TheTimeVortex">
        </header>
        `
    }
}





customElements.define('global-footer', GlobalFooter)
customElements.define('global-header', GlobalHeader)