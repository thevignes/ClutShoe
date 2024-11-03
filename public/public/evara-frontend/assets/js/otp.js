let timeLeft = 60;
const timerDisplay = document.getElementById("timer");
const resendOtpButton = document.getElementById("resendOtp");
const otpForm = document.getElementById("otpForm");

// Countdown function
const countdown = () => {
  const timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      timerDisplay.innerHTML = "Time's up!";
      resendOtpButton.style.display = "block"; // Show the resend button
    } else {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerDisplay.innerHTML = `${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;
      timeLeft -= 1;
    }
  }, 1000); // Update every second
};

// Start the initial countdown
countdown();

// Handle OTP form submission
otpForm.addEventListener("submit", (event) => {
  // Do not prevent the default behavior, allowing the form to submit normally
  // No need to handle fetch or AJAX, just let the form submit
});

// Handle resend OTP button click
const resendOtpForm = document.getElementById("resendForm");
resendOtpForm.addEventListener("click", (event) => {
  event.preventDefault(); // Prevent default action to allow for form submission
  const resendForm = document.createElement("form");
  resendForm.method = "POST";
  resendForm.action = "http://localhost:3100/resend-otp"; // Change to your endpoint

  document.body.appendChild(resendForm); // Append the form to the body
  resendForm.submit(); // Submit the form

  
});
