import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const PDF_CACHE_DIR = path.join(process.cwd(), "public", "course-pdfs");
const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");
const PDF_VERSION = "v4"; // bump to invalidate cached PDFs

const BRAND_DARK   = "#1e3a5f";
const BRAND_BLUE   = "#2563eb";
const BRAND_LIGHT  = "#93c5fd";
const BRAND_BG     = "#eff6ff";
const PAGE_W       = 595;
const PAGE_H       = 842;
const MARGIN_L     = 45;
const MARGIN_R     = 45;
const CONTENT_W    = PAGE_W - MARGIN_L - MARGIN_R;
const HEADER_H     = 78;
const FOOTER_H     = 68;
const CONTENT_TOP  = HEADER_H + 14;
const CONTENT_BOT  = PAGE_H - FOOTER_H - 10;

function drawHeader(doc: PDFKit.PDFDocument, courseTitle: string) {
  // Background
  doc.rect(0, 0, PAGE_W, HEADER_H).fill(BRAND_DARK);

  // Accent stripe
  doc.rect(0, HEADER_H - 4, PAGE_W, 4).fill(BRAND_BLUE);

  // Logo image (if available)
  const logoExists = fs.existsSync(LOGO_PATH);
  let logoRight = MARGIN_L;
  if (logoExists) {
    try {
      doc.image(LOGO_PATH, MARGIN_L, 10, { height: 42, fit: [120, 42] });
      logoRight = MARGIN_L + 128;
    } catch {
      // fall back to text logo
      doc.fontSize(20).font("Helvetica-Bold").fillColor("#ffffff")
        .text("SUDAKSHA", MARGIN_L, 16);
      doc.fontSize(8).font("Helvetica").fillColor(BRAND_LIGHT)
        .text("BUILDING COMPETENCY. ENABLING GROWTH.", MARGIN_L, 42);
      logoRight = MARGIN_L + 170;
    }
  } else {
    doc.fontSize(20).font("Helvetica-Bold").fillColor("#ffffff")
      .text("SUDAKSHA", MARGIN_L, 16);
    doc.fontSize(8).font("Helvetica").fillColor(BRAND_LIGHT)
      .text("BUILDING COMPETENCY. ENABLING GROWTH.", MARGIN_L, 42);
    logoRight = MARGIN_L + 170;
  }

  // Right side tag
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#e0f2fe")
    .text("COURSE CURRICULUM", 0, 20, { align: "right", width: PAGE_W - MARGIN_R });
  doc.fontSize(8).font("Helvetica").fillColor(BRAND_LIGHT)
    .text(courseTitle.length > 55 ? courseTitle.substring(0, 55) + "…" : courseTitle,
      logoRight, 38,
      { align: "right", width: PAGE_W - logoRight - MARGIN_R });
}

function drawFooter(doc: PDFKit.PDFDocument, pageNum: number, totalPages?: number) {
  const fy = PAGE_H - FOOTER_H;

  // Footer background
  doc.rect(0, fy, PAGE_W, FOOTER_H).fill(BRAND_DARK);

  // Top accent line
  doc.rect(0, fy, PAGE_W, 3).fill(BRAND_BLUE);

  // Left: brand + tagline
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#ffffff")
    .text("SUDAKSHA", MARGIN_L, fy + 10);
  doc.fontSize(7.5).font("Helvetica").fillColor(BRAND_LIGHT)
    .text("Building Competency. Enabling Growth.", MARGIN_L, fy + 23);

  // Centre: contact
  doc.fontSize(7.5).font("Helvetica").fillColor("#e0f2fe")
    .text("www.sudaksha.com  |  info@sudaksha.com  |  +91 98765 43210", 0, fy + 10,
      { align: "center", width: PAGE_W });
  doc.fontSize(7).font("Helvetica").fillColor(BRAND_LIGHT)
    .text("Bengaluru, Karnataka, India", 0, fy + 23,
      { align: "center", width: PAGE_W });

  // Right: page number + copyright
  const pgText = totalPages ? `Page ${pageNum} of ${totalPages}` : `Page ${pageNum}`;
  doc.fontSize(7.5).font("Helvetica-Bold").fillColor("#ffffff")
    .text(pgText, 0, fy + 10, { align: "right", width: PAGE_W - MARGIN_R });
  doc.fontSize(7).font("Helvetica").fillColor(BRAND_LIGHT)
    .text(`© ${new Date().getFullYear()} Sudaksha. All rights reserved.`, 0, fy + 23,
      { align: "right", width: PAGE_W - MARGIN_R });

  // Bottom marketing strip
  doc.rect(0, fy + 42, PAGE_W, 26).fill("#152d4a");
  doc.fontSize(7).font("Helvetica").fillColor("#93c5fd")
    .text(
      "This document is confidential and intended solely for the recipient. Unauthorized reproduction or distribution is prohibited.",
      MARGIN_L, fy + 50,
      { align: "left", width: CONTENT_W }
    );
}

