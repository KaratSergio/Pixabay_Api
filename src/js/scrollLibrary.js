export function initializeScrollObserver(handleScroll) {
  const observer = new IntersectionObserver(handleIntersection, {threshold: 0,});
  const loadingIndicator = document.createElement('div');
  loadingIndicator.classList.add('loading-indicator');
  document.body.appendChild(loadingIndicator);
  observer.observe(loadingIndicator);

  function handleIntersection(entries) {
    handleScroll(entries);
  }
}