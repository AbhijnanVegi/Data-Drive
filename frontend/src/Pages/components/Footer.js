import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { darkThemeOverride } from "chonky";

export const Footer = ({ theme, toggleTheme }) => (
  <div className="footer">
    <div style={{ position: 'fixed', right: 0, padding: '1em' }}>
      <button className="theme-toggle-button" onClick={toggleTheme} style={{ fontFamily: 'Quicksand, sans-serif' }}>
        <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
        {theme === 'light' ? ' Dark Mode' : ' Light Mode'}
      </button>
    </div>
  </div>
);