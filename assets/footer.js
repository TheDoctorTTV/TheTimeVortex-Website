class MyFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <div class="footer">
      <footer>
        &copy; T h e D o c t o r 2023
        <div class="footer-socials">
          <a href="https://www.youtube.com/@thedoctorttv" target="_blank">Youtube</a>
          <a href="https://www.twitch.tv/ttv_thedoctor" target="_blank">Twitch</a>
          <a href="https://twitter.com/TheDoctorTTV" target="_blank">Twitter</a>
          <a href="https://github.com/TheDoctor121027" target="_blank">GitHub</a> 
        </div>
      </footer>
    </div>
      `
  }
}

customElements.define('my-footer', MyFooter)