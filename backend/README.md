# Lead capture: Google Sheet setup (about 10 minutes)

Every enquiry from the website lands in a Google Sheet. Customer logos are saved to a private Google Drive folder, and the sheet links to them.

| Status in sheet | What it means | What to do |
|---|---|---|
| `partial` | The visitor typed a valid phone number but hasn't tapped "Send on WhatsApp" yet (or left the page) | **Call them.** These are warm leads you'd otherwise lose |
| `whatsapp` | The visitor tapped the WhatsApp button | Check WhatsApp for their message; the `Ref` code matches the one at the end of their message |

Each enquiry is one row. The row updates as the visitor keeps typing, so you won't get duplicates. Use the **Follow-up notes** column for your team's notes; the website never overwrites it.

## Steps

1. Go to [sheets.new](https://sheets.new) and name the sheet **Marquee Goods – Leads**.
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the sample code, paste in everything from [`Code.gs`](Code.gs), and click **Save**.
4. *(Optional)* To get an email for every new lead, set `NOTIFY_EMAIL` at the top of the file to your address.
5. Click **Deploy → New deployment**. Under the gear icon, choose **Web app**, then set:
   - **Execute as:** Me
   - **Who has access:** Anyone
6. Click **Deploy**, then **Authorize access** and allow the permissions (Sheets, Drive, and Mail if you turned on email).
7. Copy the **Web app URL** (it ends in `/exec`).
8. Open [`_src/data.mjs`](../_src/data.mjs), paste the URL into `leadEndpoint: ''`, then rebuild the site:

   ```bash
   node _src/build.mjs
   ```

9. Test it: open the site, type a name and a 10-digit number on any product page, wait 2 seconds, and a `partial` row should appear in the sheet.

## Updating the script later

After you edit `Code.gs`, go to **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. The URL stays the same.

## Security notes

- "Anyone" access is required so the website can post to the script without a login. The script only **writes** rows; it never returns sheet data to the browser.
- The script checks and limits every input: lengths are capped, text that would start a spreadsheet formula is neutralised, and uploads are limited to 5 MB. A file's type is checked from its contents, so only PNG, JPG, WEBP, SVG and PDF are accepted. There's also basic rate limiting and a hidden honeypot field to catch bots.
- The **Estimate shown** column is the price the visitor saw on the website. Always confirm the final price yourself; never treat it as agreed.
- The Drive folder stays private to your Google account. Share individual files only if you need to.
