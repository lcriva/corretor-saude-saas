
import { getPdfContent } from './services/pdfLoader';

async function verify() {
    try {
        console.log("Fetching PDF content...");
        const text = await getPdfContent();
        console.log("--- START PREVIEW ---");
        console.log(text.substring(0, 2000)); // Print first 2000 chars
        console.log("--- END PREVIEW ---");
        console.log(`Total Length: ${text.length}`);
    } catch (e) {
        console.error("Error:", e);
    }
}

verify();
