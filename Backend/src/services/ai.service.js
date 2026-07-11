const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score between 0 and 100 indicating how well the candidate's profile matches the job describe",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Technical questions that can be asked in the interview along with their intention and how to answer them",
    ),
  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
    ),
  skillGaps: z
    .array(
      z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe(
            "The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances",
          ),
      }),
    )
    .describe(
      "List of skill gaps in the candidate's profile along with their severity",
    ),
  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .describe("The day number in the preparation plan, starting from 1"),
        focus: z
          .string()
          .describe(
            "The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc.",
          ),
        tasks: z
          .array(z.string())
          .describe(
            "List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.",
          ),
      }),
    )
    .describe(
      "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
    ),
  title: z
    .string()
    .describe(
      "The title of the job for which the interview report is generated",
    ),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(interviewReportSchema),
    },
  });

  return JSON.parse(response.text);
}

const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer");

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  await page.setContent(htmlContent, {
    waitUntil: "networkidle0",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "10mm",
      right: "10mm",
      bottom: "10mm",
      left: "10mm",
    },
  });

  await browser.close();

  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = z.object({
    html: z
      .string()
      .describe(
        "The HTML content of the resume which can be converted to PDF using any library like puppeteer",
      ),
  });

  const prompt = `
You are a Senior Resume Writer, ATS Resume Specialist, and Technical Recruiter.

Using the candidate information below, generate a professional ATS-friendly resume tailored specifically to the given Job Description.

Candidate Resume:
${resume}

Candidate Self Description:
${selfDescription}

Job Description:
${jobDescription}

Return ONLY valid JSON matching the provided schema.

{
  "html": "<complete HTML>"
}

==========================
STRICT FORMAT
==========================

The resume MUST contain ONLY these sections in this exact order:

1. Candidate Name

2. Contact Information
   - LinkedIn
   - Email
   - GitHub
   - Phone
   - Location

3. PROFESSIONAL SUMMARY

Requirements:

- 3–5 concise lines
- Tailored to the Job Description
- Highlight strongest technologies
- Naturally include important ATS keywords
- Sound like a human-written professional resume
- Avoid generic AI phrases

4. TECHNICAL SKILLS

Organize skills exactly like this:

• Languages

• Frontend

• Backend

• Databases

• Core Computer Science

• Tools

• Cloud & Deployment

• Testing

• Exposure

Only include skills supported by the candidate profile.

5. EDUCATION

Include

College

Degree

CGPA

Expected Graduation

Relevant Coursework

6. EXPERIENCE

Company

Role

Duration

Write 4–6 achievement-oriented bullet points.

Every bullet must:

- Start with a strong action verb

Examples:

Developed

Designed

Built

Implemented

Optimized

Engineered

Integrated

Architected

Created

Improved

Automated

Deployed

Mention:

- technologies used
- engineering contribution
- business impact
- measurable improvements whenever possible

Do NOT invent fake experience.

Expand existing responsibilities professionally.

7. PROJECTS

Include maximum 3 projects.

Format:

Project Name — Technologies (Duration)

Write one short overview sentence.

Then include 4–6 achievement bullets.

Describe:

- architecture
- implementation
- APIs
- authentication
- database
- deployment
- optimization
- engineering challenges solved

Use strong engineering language.

Expand existing projects only.

Never invent projects.

Where realistic, include measurable impact such as:

35%

50+

500+

2x

40%

8. CERTIFICATIONS & ACHIEVEMENTS

Maximum 5 concise bullet points.

==========================
ATS OPTIMIZATION
==========================

Extract important keywords from the Job Description.

Naturally integrate those keywords into:

- Professional Summary
- Skills
- Experience
- Projects

Avoid keyword stuffing.

==========================
HTML REQUIREMENTS
==========================

Generate clean ATS-friendly semantic HTML.

Use:

- Arial, Helvetica, sans-serif
- Body font: 11px
- Candidate Name: 22px
- Section Heading: 13px
- A4 Page
- Margin: 14px
- Line Height: 1.18

Use only these colors:

Primary:
#e91e8c

Text:
#222222

Secondary:
#666666

Section headings should:

- Be bold
- Have a thin bottom border
- Maintain consistent spacing

Do NOT use:

- tables
- icons
- images
- emojis
- multiple columns
- SVG
- absolute positioning
- floating elements

Everything must remain ATS parsable.

==========================
PAGE SIZE & LAYOUT (STRICT)
==========================

The generated resume MUST fit on EXACTLY ONE A4 page.

Maximum printable area:

- Width: 210mm
- Height: 297mm

Content area:

- Padding: 14px
- Overflow: hidden

The HTML MUST NOT exceed one printed page.

Use the following CSS:

Use the following CSS exactly:

body{
    width:210mm;
    min-height:297mm;
    margin:0;
    padding:14px;
    box-sizing:border-box;

    font-family:Arial, Helvetica, sans-serif;
    font-size:11px;
    line-height:1.18;
    color:#222;

    display:flex;
    flex-direction:column;
    justify-content:space-between;
}

.resume{
    min-height:265mm;
    display:flex;
    flex-direction:column;
    justify-content:space-between;
}

main{
    flex:1;
}

h1{
    font-size:22px;
    margin:0 0 6px;
}

h2{
    font-size:13px;
    margin:10px 0 5px;
    padding-bottom:2px;
    border-bottom:1px solid #e91e8c;
}

p{
    margin:2px 0;
}

ul{
    margin:4px 0 6px 18px;
    padding:0;
}

li{
    margin:2px 0;
}
Avoid unnecessary whitespace.

==========================
FINAL QUALITY CHECK
==========================

Before generating HTML ensure:

✓ ATS Friendly

✓ Professional

✓ Recruiter Ready

✓ Human-written tone

✓ Tailored to Job Description

✓ Strong action verbs

✓ Clean formatting

✓ No fake information

✓ One-page resume

✓ Nearly full-page utilization

✓ No large blank space at the bottom

Return ONLY valid JSON.

Do not return markdown.

Do not include explanations.

Return only the JSON object.



==========================
PAGE BALANCING (VERY IMPORTANT)
==========================
==========================
PAGE BALANCING (VERY IMPORTANT)
==========================

The generated resume must visually occupy 95–99% of a single A4 page.

Do NOT leave noticeable blank space at the bottom.

Wrap the complete resume inside:

<div class="resume">

<header>
Candidate Name
Contact Information
</header>

<main>
Professional Summary
Technical Skills
Education
Experience
Projects
Certifications & Achievements
</main>

</div>

The HTML should naturally stretch to fill the printable page.

If the content is too short:

• Expand the Professional Summary to 4–5 lines.
• Add more implementation details to existing projects.
• Expand existing experience bullets.
• Expand relevant coursework.
• Expand existing project descriptions.
• Slightly increase spacing between major sections.
• Slightly increase line-height up to 1.20.

Never invent companies, internships, projects, certifications, achievements, or metrics.

Only elaborate information already present in the candidate profile.

The final resume should appear professionally balanced, with the last section ending close to the bottom margin.
`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resumePdfSchema),
    },
  });

  console.log(response.text);
  const jsonContent = JSON.parse(response.text);

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };
