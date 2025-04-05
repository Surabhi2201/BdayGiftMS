let highestZ = 1;

class Paper {
  holdingPaper = false;
  touchStartX = 0;
  touchStartY = 0;
  touchMoveX = 0;
  touchMoveY = 0;
  touchEndX = 0;
  touchEndY = 0;
  prevTouchX = 0;
  prevTouchY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;

  init(paper) {
    let lastTap = 0;

    paper.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if(!this.rotating) {
        this.touchMoveX = e.touches[0].clientX;
        this.touchMoveY = e.touches[0].clientY;
        
        this.velX = this.touchMoveX - this.prevTouchX;
        this.velY = this.touchMoveY - this.prevTouchY;
      }
        
      const dirX = e.touches[0].clientX - this.touchStartX;
      const dirY = e.touches[0].clientY - this.touchStartY;
      const dirLength = Math.sqrt(dirX*dirX+dirY*dirY);
      const dirNormalizedX = dirX / dirLength;
      const dirNormalizedY = dirY / dirLength;

      const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
      let degrees = 180 * angle / Math.PI;
      degrees = (360 + Math.round(degrees)) % 360;
      if(this.rotating) {
        this.rotation = degrees;
      }

      if(this.holdingPaper) {
        if(!this.rotating) {
          this.currentPaperX += this.velX;
          this.currentPaperY += this.velY;
        }
        this.prevTouchX = this.touchMoveX;
        this.prevTouchY = this.touchMoveY;

        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }
    });

    paper.addEventListener('touchstart', (e) => {
      if(this.holdingPaper) return; 
      this.holdingPaper = true;
      
      paper.style.zIndex = highestZ;
      highestZ += 1;

      // --- Add-on: Visual Feedback on touch start ---
      paper.style.transition = 'transform 0.1s ease';
      paper.style.boxShadow = '0 15px 30px rgba(0,0,0,0.2)';
      paper.style.transform += ' scale(1.05)';
      // ---------------------------------------------

      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.prevTouchX = this.touchStartX;
      this.prevTouchY = this.touchStartY;
    });

    paper.addEventListener('touchend', () => {
      this.holdingPaper = false;
      this.rotating = false;

      // --- Add-on: Remove shadow on release ---
      paper.style.boxShadow = '';
      paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      // ----------------------------------------

      // --- Add-on: Momentum after release ---
      const friction = 0.95;
      const animateMomentum = () => {
        if (Math.abs(this.velX) > 0.5 || Math.abs(this.velY) > 0.5) {
          this.currentPaperX += this.velX;
          this.currentPaperY += this.velY;
          this.velX *= friction;
          this.velY *= friction;

          paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
          requestAnimationFrame(animateMomentum);
        }
      };
      requestAnimationFrame(animateMomentum);
      // --------------------------------------

      // --- Add-on: Double Tap to Reset ---
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      if (tapLength < 300 && tapLength > 0) {
        this.rotation = 0;
        this.currentPaperX = 0;
        this.currentPaperY = 0;
        paper.style.transform = `translateX(0px) translateY(0px) rotateZ(0deg)`;
      }

      lastTap = currentTime;
      // ------------------------------------
    });

    // For two-finger rotation on touch screens
    paper.addEventListener('gesturestart', (e) => {
      e.preventDefault();
      this.rotating = true;
    });
    paper.addEventListener('gestureend', () => {
      this.rotating = false;
    });
  }
}

// --- Add-on: Prevent page scrolling when dragging papers ---
document.body.style.touchAction = 'none';
// -----------------------------------------------------------

const papers = Array.from(document.querySelectorAll('.paper'));

papers.forEach(paper => {
  const p = new Paper();
  p.init(paper);
});