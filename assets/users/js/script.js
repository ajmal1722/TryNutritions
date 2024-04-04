function addToCartAlert(itemId) {
    axios.post(`/add-to-cart?id=${itemId}`)
        .then(res => {
            const message = res.data.message; // Assuming the success message is returned from the server
            swal.fire({
                title: 'Success!',
                text: message,
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            }).then(() => {
                // Redirect or perform any other action after the user clicks OK
                window.location.href = currentURL; // Replace '/cart' with the desired URL
            });
        })
        .catch(err => {
            swal.fire({
                title: 'Error!',
                text: 'An error occurred while adding the product to the cart.',
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
            console.log(err);
        });
}


function showToast(message) {
    // Display toast message using Toastify library
    Toastify({
      text: message,
      duration: 3000, // Duration in milliseconds
      gravity: "bottom", // Position of the toast message
      position: "center",
      backgroundColor: "black", // Background color of the toast
    }).showToast();
}