export function initializeScrollObserver(handleScroll) {
  const observer = new IntersectionObserver(handleIntersection, {threshold: 0.5,});
  const loadingIndicator = document.createElement('div');
  document.body.appendChild(loadingIndicator);
  observer.observe(loadingIndicator);

  function handleIntersection(entries) {
    handleScroll(entries);
  }
}