function sectionHeader(doc: PDFKit.PDFDocument, title: string) {
  const y = doc.y;
  doc.rect(MARGIN_L - 4, y - 2, CONTENT_W + 8, 22).fill(BRAND_BG);
  doc.rect(MARGIN_L - 4, y - 2, 4, 22).fill(BRAND_BLUE);
  doc.fontSize(13).font("Helvetica-Bold").fillColor(BRAND_DARK)
    .text(title, MARGIN_L + 6, y + 3);
  doc.y = y + 28;
}

function generatePDF(course: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true, // enables total page count
    });

    const buffers: Buffer[] = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    let currentPage = 1;

    // Draw first page header
    drawHeader(doc, course.name);
    doc.y = CONTENT_TOP;
    doc.x = MARGIN_L;

    const checkPageBreak = (neededHeight = 60) => {
      if (doc.y + neededHeight > CONTENT_BOT) {
        doc.addPage();
        currentPage++;
        drawHeader(doc, course.name);
        doc.y = CONTENT_TOP;
        doc.x = MARGIN_L;
      }
    };

    // ── Course Title Block ─────────────────────────────────────────────────
    doc.fontSize(20).font("Helvetica-Bold").fillColor("#111827")
      .text(course.name, MARGIN_L, doc.y, { width: CONTENT_W, align: "center" });
    doc.moveDown(0.4);

    // Meta pill row
    const metaY = doc.y;
    const pills = [
      `Duration: ${course.duration || 0} hrs`,
      `Level: ${course.targetLevel || "All Levels"}`,
      `Mode: ${course.deliveryMode || "Online"}`,
    ];
    let pillX = MARGIN_L;
    pills.forEach((pill) => {
      const pw = doc.widthOfString(pill) + 16;
      doc.rect(pillX, metaY, pw, 18).fill(BRAND_BG);
      doc.fontSize(9).font("Helvetica").fillColor(BRAND_BLUE).text(pill, pillX + 8, metaY + 4);
      pillX += pw + 8;
    });
    doc.y = metaY + 26;

    // Divider
    doc.moveTo(MARGIN_L, doc.y).lineTo(PAGE_W - MARGIN_R, doc.y)
      .strokeColor(BRAND_BLUE).lineWidth(1.5).stroke();
    doc.y += 10;

    // ── Description ────────────────────────────────────────────────────────
    if (course.description) {
      checkPageBreak(80);
      sectionHeader(doc, "About this Course");
      doc.fontSize(11).font("Helvetica").fillColor("#374151")
        .text(course.description, MARGIN_L, doc.y, { width: CONTENT_W, align: "justify", lineGap: 2 });
      doc.y += 12;
    }

    // ── Learning Objectives ────────────────────────────────────────────────
    const objectives: any[] = Array.isArray(course.learningObjectives) ? course.learningObjectives : [];
    if (objectives.length > 0) {
      checkPageBreak(60);
      sectionHeader(doc, "What You Will Learn");
      objectives.forEach((obj: any) => {
        const text = typeof obj === "string" ? obj : obj?.outcome ?? "";
        if (!text) return;
        checkPageBreak(20);
        const bulletY = doc.y;
        doc.circle(MARGIN_L + 5, bulletY + 5, 3).fill(BRAND_BLUE);
        doc.fontSize(11).font("Helvetica").fillColor("#374151")
          .text(text, MARGIN_L + 16, bulletY, { width: CONTENT_W - 16, lineGap: 1 });
        doc.y += 3;
      });
      doc.y += 8;
    }

    // ── Curriculum ─────────────────────────────────────────────────────────
    const modules: any[] = Array.isArray(course.moduleBreakdown) ? course.moduleBreakdown : [];
    if (modules.length > 0) {
      checkPageBreak(60);
      sectionHeader(doc, "Course Curriculum");

      modules.forEach((mod: any, mi: number) => {
        checkPageBreak(40);
        const modTitle = mod.title || mod.module || `Module ${mi + 1}`;

        // Module header bar
        const mhY = doc.y;
        doc.rect(MARGIN_L, mhY, CONTENT_W, 20).fill("#dbeafe");
        doc.fontSize(11).font("Helvetica-Bold").fillColor(BRAND_DARK)
          .text(`Module ${mi + 1}: ${modTitle}`, MARGIN_L + 8, mhY + 4, { width: CONTENT_W - 16 });
        doc.y = mhY + 26;

        const chapters: any[] = Array.isArray(mod.chapters) ? mod.chapters : [];
        chapters.forEach((ch: any, ci: number) => {
          checkPageBreak(18);
          const chTitle = typeof ch === "string" ? ch : ch.title ?? `Chapter ${ci + 1}`;
          const dur = ch.duration ? ` — ${ch.duration} hrs` : "";
          const chY = doc.y;
          // Alternating row tint
          if (ci % 2 === 0) doc.rect(MARGIN_L + 8, chY - 1, CONTENT_W - 8, 16).fill("#f9fafb");
          doc.fontSize(10).font("Helvetica").fillColor("#4b5563")
            .text(`${ci + 1}.  ${chTitle}${dur}`, MARGIN_L + 18, chY + 1, { width: CONTENT_W - 26, lineGap: 1 });
          doc.y += 3;
        });
        doc.y += 6;
      });
    }

    // ── Trainer ────────────────────────────────────────────────────────────
    if (course.trainer?.name) {
      checkPageBreak(40);
      doc.moveTo(MARGIN_L, doc.y).lineTo(PAGE_W - MARGIN_R, doc.y)
        .strokeColor("#e5e7eb").lineWidth(0.5).stroke();
      doc.y += 8;
      doc.fontSize(11).font("Helvetica-Bold").fillColor(BRAND_DARK)
        .text("Your Trainer", MARGIN_L, doc.y);
      doc.y += 4;
      doc.fontSize(11).font("Helvetica").fillColor("#374151")
        .text(course.trainer.name, MARGIN_L, doc.y);
      doc.y += 12;
    }

    // ── Marketing call-to-action box ───────────────────────────────────────
    checkPageBreak(70);
    doc.y += 8;
    const ctaY = doc.y;
    doc.rect(MARGIN_L, ctaY, CONTENT_W, 52).fill(BRAND_BG);
    doc.rect(MARGIN_L, ctaY, CONTENT_W, 52).stroke("#bfdbfe");
    doc.fontSize(11).font("Helvetica-Bold").fillColor(BRAND_DARK)
      .text("Enroll Today!", MARGIN_L + 12, ctaY + 8, { width: CONTENT_W - 24 });
    doc.fontSize(9.5).font("Helvetica").fillColor("#374151")
      .text(
        "Join thousands of professionals upskilling with Sudaksha. Visit www.sudaksha.com or call +91 98765 43210 to enrol.",
        MARGIN_L + 12, ctaY + 24,
        { width: CONTENT_W - 24, lineGap: 1 }
      );
    doc.y = ctaY + 60;

    // ── Flush all footers using bufferedPageRange ──────────────────────────
    const range = doc.bufferedPageRange();
    const total = range.count;
    for (let i = 0; i < total; i++) {
      doc.switchToPage(range.start + i);
      drawFooter(doc, i + 1, total);
    }

    doc.end();
  });
}

function ensureCacheDir() {
  if (!fs.existsSync(PDF_CACHE_DIR)) fs.mkdirSync(PDF_CACHE_DIR, { recursive: true });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: { trainer: { select: { name: true } } },
    });

    if (!course || course.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    ensureCacheDir();
    const pdfPath = path.join(PDF_CACHE_DIR, `${course.id}-${PDF_VERSION}.pdf`);

    if (fs.existsSync(pdfPath)) {
      const buffer = fs.readFileSync(pdfPath);
      return new NextResponse(buffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${slug}-curriculum.pdf"`,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    const buffer = await generatePDF(course);
    fs.writeFileSync(pdfPath, buffer);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slug}-curriculum.pdf"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error: any) {
    console.error("Curriculum PDF error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
