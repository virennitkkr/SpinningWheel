// Spinning Wheel Game Logic

const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const resultDiv = document.getElementById('result');
const ctx = wheel.getContext('2d');

// Configuration constants
const MIN_SPINS = 5;  // Minimum number of full rotations
const MAX_SPINS = 10; // Maximum number of full rotations

// Wheel segments
const segments = [
    { text: '100 Points', color: '#FF6B6B', textColor: '#fff' },
    { text: '50 Points', color: '#4ECDC4', textColor: '#fff' },
    { text: 'Try Again', color: '#45B7D1', textColor: '#fff' },
    { text: '200 Points', color: '#FFA07A', textColor: '#fff' },
    { text: '75 Points', color: '#98D8C8', textColor: '#fff' },
    { text: 'Bonus!', color: '#F7DC6F', textColor: '#333' },
    { text: '150 Points', color: '#BB8FCE', textColor: '#fff' },
    { text: '25 Points', color: '#85C1E2', textColor: '#fff' }
];

const numSegments = segments.length;
const segmentAngle = (2 * Math.PI) / numSegments;
let currentRotation = 0;
let isSpinning = false;

// Draw the wheel
function drawWheel() {
    const centerX = wheel.width / 2;
    const centerY = wheel.height / 2;
    const radius = wheel.width / 2 - 10;

    // Clear canvas
    ctx.clearRect(0, 0, wheel.width, wheel.height);

    // Save context
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation);

    // Draw segments
    for (let i = 0; i < numSegments; i++) {
        const angle = i * segmentAngle;
        
        // Draw segment
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, angle, angle + segmentAngle);
        ctx.closePath();
        ctx.fillStyle = segments[i].color;
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.rotate(angle + segmentAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = segments[i].textColor;
        ctx.font = 'bold 18px Arial';
        ctx.fillText(segments[i].text, radius - 20, 10);
        ctx.restore();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
}

// Spin the wheel
function spinWheel() {
    if (isSpinning) return;

    isSpinning = true;
    spinBtn.disabled = true;
    resultDiv.textContent = '';
    resultDiv.classList.remove('show');

    // Random number of spins
    const spins = Math.random() * (MAX_SPINS - MIN_SPINS) + MIN_SPINS;
    const extraDegrees = Math.random() * 360;
    const totalRotation = spins * 360 + extraDegrees;

    // Animation parameters
    const duration = 4000; // 4 seconds
    const startTime = Date.now();
    const startRotation = (currentRotation * 180) / Math.PI;

    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease out cubic)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const rotation = startRotation + totalRotation * easeOut;
        currentRotation = (rotation * Math.PI) / 180;

        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Spinning finished
            isSpinning = false;
            spinBtn.disabled = false;
            showResult();
        }
    }

    animate();
}

// Show the result
function showResult() {
    // Normalize rotation to 0-2π
    const normalizedRotation = currentRotation % (2 * Math.PI);
    
    // Calculate which segment is at the pointer position
    // The pointer is at the top (90 degrees or π/2 radians from the right)
    // We reverse the rotation direction (2π - rotation) because the wheel spins clockwise
    // but the canvas rotation is measured counter-clockwise
    const pointerAngle = (2 * Math.PI - normalizedRotation + Math.PI / 2) % (2 * Math.PI);
    const segmentIndex = Math.floor(pointerAngle / segmentAngle);
    
    const winningSegment = segments[segmentIndex];
    
    resultDiv.textContent = `You won: ${winningSegment.text}! 🎉`;
    resultDiv.classList.add('show');
}

// Event listener
spinBtn.addEventListener('click', spinWheel);

// Initial draw
drawWheel();

// Handle responsive canvas sizing
function resizeCanvas() {
    const container = document.querySelector('.wheel-container');
    if (!container) {
        console.error('Wheel container not found');
        return;
    }
    const size = Math.min(container.offsetWidth, container.offsetHeight);
    wheel.width = size;
    wheel.height = size;
    drawWheel();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
