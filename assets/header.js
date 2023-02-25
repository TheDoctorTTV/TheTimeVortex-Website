class MyHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <div class="header">
        <h1 class="main-header">The Time Vortex</h1>
        <nav class="navbar">
            <ul class="navbar-links">
                <li> <a href="/index-min"> Home </a></li>
                <li> <a href="/socials-min"> Socials </a></li>
                <li> <a href="/videos-hub-min"> VODs Archive </a></li>
                <li> <a href="/minecraft-server-min"> MC Server </a></li>               
            </ul>
        </nav>
    </div>
    <div class="mobile_nav">
        <ul>
            <li> <a href="/index-min"> <img class="icons" src="/icons/home-icon.svg" alt=""> </a></li>
            <li> <a href="/socials-min"> <img class="icons" src="/icons/socials.svg" alt=""> </a></li>
            <li> <a href="/videos-hub-min"> <img class="icons" src="/icons/tv-outline.svg" alt=""> </a> </li>
            <li> <a href="/minecraft-server-min"> <img class="icons" src="/icons/minecraft.svg" alt=""> </a></li>
        </ul>
    </div>
    `
  }
}

customElements.define('my-header', MyHeader)