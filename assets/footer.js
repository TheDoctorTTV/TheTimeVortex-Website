class MyFooter extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div class="footer">
            <footer>
                &copy; T h e D o c t o r 2022
            </footer>
        </div>
      `
    }
  }
  
  customElements.define('my-footer', MyFooter)