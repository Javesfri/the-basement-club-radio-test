import "../styles/App.css";
import "../styles/App.css";
import "../styles/Footer.css";
import "../styles/Navbar.css";
import "../styles/Newsletter.css";
import "../styles/ButtonPlay.css";
import "../styles/Player.css";
import "../styles/Home.css";

import NavbarSite from "../components/Navbar.jsx";
import FooterSite from "../components/Footer.jsx";
import { PlayerProvider } from "@/components/PlayerContext";
import Player from "@/components/Player";
function MyApp({ Component, pageProps }) {
  return (
    <PlayerProvider>
      <div className="App">
        <NavbarSite />

        <div className="Main">
          <Component {...pageProps} />
        </div>
        <Player />
        
      </div>
    </PlayerProvider>
  );
}

export default MyApp;
