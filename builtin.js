import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto("https://builtin.com/companies/type/robotics-companies");
  await page.setViewport({ width: 1080, height: 1024 });

  // get the company list results
  const links = await page.evaluate(() => {
    const results = [];
    const items = Array.from(
      document.querySelectorAll(
        "#company-list section .container .row:nth-child(2) .company-unbounded-responsive"
      )
    );
    for (var item of items) {
      var link = item.querySelector("a:nth-child(3)");
      if (link) results.push(link.href);
    }
    return results;
  });
  var currentPage = 1;
  var finished = false;
  while (!finished) {
    // click on each company
    for (var item of links) {
      await page.goto(item);
      const selector =
        'button.job-category-pill[data-testid="job-filter-job-pill-6"]';
      const isDisabled = await page
        .locator(selector)
        .map((button) => button.disabled)
        .wait();

      // wait for a random amount of time to fool the bot detectors
      const randomWaitTime = Math.floor(Math.random() * 1000) + 2000;
      await delay(randomWaitTime);
      // scroll a bit to fool them
      await page.evaluate(() => {
        window.scrollTo(0, 500);
      });
      await delay(randomWaitTime);
      if (isDisabled) {
        await goBack(page);
      }

      await page
        .locator(selector)
        .filter((button) => !button.disabled)
        .click();
      await delay(randomWaitTime);
      const jobs = page.locator(".jobs row .job-item");

      // go back to prev page
      await goBack(page);
      await delay(randomWaitTime);
    }

    // click on the next page at the bottom, if it exists
    currentPage += 1;
    const selector = `li.page-item ::-p-text(${currentPage})`;

    const nextButton = await page.locator(selector).wait();
    if (nextButton) {
      await page.click(selector);
    } else {
      finished = true;
    }
  }

  await browser.close();
})();

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

function goBack(page) {
  return page.evaluate(() => {
    window.history.back();
  });
}

