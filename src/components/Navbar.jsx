function Navbar({ LinkComponent, currentUser }) {
  return (
    <header className="navbar">
      <div className="logo">CloudPortfolio</div>
      <nav>
        <LinkComponent to="/">Browse</LinkComponent>
        <LinkComponent to="/upload">Upload</LinkComponent>
        <LinkComponent to="/portfolio">My Portfolio</LinkComponent>
        <LinkComponent to="/architecture">Azure Architecture</LinkComponent>
        {currentUser ? (
          <LinkComponent to="/portfolio" className="user-link">
            {currentUser.name}
          </LinkComponent>
        ) : (
          <LinkComponent to="/signin" className="sign-in">
            Sign In
          </LinkComponent>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
