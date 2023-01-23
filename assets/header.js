import React from 'react';
import { Link } from 'react-router-dom';


const Header = () => {
  return (
    <div class="Header">
    <h1>The Time Vortex</h1>
    <nav class="navbar">
      <ul class="navbar-links">
        <li> <a href="index"> Home </a></li>
        <li> <a href="https://youtube.com/thedoctor121027" target="_blank"> Youtube </a></li>
        <li> <a href="https://twitch.tv/ttv_thedoctor" target="_blank"> Twitch </a></li>
        <li class="more-links"> <a href="#"> More </a>
          <ul>
            <li> <a href="https://twitter.com/TheDoctorTTV" target="_blank"> Twitter </a></li>
            <li> <a href="videos-hub"> Stream VODs Hub </a></li>
            <li> <a href="minecraft-server"> Minecraft Server </a></li>
          </ul>
        </li>
      </ul>
    </nav>
  </div>
  );
};


export default Header;

