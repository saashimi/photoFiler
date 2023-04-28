const srcBtn = document.getElementById('srcBtn');
const destBtn = document.getElementById('destBtn');
const subBtn = document.getElementById('subBtn');

const srcPathElement = document.getElementById('srcPath');
const destPathElement = document.getElementById('destPath');
const msgElement = document.getElementById('successFail');

srcBtn.addEventListener('click', async () => {
  const srcPath = await window.electronAPI.openDirectory();
  srcPathElement.innerText = srcPath;
});

destBtn.addEventListener('click', async () => {
  const destPath = await window.electronAPI.openDirectory();
  destPathElement.innerText = destPath;
});

subBtn.addEventListener('click', async () => {
  const msg = await window.electronAPI.copyFiles(srcPathElement.innerText, destPathElement.innerText);
  if (typeof msg === "number") {
    msgElement.innerText = `Copied ${msg} files`;
  } else {
    msgElement.innerText = `${msg}`;
  }
});

