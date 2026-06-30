const fs = require("fs");
const path = require("path");
const {
    AlignmentType,
    BorderStyle,
    Document,
    HeadingLevel,
    Packer,
    PageBreak,
    PageOrientation,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableRow,
    TextRun,
    VerticalAlign,
    WidthType,
} = require("../backend/node_modules/docx");

const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, "SIMTA_BLACKBOX_TESTING_BAB5_LENGKAP.docx");

const sources = [
    {
        file: "BLACKBOX_TESTING.md",
        title: "BAB V Pengujian Sistem",
        orientation: PageOrientation.PORTRAIT,
    },
    {
        file: "PANDUAN_UJI_BLACKBOX_SIMTA.md",
        title: "Panduan Uji Manual",
        orientation: PageOrientation.LANDSCAPE,
    },
];

const COLORS = {
    blue: "1D4ED8",
    dark: "111827",
    muted: "4B5563",
    line: "D1D5DB",
    tableHeader: "DBEAFE",
    tableAlt: "F9FAFB",
    codeBg: "F3F4F6",
};

function readSource(fileName) {
    return fs.readFileSync(path.join(rootDir, fileName), "utf8").replace(/\r\n/g, "\n");
}

function stripMarkdown(value) {
    return value
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/<br\s*\/?>/gi, "\n")
        .trim();
}

function inlineRuns(text, options = {}) {
    const runs = [];
    const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
            runs.push(new TextRun({
                text: text.slice(lastIndex, match.index),
                size: options.size || 22,
                font: "Times New Roman",
                color: options.color || COLORS.dark,
            }));
        }

        const token = match[0];
        if (token.startsWith("**")) {
            runs.push(new TextRun({
                text: token.slice(2, -2),
                bold: true,
                size: options.size || 22,
                font: "Times New Roman",
                color: options.color || COLORS.dark,
            }));
        } else {
            runs.push(new TextRun({
                text: token.slice(1, -1),
                size: options.size || 20,
                font: "Consolas",
                color: "B91C1C",
            }));
        }

        lastIndex = pattern.lastIndex;
    }

    if (lastIndex < text.length) {
        runs.push(new TextRun({
            text: text.slice(lastIndex),
            size: options.size || 22,
            font: "Times New Roman",
            color: options.color || COLORS.dark,
        }));
    }

    return runs.length ? runs : [new TextRun({ text: "", size: options.size || 22 })];
}

function parseTableRow(line) {
    return line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => stripMarkdown(cell));
}

function isSeparatorRow(line) {
    return /^\s*\|?[\s:-]*-{3,}[\s|:-]*\|?\s*$/.test(line);
}

function tableBorders() {
    const border = { style: BorderStyle.SINGLE, size: 1, color: COLORS.line };
    return {
        top: border,
        bottom: border,
        left: border,
        right: border,
        insideHorizontal: border,
        insideVertical: border,
    };
}

function makeCell(text, options = {}) {
    const paragraphChildren = [];
    const lines = String(text || "").split("\n");

    lines.forEach((line, index) => {
        if (index > 0) {
            paragraphChildren.push(new TextRun({ text: "", break: 1 }));
        }
        paragraphChildren.push(...inlineRuns(line, {
            size: options.header ? 17 : 16,
            color: options.header ? "0F172A" : COLORS.dark,
        }));
    });

    return new TableCell({
        width: {
            size: options.width || 10,
            type: WidthType.PERCENTAGE,
        },
        verticalAlign: VerticalAlign.TOP,
        margins: {
            top: 90,
            bottom: 90,
            left: 90,
            right: 90,
        },
        shading: options.header
            ? { type: ShadingType.CLEAR, color: "auto", fill: COLORS.tableHeader }
            : options.alt
                ? { type: ShadingType.CLEAR, color: "auto", fill: COLORS.tableAlt }
                : undefined,
        children: [
            new Paragraph({
                children: paragraphChildren,
                alignment: options.header ? AlignmentType.CENTER : AlignmentType.LEFT,
                spacing: { before: 0, after: 0, line: 240 },
            }),
        ],
    });
}

