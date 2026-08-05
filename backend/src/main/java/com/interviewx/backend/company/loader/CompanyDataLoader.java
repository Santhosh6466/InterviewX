package com.interviewx.backend.company.loader;

import com.interviewx.backend.company.entity.Company;
import com.interviewx.backend.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CompanyDataLoader implements CommandLineRunner {

    private final CompanyRepository companyRepository;

    @Override
    public void run(String... args) {
        try {
            long count = companyRepository.count();
            if (count >= 60) {
                log.info("[CompanyDataLoader] Company collection already has {} entries. Skipping seed.", count);
                return;
            }

            log.info("[CompanyDataLoader] Seeding top tech companies (current count: {})...", count);

            List<CompanySeedData> seedList = getCompaniesToSeed();
            List<Company> toInsert = new ArrayList<>();

            for (CompanySeedData seed : seedList) {
                if (!companyRepository.existsByName(seed.name)) {
                    Company company = Company.builder()
                            .name(seed.name)
                            .domain(seed.domain)
                            .logoUrl(seed.logoUrl)
                            .rating(seed.rating)
                            .totalRating(seed.totalRating)
                            .description(seed.description)
                            .positives(seed.positives)
                            .reviews(seed.reviews)
                            .salaries(seed.salaries)
                            .interviews(seed.interviews)
                            .jobs(seed.jobs)
                            .benefits(seed.benefits)
                            .photos(seed.photos)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();

                    toInsert.add(company);
                }
            }

            if (!toInsert.isEmpty()) {
                companyRepository.saveAll(toInsert);
                log.info("[CompanyDataLoader] Successfully seeded {} additional companies. Total companies now: {}", 
                        toInsert.size(), companyRepository.count());
            }
        } catch (Exception e) {
            log.warn("[CompanyDataLoader] Error during company data seeding: {}", e.getMessage());
        }
    }

    private static class CompanySeedData {
        String name;
        String domain;
        String logoUrl;
        Double rating;
        String totalRating;
        String description;
        String positives;
        String reviews;
        String salaries;
        String interviews;
        String jobs;
        String benefits;
        String photos;

        CompanySeedData(String name, String domain, String logoUrl, Double rating, String totalRating,
                        String description, String positives, String reviews, String salaries,
                        String interviews, String jobs, String benefits, String photos) {
            this.name = name;
            this.domain = domain;
            this.logoUrl = logoUrl;
            this.rating = rating;
            this.totalRating = totalRating;
            this.description = description;
            this.positives = positives;
            this.reviews = reviews;
            this.salaries = salaries;
            this.interviews = interviews;
            this.jobs = jobs;
            this.benefits = benefits;
            this.photos = photos;
        }
    }

    private List<CompanySeedData> getCompaniesToSeed() {
        List<CompanySeedData> list = new ArrayList<>();

        list.add(new CompanySeedData("Google", "google.com", "https://logo.clearbit.com/google.com", 4.5, "42k+", "Technology | Search, Cloud & AI", "Great compensation, work-life balance, cutting-edge projects", "42000", "55000", "12500", "850", "Comprehensive health, free food, 401k match", ""));
        list.add(new CompanySeedData("Microsoft", "microsoft.com", "https://logo.clearbit.com/microsoft.com", 4.4, "38k+", "Technology | Cloud, OS & Productivity", "Exceptional culture, strong benefits, steady growth", "38000", "48000", "11000", "1200", "Health coverage, parental leave, gym discounts", ""));
        list.add(new CompanySeedData("Amazon", "amazon.com", "https://logo.clearbit.com/amazon.com", 4.1, "55k+", "E-Commerce & Cloud | AWS & Retail", "Massive scale, fast-paced environment, high ownership", "55000", "62000", "18000", "3400", "Healthcare, stock units, career progression", ""));
        list.add(new CompanySeedData("Apple", "apple.com", "https://logo.clearbit.com/apple.com", 4.3, "29k+", "Consumer Electronics | Hardware & Software", "Iconic products, talented peers, great discounts", "29000", "32000", "8200", "620", "Product discounts, healthcare, wellness programs", ""));
        list.add(new CompanySeedData("Meta", "meta.com", "https://logo.clearbit.com/meta.com", 4.3, "22k+", "Social Media & AI | VR & Networks", "High engineering bar, top-tier compensation, high autonomy", "22000", "28000", "7900", "450", "Free meals, wellness allowance, generous equity", ""));
        list.add(new CompanySeedData("Netflix", "netflix.com", "https://logo.clearbit.com/netflix.com", 4.2, "8k+", "Streaming & Entertainment | Media Tech", "Top of market compensation, high freedom and responsibility", "8000", "12000", "3400", "180", "All-cash compensation, unlimited PTO, premium benefits", ""));
        list.add(new CompanySeedData("Uber", "uber.com", "https://logo.clearbit.com/uber.com", 4.2, "16k+", "Transportation & Delivery | Mobility Tech", "Challenging distributed systems, strong compensation", "16000", "19000", "5200", "380", "Uber credits, health insurance, flexible work", ""));
        list.add(new CompanySeedData("Stripe", "stripe.com", "https://logo.clearbit.com/stripe.com", 4.4, "6k+", "Financial Technology | Global Payments", "Brilliant engineering culture, high craft, modern stack", "6000", "9000", "2800", "220", "Remote flexibility, wellness benefits, competitive equity", ""));
        list.add(new CompanySeedData("Airbnb", "airbnb.com", "https://logo.clearbit.com/airbnb.com", 4.3, "7k+", "Travel & Hospitality | Marketplace Platform", "Live and work anywhere, beautiful design philosophy", "7000", "8500", "2400", "190", "Annual travel credit, wellness stipend, remote flexibility", ""));
        list.add(new CompanySeedData("Spotify", "spotify.com", "https://logo.clearbit.com/spotify.com", 4.3, "9k+", "Audio & Media | Music Streaming", "Vibrant culture, agile autonomous squads, music perks", "9000", "11000", "3100", "210", "Flexible work anywhere, music perks, health insurance", ""));
        list.add(new CompanySeedData("Adobe", "adobe.com", "https://logo.clearbit.com/adobe.com", 4.4, "15k+", "Creative Software & Cloud | SaaS", "Healthy work-life balance, innovative creative suites", "15000", "18000", "4300", "410", "Educational reimbursement, wellness subsidy, sabbatical", ""));
        list.add(new CompanySeedData("Salesforce", "salesforce.com", "https://logo.clearbit.com/salesforce.com", 4.3, "21k+", "Enterprise Software | CRM & Cloud", "Ohana culture, philanthropic focus, strong sales enablement", "21000", "26000", "5900", "730", "Volunteer time off, comprehensive health, 401k match", ""));
        list.add(new CompanySeedData("Nvidia", "nvidia.com", "https://logo.clearbit.com/nvidia.com", 4.7, "12k+", "Semiconductors & AI | GPU Computing", "World leader in AI hardware, stellar equity growth", "12000", "15000", "4100", "520", "ESPP discounts, health plans, top tech stack", ""));
        list.add(new CompanySeedData("Oracle", "oracle.com", "https://logo.clearbit.com/oracle.com", 3.9, "31k+", "Enterprise Software | Database & OCI", "Large scale enterprise contracts, good stability", "31000", "39000", "8800", "1100", "Health benefits, stock purchase, flexible hours", ""));
        list.add(new CompanySeedData("Cisco", "cisco.com", "https://logo.clearbit.com/cisco.com", 4.3, "27k+", "Networking & Cybersecurity | Enterprise", "Award-winning workplace culture, strong job security", "27000", "33000", "7200", "640", "Flexible hours, birthday off, comprehensive insurance", ""));
        list.add(new CompanySeedData("Intel", "intel.com", "https://logo.clearbit.com/intel.com", 4.0, "28k+", "Semiconductors | Silicon & Chips", "Deep tech engineering, great sabbatical program", "28000", "34000", "7600", "890", "Sabbaticals, stock purchase plan, tuition aid", ""));
        list.add(new CompanySeedData("LinkedIn", "linkedin.com", "https://logo.clearbit.com/linkedin.com", 4.5, "11k+", "Professional Networking | Social Platform", "InvestInYou wellness funds, supportive leadership", "11000", "14000", "3600", "290", "InDay monthly rest, wellness reimbursement, free food", ""));
        list.add(new CompanySeedData("Twitter", "x.com", "https://logo.clearbit.com/x.com", 3.8, "9k+", "Social Media | Microblogging & Realtime", "High speed iteration, massive global user reach", "9000", "11000", "3100", "150", "Competitive compensation, healthcare coverage", ""));
        list.add(new CompanySeedData("ByteDance", "bytedance.com", "https://logo.clearbit.com/bytedance.com", 4.1, "14k+", "Media & AI | TikTok Platform", "Extreme viral growth, challenging algorithms, high bonuses", "14000", "17000", "4800", "620", "Free daily meals, gym stipend, performance bonuses", ""));
        list.add(new CompanySeedData("Coinbase", "coinbase.com", "https://logo.clearbit.com/coinbase.com", 4.1, "5k+", "Cryptocurrency & Web3 | Exchange Platform", "Remote-first culture, crypto incentives, high compensation", "5000", "7200", "1900", "140", "Crypto allowance, recharge weeks, remote stipend", ""));
        list.add(new CompanySeedData("Palantir", "palantir.com", "https://logo.clearbit.com/palantir.com", 4.2, "6k+", "Big Data & AI | Enterprise Intelligence", "High mission focus, tough technical problems, smart peers", "6000", "8400", "2200", "180", "High quality meals, full healthcare, modern offices", ""));
        list.add(new CompanySeedData("Snowflake", "snowflake.com", "https://logo.clearbit.com/snowflake.com", 4.4, "4k+", "Data Cloud | Data Warehousing & Analytics", "Modern data architectures, high growth, rewarding equity", "4000", "6100", "1700", "240", "Health coverage, equity grants, hybrid workplace", ""));
        list.add(new CompanySeedData("Databricks", "databricks.com", "https://logo.clearbit.com/databricks.com", 4.5, "5k+", "Data & AI | Lakehouse Platform", "Inventors of Spark, tremendous market leadership", "5000", "7000", "1950", "290", "Pre-IPO equity, wellness budget, learning stipends", ""));
        list.add(new CompanySeedData("Atlassian", "atlassian.com", "https://logo.clearbit.com/atlassian.com", 4.5, "8k+", "Collaboration Software | Jira & Confluence", "Team Anywhere remote policy, open company values", "8000", "10500", "2700", "310", "Work from anywhere, home office setup, mental health support", ""));
        list.add(new CompanySeedData("Figma", "figma.com", "https://logo.clearbit.com/figma.com", 4.6, "3k+", "Design & Collaboration | Web-based Tools", "World-class product design culture, supportive team", "3000", "4200", "1100", "120", "Generous equity, learning budget, top-tier healthcare", ""));
        list.add(new CompanySeedData("Canva", "canva.com", "https://logo.clearbit.com/canva.com", 4.6, "4k+", "Graphic Design | Visual Suite", "Empowering mission, celebrated culture, in-house chefs", "4000", "5500", "1400", "160", "Vibe meals, wellness days, flexible working", ""));
        list.add(new CompanySeedData("Zoom", "zoom.us", "https://logo.clearbit.com/zoom.us", 4.3, "7k+", "Video Communications | Unified Collaboration", "Delivering happiness core value, great flexibility", "7000", "9100", "2300", "190", "Fitness stipend, book reimbursement, flexible PTO", ""));
        list.add(new CompanySeedData("Slack", "slack.com", "https://logo.clearbit.com/slack.com", 4.4, "5k+", "Productivity & Chat | Salesforce Company", "Empathetic communication, good balance, great tooling", "5000", "6800", "1800", "140", "Parental leave, wellness reimbursement, professional growth", ""));
        list.add(new CompanySeedData("Pinterest", "pinterest.com", "https://logo.clearbit.com/pinterest.com", 4.2, "6k+", "Visual Discovery & Social | Content Curation", "Pinstyle culture, inspiring visual algorithms, work-life balance", "6000", "7900", "2100", "170", "Pincation recharge days, health coverage, 401k match", ""));
        list.add(new CompanySeedData("Reddit", "reddit.com", "https://logo.clearbit.com/reddit.com", 4.2, "4k+", "Social News & Communities | Forum Platform", "High user impact, supportive environment, great snacks", "4000", "5300", "1500", "130", "Workspace stipend, health benefits, flexible time off", ""));
        list.add(new CompanySeedData("Snap", "snap.com", "https://logo.clearbit.com/snap.com", 4.0, "6k+", "Camera & AR | Snapchat Platform", "Pioneering AR tech, creative engineering, good perks", "6000", "8100", "2200", "160", "Free food, wellness subsidy, top-tier health coverage", ""));
        list.add(new CompanySeedData("Dropbox", "dropbox.com", "https://logo.clearbit.com/dropbox.com", 4.3, "5k+", "Cloud Storage & Collaboration | Virtual First", "Virtual First culture, high quality engineering codebases", "5000", "6400", "1750", "110", "Wellness perks, virtual first stipend, generous PTO", ""));
        list.add(new CompanySeedData("Shopify", "shopify.com", "https://logo.clearbit.com/shopify.com", 4.2, "11k+", "E-Commerce Infrastructure | Merchant Platform", "Digital by default, builder mindset, merchant obsessed", "11000", "13500", "3600", "280", "Flexible spending account, remote work setup, health insurance", ""));
        list.add(new CompanySeedData("Block", "block.xyz", "https://logo.clearbit.com/block.xyz", 4.1, "7k+", "Financial Services | Square & Cash App", "Decentralized autonomy, creative design culture", "7000", "9200", "2500", "190", "Work from home allowance, wellness stipend, equity", ""));
        list.add(new CompanySeedData("Twilio", "twilio.com", "https://logo.clearbit.com/twilio.com", 4.1, "8k+", "Cloud Communications | API Platform", "Developer first culture, Kindle & book allowance", "8000", "10200", "2700", "210", "Kindle allowance, wellness funds, competitive 401k", ""));
        list.add(new CompanySeedData("MongoDB", "mongodb.com", "https://logo.clearbit.com/mongodb.com", 4.5, "6k+", "Database Software | Developer Data Platform", "Leading document database, passionate engineering teams", "6000", "8100", "2200", "230", "Mental health support, fertility benefits, gym subsidy", ""));
        list.add(new CompanySeedData("GitHub", "github.com", "https://logo.clearbit.com/github.com", 4.6, "4k+", "Software Development | Git & AI Copilot", "Home for developers, remote-first excellence, high impact", "4000", "5900", "1600", "140", "Home office budget, ergonomic gear, health insurance", ""));
        list.add(new CompanySeedData("GitLab", "gitlab.com", "https://logo.clearbit.com/gitlab.com", 4.4, "5k+", "DevSecOps | All-Remote Platform", "100% all-remote pioneer, transparent handbook culture", "5000", "6700", "1800", "170", "All-remote, flexible hours, growth and development budget", ""));
        list.add(new CompanySeedData("Docker", "docker.com", "https://logo.clearbit.com/docker.com", 4.4, "2k+", "Containerization | Developer Tools", "Standard of containerization, collaborative community", "2000", "3100", "850", "90", "Medical & dental, remote setup, retirement plan", ""));
        list.add(new CompanySeedData("Cloudflare", "cloudflare.com", "https://logo.clearbit.com/cloudflare.com", 4.3, "6k+", "Web Infrastructure & Security | Edge Computing", "Helping build a better internet, high technical talent", "6000", "8200", "2250", "260", "Comprehensive health, daily lunches, commuter benefits", ""));
        list.add(new CompanySeedData("Tesla", "tesla.com", "https://logo.clearbit.com/tesla.com", 3.9, "25k+", "Automotive & Clean Energy | EV & Autopilot", "Accelerating sustainable energy, fast problem solving", "25000", "31000", "7900", "980", "Discount on vehicles, stock purchase plan, health coverage", ""));
        list.add(new CompanySeedData("SpaceX", "spacex.com", "https://logo.clearbit.com/spacex.com", 4.1, "12k+", "Aerospace | Rocketry & Starlink", "Interplanetary mission, elite engineering talent", "12000", "16000", "4400", "510", "Stock options, on-site healthcare, aerospace innovation", ""));
        list.add(new CompanySeedData("IBM", "ibm.com", "https://logo.clearbit.com/ibm.com", 4.1, "48k+", "Technology & Consulting | Hybrid Cloud & AI", "Rich century heritage, strong training & patents", "48000", "58000", "13500", "1400", "Tuition assistance, retirement fund, hybrid work", ""));
        list.add(new CompanySeedData("SAP", "sap.com", "https://logo.clearbit.com/sap.com", 4.4, "34k+", "Enterprise Software | ERP & Supply Chain", "Pledge to Flex, stable enterprise environment", "34000", "42000", "9800", "880", "Pledge to Flex, childcare support, wellness allowance", ""));
        list.add(new CompanySeedData("Qualcomm", "qualcomm.com", "https://logo.clearbit.com/qualcomm.com", 4.2, "21k+", "Semiconductors & Wireless | 5G & Snapdragon", "Wireless innovation powerhouse, robust patent rewards", "21000", "26000", "6300", "670", "Patent awards, health coverage, 401k match", ""));
        list.add(new CompanySeedData("AMD", "amd.com", "https://logo.clearbit.com/amd.com", 4.3, "14k+", "Semiconductors | Ryzen & EPYC Computing", "Rapid growth, cutting-edge chip architectures", "14000", "17500", "4300", "490", "Tuition aid, stock discount, competitive healthcare", ""));
        list.add(new CompanySeedData("PayPal", "paypal.com", "https://logo.clearbit.com/paypal.com", 4.0, "22k+", "Fintech & Payments | Digital Wallets", "Global financial reach, employee wellness days", "22000", "27000", "6400", "530", "Sabbaticals, employee financial wellness days, health plan", ""));
        list.add(new CompanySeedData("Intuit", "intuit.com", "https://logo.clearbit.com/intuit.com", 4.5, "12k+", "Financial Software | TurboTax & QuickBooks", "Exceptional employee care, design for delight", "12000", "15500", "3900", "360", "Well-being budget, sabbatical, education reimbursement", ""));
        list.add(new CompanySeedData("Flipkart", "flipkart.com", "https://logo.clearbit.com/flipkart.com", 4.2, "18k+", "E-Commerce | India Marketplace", "Dynamic Indian scale, strong engineering practices", "18000", "23000", "5800", "620", "Gym membership, medical insurance, employee discounts", ""));
        list.add(new CompanySeedData("Swiggy", "swiggy.com", "https://logo.clearbit.com/swiggy.com", 4.1, "12k+", "On-Demand Delivery | Food & Instamart", "Hyper-local logistics at immense scale, great teamwork", "12000", "15000", "4100", "430", "Food allowances, medical benefits, hybrid work policy", ""));
        list.add(new CompanySeedData("Zomato", "zomato.com", "https://logo.clearbit.com/zomato.com", 4.0, "10k+", "Food Delivery & Dining | Quick Commerce", "Fun startup energy, high growth, high ownership", "10000", "13000", "3600", "390", "Zomato gold, period leaves, medical coverage", ""));
        list.add(new CompanySeedData("Razorpay", "razorpay.com", "https://logo.clearbit.com/razorpay.com", 4.3, "7k+", "Fintech | Payment Gateway & Banking", "Fastest growing Indian fintech, developer loved APIs", "7000", "9200", "2500", "280", "Health coverage for family, flexible time off, ESOPs", ""));
        list.add(new CompanySeedData("CRED", "cred.club", "https://logo.clearbit.com/cred.club", 4.2, "4k+", "Fintech | Credit Rewards & Payments", "Exceptional product design, high talent density", "4000", "5800", "1600", "190", "Health benefits, organic meals, ESOP buybacks", ""));
        list.add(new CompanySeedData("PhonePe", "phonepe.com", "https://logo.clearbit.com/phonepe.com", 4.3, "8k+", "Digital Payments | UPI & Financial Services", "Largest UPI payment volume, deep distributed backend", "8000", "10400", "2800", "310", "Parental support, healthcare, wealth creation plans", ""));
        list.add(new CompanySeedData("Paytm", "paytm.com", "https://logo.clearbit.com/paytm.com", 3.8, "16k+", "Fintech & Payments | Merchant Solutions", "Massive merchant network in India, high intensity", "16000", "21000", "5400", "510", "Insurance, gratuity, performance incentives", ""));
        list.add(new CompanySeedData("Meesho", "meesho.com", "https://logo.clearbit.com/meesho.com", 4.3, "6k+", "Social Commerce | Reseller Marketplace", "User first mindset, boundaryless work policy", "6000", "8000", "2200", "240", "MeeCare wellness, remote setup, infinite wellness leaves", ""));
        list.add(new CompanySeedData("Freshworks", "freshworks.com", "https://logo.clearbit.com/freshworks.com", 4.3, "9k+", "Customer Engagement SaaS | CRM & Helpdesk", "Customer delight from Chennai to NASDAQ, warm culture", "9000", "11800", "3100", "290", "Family medical insurance, food court, hybrid flexibility", ""));
        list.add(new CompanySeedData("Postman", "postman.com", "https://logo.clearbit.com/postman.com", 4.4, "3k+", "Developer Tools | API Platform", "Used by 30M+ developers worldwide, high innovation", "3000", "4400", "1200", "140", "Home office budget, health insurance, remote first", ""));
        list.add(new CompanySeedData("BrowserStack", "browserstack.com", "https://logo.clearbit.com/browserstack.com", 4.2, "4k+", "Software Testing | Cloud Infrastructure", "Leading web and mobile app testing platform", "4000", "5600", "1500", "170", "Medical cover, learning stipend, performance bonuses", ""));
        list.add(new CompanySeedData("Zerodha", "zerodha.com", "https://logo.clearbit.com/zerodha.com", 4.6, "3k+", "Stock Brokerage & Fintech | Trading Tech", "Bootstrapped titan, lean engineering, calm work culture", "3000", "4100", "1100", "90", "Healthy bonuses, organic food, work life balance", ""));
        list.add(new CompanySeedData("Zoho", "zoho.com", "https://logo.clearbit.com/zoho.com", 4.4, "24k+", "Business Software Suite | Cloud SaaS", "Rural offices, self-reliant tech stack, high job security", "24000", "31000", "7800", "850", "Free transport, daily meals, rural tech initiatives", ""));

        return list;
    }
}
