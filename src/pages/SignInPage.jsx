import { useNavigate } from "react-router-dom";

function SignInPage({ setCurrentUser }) {
  const navigate = useNavigate();

  const handleSignIn = () => {
    setCurrentUser({
      name: "Nischal Shrestha",
      email: "nischal.shrestha@student.ulster.ac.uk",
      role: "Student",
    });

    navigate("/portfolio");
  };

  return (
    <section className="hero">
      <div className="intro">
        <h1>Sign In</h1>
        <p>Simulated Microsoft Entra ID authentication for CloudPortfolio.</p>
      </div>

      <section className="signin-card">
        <div className="signin-icon">CP</div>
        <h2>CloudPortfolio</h2>
        <p>
          In the deployed Azure version, institutional sign-in would use
          Microsoft Entra ID to verify student identity and protect portfolio
          actions.
        </p>
        <button type="button" className="signin-button" onClick={handleSignIn}>
          Sign in with Microsoft Entra ID
        </button>
      </section>
    </section>
  );
}

export default SignInPage;
