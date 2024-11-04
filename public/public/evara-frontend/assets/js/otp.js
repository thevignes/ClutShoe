document.getElementById("otpInput").focus();

let timer;
let timerInterval;


function startTimer() {
    const currentTime = Date.now();
    const expirationTime = parseInt(localStorage.getItem("otpExpirationTime"), 10);
    
    
    if (!expirationTime || currentTime >= expirationTime) {
        const newExpirationTime = currentTime + 60 * 1000; 
        localStorage.setItem("otpExpirationTime", newExpirationTime);
        timer = 60;
    } else {
        timer = Math.floor((expirationTime - currentTime) / 1000);
    }

    document.getElementById("timer").textContent = timer;

    
    timerInterval = setInterval(() => {
        if (timer > 0) {
            timer--;
            document.getElementById("timer").textContent = timer;
        } else {
            clearInterval(timerInterval);
            document.getElementById("timer").classList.add("expired");
            document.getElementById("timer").textContent = "Expired";
            document.getElementById("otpInput").disabled = true;
        }
    }, 1000);
}

startTimer();


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
