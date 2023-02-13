class BGMusic extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
      
      `
    }
}

customElements.define('bg-music-js', BGMusic)