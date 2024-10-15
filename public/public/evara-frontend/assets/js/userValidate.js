// <!-- Form Validation Script -->
 
    function validateForm() {

      document.getElementById("allFieldsError").innerText = "";
      document.getElementById("nameError").innerText = "";
      document.getElementById("emailError").innerText = "";
      document.getElementById("passwordError").innerText = "";
      document.getElementById("confirmPasswordError").innerText = "";

  
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document.getElementById("confirmPassword").value;

      let isValid = true;

    
      if (!name && !email && !password && !confirmPassword) {
        document.getElementById("allFieldsError").innerText = "All fields are required.";
        isValid = false;
      }

    
      if (name.length < 3) {
        document.getElementById("nameError").innerText = "Name must be at least 3 characters long.";
        isValid = false;
      }

      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        document.getElementById("emailError").innerText = "Please enter a valid email address.";
        isValid = false;
      }


      if (password.length < 6) {
        document.getElementById("passwordError").innerText = "Password must be at least 6 characters long.";
        isValid = false;
        if(!password){
          
        }
      }
     



 
      if (password !== confirmPassword) {
        document.getElementById("confirmPasswordError").innerText = "Passwords do not match.";
        isValid = false;
      }

    
      return isValid;
    }