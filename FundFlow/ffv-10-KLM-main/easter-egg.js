export function addSecretEffects() {
    const secretElements = document.querySelectorAll('.secret-text');
    secretElements.forEach(element => {
        element.classList.add('secret-effect');
    });
} 