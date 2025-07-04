import axios from "axios";

function ForgotPass({ show, onClose }) {
  const handleSubmit = async (e) => {
    alert("Check Your Email.");
    e.preventDefault();
    const formData = new FormData(e.target);
    axios.post("http://localhost:8081/api/forgot-password", {
      email: formData.get("email"),
    });

    document.getElementById("forgotPassword").reset();
    localStorage.setItem("user_id", "");
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="auth-form" id="forgotPassword">
        <div
          className="auth-wrapper"
          style={{ display: show ? "flex" : "none" }}
        >
          <div
            className="d-flex"
            style={{ flexDirection: "row-reverse", cursor: "pointer" }}
          >
            {/* <div
              style={{
                background: "transparent",
                color: "white",
                border: "none",
                fontSize: "60px",
                position: "fixed",
                top: "60px",
                right: "20px",
              }}
              onClick={onClose}
            >
              <i className="fa-solid fa-xmark"></i>
            </div> */}
          </div>
          <div className="auth-card">
            <div
              style={{
                display: "flex",
                justifyContent: "end",
              }}
            >
              <button
                type="button"
                className="no-focus"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                }}
                onClick={()=>{onClose()}}
              >
                X
              </button>
            </div>
            <div className="mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label mx-2"
              >
                Email Address
              </label>
              <input
                type="email"
                className="form-control mb-3"
                id="Email"
                name="email"
                placeholder="Email Address"
                required
              />
            </div>
            <div style={{ alignSelf: "center" }}>
              <button
                className="btn btn-outline-warning"
                type="submit"
                onClick={onClose}
              >
                Send Link.
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ForgotPass;
