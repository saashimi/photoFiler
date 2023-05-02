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
  subBtn.setAttribute("class", "button is-warning is-loading");
  msgElement.innerHTML = "Copying files ... "
  const msg = await window.electronAPI.copyFiles(srcPathElement.value, destPathElement.value);
  subBtn.setAttribute("class", "button is-warning");
  if (typeof msg === "number") {
    msgElement.innerHTML = `Copied ${msg} files`;
  } else {
    msgElement.innerHTML = `${msg}`;
  }
});

