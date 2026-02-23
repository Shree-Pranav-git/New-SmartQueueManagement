// Set this to your backend Render URL, e.g. "https://smart-queue-backend.onrender.com"
const API_BASE_URL = "https://new-smartqueuemanagement.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    // Custom Cursor Logic
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    if (cursor && follower) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Immediate cursor update
            cursor.style.left = `${mouseX}px`;
            cursor.style.top = `${mouseY}px`;
        });

        // Smooth follower animation
        function animateFollower() {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            
            follower.style.left = `${followerX}px`;
            follower.style.top = `${followerY}px`;
            
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        // Hover effects for interactive elements
        const interactiveElements = document.querySelectorAll('a, button, input');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
        
        // Ensure new dynamic elements get the hover effect
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        if (node.matches('a, button, input')) {
                            node.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
                            node.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
                        }
                        const children = node.querySelectorAll('a, button, input');
                        children.forEach(child => {
                            child.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
                            child.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
                        });
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    const bookingForm = document.getElementById("bookingForm");
    if (bookingForm) {
        bookingForm.addEventListener("submit", handleBookingSubmit);
        refreshQueue();
        setInterval(refreshQueue, 5000);
    }

    const adminTable = document.getElementById("adminTable");
    if (adminTable) {
        loadAdminData();
        setInterval(loadAdminData, 5000);
    }
});

async function handleBookingSubmit(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const resultDiv = document.getElementById("bookingResult");
    resultDiv.textContent = "Booking...";
    resultDiv.className = "result";

    try {
        const body = new URLSearchParams();
        body.append("name", name);
        body.append("phone", phone);

        const res = await fetch(`${API_BASE_URL}/api/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            body
        });

        const data = await res.json();
        if (data.success) {
            resultDiv.classList.add("success");
            resultDiv.textContent =
                `Your token is ${data.token}. Your position in queue is ${data.position}.`;
            document.getElementById("bookingForm").reset();
            refreshQueue();
        } else {
            resultDiv.classList.add("error");
            resultDiv.textContent = data.message || "Failed to book appointment.";
        }
    } catch (err) {
        console.error(err);
        resultDiv.classList.add("error");
        resultDiv.textContent = "Error connecting to server.";
    }
}

async function refreshQueue() {
    const currentServingEl = document.getElementById("currentServing");
    const queueBody = document.getElementById("queueBody");
    if (!currentServingEl || !queueBody) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/queue`);
        const data = await res.json();

        currentServingEl.textContent =
            data.currentServing ? `Currently serving token: ${data.currentServing}` :
                                  "No token is currently being served.";

        queueBody.innerHTML = "";
        data.waiting.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.phone}</td>
                <td><span class="status-badge status-${item.status}">${item.status}</span></td>
            `;
            queueBody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        currentServingEl.textContent = "Failed to load queue.";
    }
}

async function loadAdminData() {
    const adminBody = document.getElementById("adminBody");
    if (!adminBody) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/admin`);
        const data = await res.json();

        adminBody.innerHTML = "";
        data.forEach(item => {
            const tr = document.createElement("tr");

            const isWaiting = item.status === "WAITING";
            const isServing = item.status === "SERVING";

            tr.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.phone}</td>
                <td><span class="status-badge status-${item.status}">${item.status}</span></td>
                <td>
                    <button ${isWaiting ? "" : "disabled"} onclick="updateStatus(${item.id}, 'SERVING')">
                        Mark Serving
                    </button>
                    <button ${isServing ? "" : "disabled"} onclick="updateStatus(${item.id}, 'COMPLETED')">
                        Mark Completed
                    </button>
                </td>
            `;
            adminBody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

async function updateStatus(id, action) {
    try {
        const body = new URLSearchParams();
        body.append("id", id);
        body.append("action", action);

        const res = await fetch(`${API_BASE_URL}/api/admin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            body
        });

        const data = await res.json();
        if (!data.success) {
            alert(data.message || "Failed to update status.");
        }
        loadAdminData();
        refreshQueue();
    } catch (err) {
        console.error(err);
        alert("Error updating status.");
    }
}

