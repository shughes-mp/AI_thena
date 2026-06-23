import type { Browser } from "puppeteer-core";

const SERVERLESS_VIEWPORT = {
  deviceScaleFactor: 1,
  hasTouch: false,
  height: 1080,
  isLandscape: false,
  isMobile: false,
  width: 1440,
};

export async function launchPdfBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    const [{ default: chromium }, { default: puppeteer }] = await Promise.all([
      import("@sparticuz/chromium"),
      import("puppeteer-core"),
    ]);

    return puppeteer.launch({
      args: await puppeteer.defaultArgs({
        args: chromium.args,
        headless: "shell",
      }),
      defaultViewport: SERVERLESS_VIEWPORT,
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
  }

  const { default: puppeteer } = await import("puppeteer");
  return puppeteer.launch({ headless: true });
}
