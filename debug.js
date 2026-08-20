const puppeteer = require('puppeteer');
(async () => {
    try {
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('LOG:', msg.text()));
        page.on('pageerror', err => console.log('ERROR:', err.message));
        
        await page.goto('file:///C:/Users/ridho/.gemini/antigravity/scratch/antygravit/arcade.html', {waitUntil: 'networkidle0'});
        
        // Wait for the game cards to render
        await page.waitForSelector('.group.bg-white.rounded-3xl', {timeout: 5000});
        
        console.log('Found game card, clicking...');
        // Click the first game card
        await page.click('.group.bg-white.rounded-3xl');
        
        // Wait 2 seconds for modal to do its thing
        await new Promise(r => setTimeout(r, 2000));
        
        console.log('Modal opened (maybe). Taking screenshot...');
        await page.screenshot({path: 'arcade-debug.png'});
        
        await browser.close();
    } catch(e) {
        console.log('EXCEPTION:', e);
    }
})();
