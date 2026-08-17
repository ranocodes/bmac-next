import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface CertificateData {
  person_id: string;
  first_name: string;
  last_name: string;
  program_title: string;
  cohort_title: string;
  completion_date: string;
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ participantId: string }>;
}) {
  const { participantId } = await params;

  const rows = await db.query<CertificateData>(
    `SELECT pt.person_id,
            p.first_name,
            p.last_name,
            pr.title AS program_title,
            c.title AS cohort_title,
            COALESCE(c.end_date, pt.updated_at) AS completion_date
     FROM participants pt
     JOIN people p ON p.id = pt.person_id
     JOIN cohorts c ON c.id = pt.cohort_id
     JOIN programs pr ON pr.id = c.program_id
     WHERE pt.id = $1 AND pt.status IN ('certificate_eligible', 'completed')`,
    [participantId]
  );

  if (!rows.length) notFound();

  const data = rows[0];
  const completionDate = new Date(data.completion_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <html>
      <head>
        <title>Certificate — BMAC</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            background: #f0f0f0;
            font-family: 'Inter', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 2rem;
          }

          .certificate-wrapper {
            width: 900px;
            max-width: 100%;
            background: #fff;
            padding: 4px;
            border-radius: 8px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          }

          .certificate {
            position: relative;
            width: 100%;
            aspect-ratio: 1.414 / 1;
            border: 3px solid #1a1a2e;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 3rem;
            overflow: hidden;
          }

          .certificate::before {
            content: '';
            position: absolute;
            inset: 8px;
            border: 1px solid #c9a96e;
            pointer-events: none;
          }

          .certificate::after {
            content: '';
            position: absolute;
            inset: 14px;
            border: 1px dashed #e0d5c0;
            pointer-events: none;
          }

          .corner {
            position: absolute;
            width: 60px;
            height: 60px;
          }
          .corner-tl { top: 20px; left: 20px; border-top: 2px solid #c9a96e; border-left: 2px solid #c9a96e; }
          .corner-tr { top: 20px; right: 20px; border-top: 2px solid #c9a96e; border-right: 2px solid #c9a96e; }
          .corner-bl { bottom: 20px; left: 20px; border-bottom: 2px solid #c9a96e; border-left: 2px solid #c9a96e; }
          .corner-br { bottom: 20px; right: 20px; border-bottom: 2px solid #c9a96e; border-right: 2px solid #c9a96e; }

          .org-name {
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            font-size: 0.75rem;
            letter-spacing: 0.25em;
            text-transform: uppercase;
            color: #c9a96e;
            margin-bottom: 0.5rem;
          }

          .title {
            font-family: 'Playfair Display', serif;
            font-weight: 700;
            font-size: 2.5rem;
            color: #1a1a2e;
            margin-bottom: 0.25rem;
            letter-spacing: 0.02em;
          }

          .subtitle {
            font-family: 'Inter', sans-serif;
            font-weight: 300;
            font-size: 0.85rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin-bottom: 1.5rem;
          }

          .presented-to {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: #999;
            margin-bottom: 0.5rem;
          }

          .participant-name {
            font-family: 'Playfair Display', serif;
            font-weight: 600;
            font-size: 1.75rem;
            color: #1a1a2e;
            border-bottom: 2px solid #c9a96e;
            padding-bottom: 0.25rem;
            margin-bottom: 1rem;
            min-width: 300px;
          }

          .description {
            font-size: 0.8rem;
            color: #555;
            line-height: 1.6;
            max-width: 500px;
            margin-bottom: 0.5rem;
          }

          .program-name {
            font-weight: 600;
            color: #1a1a2e;
          }

          .date {
            font-size: 0.75rem;
            color: #888;
            margin-top: 0.25rem;
          }

          .footer {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            width: 100%;
            max-width: 600px;
            margin-top: auto;
            padding-top: 1.5rem;
          }

          .signature-block {
            text-align: center;
            flex: 1;
          }

          .signature-line {
            width: 180px;
            border-bottom: 1px solid #ccc;
            margin: 0 auto 0.35rem;
            padding-bottom: 1.5rem;
          }

          .signature-label {
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #888;
          }

          .seal {
            width: 70px;
            height: 70px;
            border: 2px solid #c9a96e;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Playfair Display', serif;
            font-weight: 700;
            font-size: 0.65rem;
            color: #c9a96e;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            flex-shrink: 0;
          }

          .print-btn {
            display: block;
            margin: 1.5rem auto 0;
            padding: 0.6rem 1.5rem;
            background: #1a1a2e;
            color: #fff;
            border: none;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          .print-btn:hover { opacity: 0.85; }

          @media print {
            body { background: none; padding: 0; }
            .certificate-wrapper { box-shadow: none; padding: 0; border-radius: 0; }
            .print-btn { display: none !important; }
          }
        `}</style>
      </head>
      <body>
        <div>
          <div className="certificate-wrapper">
            <div className="certificate">
              <div className="corner corner-tl" />
              <div className="corner corner-tr" />
              <div className="corner corner-bl" />
              <div className="corner corner-br" />

              <p className="org-name">Black Men of Action &amp; Community</p>
              <h1 className="title">Certificate</h1>
              <p className="subtitle">of Completion</p>

              <p className="presented-to">This certificate is proudly presented to</p>
              <p className="participant-name">
                {data.first_name} {data.last_name}
              </p>

              <p className="description">
                For successfully completing the{" "}
                <span className="program-name">{data.program_title}</span>{" "}
                program under the{" "}
                <span className="program-name">{data.cohort_title}</span>{" "}
                cohort.
              </p>

              <p className="date">Awarded on {completionDate}</p>

              <div className="footer">
                <div className="signature-block">
                  <div className="signature-line" />
                  <p className="signature-label">Program Director</p>
                </div>

                <div className="seal">BMAC</div>

                <div className="signature-block">
                  <div className="signature-line" />
                  <p className="signature-label">Executive Director</p>
                </div>
              </div>
            </div>
          </div>

          <button className="print-btn" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
        </div>
      </body>
    </html>
  );
}
