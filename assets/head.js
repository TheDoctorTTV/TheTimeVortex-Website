class MyHead extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/style-minify.css">
  <link rel="stylesheet" href="/style-mediaquery-minify.css">
  <title>TheTimeVortex</title>
  <link rel="shortcut icon" type="image/x-icon" href="\icons\WebsiteLogo.ico">
  <meta property="og:type" content="website">
  <meta property="og:title" content="TheTimeVortex" />
  <meta property="og:description"
    content="TheDoctor's website which includes his discord server, youtube, twitch and more." />
  <meta property="og:url" content="https://www.thetimevortex.net" />
  <meta property="og:image"
    content="https://cdn.discordapp.com/attachments/824742183415316571/1040475479616000010/The_Time_Vortex_Logo.png" />
</head>
      `
  }
}

customElements.define('my-head', MyHead)