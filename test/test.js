const {By, Builder, Browser} = require('selenium-webdriver');
const {suite} = require("selenium-webdriver/testing")
const assert = require("assert")
/*const driver = new webdriver.Builder()
  // The "9515" is the port opened by ChromeDriver.
  .usingServer('http://localhost:9515')
  .withCapabilities({
    'goog:chromeOptions': {
      // Here is the path to your Electron binary.
      binary: 'release-builds/photofiler-darwin-x64/photofiler.app/Contents/MacOS/photofiler'
    }
  })
  .forBrowser('chrome') // note: use .forBrowser('electron') for selenium-webdriver <= 3.6.0
  .build() */


suite(function (env) {
    describe('First script', function () {
      let driver;
      
      const documentInitialized = () => driver.executeScript('return initialized');

      before(async function () {
        driver = await new Builder()
        // The "9515" is the port opened by ChromeDriver.
        .usingServer('http://localhost:9515')
        .withCapabilities({
            'goog:chromeOptions': {
            // Here is the path to your Electron binary.
            binary: 'release-builds/photofiler-darwin-x64/photofiler.app/Contents/MacOS/photofiler'
            }
        })
        .forBrowser('chrome') // note: use .forBrowser('electron') for selenium-webdriver <= 3.6.0
        .build();        
      });
  
      after(async () => await driver.quit());
  
      it('Check Initialized', async function () {  
        let title = await driver.getTitle();
        assert.equal("📷 Photo 🗄️ Filer", title);

      });
    });
  }, { browsers: [Browser.CHROME]});
