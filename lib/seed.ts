import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

let initialized = false;

export async function initDb() {
  if (initialized) return;
  initialized = true;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS scam_types (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        warning_signs TEXT NOT NULL DEFAULT '[]'
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        expires_at TIMESTAMP NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        platform TEXT NOT NULL,
        scam_type_id INTEGER NOT NULL REFERENCES scam_types(id),
        user_id INTEGER REFERENCES users(id),
        financial_loss REAL,
        reporter_age TEXT,
        status TEXT NOT NULL DEFAULT 'received',
        admin_notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS tips (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        icon TEXT NOT NULL
      )
    `;

    // Check if already seeded
    const count = await sql`SELECT COUNT(*) as c FROM scam_types`;
    if (Number(count[0].c) > 0) return;

    // Create default admin
    const adminPassword = await bcrypt.hash("admin123", 12);
    await sql`
      INSERT INTO users (username, email, password_hash, is_admin)
      VALUES ('admin', 'admin@scamshield.com', ${adminPassword}, true)
      ON CONFLICT DO NOTHING
    `;

    // Seed scam types
    await sql`
      INSERT INTO scam_types (name, description, icon, warning_signs) VALUES
      ('Phishing', 'Fraudulent messages impersonating legitimate organisations to steal credentials or personal data.', 'fish', '["Urgent language demanding immediate action","Suspicious sender addresses","Links to unfamiliar websites","Requests for passwords or 2FA codes"]'),
      ('Romance Scam', 'Scammers build a fake romantic relationship online then request money or gifts.', 'heart', '["Never willing to meet in person or video call","Professes love very quickly","Always has an excuse to not meet","Asks for money or gift cards"]'),
      ('Investment Fraud', 'Fake investment schemes promising unrealistically high returns.', 'trending-up', '["Guaranteed high returns with no risk","Pressure to invest immediately","Unregistered sellers","Complex strategies hard to understand"]'),
      ('Tech Support Scam', 'Fake tech support claiming your device is infected to gain access or charge for fake services.', 'monitor', '["Unsolicited calls or pop-ups about infection","Requests for remote access","Demands payment via gift cards","Urgency and threats about losing data"]'),
      ('Job Scam', 'Fake job offers that require upfront fees or aim to steal personal information.', 'briefcase', '["Job offer with no interview","Requires upfront payment","Salary unusually high for simple tasks","Requests your bank details early"]'),
      ('Lottery / Prize Scam', 'Victims are told they won a prize but must pay fees to claim it.', 'gift', '["You won a contest you never entered","Required to pay fees to release prize","Contact via unsolicited message","Pressure to keep it secret"]')
    `;

    // Seed tips
    await sql`
      INSERT INTO tips (title, content, category, icon) VALUES
      ('Verify before you click', 'Always hover over links before clicking to check the actual URL. Look for misspellings or extra characters in domain names.', 'general', 'mouse-pointer'),
      ('Use strong unique passwords', 'Use a password manager to generate and store unique passwords for every account. Never reuse passwords across services.', 'general', 'lock'),
      ('Enable 2-factor authentication', 'Turn on 2FA on every account that supports it. Use an authenticator app rather than SMS when possible.', 'general', 'shield'),
      ('Be suspicious of urgency', 'Scammers create false urgency to prevent you from thinking critically. Slow down and verify any urgent request through an official channel.', 'recognition', 'alert-triangle'),
      ('Never pay with gift cards', 'No legitimate government body or business will ever ask you to pay using gift cards. This is always a scam.', 'recognition', 'credit-card'),
      ('Verify by calling back officially', 'If you receive an unexpected call from your bank, hang up and call back using the official number from their website.', 'recognition', 'phone'),
      ('Protect your personal information', 'Never give out your full name, address, or financial details to someone who contacted you unexpectedly.', 'privacy', 'user-x'),
      ('Review privacy settings', 'Review the privacy settings on your social media. Limit who can see your personal info to reduce exposure to targeted scams.', 'privacy', 'settings'),
      ('Report scam attempts', 'Always report scam attempts to the platform they occurred on and to your national cybercrime authority.', 'recovery', 'flag'),
      ('Contact your bank immediately if scammed', 'If you sent money to a scammer, contact your bank immediately. Acting quickly gives the best chance of recovering funds.', 'recovery', 'building-2')
    `;

    // Seed dummy reports
    await sql`
      INSERT INTO reports (title, description, platform, scam_type_id, financial_loss, reporter_age, status, created_at) VALUES
      ('Fake job offer promised $5000/month for simple data entry', 'I received a message on Facebook from someone claiming to be an HR manager at a multinational company. They offered me a data entry job paying $5000 per month with no experience required. They asked me to pay $200 for a training kit upfront. After I paid, they disappeared and blocked me on all platforms.', 'Facebook', 5, 200, '18-24', 'investigating', NOW() - INTERVAL ''2 days''),
      ('Received phishing email pretending to be from my bank', 'Got an email from what looked like my bank saying my account was suspended due to suspicious activity. When I clicked the link it asked for my full card number, CVV and PIN. I almost entered my details but noticed the URL was slightly different from the real bank website.', 'Email', 1, NULL, '35-44', 'resolved', NOW() - INTERVAL ''5 days''),
      ('Romance scammer on Instagram asked for gift cards', 'Someone with an attractive profile picture sent me a follow request on Instagram. We talked for 3 weeks and they said they were a doctor working abroad. Eventually they asked me to send Google Play gift cards worth $300.', 'Instagram', 2, 300, '45-54', 'received', NOW() - INTERVAL ''1 days''),
      ('WhatsApp crypto investment scam lost $2500', 'Someone added me to a WhatsApp group about cryptocurrency investments. I invested $500 and they showed me fake profits in an app. When I tried to withdraw my $2500 they said I had to pay a 20% tax first and then disappeared.', 'WhatsApp', 3, 2500, '25-34', 'investigating', NOW() - INTERVAL ''3 days''),
      ('Fake Microsoft support called saying my PC had virus', 'Received a call from someone claiming to be from Microsoft Support. They asked me to install a remote access app and showed me fake error messages. They wanted $299 for a lifetime protection plan.', 'Phone', 4, 299, '55-64', 'resolved', NOW() - INTERVAL ''7 days''),
      ('Won a lottery I never entered via SMS', 'Received an SMS saying I had won $50,000 in an international lottery draw. When I called the number they asked me to pay $150 to release my winnings for customs clearance.', 'Phone', 6, NULL, '35-44', 'received', NOW() - INTERVAL ''4 days''),
      ('Phishing link sent through Facebook Messenger', 'A friend account was hacked and sent me a message with a link. I clicked the link which took me to a fake Facebook login page and my account was also hacked.', 'Facebook', 1, NULL, '18-24', 'resolved', NOW() - INTERVAL ''10 days''),
      ('Fake Telegram crypto trading bot scam', 'Joined a Telegram channel that promoted an automated crypto trading bot. I paid $100 to activate the bot. When I tried to withdraw they asked for a $200 withdrawal fee.', 'Telegram', 3, 300, '25-34', 'investigating', NOW() - INTERVAL ''6 days''),
      ('Scammer pretended to be Australian soldier on dating app', 'Met someone on a dating app who said they were an army officer. They said they needed money for emergency medical treatment. Total loss was $850 before I stopped.', 'Website', 2, 850, '55-64', 'received', NOW() - INTERVAL ''8 days''),
      ('Email saying I owe taxes and will be arrested', 'Received an email claiming to be from the tax authority saying I owed $1200 in back taxes. The payment link asked for gift cards.', 'Email', 1, NULL, '45-54', 'resolved', NOW() - INTERVAL ''12 days''),
      ('TikTok ad led to fake investment website', 'Saw a TikTok video promoting a crypto trading platform with guaranteed 30% weekly returns. Deposited $1000. When I tried to withdraw they asked for another $500 first.', 'TikTok', 3, 1000, '18-24', 'investigating', NOW() - INTERVAL ''9 days''),
      ('Job scam via LinkedIn required equipment purchase', 'Got a LinkedIn message offering a remote role paying $25 per hour. They said I needed to buy a special work laptop for $600 and would be reimbursed. I paid and never heard from them again.', 'Website', 5, 600, '25-34', 'received', NOW() - INTERVAL ''11 days'')
    `;

  } catch (error) {
    console.error("initDb error:", error);
    throw error;
  }
}