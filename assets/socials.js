// Import the Flip plugin from the gsap library
gsap.registerPlugin(Flip);

// Select all elements with the class 'social-card' and store them in the 'cards' variable
const cards = document.querySelectorAll('.social-card');

// Loop through each card element and add a click event listener
cards.forEach((card, index) => {
  card.addEventListener('click', () => {
    // Get the state of all the card elements using the Flip plugin
    const state = Flip.getState(cards);

    // Check if the clicked card is already active
    const isCardActive = card.classList.contains('active');

    // Loop through all the card elements again to modify their classes
    cards.forEach((otherCard, otherIndex) => {
      otherCard.classList.remove('active');
      otherCard.classList.remove('inactive');

      // Check if the clicked card is inactive and not the current card being looped over
      if (!isCardActive && index !== otherIndex) {
        otherCard.classList.add('inactive');
      }
    });

    // Add the 'active' class to the clicked card only if it's not already active
    if (!isCardActive) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }

    Flip.from(state, {
      duration: 1,
      ease: 'expo.out',
      // Use 'false' for the 'absolute' option to avoid using absolute positioning
      absolute: false,
      // Use 'auto' for the 'grid-auto-rows' property to make the rows flexible
      // Use 'auto' for the 'grid-auto-columns' property to make the columns flexible
      gridAutoRows: 'auto',
      gridAutoColumns: 'auto',
      // Add a 'gap' option to specify the grid gap (in pixels)
      gap: 16,
    });
  });
});
