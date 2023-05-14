const {By, Builder, Browser} = require('selenium-webdriver');
const {suite} = require("selenium-webdriver/testing")
const assert = require("assert")

suite(function (env) {
    describe('First script', function () {
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
  
      it('Check Initialized', async function () {  
        await driver.manage().setTimeouts({implicit: 10000});
        let title = await driver.getTitle();
        assert.equal("📷 Photo 🗄️ Filer", title);
      });

      it("Source directory Input Box initial state", async function() {
        await driver.manage().setTimeouts({implicit: 10000});
        let sourceText = await driver.findElement(By.id('srcPath'))
        .getAttribute("placeholder");
        //let value = await sourceText.getText();
        assert.equal(sourceText, "Select source directory");
      });

      it("Destination directory Input Box initial state", async function() {
        await driver.manage().setTimeouts({implicit: 10000});
        let destText = await driver.findElement(By.id('destPath'))
        .getAttribute("placeholder");
        //let value = await destText.getText();
        assert.equal(destText, "Select destination directory");
      });

    });
}, { browsers: [Browser.CHROME]});
