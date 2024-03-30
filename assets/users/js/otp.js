const otpInputs = document.querySelectorAll('.otp-input');
    const verifyBtn = document.querySelector('.otp-verify-btn');
    const resendLink = document.getElementById('resendLink');

    otpInputs.forEach((input, index) => {
      input.addEventListener('input', function(event) {
        const value = event.target.value;
        if (value.length === 1) {
          const nextInput = input.nextElementSibling;
          if (nextInput) {
            nextInput.focus();
          } else {
            verifyBtn.classList.add('show');
          }
        } else {
          verifyBtn.classList.remove('show');
        }
      });

      input.addEventListener('keypress', function(event) {
        const keyCode = event.keyCode || event.which;
        const keyValue = String.fromCharCode(keyCode);
        if (!/\d/.test(keyValue)) {
          event.preventDefault();
        }
      });

      input.addEventListener('keydown', function(event) {
        if (event.key === 'Backspace' && input.value.length === 0) {
          const prevInput = otpInputs[index - 1];
          if (prevInput) {
            prevInput.focus();
          }
        }
      });
    });

    // Countdown Timer
    const countdownElement = document.getElementById('countdown');
    let timeLeft = 120;

    function updateCountdown() {
      const minutes = Math.floor(timeLeft / 60);
      let seconds = timeLeft % 60;
      seconds = seconds < 10 ? '0' + seconds : seconds;
      countdownElement.textContent = `${minutes}:${seconds}`;
      if (timeLeft === 0) {
        clearInterval(timer);
        verifyBtn.disabled = true;
        resendLink.style.opacity = '1';
      }
      timeLeft--;
    }

    const timer = setInterval(updateCountdown, 1000);

    // Resend OTP functionality
    resendLink.addEventListener('click', function(event) {
      event.preventDefault();
      // Implement your resend OTP logic here
      console.log('Resending OTP...');
      // Reset timer
      timeLeft = 120;
      clearInterval(timer);
      timer = setInterval(updateCountdown, 1000);
      // Reset button and link
      verifyBtn.classList.remove('show');
      verifyBtn.disabled = true;
      resendLink.style.opacity = '0.5';
    });