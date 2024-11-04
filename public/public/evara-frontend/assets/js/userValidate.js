// <!-- Form Validation Script -->

function validateForm() {
  // Clear previous error messages
  document.getElementById("allFieldsError").innerText = "";
  document.getElementById("nameError").innerText = "";
  document.getElementById("emailError").innerText = "";
  document.getElementById("passwordError").innerText = "";
  document.getElementById("confirmPasswordError").innerText = "";

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  let isValid = true;

  // Check if all fields are empty
  if (!name && !email && !password && !confirmPassword) {
    document.getElementById("allFieldsError").innerText = "All fields are required.";
    isValid = false;
  }

  // Validate name (at least 3 characters and only alphabetic letters)
  if (name.length < 3) {
    document.getElementById("nameError").innerText = "Name must be at least 3 characters long.";
    isValid = false;
  } else {
    const nameRegex = /^[A-Za-z]+$/;
    if (!nameRegex.test(name)) {
      document.getElementById("nameError").innerText = "Name can only contain alphabetic letters.";
      isValid = false;
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    document.getElementById("emailError").innerText = "Please enter a valid email address.";
    isValid = false;
  }

  // Validate password (at least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  if (!passwordRegex.test(password)) {
    document.getElementById("passwordError").innerText =
      "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.";
    isValid = false;
  }

  // Validate confirm password (must match password)
  if (password !== confirmPassword) {
    document.getElementById("confirmPasswordError").innerText = "Passwords do not match.";
    isValid = false;
  }

  return isValid;
}
