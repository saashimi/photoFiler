const srcBtn = document.getElementById('srcBtn');
const destBtn = document.getElementById('destBtn');
const subBtn = document.getElementById('subBtn');

const srcPathElement = document.getElementById('srcPath');
const destPathElement = document.getElementById('destPath');
const msgElement = document.getElementById('successFail');

srcBtn.addEventListener('click', async () => {
  const srcPath = await window.electronAPI.openDirectory();
  srcPathElement.value = srcPath;
});

destBtn.addEventListener('click', async () => {
  const destPath = await window.electronAPI.openDirectory();
  destPathElement.value = destPath;
});

subBtn.addEventListener('click', async () => {
  const msg = await window.electronAPI.copyFiles(srcPathElement.value, destPathElement.value);
  if (typeof msg === "number") {
    msgElement.value = `Copied ${msg} files`;
  } else {
    msgElement.value = `${msg}`;
  }
});

