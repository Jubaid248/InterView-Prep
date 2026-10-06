import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let extractedText = "";

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".pdf") || fileType === "application/pdf") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse/lib/pdf-parse.js");
      const parsed = await pdfParse(buffer);
      extractedText = parsed.text || "";
    } else if (
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md") ||
      fileType.startsWith("text/")
    ) {
      extractedText = buffer.toString("utf-8");
    } else {
      // Fallback: try reading as UTF-8 string
      extractedText = buffer.toString("utf-8");
    }

    // Clean up excessive whitespace / empty lines
    const cleanedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleanedText) {
      return NextResponse.json(
        { error: "Could not extract readable text from the file." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text: cleanedText,
      fileName: file.name,
      characterCount: cleanedText.length,
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error("[/api/resume/parse] Error:", error);
    return NextResponse.json(
      { error: `Failed to parse uploaded resume file: ${errMessage}` },
      { status: 500 }
    );
  }
}
