document.addEventListener("DOMContentLoaded", () => {
  const wall = document.querySelector(".poster-section");
  const paper = document.querySelector(".paper");
  const inner = document.querySelector(".paper__inner");

  if (!wall || !paper || !inner) return;

  const createSheet = (isFirst = false) => {
    const sheet = document.createElement("div");
    sheet.className = "paper paper--continuation";
    sheet.style.cssText = `
      position: relative;
      background-color: var(--paper);
      width: 60%;
      aspect-ratio: 8.5 / 11;
      box-shadow: 2px 3px 0 var(--paper-border), 6px 10px 0 rgba(0,0,0,0.22);
      overflow: hidden;
      margin-top: 32px;
    `;

    const stripe = document.createElement("div");
    stripe.className = "paper__top-stripe";
    stripe.setAttribute("aria-hidden", "true");

    const sheetInner = document.createElement("div");
    sheetInner.className = "paper__inner";

    if (!isFirst) {
      const contLabel = document.createElement("p");
      contLabel.className = "paper__classification";
      contLabel.textContent = "CONTINUED //";
      sheetInner.appendChild(contLabel);
    }

    sheet.appendChild(stripe);
    sheet.appendChild(sheetInner);
    return { sheet, inner: sheetInner };
  };

  const getOverflowingChildren = (containerInner, containerPaper) => {
    const children = Array.from(containerInner.children);
    const paperBottom = containerPaper.offsetTop + containerPaper.offsetHeight;

    const overflowing = [];
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      const childBottom = child.offsetTop + child.offsetHeight;
      if (childBottom > containerPaper.offsetHeight) {
        overflowing.unshift(child);
      } else {
        break;
      }
    }
    return overflowing;
  };

const checkOverflow = () => {
  paper.style.overflow = 'visible';
  
  // Force layout recalculation before measuring
  document.body.offsetHeight;

  let currentPaper = paper;
  let currentInner = inner;
  let iterations = 0;
  const maxIterations = 10;

  while (iterations < maxIterations) {
    iterations++;

    // Force reflow before measuring this iteration
    currentPaper.style.overflow = 'visible';
    void currentPaper.offsetHeight;

    const paperRect = currentPaper.getBoundingClientRect();
    const paperBottom = paperRect.bottom;
    const children = Array.from(currentInner.children);

    const overflowEls = [];
    let overflowStarted = false;

    for (let i = 0; i < children.length; i++) {
      const childRect = children[i].getBoundingClientRect();
      if (childRect.bottom > paperBottom || overflowStarted) {
        overflowStarted = true;
        overflowEls.push(children[i]);
      }
    }

    console.log(`Iteration ${iterations}: paperBottom=${paperBottom.toFixed(0)}, overflow count=${overflowEls.length}`);

    if (overflowEls.length === 0) {
      currentPaper.style.overflow = 'hidden';
      break;
    }

    // Keep at least one element on this sheet
    // If all children are overflowing, only move from the second child onward
    const elsToMove = overflowEls.length === children.length
      ? overflowEls.slice(1)
      : overflowEls;

    if (elsToMove.length === 0) {
      currentPaper.style.overflow = 'hidden';
      break;
    }

    currentPaper.style.overflow = 'hidden';

    const nextSheet = document.createElement('div');
    nextSheet.className = 'paper paper--continuation';
    nextSheet.style.cssText = `
      position: relative;
      background-color: var(--paper);
      width: ${window.innerWidth <= 768 ? '90%' : '60%'};
      aspect-ratio: 8.5 / 11;
      box-shadow: 2px 3px 0 var(--paper-border), 6px 10px 0 rgba(0,0,0,0.22);
      overflow: visible;
      margin-top: 32px;
    `;

    const stripe = document.createElement('div');
    stripe.className = 'paper__top-stripe';
    stripe.setAttribute('aria-hidden', 'true');

    const nextInner = document.createElement('div');
    nextInner.className = 'paper__inner';

    const contLabel = document.createElement('p');
    contLabel.className = 'paper__classification';
    contLabel.textContent = 'CONTINUED //';
    nextInner.appendChild(contLabel);

    elsToMove.forEach(el => nextInner.appendChild(el));

    nextSheet.appendChild(stripe);
    nextSheet.appendChild(nextInner);
    wall.appendChild(nextSheet);

    // Force layout after appending before next iteration measures
    void nextSheet.offsetHeight;

    currentPaper = nextSheet;
    currentInner = nextInner;
  }

  currentPaper.style.overflow = 'hidden';
};
  if (document.fonts) {
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(checkOverflow);
      });
    });
  } else {
    window.addEventListener("load", () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(checkOverflow);
      });
    });
  }
});
