
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


function addToCartAlert(itemId) {
    axios.post(`/add-to-cart?id=${itemId}`)
    
        .then(res => {
            const cart = res.data.cart;
            if (cart){
                showToast('Item Added to cart');
                window.location.reload();
            } else {
                window.location.href = '/login'
            }
        })
        .catch(err => {
            console.log(err.response);
            
            if (err.response && err.response.status === 500 || err.response.status === 401) {
                window.location.href = '/login';
            } else {
                // Handle other errors if needed
                console.log('An error occurred:', err.response);
            }
        });
}