function makeTable(rows) {
    const maxColumns = Math.max(...rows.map((row) => row.length));
    const columnWidth = Math.floor(100 / Math.max(maxColumns, 1));

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: tableBorders(),
        rows: rows.map((row, rowIndex) => new TableRow({
            tableHeader: rowIndex === 0,
            children: Array.from({ length: maxColumns }).map((_, colIndex) => makeCell(row[colIndex] || "", {
                header: rowIndex === 0,
                alt: rowIndex > 0 && rowIndex % 2 === 0,
                width: columnWidth,
            })),
        })),
    });
}

function makeHeading(text, level) {
    const headingMap = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
    };

    return new Paragraph({
        text: stripMarkdown(text),
        heading: headingMap[Math.min(level, 4)] || HeadingLevel.HEADING_4,
        spacing: { before: level <= 2 ? 280 : 180, after: 120 },
    });
}

function makeParagraph(text) {
    const trimmed = text.trim();
    if (!trimmed) {
        return new Paragraph({ text: "", spacing: { after: 80 } });
    }

    const captionMatch = trimmed.match(/^\*\*(Tabel\s+[^*]+)\*\*$/i);
    if (captionMatch) {
        return new Paragraph({
            children: [
                new TextRun({
                    text: captionMatch[1],
                    bold: true,
                    italics: true,
                    font: "Times New Roman",
                    size: 21,
                    color: COLORS.dark,
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 100 },
        });
    }

    if (/^\[.*\]$/.test(trimmed)) {
        return new Paragraph({
            children: inlineRuns(trimmed, { size: 21, color: COLORS.muted }),
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 120 },
        });
    }

    return new Paragraph({
        children: inlineRuns(trimmed, { size: 22 }),
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 120, line: 320 },
    });
}

function makeBullet(text) {
    return new Paragraph({
        children: inlineRuns(stripMarkdown(text.replace(/^[-*]\s+/, "")), { size: 22 }),
        bullet: { level: 0 },
        spacing: { after: 80 },
    });
}

function makeCodeBlock(lines) {
    return new Paragraph({
        children: [
            new TextRun({
                text: lines.join("\n"),
                font: "Consolas",
                size: 20,
                color: COLORS.dark,
            }),
        ],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: COLORS.codeBg },
        border: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
            left: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" },
        },
        spacing: { before: 100, after: 140 },
    });
}

function parseMarkdown(markdown) {
    const lines = markdown.split("\n");
    const children = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
            i += 1;
            continue;
        }

        if (trimmed.startsWith("```")) {
            const codeLines = [];
            i += 1;
            while (i < lines.length && !lines[i].trim().startsWith("```")) {
                codeLines.push(lines[i]);
                i += 1;
            }
            children.push(makeCodeBlock(codeLines));
            i += 1;
            continue;
        }

        const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
            children.push(makeHeading(headingMatch[2], headingMatch[1].length));
            i += 1;
            continue;
        }

        if (trimmed.startsWith("|") && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
            const tableLines = [];
            tableLines.push(lines[i]);
            i += 2;
            while (i < lines.length && lines[i].trim().startsWith("|")) {
                tableLines.push(lines[i]);
                i += 1;
            }
            children.push(makeTable(tableLines.map(parseTableRow)));
            children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
            continue;
        }

        if (/^[-*]\s+/.test(trimmed)) {
            children.push(makeBullet(trimmed));
            i += 1;
            continue;
        }

        const paragraphLines = [trimmed];
        i += 1;
        while (
            i < lines.length
            && lines[i].trim()
            && !lines[i].trim().startsWith("#")
            && !lines[i].trim().startsWith("|")
            && !lines[i].trim().startsWith("```")
            && !/^[-*]\s+/.test(lines[i].trim())
        ) {
            paragraphLines.push(lines[i].trim());
            i += 1;
        }
        children.push(makeParagraph(paragraphLines.join(" ")));
    }

    return children;
}

