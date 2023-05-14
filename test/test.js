const webdriver = require('selenium-webdriver')
const assert = require('assert')
const driver = new webdriver.Builder()
  // The "9515" is the port opened by ChromeDriver.
  .usingServer('http://localhost:9515')
  .withCapabilities({
    'goog:chromeOptions': {
      // Here is the path to your Electron binary.
      binary: 'release-builds/photofiler-darwin-x64/photofiler.app/Contents/MacOS/photofiler'
    }
  })
  .forBrowser('chrome') // note: use .forBrowser('electron') for selenium-webdriver <= 3.6.0
  .build()

  driver.wait(() => {
    return driver.getTitle().then((title) => {
      assert.equal(title, '📷 Photo 🗄️ Filer')
      return
    })
  }, 1000)
  driver.quit()