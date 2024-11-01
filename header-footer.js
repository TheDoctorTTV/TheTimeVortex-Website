class GlobalFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer>
        <p>&copy; TheDoctorTTV 2024.</p> <p><a href="discord-bot-terms.html">Privacy Policy | Terms of Service</a></p>
</footer>
        `
    }
}

class GlobalHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <header>
            <img class="long_logo" src="backgrounds/TheTimeVortex-Long-Logo.webp" alt="TheTimeVortex">
            <div class="nav">
      <a href="index.html">Home</a>
      <a href="socials.html">Socials</a>
      <a href="minecraft-server.html">MC Server</a>
    </div>
        </header>
        `
    }
}

customElements.define('global-footer', GlobalFooter)
customElements.define('global-header', GlobalHeader)