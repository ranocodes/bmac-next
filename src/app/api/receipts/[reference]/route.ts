import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { getDonationRecordByReference } from '@/lib/donations';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  const record = await getDonationRecordByReference(decodeURIComponent(reference));
  if (!record) {
    return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
  }

  const doc = new PDFDocument({ size: 'A4', margin: 48 });
  const chunks: Uint8Array[] = [];
  doc.on('data', (c: Uint8Array) => chunks.push(c));
  const done = new Promise<void>(resolve => doc.on('end', resolve));

  const amountLabel = `₦${Number(record.amount || 0).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
  const dateLabel = record.createdAt
    ? new Date(record.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  doc.fontSize(22).text('BMAC — Donation Receipt', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#666666').text('Brilliant Minds Academic & Career Foundation', { align: 'center' });
  doc.text('Plateau State, Nigeria', { align: 'center' });
  doc.moveDown(1.2);

  doc.fontSize(11).fillColor('#111111');
  doc.text('Official tax-deductible donation receipt', { align: 'center' });
  doc.moveDown(1.5);

  const line = (label: string, value: string) => {
    doc.font('Helvetica-Bold').fontSize(10).text(`${label}:`, { continued: true, width: 160 });
    doc.font('Helvetica').text(value, { indent: 0, align: 'left', continued: false });
    doc.moveDown(0.6);
  };
  line('Receipt No.', record.reference);
  line('Date', dateLabel);
  line('Donor Name', record.name);
  line('Donor Email', record.email || '—');
  line('Amount', amountLabel);
  line('Currency', record.currency || 'NGN');
  line('Status', record.status === 'completed' ? 'Completed' : record.status);
  doc.moveDown(1.2);

  doc.fontSize(9).fillColor('#666666').text(
    'This receipt was generated electronically by BMAC. It acknowledges receipt of the donation listed above. ' +
    'For enquiries, contact the Brilliant Minds Academic & Career Foundation.',
    { align: 'justify' }
  );
  doc.end();

  await done;
  const body = Buffer.concat(chunks);
  return new NextResponse(new Uint8Array(body), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="bmac-receipt-${record.reference}.pdf"`,
      'Cache-Control': 'private, max-age=60',
    },
  });
}
