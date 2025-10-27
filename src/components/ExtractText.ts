import * as pdfjsLib from "pdfjs-dist";
import { Document, Packer, Paragraph } from "docx";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type;

    if (fileType === "application/pdf") {
        const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item: any) => item.str).join(" ") + " ";
        }
        return text.trim();
    }

    if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const buffer = await file.arrayBuffer();
        const zip = await import("jszip").then((m) => m.default.loadAsync(buffer));
        const documentXml = await zip.file("word/document.xml")?.async("string");
        const text = documentXml?.replace(/<[^>]+>/g, " ") || "";
        return text.trim();
    }

    if (fileType === "text/plain") {
        return await file.text();
    }

    throw new Error("Unsupported file format");
}
