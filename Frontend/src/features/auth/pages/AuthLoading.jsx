import "../auth.form.scss";

const AuthLoading = () => {
  return (
    <div className="auth-loading">
      <div className="background-blur blur-1"></div>
      <div className="background-blur blur-2"></div>

      <div className="loading-card">
        <div className="logo-circle">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>

          <div className="center-dot">
            <span>AI</span>
          </div>
        </div>

        <h2>Signing You In</h2>

        <p>
          Please wait while we securely authenticate your account and prepare
          your dashboard.
        </p>

        <div className="progress">
          <div className="progress-bar"></div>
        </div>

        <div className="loading-text">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default AuthLoading;
