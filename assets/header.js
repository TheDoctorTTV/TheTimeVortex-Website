class MyHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <div class="Header">
        <h1>The Time Vortex</h1>
        <nav class="navbar">
            <ul class="navbar-links">
                <li> <a href="/index"> Home </a></li>
                <li> <a href="/socials" target="_blank"> Socials </a></li>
                <li class="more-links"> <a href="#"> More </a>
                    <ul>
                        <li> <a href="/videos-hub"> Stream VODs Hub </a></li>
                        <li> <a href="/minecraft-server"> Minecraft Server </a></li>
                    </ul>
                </li>
            </ul>
        </nav>
    </div>
    <div class="mobile_nav">
        <ul>
            <li> <a href="/index"> <img class="icons" src="/icons/home-icon.svg" alt=""> </a></li>
            <li> <a href="/socials"> <img class="icons" src="/icons/socials.svg" alt=""> </a></li>
            <li> <a href="/videos-hub"> <img class="icons" src="/icons/tv-outline.svg" alt=""> </a> </li>
            <li> <a href="/minecraft-server"> <img class="icons" src="/icons/minecraft.svg" alt=""> </a></li>
        </ul>
    </div>
    `
  }
}

customElements.define('my-header', MyHeader)