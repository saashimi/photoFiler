const srcBtn = document.getElementById('srcBtn')
const destBtn = document.getElementById('destBtn')
const subBtn = document.getElementById('subBtn')

const srcPathElement = document.getElementById('srcPath')
const destPathElement = document.getElementById('destPath')

srcBtn.addEventListener('click', async () => {
  const srcPath = await window.electronAPI.openDirectory()
  srcPathElement.innerText = srcPath
})

destBtn.addEventListener('click', async () => {
  const destPath = await window.electronAPI.openDirectory()
  destPathElement.innerText = destPath
})

subBtn.addEventListener('click', async () => {
  window.electronAPI.copyFiles(srcPathElement.innerText, destPathElement.innerText)
})

