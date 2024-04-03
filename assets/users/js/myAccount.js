// Function to show profile section and hide other sections
function showProfile() {
    // Show profile section and hide others
    document.getElementById("profile").style.display = "block";
    document.getElementById("orders").style.display = "none";
    document.getElementById("addAddress").style.display = "none";
    document.getElementById("changePassword").style.display = "none";

    // Set active class and remove from others
    setActiveTab("profileTab");
}

function showOrders() {
    // Show orders section and hide others
    document.getElementById("profile").style.display = "none";
    document.getElementById("orders").style.display = "block";
    document.getElementById("addAddress").style.display = "none";
    document.getElementById("changePassword").style.display = "none";

    // Set active class and remove from others
    setActiveTab("ordersTab");
}

function showAddAddress() {
    // Show add address section and hide others
    document.getElementById("profile").style.display = "none";
    document.getElementById("orders").style.display = "none";
    document.getElementById("addAddress").style.display = "block";
    document.getElementById("changePassword").style.display = "none";

    // Set active class and remove from others
    setActiveTab("addressTab");
}

function showChangePassword() {
    // Show change password section and hide others
    document.getElementById("profile").style.display = "none";
    document.getElementById("orders").style.display = "none";
    document.getElementById("addAddress").style.display = "none";
    document.getElementById("changePassword").style.display = "block";

    // Set active class and remove from others
    setActiveTab("passwordTab");
}

// Function to set active tab
function setActiveTab(tabId) {
    // Remove active class from all tabs
    var tabs = document.querySelectorAll(".list-group-item");
    tabs.forEach((tab) => {
        tab.classList.remove("active");
    });
    // Add active class to the clicked tab
    document.getElementById(tabId).classList.add("active");
}

// Function to toggle sidebar visibility like a modal
document
    .getElementById("sidebarModalToggle")
    .addEventListener("click", function () {
        document.getElementById("sidebar").classList.toggle("d-none");
        document.body.classList.toggle("sidebar-modal-open"); // Add a class to body for styling
    });

// edit profile
document
    .getElementById("editProfileButton")
    .addEventListener("click", function () {
        var modal = new bootstrap.Modal(
            document.getElementById("editProfileModal")
        );
        modal.show();
    });

// add address
document
    .getElementById("addAddressButton")
    .addEventListener("click", function () {
        var modal = new bootstrap.Modal(document.getElementById("exampleModal"));
        modal.show();
    });

function validateForm() {
    const nameInput = document.getElementById("editUsername");
    const emailInput = document.getElementById("editEmail");
    const phoneInput = document.getElementById("editPhone");

    // Reset error messages
    document.getElementById("nameError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("phoneError").textContent = "";

    // Validate name
    const nameRegex = /^[a-zA-Z ]{3,}$/;
    if (!nameRegex.test(nameInput.value)) {
        document.getElementById("nameError").textContent =
            "Name must contain at least 3 letters.";
        return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
        document.getElementById("emailError").textContent = "Invalid email format";
        return false;
    }

    // Validate phone
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneInput.value)) {
        document.getElementById("phoneError").textContent =
            "Phone number must contain 10 digits and only numbers are allowed";
        return false;
    }

    return true; // Form is valid, allow submission
}
