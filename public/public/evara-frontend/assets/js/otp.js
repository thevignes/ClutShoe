document.getElementById("otpInput").focus();

let timer;
let timerInterval;

// Start the timer
function startTimer() {
    const currentTime = Date.now();
    const expirationTime = parseInt(localStorage.getItem("otpExpirationTime"), 10);
    
    if (!expirationTime || currentTime >= expirationTime) {
        const newExpirationTime = currentTime + 60 * 1000; // 60 seconds
        localStorage.setItem("otpExpirationTime", newExpirationTime);
        timer = 60;
    } else {
        timer = Math.floor((expirationTime - currentTime) / 1000);
    }

    document.getElementById("timer").textContent = timer;

    // Update the timer every second
    timerInterval = setInterval(() => {
        if (timer > 0) {
            timer--;
            document.getElementById("timer").textContent = timer;
        } else {
            clearInterval(timerInterval);
            document.getElementById("timer").classList.add("expired");
            // document.getElementById("timer").textContent = "Expired";
            document.getElementById("otpInput").disabled = true;
            document.getElementById("resendOtp").style.display = "block"; // Show the "Resend OTP" button
        }
    }, 1000);
}

startTimer();

// Handle OTP form submission
document.getElementById("otpForm").addEventListener("submit", (event) => {
    // Allow normal form submission
});

// Handle "Resend OTP" button click
const resendOtpButton = document.getElementById("resendOtp");
resendOtpButton.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default action

    // Create and submit a form to resend OTP
    const resendForm = document.createElement("form");
    resendForm.method = "POST";
    resendForm.action = "/resend-otp"; // Change to your endpoint

    document.body.appendChild(resendForm); // Append the form to the body
    resendForm.submit(); // Submit the form
});
