export default function TopBar({ cartCount, searchTerm, onSearchChange, onLoginClick, onSignUpClick }) {
  return (
    <header className="topbar">
      <div className="search-box">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <button className="icon-link" type="button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        Cart ({cartCount})
      </button>

      <button className="icon-link" type="button" onClick={onLoginClick}>Login</button>
      <button className="icon-link" type="button" onClick={onSignUpClick}>Sign Up</button>
    </header>
  )
}
