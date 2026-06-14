/**
 * ===========================================
 * Document Service - DOCX Generator
 * ===========================================
 * Service untuk generate dokumen DOCX
 * seperti Surat Persetujuan Sempro
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {
    Document,
    ImageRun,
    Packer,
    Paragraph,
    TextRun,
    AlignmentType,
    HeadingLevel,
    BorderStyle,
    Table,
    TableRow,
    TableCell,
    WidthType,
    convertInchesToTwip,
} = require('docx');

const signatureAssetsDir = path.join(__dirname, '..', 'assets', 'signatures');

const loadSignatureAsset = (fileName) => {
    const filePath = path.join(signatureAssetsDir, fileName);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    return fs.readFileSync(filePath);
};

const createSignatureParagraph = (signatureBuffer) => new Paragraph({
    alignment: AlignmentType.CENTER,
    children: signatureBuffer ? [
        new ImageRun({
            type: 'png',
            data: signatureBuffer,
            transformation: {
                width: 150,
                height: 45,
            },
        })
    ] : [
        new TextRun({ text: '' })
    ],
});

/**
 * Format tanggal ke format Indonesia
 * @param {Date} date - Tanggal
 * @returns {string} - Tanggal dalam format Indonesia
 */
const formatTanggalIndonesia = (date = new Date()) => {
    const bulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const d = new Date(date);
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * Generate Surat Persetujuan Seminar Proposal
 * @param {Object} data - Data untuk surat
 * @param {Object} data.mahasiswa - Data mahasiswa
 * @param {Object} data.dospem1 - Data dosen pembimbing 1
 * @param {Object} data.dospem2 - Data dosen pembimbing 2
 * @returns {Promise<Buffer>} - Buffer DOCX
 */
const generateSuratPersetujuanSempro = async (data) => {
    const { mahasiswa, dospem1, dospem2 } = data;
    const tanggal = formatTanggalIndonesia();
    const sampleSignature = loadSignatureAsset('sample-ttd.png');

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: convertInchesToTwip(1),
                        right: convertInchesToTwip(1),
                        bottom: convertInchesToTwip(1),
                        left: convertInchesToTwip(1.25),
                    },
                },
            },
            children: [
                // Header - Judul
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: 'PERSETUJUAN PENGAJUAN',
                            bold: true,
                            size: 28,
                        }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: 'SEMINAR PROPOSAL PENELITIAN / HASIL PENELITIAN / SIDANG',
                            bold: true,
                            size: 28,
                        }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: 'TUGAS AKHIR (*)',
                            bold: true,
                            size: 28,
                        }),
                    ],
                }),

                // Spacing
                new Paragraph({ text: '' }),
                new Paragraph({ text: '' }),

                // Keterangan
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'Yang bertanda tangan dibawah ini selaku Dosen Pembimbing TA menerangkan bahwa :',
                        }),
                    ],
                }),

                // Spacing
                new Paragraph({ text: '' }),

                // Data Mahasiswa - Table
                new Table({
                    width: {
                        size: 100,
                        type: WidthType.PERCENTAGE,
                    },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE },
                        insideVertical: { style: BorderStyle.NONE },
                    },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    width: { size: 25, type: WidthType.PERCENTAGE },
                                    children: [new Paragraph({ text: 'Nama' })],
                                }),
                                new TableCell({
                                    width: { size: 5, type: WidthType.PERCENTAGE },
                                    children: [new Paragraph({ text: ':' })],
                                }),
                                new TableCell({
                                    width: { size: 70, type: WidthType.PERCENTAGE },
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: mahasiswa.name || '-', bold: true })]
                                    })],
                                }),
                            ],
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: 'NIM' })] }),
                                new TableCell({ children: [new Paragraph({ text: ':' })] }),
                                new TableCell({ children: [new Paragraph({ text: mahasiswa.nim_nip || '-' })] }),
                            ],
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: 'Program Studi' })] }),
                                new TableCell({ children: [new Paragraph({ text: ':' })] }),
                                new TableCell({ children: [new Paragraph({ text: mahasiswa.prodi || 'Sistem Informasi' })] }),
                            ],
                        }),
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: 'Judul TA' })] }),
                                new TableCell({ children: [new Paragraph({ text: ':' })] }),
                                new TableCell({ children: [new Paragraph({ text: '' })] }),
                            ],
                        }),
                    ],
                }),

                // Judul TA (in quotes)
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                    children: [
                        new TextRun({
                            text: `"${mahasiswa.judulTA || 'Judul Tugas Akhir'}"`,
                            italics: true,
                        }),
                    ],
                }),

                // Pernyataan
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'Menyatakan bahwa proposal penelitian / laporan TA (*) sudah selesai diperiksa dan siap untuk diajukan dalam seminar / sidang (*).',
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.',
                        }),
                    ],
                }),

                // Spacing
                new Paragraph({ text: '' }),
                new Paragraph({ text: '' }),

                // Tempat dan Tanggal
                new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                        new TextRun({
                            text: `Batam, ${tanggal}`,
                        }),
                    ],
                }),

                // Spacing
                new Paragraph({ text: '' }),
                new Paragraph({ text: '' }),

                // Tanda Tangan - 2 Kolom
                new Table({
                    width: {
                        size: 100,
                        type: WidthType.PERCENTAGE,
                    },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE },
                        insideVertical: { style: BorderStyle.NONE },
                    },
                    rows: [
                        // Header
                        new TableRow({
                            children: [
                                new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    children: [new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [new TextRun({ text: 'Dosen Pembimbing 1', bold: true })]
                                    })],
                                }),
                                new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    children: [new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [new TextRun({ text: 'Dosen Pembimbing 2', bold: true })]
                                    })],
                                }),
                            ],
                        }),
                        // Space for signature
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({ text: '' }),
                                        createSignatureParagraph(sampleSignature),
                                        new Paragraph({ text: '' }),
                                    ]
                                }),
                                new TableCell({
                                    children: [
                                        new Paragraph({ text: '' }),
                                        createSignatureParagraph(sampleSignature),
                                        new Paragraph({ text: '' }),
                                    ]
                                }),
                            ],
                        }),
                        // Names
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [new TextRun({ text: dospem1?.name || 'Nama Dosen Pembimbing 1', bold: true, underline: {} })]
                                    })],
                                }),
                                new TableCell({
                                    children: [new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [new TextRun({ text: dospem2?.name || 'Nama Dosen Pembimbing 2', bold: true, underline: {} })]
                                    })],
                                }),
                            ],
                        }),
                        // NIP/NIDN
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        text: `NIDN. ${dospem1?.nim_nip || '-'}`
                                    })],
                                }),
                                new TableCell({
                                    children: [new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        text: `NIDN. ${dospem2?.nim_nip || '-'}`
                                    })],
                                }),
                            ],
                        }),
                    ],
                }),

                // Spacing
                new Paragraph({ text: '' }),
                new Paragraph({ text: '' }),

                // Footnote
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '(*) coret yang tidak perlu',
                            italics: true,
                            size: 20,
                        }),
                    ],
                }),
            ],
        }],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
};

module.exports = {
    generateSuratPersetujuanSempro,
    formatTanggalIndonesia,
};