function makeCover() {
    return [
        new Paragraph({
            children: [
                new TextRun({
                    text: "DOKUMEN PENGUJIAN BLACK BOX",
                    bold: true,
                    size: 34,
                    font: "Times New Roman",
                    color: COLORS.blue,
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 1200, after: 180 },
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: "Sistem Informasi Manajemen Tugas Akhir (SIMTA)",
                    bold: true,
                    size: 28,
                    font: "Times New Roman",
                    color: COLORS.dark,
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 },
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: "BAB V Pengujian Sistem dan Panduan Uji Manual",
                    italics: true,
                    size: 24,
                    font: "Times New Roman",
                    color: COLORS.muted,
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
        }),
        new Table({
            width: { size: 78, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            borders: tableBorders(),
            rows: [
                ["Isi Dokumen", "Bab V Black Box Testing dan checklist pengujian manual"].map((value, index) => value),
                ["Metode", "Black Box Testing"],
                ["Acuan", "Audit kode frontend, backend, dan draft Bab IV"],
                ["Tanggal Generate", new Date().toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                })],
            ].map((row, rowIndex) => new TableRow({
                children: row.map((cell, cellIndex) => makeCell(cell, {
                    header: cellIndex === 0,
                    alt: rowIndex % 2 === 1,
                    width: cellIndex === 0 ? 28 : 50,
                })),
            })),
        }),
        new Paragraph({ children: [new PageBreak()] }),
    ];
}

const sections = [];
const firstChildren = makeCover().concat(parseMarkdown(readSource(sources[0].file)));

sections.push({
    properties: {
        page: {
            size: { orientation: sources[0].orientation },
            margin: {
                top: 1134,
                right: 1134,
                bottom: 1134,
                left: 1134,
            },
        },
    },
    children: firstChildren,
});

sections.push({
    properties: {
        page: {
            size: { orientation: sources[1].orientation },
            margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
            },
        },
    },
    children: parseMarkdown(readSource(sources[1].file)),
});

const doc = new Document({
    creator: "Codex",
    title: "SIMTA Black Box Testing Bab 5 Lengkap",
    description: "Dokumen Bab V Black Box Testing dan panduan uji manual SIMTA.",
    styles: {
        default: {
            document: {
                run: {
                    font: "Times New Roman",
                    size: 22,
                    color: COLORS.dark,
                },
                paragraph: {
                    spacing: { line: 320, after: 120 },
                },
            },
        },
        paragraphStyles: [
            {
                id: "Heading1",
                name: "Heading 1",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: {
                    font: "Times New Roman",
                    bold: true,
                    size: 30,
                    color: COLORS.blue,
                },
                paragraph: {
                    spacing: { before: 320, after: 180 },
                },
            },
            {
                id: "Heading2",
                name: "Heading 2",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: {
                    font: "Times New Roman",
                    bold: true,
                    size: 26,
                    color: COLORS.dark,
                },
                paragraph: {
                    spacing: { before: 260, after: 140 },
                },
            },
            {
                id: "Heading3",
                name: "Heading 3",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: {
                    font: "Times New Roman",
                    bold: true,
                    size: 23,
                    color: COLORS.dark,
                },
                paragraph: {
                    spacing: { before: 220, after: 120 },
                },
            },
            {
                id: "Heading4",
                name: "Heading 4",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: {
                    font: "Times New Roman",
                    bold: true,
                    italics: true,
                    size: 21,
                    color: COLORS.muted,
                },
                paragraph: {
                    spacing: { before: 180, after: 100 },
                },
            },
        ],
    },
    numbering: {
        config: [
            {
                reference: "default-bullet",
                levels: [
                    {
                        level: 0,
                        format: "bullet",
                        text: "•",
                        alignment: AlignmentType.LEFT,
                        style: {
                            paragraph: {
                                indent: { left: 720, hanging: 360 },
                            },
                        },
                    },
                ],
            },
        ],
    },
    sections,
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(outputPath, buffer);
    console.log(`Generated: ${outputPath}`);
});
