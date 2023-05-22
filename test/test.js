const {By, Builder, Browser, Key} = require('selenium-webdriver');
const {suite} = require("selenium-webdriver/testing")
const assert = require("assert")

suite(function (env) {
    describe('photoFiler tests', function () {
      this.timeout(10000)
      let driver;
      
      before(async function () {
        driver = await new Builder()
        // The "9515" is the port opened by ChromeDriver.
        .usingServer('http://localhost:9515')
        .withCapabilities({
            'goog:chromeOptions': {
            // Electron app binary.
            binary: 'release-builds/photofiler-darwin-x64/photofiler.app/Contents/MacOS/photofiler'
            }
        })
        .forBrowser('chrome')
        .build();        
      });
  
      after(async () => await driver.quit());
  
      it('Check Initialized', async function() {  
        let title = await driver.getTitle();
        assert.equal("📷 Photo 🗄️ Filer", title);
      });

      it("Source directory Input Box initial state", async function() {
        let sourceText = await driver.findElement(By.id('srcPath'))
        .getAttribute("placeholder");
        assert.equal(sourceText, "Select source directory");
      });

      it("Destination directory Input Box initial state", async function() {
        let destText = await driver.findElement(By.id('destPath'))
        .getAttribute("placeholder");
        assert.equal(destText, "Select destination directory");
      });
      
      it("Can enter text into src field", async function() {
        let sourceText = await driver.findElement(By.id('srcPath'))
        await driver.actions()
        .sendKeys(sourceText, '/Users/test')
        .pause(500)
        .keyDown(Key.COMMAND)
        .sendKeys(sourceText, 'a')
        .pause(500)
        .keyUp(Key.COMMAND)
        .pause(500)
        .keyDown(Key.DELETE)
        .pause(500)
        .keyUp(Key.DELETE)
        .perform()
        let val = await sourceText.getAttribute('placeholder')
        assert.equal(val, "Select source directory");
      });

    });
}, { browsers: [Browser.CHROME]});
