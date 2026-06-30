# -*- coding: utf-8 -*-
import os
import xml.etree.ElementTree as ET

# Output Directory
out_dir = r"c:\Users\GIGABYTE\Documents\Skripsi\Program_Deploy\RANDOM-KEBUTUHANSKRIPSI\Diagram_Drawio"
if not os.path.exists(out_dir):
    os.makedirs(out_dir)

class DrawioBuilder:
    def __init__(self, name, w=850, h=1200):
        self.root = ET.Element("mxfile", host="Electron", version="22.1.2")
        self.diag = ET.SubElement(self.root, "diagram", id="d1", name=name)
        self.model = ET.SubElement(self.diag, "mxGraphModel", dx="1000", dy="1000", grid="1", gridSize="10", pageWidth=str(w), pageHeight=str(h))
        self.graph_root = ET.SubElement(self.model, "root")
        ET.SubElement(self.graph_root, "mxCell", id="0")
        ET.SubElement(self.graph_root, "mxCell", id="1", parent="0")
        self.lifeline_h = 800  # Default lifeline height for sequence diagrams
        self.lifelines_x = {}  # Store x coordinate of lifelines for alignment

    def title(self, text, w=600, h=40, x=125, y=20):
        style = "text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;fontSize=18;fontStyle=1"
        self.vertex("title", text, style, x, y, w, h, False)

    def vertex(self, nid, val, style, x, y, w, h, conn=True):
        attrs = {"id": str(nid), "parent": "1", "style": style, "value": val, "vertex": "1"}
        if not conn: 
            attrs["connectable"] = "0"
        cell = ET.SubElement(self.graph_root, "mxCell", attrs)
        geom = ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width=str(w), height=str(h))
        geom.set("as", "geometry")
        return cell

    def swimlanes(self, left, right, h, lw=380, rw=380):
        # Closed Outer Box
        self.vertex("swim_border", "", "fillColor=none;strokeColor=#666666;strokeWidth=1;childLayout=none;", 50, 60, lw + rw, h - 60, False)
        # Headers
        self.vertex("swim_h_left", left, "rounded=0;whiteSpace=wrap;html=1;fontStyle=1;align=center;verticalAlign=middle;fillColor=#f5f5f5;strokeColor=#666666;fontSize=14;", 50, 60, lw, 40, False)
        self.vertex("swim_h_right", right, "rounded=0;whiteSpace=wrap;html=1;fontStyle=1;align=center;verticalAlign=middle;fillColor=#f5f5f5;strokeColor=#666666;fontSize=14;", 50 + lw, 60, rw, 40, False)
        # Dashed Middle Separator
        self.vertex("swim_sep", "", "fillColor=none;strokeColor=#666666;dashed=1;strokeWidth=1;", 50 + lw, 100, 1, h - 100, False)

    def swimlanes3(self, left, middle, right, h, lw=260, mw=260, rw=260):
        # Closed Outer Box
        self.vertex("swim_border", "", "fillColor=none;strokeColor=#666666;strokeWidth=1;childLayout=none;", 50, 60, lw + mw + rw, h - 60, False)
        # Headers
        self.vertex("swim_h_left", left, "rounded=0;whiteSpace=wrap;html=1;fontStyle=1;align=center;verticalAlign=middle;fillColor=#f5f5f5;strokeColor=#666666;fontSize=14;", 50, 60, lw, 40, False)
        self.vertex("swim_h_mid", middle, "rounded=0;whiteSpace=wrap;html=1;fontStyle=1;align=center;verticalAlign=middle;fillColor=#f5f5f5;strokeColor=#666666;fontSize=14;", 50 + lw, 60, mw, 40, False)
        self.vertex("swim_h_right", right, "rounded=0;whiteSpace=wrap;html=1;fontStyle=1;align=center;verticalAlign=middle;fillColor=#f5f5f5;strokeColor=#666666;fontSize=14;", 50 + lw + mw, 60, rw, 40, False)
        # Dashed Separators
        self.vertex("swim_sep1", "", "fillColor=none;strokeColor=#666666;dashed=1;strokeWidth=1;", 50 + lw, 100, 1, h - 100, False)
        self.vertex("swim_sep2", "", "fillColor=none;strokeColor=#666666;dashed=1;strokeWidth=1;", 50 + lw + mw, 100, 1, h - 100, False)

    def divider(self, text, y, w=800):
        style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;fontStyle=1;align=center;verticalAlign=middle;fontSize=11;"
        self.vertex(f"div_{y}", text, style, 40, y, w, 25, False)

    def frame(self, text, y, h, w=800):
        style = "shape=umlFrame;whiteSpace=wrap;html=1;pointerEvents=0;recursiveResize=0;container=1;collapsible=0;width=80;height=20;fillColor=none;strokeColor=#666666;fontSize=10;fontStyle=1;align=left;verticalAlign=top;spacingLeft=10;"
        self.vertex(f"frame_{y}", text, style, 40, y, w, h, False)

    def frame_sep(self, y, w=800):
        style = "line;strokeColor=#666666;dashed=1;html=1;align=left;verticalAlign=bottom;"
        self.vertex(f"sep_{y}", "", style, 40, y, w, 10, False)

    def is_actor(self, nid):
        # Returns True if lifeline is an Actor (e.g. Admin, Pengguna, Mahasiswa, Dosen)
        nid_l = nid.lower()
        return any(act in nid_l for act in ["user", "admin", "mhs", "dosen", "pengguna", "actor"]) and not any(db in nid_l for db in ["model", "db", "tabel"])

    def seq_lifeline(self, nid, name, x, y=100, w=100):
        self.lifelines_x[nid] = x
        # Determine styling based on name or ID
        if self.is_actor(nid):
            style = S_LIF_ACTOR
        elif any(db in nid.lower() or db in name.lower() for db in ["model", "db", "tabel", "database"]):
            style = S_LIF_DB
        else:
            style = S_LIF_BOX
        return self.vertex(nid, name, style, x, y, w, self.lifeline_h)

    def seq_activation_bar(self, nid, lifeline_id, y_start, y_end):
        x_lifeline = self.lifelines_x.get(lifeline_id, 0)
        # Midline is at x_lifeline + 50 (w=100). Activation bar width=16, so x = x_lifeline + 42
        x_act = x_lifeline + 42
        w_act = 16
        h_act = y_end - y_start
        style = "fillColor=#ffffff;strokeColor=#000000;rounded=0;whiteSpace=wrap;html=1;"
        return self.vertex(nid, "", style, x_act, y_start, w_act, h_act)

    def seq_edge(self, eid, sid, tid, label, y, is_dashed=False):
        ratio = (y - 100.0) / self.lifeline_h
        ratio_str = f"{ratio:.3f}"
        
        xs = self.lifelines_x.get(sid, 0)
        xt = self.lifelines_x.get(tid, 0)
        
        if xs < xt: # left to right
            exitX = "0.5" if self.is_actor(sid) else "0.58"
            entryX = "0.5" if self.is_actor(tid) else "0.42"
        else: # right to left
            exitX = "0.5" if self.is_actor(sid) else "0.42"
            entryX = "0.5" if self.is_actor(tid) else "0.58"
            
        if is_dashed:
            style = f"html=1;verticalAlign=bottom;endArrow=dashed;endFill=0;edgeStyle=none;exitX={exitX};exitY={ratio_str};entryX={entryX};entryY={ratio_str};"
        else:
            style = f"html=1;verticalAlign=bottom;endArrow=block;edgeStyle=none;exitX={exitX};exitY={ratio_str};entryX={entryX};entryY={ratio_str};"
        return self.edge(eid, sid, tid, label, style)

    def seq_self_edge(self, eid, sid, label, y1, y2):
        r1 = (y1 - 100.0) / self.lifeline_h
        r2 = (y2 - 100.0) / self.lifeline_h
        r1_str = f"{r1:.3f}"
        r2_str = f"{r2:.3f}"
        exitX = "0.5" if self.is_actor(sid) else "0.58"
        entryX = "0.5" if self.is_actor(sid) else "0.58"
        style = f"html=1;verticalAlign=bottom;endArrow=block;edgeStyle=orthogonalEdgeStyle;rounded=0;exitX={exitX};exitY={r1_str};entryX={entryX};entryY={r2_str};"
        return self.edge(eid, sid, sid, label, style)

    def edge(self, eid, sid, tid, val="", style="", exit_port=None, entry_port=None):
        if not style:
            style = "edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;endFill=1;strokeWidth=1;"
        if exit_port:
            style += f"exitX={exit_port[0]};exitY={exit_port[1]};exitDx=0;exitDy=0;"
        if entry_port:
            style += f"entryX={entry_port[0]};entryY={entry_port[1]};entryDx=0;entryDy=0;"
        cell = ET.SubElement(self.graph_root, "mxCell", id=str(eid), parent="1", style=style, value=val, edge="1", source=str(sid), target=str(tid))
        geom = ET.SubElement(cell, "mxGeometry", relative="1")
        geom.set("as", "geometry")
        return cell

    def save(self, fn):
        tree = ET.ElementTree(self.root)
        ET.indent(tree, space="  ")
        tree.write(os.path.join(out_dir, fn), encoding="utf-8", xml_declaration=True)

# Styles
S_START = "ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1"
S_START_ACT = "ellipse;html=1;fillColor=#000000;strokeColor=none;"
S_END_ACT = "ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#000000;"
S_PROC = "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf"
S_DEC = "rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656"
S_ACT = "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#f8cecc;strokeColor=#b85450"
S_UC = "ellipse;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656"
S_CLS = "swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;fillColor=#dae8fc;strokeColor=#6c8ebf"
S_LIF = "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;dropTarget=0;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#dae8fc;strokeColor=#6c8ebf"
S_LIF_BOX = "shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;dropTarget=0;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;"
S_LIF_ACTOR = "shape=umlLifeline;participant=umlActor;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;dropTarget=0;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;"
S_LIF_DB = "shape=umlLifeline;participant=cylinder;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;dropTarget=0;collapsible=0;recursiveResize=0;outlineConnect=0;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;"

# ==========================================
# 1. USE CASE DIAGRAM
# ==========================================
def build_usecase():
    b = DrawioBuilder("Use Case Diagram SIMTA", 1000, 1050)
    b.title("Gambar 4.1: Use Case Diagram SIMTA")
    b.vertex("a_admin", "Admin (Koordinator)", S_ACT, 50, 370, 40, 80)
    b.vertex("a_mhs", "Mahasiswa", S_ACT, 50, 150, 40, 80)
    b.vertex("a_dosen", "Dosen\n(Pembimbing / Penguji)", S_ACT, 50, 680, 40, 80)
    b.vertex("sys_box", "SIMTA System Boundary", "swimlane;whiteSpace=wrap;html=1;startSize=23;fillColor=none;strokeColor=#6c8ebf;dashed=1", 200, 80, 600, 930, False)
    
    ucs = [
        ("uc_login", "Melakukan Login", 120),
        ("uc_dash", "Mengakses Halaman Utama", 175),
        ("uc_users", "Mengelola Data Pengguna", 230),
        ("uc_plot", "Menentukan Dosen Pembimbing", 285),
        ("uc_jadwal", "Mengelola Jadwal Sidang", 340),
        ("uc_hasil", "Menginput Hasil & Nilai Sidang", 395),
        ("uc_upload", "Mengunggah Dokumen Bimbingan", 450),
        ("uc_history", "Melihat Riwayat & Umpan Balik", 505),
        ("uc_reply", "Melakukan Diskusi Interaktif", 560),
        ("uc_surat", "Mengunduh Surat Persetujuan", 615),
        ("uc_revisi", "Mengunggah Dokumen Revisi", 670),
        ("uc_review_dp", "Melakukan Evaluasi Bimbingan", 725),
        ("uc_review_pj", "Melakukan Evaluasi Revisi", 780),
        ("uc_acc_sempro", "Memberikan Persetujuan Proposal", 835),
        ("uc_acc_revisi", "Memberikan Persetujuan Ujian", 890),
        ("uc_view_jadwal", "Melihat Jadwal Sidang", 945)
    ]
    for uid, val, y in ucs:
        b.vertex(uid, val, S_UC, 350, y, 220, 45)
    
    style_assoc = "endArrow=none;html=1;rounded=0;edgeStyle=none;"
    for uid in ["uc_login", "uc_dash", "uc_users", "uc_plot", "uc_jadwal", "uc_hasil", "uc_view_jadwal"]:
        b.edge(f"e_a_{uid}", "a_admin", uid, style=style_assoc)
    for uid in ["uc_login", "uc_dash", "uc_upload", "uc_history", "uc_reply", "uc_surat", "uc_revisi", "uc_view_jadwal"]:
        b.edge(f"e_m_{uid}", "a_mhs", uid, style=style_assoc)
    for uid in ["uc_login", "uc_dash", "uc_history", "uc_reply", "uc_review_dp", "uc_review_pj", "uc_acc_sempro", "uc_acc_revisi", "uc_view_jadwal"]:
        b.edge(f"e_d_{uid}", "a_dosen", uid, style=style_assoc)
    b.save("Gambar 4.1 - Use Case Diagram SIMTA.drawio")

# ==========================================
# 2. CLASS DIAGRAM
# ==========================================
def build_class_diagram():
    b = DrawioBuilder("Class Diagram SIMTA", 1200, 1000)
    b.title("Gambar 4.2: Class Diagram SIMTA")
    
    b_fields = "Bimbingan\n--\n+mahasiswa: ID\n+dosen: ID\n+dosenType: String\n+kategoriBimbingan: String\n+version: String\n+judul: String\n+catatan: String\n+fileName: String\n+filePath: String\n+fileSize: String\n+fileOriginalName: String\n+status: String\n+feedback: String\n+feedbackDate: Date\n+feedbackFile: String\n+feedbackFileName: String\n+draftFeedback: String\n+draftStatus: String\n+hasDraft: Boolean\n+createdAt: Date\n+updatedAt: Date"
    b.vertex("c_bim", b_fields, S_CLS, 50, 100, 260, 420)
    
    u_fields = "User\n--\n+_id: ID\n+nim_nip: String\n+password: String\n+name: String\n+email: String\n+role: String\n+prodi: String\n+semester: String\n+judulTA: String\n+currentProgress: String\n+statusMahasiswa: String\n+dospem_1: ID\n+dospem_2: ID\n+penguji_1: ID\n+penguji_2: ID\n+status: String\n+whatsapp: String\n+canAccessAdmin: Boolean\n+createdAt: Date\n+updatedAt: Date"
    b.vertex("c_user", u_fields, S_CLS, 420, 200, 240, 360)
    
    r_fields = "Reply\n--\n+_id: ID\n+bimbingan: ID\n+sender: ID\n+senderRole: String\n+message: String\n+createdAt: Date\n+updatedAt: Date"
    b.vertex("c_reply", r_fields, S_CLS, 750, 100, 220, 170)
    
    j_fields = "Jadwal\n--\n+mahasiswa: ID\n+jenisJadwal: String\n+tanggal: Date\n+waktuMulai: String\n+waktuSelesai: String\n+ruangan: String\n+penguji: Array<ID>\n+status: String\n+hasil: String\n+nilaiSidang: Number\n+catatan: String\n+createdBy: ID\n+createdAt: Date\n+updatedAt: Date"
    b.vertex("c_jadwal", j_fields, S_CLS, 410, 620, 260, 290)
    
    b.edge("rel_u_bim_m", "c_user", "c_bim", "1..* (Mahasiswa)", "endArrow=classic;html=1;rounded=0;", (0, 0.2), (1, 0.3))
    b.edge("rel_u_bim_d", "c_user", "c_bim", "1..* (Dosen)", "endArrow=classic;html=1;rounded=0;", (0, 0.4), (1, 0.6))
    b.edge("rel_bim_rep", "c_bim", "c_reply", "1..* (Replies)", "endArrow=classic;html=1;rounded=0;", (1, 0.12), (0, 0.3))
    b.edge("rel_u_rep", "c_user", "c_reply", "1..* (Sender)", "endArrow=classic;html=1;rounded=0;", (1, 0.2), (0, 0.7))
    b.edge("rel_u_jad_m", "c_user", "c_jadwal", "1 (Mahasiswa)", "endArrow=classic;html=1;rounded=0;", (0.3, 1), (0.3, 0))
    b.edge("rel_u_jad_d", "c_user", "c_jadwal", "1..* (Penguji)", "endArrow=classic;html=1;rounded=0;", (0.5, 1), (0.5, 0))
    b.edge("rel_u_jad_a", "c_user", "c_jadwal", "1 (Admin)", "endArrow=classic;html=1;rounded=0;", (0.7, 1), (0.7, 0))
    b.save("Gambar 4.2 - Class Diagram SIMTA.drawio")

# ==========================================
# 3. ACTIVITY DIAGRAMS (Gambar 4.3 - Gambar 4.10)
# ==========================================

# 3. ACTIVITY DIAGRAMS (Gambar 4.3 - Gambar 4.10)
# ==========================================

# Gambar 4.3: Activity Diagram Login
def build_activity_login():
    b = DrawioBuilder("Activity Diagram Login", 900, 1200)
    b.title("Gambar 4.3: Activity Diagram Autentikasi Pengguna (Login)")
    b.swimlanes3("Pengguna", "Sistem", "Basis Data", 1200)
    
    b.vertex("start", "", S_START_ACT, 165, 120, 30, 30)
    b.vertex("open_web", "Mengakses Website SIMTA", S_PROC, 80, 190, 200, 60)
    b.vertex("show_login", "Menampilkan Halaman Login", S_PROC, 340, 190, 200, 60)
    b.vertex("input", "Memasukkan NIM/NIP dan Password", S_PROC, 80, 280, 200, 60)
    b.vertex("click_login", "Menekan Tombol Login", S_PROC, 80, 370, 200, 60)
    b.vertex("submit_login", "Mengirimkan Kredensial Login", S_PROC, 340, 370, 200, 60)
    
    b.vertex("check_cred", "Mencari Data Pengguna & Verifikasi Password", S_PROC, 600, 460, 200, 60)
    b.vertex("is_cred_valid", "Kredensial Valid?", S_DEC, 640, 550, 120, 80)
    b.vertex("err_cred", "Menampilkan Pesan Autentikasi Gagal", S_PROC, 340, 560, 200, 60)
    
    b.vertex("check_active", "Memeriksa Status Aktif Akun", S_PROC, 600, 660, 200, 60)
    b.vertex("is_active", "Status Akun Aktif?", S_DEC, 640, 750, 120, 80)
    b.vertex("err_active", "Menampilkan Pesan Akun Nonaktif", S_PROC, 340, 760, 200, 60)
    
    b.vertex("identify", "Mengidentifikasi Peran Pengguna & Hak Akses", S_PROC, 600, 860, 200, 60)
    b.vertex("db_redirect", "Mengembalikan Hak Akses & Sesi Peran", S_PROC, 600, 950, 200, 60)
    b.vertex("redirect", "Mengarahkan ke Dashboard Sesuai Peran", S_PROC, 340, 950, 200, 60)
    b.vertex("end", "", S_END_ACT, 425, 1060, 30, 30)
    
    b.edge("e1", "start", "open_web", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e2", "open_web", "show_login", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e3", "show_login", "input", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e4", "input", "click_login", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e5", "click_login", "submit_login", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e6", "submit_login", "check_cred", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e7", "check_cred", "is_cred_valid", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e8", "is_cred_valid", "err_cred", "Tidak", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e9", "err_cred", "input", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e10", "is_cred_valid", "check_active", "Ya", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e11", "check_active", "is_active", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e12", "is_active", "err_active", "Tidak", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e13", "err_active", "input", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e14", "is_active", "identify", "Ya", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e15", "identify", "db_redirect", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e16", "db_redirect", "redirect", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e17", "redirect", "end", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.save("Gambar 4.3 - Activity Diagram Login.drawio")

# Gambar 4.4: Activity Diagram Kelola User
def build_activity_kelola_user():
    b = DrawioBuilder("Activity Diagram Kelola User", 900, 1100)
    b.title("Gambar 4.4: Activity Diagram Pengelolaan Data Pengguna (Admin)")
    b.swimlanes3("Admin", "Sistem", "Basis Data", 1100)
    
    b.vertex("start", "", S_START_ACT, 165, 120, 30, 30)
    b.vertex("menu", "Memilih Menu Kelola Pengguna", S_PROC, 80, 190, 200, 60)
    b.vertex("show_list", "Menampilkan Daftar Pengguna", S_PROC, 340, 190, 200, 60)
    b.vertex("click_add", "Menekan Tombol \"Tambah Pengguna\"", S_PROC, 80, 280, 200, 60)
    b.vertex("show_form", "Menampilkan Form Tambah Pengguna", S_PROC, 340, 280, 200, 60)
    b.vertex("input_data", "Memasukkan Data Pengguna Baru & Tekan Simpan", S_PROC, 80, 370, 200, 60)
    b.vertex("submit_data", "Mengirimkan Permintaan Pembuatan Pengguna", S_PROC, 340, 370, 200, 60)
    
    b.vertex("check_exist", "Memeriksa Ketersediaan NIM/NIP Pengguna", S_PROC, 600, 460, 200, 60)
    b.vertex("is_exist", "NIM/NIP Sudah Terdaftar?", S_DEC, 640, 550, 120, 80)
    b.vertex("err_exist", "Menampilkan Pesan NIM/NIP Terdaftar", S_PROC, 340, 560, 200, 60)
    
    b.vertex("encrypt_pwd", "Melakukan Enkripsi Kata Sandi (bcrypt)", S_PROC, 600, 660, 200, 60)
    b.vertex("save", "Menyimpan Data Pengguna Baru ke Basis Data", S_PROC, 600, 750, 200, 60)
    b.vertex("db_confirm", "Mengembalikan Konfirmasi Sukses", S_PROC, 600, 840, 200, 60)
    b.vertex("success", "Menampilkan Notifikasi Sukses & Update Tabel", S_PROC, 340, 840, 200, 60)
    b.vertex("end", "", S_END_ACT, 425, 950, 30, 30)
    
    b.edge("e1", "start", "menu", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e2", "menu", "show_list", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e3", "show_list", "click_add", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e4", "click_add", "show_form", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e5", "show_form", "input_data", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e6", "input_data", "submit_data", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e7", "submit_data", "check_exist", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e8", "check_exist", "is_exist", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e9", "is_exist", "err_exist", "Ya", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e10", "err_exist", "input_data", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e11", "is_exist", "encrypt_pwd", "Tidak", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e12", "encrypt_pwd", "save", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e13", "save", "db_confirm", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e14", "db_confirm", "success", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e15", "success", "end", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.save("Gambar 4.4 - Activity Diagram Kelola User.drawio")

# Gambar 4.5: Activity Diagram Plotting Dosen Pembimbing
def build_activity_plotting_dospem():
    b = DrawioBuilder("Activity Diagram Plotting Dospem", 900, 1100)
    b.title("Gambar 4.5: Activity Diagram Penentuan Dosen Pembimbing (Admin)")
    b.swimlanes3("Admin", "Sistem", "Basis Data", 1100)
    
    b.vertex("start", "", S_START_ACT, 165, 120, 30, 30)
    b.vertex("menu", "Memilih Menu Plotting Dospem", S_PROC, 80, 190, 200, 60)
    b.vertex("show_list", "Menampilkan Daftar Mahasiswa & Pilihan Dosen", S_PROC, 340, 190, 200, 60)
    b.vertex("choose_dospem", "Memilih Mahasiswa & Menentukan Dospem 1 & 2", S_PROC, 80, 280, 200, 60)
    b.vertex("submit_plotting", "Mengirimkan Permintaan Plotting", S_PROC, 340, 280, 200, 60)
    
    b.vertex("query_mhs", "Mencari & Memvalidasi Peran Target", S_PROC, 600, 370, 200, 60)
    b.vertex("is_mhs", "Role = Mahasiswa?", S_DEC, 640, 460, 120, 80)
    b.vertex("err_role", "Menampilkan Pesan Error Peran Bukan Mahasiswa", S_PROC, 340, 470, 200, 60)
    
    b.vertex("check_dup", "Memvalidasi Kesamaan Dospem 1 & Dospem 2", S_PROC, 600, 580, 200, 60)
    b.vertex("is_dup", "Dospem 1 == Dospem 2?", S_DEC, 640, 670, 120, 80)
    b.vertex("err_dup", "Menampilkan Pesan Error Duplikasi Dosen", S_PROC, 340, 680, 200, 60)
    
    b.vertex("save", "Menyimpan Relasi Dospem 1 & 2 ke Record Mahasiswa", S_PROC, 600, 790, 200, 60)
    b.vertex("db_confirm", "Mengembalikan Konfirmasi Plotting Berhasil", S_PROC, 600, 880, 200, 60)
    b.vertex("success", "Menampilkan Notifikasi Sukses Plotting", S_PROC, 340, 880, 200, 60)
    b.vertex("end", "", S_END_ACT, 425, 990, 30, 30)
    
    b.edge("e1", "start", "menu", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e2", "menu", "show_list", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e3", "show_list", "choose_dospem", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e4", "choose_dospem", "submit_plotting", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e5", "submit_plotting", "query_mhs", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e6", "query_mhs", "is_mhs", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e7", "is_mhs", "err_role", "Tidak", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e8", "err_role", "choose_dospem", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e9", "is_mhs", "check_dup", "Ya", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e10", "check_dup", "is_dup", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e11", "is_dup", "err_dup", "Ya", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e12", "err_dup", "choose_dospem", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e13", "is_dup", "save", "Tidak", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e14", "save", "db_confirm", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e15", "db_confirm", "success", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e16", "success", "end", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.save("Gambar 4.5 - Activity Diagram Plotting Dosen Pembimbing.drawio")

# Gambar 4.6: Activity Diagram Kelola Jadwal Sidang
def build_activity_kelola_jadwal():
    b = DrawioBuilder("Activity Diagram Kelola Jadwal", 900, 1400)
    b.title("Gambar 4.6: Activity Diagram Pengelolaan Jadwal Sidang (Admin)")
    b.swimlanes3("Admin", "Sistem", "Basis Data", 1400)
    
    b.vertex("start", "", S_START_ACT, 165, 100, 30, 30)
    b.vertex("menu", "Mengakses Menu Kelola Jadwal", S_PROC, 80, 170, 200, 60)
    b.vertex("show_list", "Menampilkan Halaman Kelola Jadwal", S_PROC, 340, 170, 200, 60)
    b.vertex("click_add", "Menekan Tombol \"Tambah Jadwal\"", S_PROC, 80, 260, 200, 60)
    b.vertex("show_form", "Menampilkan Form Tambah Jadwal", S_PROC, 340, 260, 200, 60)
    b.vertex("input_data", "Mengisi Form Jadwal & Menekan Simpan", S_PROC, 80, 350, 200, 60)
    b.vertex("submit_jadwal", "Mengirimkan Permintaan Pembuatan Jadwal", S_PROC, 340, 350, 200, 60)
    
    b.vertex("check_room", "Cek Ketersediaan Ruangan & Slot Waktu", S_PROC, 600, 440, 200, 60)
    b.vertex("is_room_conflict", "Ruangan Bentrok?", S_DEC, 640, 530, 120, 80)
    b.vertex("err_room", "Menampilkan Pesan Bentrok Ruangan", S_PROC, 340, 540, 200, 60)
    
    b.vertex("check_role", "Cek Validasi Peran Dosen Penguji", S_PROC, 600, 650, 200, 60)
    b.vertex("is_role_valid", "Dosen Penguji Valid?", S_DEC, 640, 740, 120, 80)
    b.vertex("err_role", "Menampilkan Pesan Konflik Peran Dosen", S_PROC, 340, 750, 200, 60)
    
    b.vertex("save", "Menyimpan Jadwal & Sinkronisasi Data Penguji", S_PROC, 600, 850, 200, 60)
    b.vertex("update_prog", "Memperbarui Status Progres Mahasiswa", S_PROC, 600, 940, 200, 60)
    b.vertex("db_confirm", "Mengembalikan Konfirmasi Sukses", S_PROC, 600, 1030, 200, 60)
    
    b.vertex("email", "Mengirim Email Notifikasi Otomatis", S_PROC, 340, 1030, 200, 60)
    b.vertex("success", "Menampilkan Notifikasi Sukses Pembuatan", S_PROC, 340, 1120, 200, 60)
    b.vertex("end", "", S_END_ACT, 425, 1220, 30, 30)
    
    b.edge("e1", "start", "menu", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e2", "menu", "show_list", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e3", "show_list", "click_add", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e4", "click_add", "show_form", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e5", "show_form", "input_data", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e6", "input_data", "submit_jadwal", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e7", "submit_jadwal", "check_room", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e8", "check_room", "is_room_conflict", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e9", "is_room_conflict", "err_room", "Ya", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e10", "err_room", "input_data", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e11", "is_room_conflict", "check_role", "Tidak", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e12", "check_role", "is_role_valid", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e13", "is_role_valid", "err_role", "Tidak", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e14", "err_role", "input_data", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e15", "is_role_valid", "save", "Ya", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e16", "save", "update_prog", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e17", "update_prog", "db_confirm", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e18", "db_confirm", "email", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e19", "email", "success", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e20", "success", "end", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.save("Gambar 4.6 - Activity Diagram Kelola Jadwal Sidang.drawio")


# Gambar 4.7: Activity Diagram Pengajuan Bimbingan
def build_activity_pengajuan():
    b = DrawioBuilder("Activity Diagram Pengajuan Bimbingan", 900, 1350)
    b.title("Gambar 4.7: Activity Diagram Pengajuan Bimbingan / Revisi Mahasiswa")
    b.swimlanes3("Mahasiswa", "Sistem", "Basis Data", 1350)
    
    b.vertex("start", "", S_START_ACT, 165, 80, 30, 30)
    b.vertex("menu", "Mengakses Menu Bimbingan", S_PROC, 80, 140, 200, 60)
    b.vertex("show_list", "Menampilkan Halaman Riwayat Bimbingan", S_PROC, 340, 140, 200, 60)
    b.vertex("click_new", "Menekan Tombol \"Pengajuan Baru\"", S_PROC, 80, 230, 200, 60)
    b.vertex("submit_check", "Mengirimkan Permintaan Pengecekan Antrean", S_PROC, 340, 230, 200, 60)
    
    b.vertex("check_pending", "Memeriksa Dokumen Berstatus Menunggu Review", S_PROC, 600, 320, 200, 60)
    b.vertex("is_pending", "Ada Dokumen Status Menunggu?", S_DEC, 640, 410, 120, 80)
    b.vertex("err_pending", "Menampilkan Pesan Ada Bimbingan Menunggu Review", S_PROC, 340, 420, 200, 60)
    
    b.vertex("check_revisi", "Memeriksa Status Fase Mahasiswa", S_PROC, 600, 530, 200, 60)
    b.vertex("is_revisi", "Mahasiswa dalam Fase Revisi Sidang?", S_DEC, 640, 620, 120, 80)
    
    b.vertex("pilih_penguji", "Memilih Dosen Penguji & Kolom Revisi", S_PROC, 80, 730, 200, 60)
    b.vertex("upload_revisi", "Mengunggah Dokumen PDF Revisi", S_PROC, 80, 810, 200, 60)
    
    b.vertex("pilih_dospem", "Memilih Dosen Pembimbing & Kolom Bimbingan", S_PROC, 80, 890, 200, 60)
    b.vertex("upload_bim", "Mengunggah Dokumen PDF Bimbingan", S_PROC, 80, 970, 200, 60)
    
    b.vertex("submit_btn", "Menekan Tombol Kirim Dokumen", S_PROC, 80, 1060, 200, 60)
    b.vertex("submit_doc", "Mengirimkan Berkas Dokumen", S_PROC, 340, 1060, 200, 60)
    b.vertex("save", "Menyimpan Berkas & Generate Versi Otomatis", S_PROC, 600, 1150, 200, 60)
    b.vertex("db_confirm", "Mengembalikan Konfirmasi Berkas Tersimpan", S_PROC, 600, 1230, 200, 60)
    b.vertex("email", "Mengirim Email Notifikasi Otomatis ke Dosen", S_PROC, 340, 1230, 200, 60)
    b.vertex("end", "", S_END_ACT, 425, 1310, 30, 30)
    
    b.edge("e1", "start", "menu", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e2", "menu", "show_list", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e3", "show_list", "click_new", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e4", "click_new", "submit_check", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e5", "submit_check", "check_pending", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e6", "check_pending", "is_pending", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e7", "is_pending", "err_pending", "Ya", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e8", "err_pending", "menu", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e9", "is_pending", "check_revisi", "Tidak", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e10", "check_revisi", "is_revisi", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e11", "is_revisi", "pilih_penguji", "Ya", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e12", "pilih_penguji", "upload_revisi", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e13", "upload_revisi", "submit_btn", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e14", "is_revisi", "pilih_dospem", "Tidak", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e15", "pilih_dospem", "upload_bim", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e16", "upload_bim", "submit_btn", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e17", "submit_btn", "submit_doc", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e18", "submit_doc", "save", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e19", "save", "db_confirm", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e20", "db_confirm", "email", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e21", "email", "end", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.save("Gambar 4.7 - Activity Diagram Pengajuan Bimbingan.drawio")

# Gambar 4.8: Activity Diagram Dosen Review Bimbingan
def build_activity_dosen_review():
    b = DrawioBuilder("Activity Diagram Dosen Review", 900, 1400)
    b.title("Gambar 4.8: Activity Diagram Dosen Review Bimbingan / Revisi")
    b.swimlanes3("Dosen", "Sistem", "Basis Data", 1400)
    
    b.vertex("start", "", S_START_ACT, 165, 80, 30, 30)
    b.vertex("menu", "Mengakses Menu Review Bimbingan", S_PROC, 80, 140, 200, 60)
    b.vertex("show_list", "Menampilkan Daftar Dokumen Masuk", S_PROC, 340, 140, 200, 60)
    b.vertex("select_doc", "Memilih Dokumen Mahasiswa Menunggu Review", S_PROC, 80, 230, 200, 60)
    b.vertex("load_doc", "Memuat Berkas PDF (Mode Baca) & Form Evaluasi", S_PROC, 340, 230, 200, 60)
    b.vertex("fill_form", "Memasukkan Catatan Evaluasi & Memilih Status", S_PROC, 80, 320, 200, 60)
    b.vertex("submit_review", "Mengirimkan Hasil Review", S_PROC, 340, 320, 200, 60)
    
    b.vertex("check_status", "Memeriksa Status: Apakah ACC Sempro?", S_PROC, 600, 410, 200, 60)
    b.vertex("is_acc_sempro", "Status ACC Sempro?", S_DEC, 640, 500, 120, 80)
    
    b.vertex("check_min", "Menghitung Jumlah Sesi Bimbingan", S_PROC, 600, 610, 200, 60)
    b.vertex("is_min_ok", "Jumlah Sesi Bimbingan >= 5?", S_DEC, 640, 700, 120, 80)
    b.vertex("err_min", "Menampilkan Error Syarat Sesi Tidak Terpenuhi", S_PROC, 340, 710, 200, 60)
    
    b.vertex("save", "Menyimpan Catatan & Mengubah Status Dokumen", S_PROC, 600, 820, 200, 60)
    b.vertex("check_lanjut", "Status yang Dipilih Lanjut Bab?", S_DEC, 640, 920, 120, 80)
    b.vertex("auto_prog", "Pembaruan Progress Akademik Mahasiswa", S_PROC, 600, 1030, 200, 60)
    b.vertex("db_confirm", "Mengembalikan Konfirmasi Review Disimpan", S_PROC, 600, 1120, 200, 60)
    
    b.vertex("email", "Mengirim Email Notifikasi Otomatis Umpan Balik", S_PROC, 340, 1120, 200, 60)
    b.vertex("success", "Menampilkan Notifikasi Review Berhasil", S_PROC, 340, 1200, 200, 60)
    b.vertex("end", "", S_END_ACT, 425, 1300, 30, 30)
    
    b.edge("e1", "start", "menu", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e2", "menu", "show_list", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e3", "show_list", "select_doc", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e4", "select_doc", "load_doc", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e5", "load_doc", "fill_form", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e6", "fill_form", "submit_review", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e7", "submit_review", "check_status", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e8", "check_status", "is_acc_sempro", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e9", "is_acc_sempro", "check_min", "Ya", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e10", "check_min", "is_min_ok", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e11", "is_min_ok", "err_min", "Tidak", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e12", "err_min", "fill_form", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e13", "is_min_ok", "save", "Ya", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e14", "is_acc_sempro", "save", "Tidak", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e15", "save", "check_lanjut", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e16", "check_lanjut", "auto_prog", "Ya", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e17", "auto_prog", "db_confirm", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e18", "check_lanjut", "db_confirm", "Tidak", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e19", "db_confirm", "email", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e20", "email", "success", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e21", "success", "end", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.save("Gambar 4.8 - Activity Diagram Dosen Review Bimbingan.drawio")

# Gambar 4.9: Activity Diagram Diskusi Reply Komentar
def build_activity_diskusi_reply():
    b = DrawioBuilder("Activity Diagram Diskusi Reply", 900, 950)
    b.title("Gambar 4.9: Activity Diagram Diskusi / Reply Komentar Bimbingan")
    b.swimlanes3("Pengguna", "Sistem", "Basis Data", 950)
    
    b.vertex("start", "", S_START_ACT, 165, 100, 30, 30)
    b.vertex("select_thread", "Membuka Halaman Detail Riwayat Bimbingan", S_PROC, 80, 170, 200, 60)
    b.vertex("show_thread", "Menampilkan Thread Diskusi & Form Balasan", S_PROC, 340, 170, 200, 60)
    b.vertex("req_check", "Mengirimkan Permintaan Pengecekan Akses", S_PROC, 340, 260, 200, 60)
    
    b.vertex("check_involvement", "Memeriksa Keterlibatan Pengguna dalam Bimbingan", S_PROC, 600, 350, 200, 60)
    b.vertex("is_involved", "Pengguna Terlibat?", S_DEC, 640, 440, 120, 80)
    b.vertex("err_access", "Menolak Akses dan Menampilkan Pesan Kesalahan", S_PROC, 340, 450, 200, 60)
    
    b.vertex("input_msg", "Memasukkan Komentar Balasan & Tekan Kirim", S_PROC, 80, 560, 200, 60)
    b.vertex("submit_msg", "Mengirimkan Pesan Komentar", S_PROC, 340, 560, 200, 60)
    b.vertex("save_db", "Menyimpan Komentar Balasan ke Basis Data", S_PROC, 600, 650, 200, 60)
    b.vertex("db_confirm", "Mengembalikan Status Komentar Disimpan", S_PROC, 600, 740, 200, 60)
    b.vertex("update_ui", "Memperbarui Tampilan Thread Diskusi Komentar", S_PROC, 340, 740, 200, 60)
    b.vertex("end", "", S_END_ACT, 425, 850, 30, 30)
    
    b.edge("e1", "start", "select_thread", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e2", "select_thread", "show_thread", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e3", "show_thread", "req_check", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e4", "req_check", "check_involvement", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e5", "check_involvement", "is_involved", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e6", "is_involved", "err_access", "Tidak", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e7", "err_access", "end", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e8", "is_involved", "input_msg", "Ya", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e9", "input_msg", "submit_msg", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e10", "submit_msg", "save_db", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e11", "save_db", "db_confirm", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e12", "db_confirm", "update_ui", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e13", "update_ui", "end", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.save("Gambar 4.9 - Activity Diagram Diskusi Reply Komentar.drawio")

# Gambar 4.10: Activity Diagram Lihat Jadwal Sidang
def build_activity_lihat_jadwal():
    b = DrawioBuilder("Activity Diagram Lihat Jadwal", 900, 900)
    b.title("Gambar 4.10: Activity Diagram Lihat Jadwal Sidang")
    b.swimlanes3("Pengguna", "Sistem", "Basis Data", 900)
    
    b.vertex("start", "", S_START_ACT, 165, 100, 30, 30)
    b.vertex("select_menu", "Mengakses Menu Jadwal Sidang", S_PROC, 80, 170, 200, 60)
    b.vertex("req_filter", "Mengirimkan Permintaan Jadwal dengan Sesi User", S_PROC, 340, 170, 200, 60)
    
    b.vertex("check_role", "Mengidentifikasi Peran Aktif Pengguna", S_PROC, 600, 260, 200, 60)
    b.vertex("is_role", "Peran Pengguna?", S_DEC, 640, 350, 120, 80)
    
    b.vertex("role_admin", "Admin: Query Seluruh Jadwal Sidang", S_PROC, 600, 460, 200, 60)
    b.vertex("role_dosen", "Dosen: Query Jadwal (sebagai Penguji)", S_PROC, 600, 540, 200, 60)
    b.vertex("role_mhs", "Mahasiswa: Query Jadwal Milik Sendiri", S_PROC, 600, 620, 200, 60)
    b.vertex("db_results", "Mengembalikan Hasil Kueri Jadwal", S_PROC, 600, 710, 200, 60)
    
    b.vertex("show_list", "Menampilkan Daftar Jadwal Sidang dalam Tabel", S_PROC, 340, 710, 200, 60)
    b.vertex("end", "", S_END_ACT, 425, 810, 30, 30)
    
    b.edge("e1", "start", "select_menu", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e2", "select_menu", "req_filter", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e3", "req_filter", "check_role", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e4", "check_role", "is_role", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e5", "is_role", "role_admin", "Admin", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e6", "is_role", "role_dosen", "Dosen", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e7", "is_role", "role_mhs", "Mahasiswa", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e8", "role_admin", "db_results", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e9", "role_dosen", "db_results", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e10", "role_mhs", "db_results", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e11", "db_results", "show_list", exit_port=(0, 0.5), entry_port=(1, 0.5))
    b.edge("e12", "show_list", "end", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.save("Gambar 4.10 - Activity Diagram Lihat Jadwal Sidang.drawio")

# ==========================================
# 4. SEQUENCE DIAGRAMS (Gambar 4.11 - Gambar 4.18)
# ==========================================

# # Gambar 4.11: Sequence Diagram Autentikasi Pengguna (Login)
def build_sequence_login():
    b = DrawioBuilder("Sequence Diagram Login", 900, 700)
    b.lifeline_h = 550
    b.title("Gambar 4.11: Sequence Diagram Autentikasi Pengguna (Login)")
    
    b.seq_lifeline("l_user", "Pengguna", 100)
    b.seq_lifeline("l_view", "Halaman Login", 300)
    b.seq_lifeline("l_ctrl", "Sistem", 500)
    b.seq_lifeline("l_model", "Database", 700)
    
    b.seq_activation_bar("act_view", "l_view", 180, 450)
    b.seq_activation_bar("act_ctrl", "l_ctrl", 220, 410)
    b.seq_activation_bar("act_model", "l_model", 330, 370)
    
    b.seq_edge("m1", "l_user", "l_view", "1: Input NIM/NIP & Password", 180)
    b.seq_edge("m2", "l_view", "l_ctrl", "2: Kirim Kredensial Login", 220)
    b.seq_self_edge("m3", "l_ctrl", "3: Verifikasi Kredensial", 260, 290)
    b.seq_edge("m4", "l_ctrl", "l_model", "4: Cari Data Pengguna", 330)
    b.seq_edge("m5", "l_model", "l_ctrl", "5: Mengembalikan Data Pengguna", 370, True)
    b.seq_edge("m6", "l_ctrl", "l_view", "6: Kirim Token & Sesi Login", 410, True)
    b.seq_edge("m7", "l_view", "l_user", "7: Tampilkan Dashboard Utama", 450, True)
    
    b.save("Gambar 4.11 - Sequence Diagram Login.drawio")

# Gambar 4.12: Sequence Diagram Admin Kelola Data User
def build_sequence_kelola_user():
    b = DrawioBuilder("Sequence Diagram Kelola User", 900, 700)
    b.lifeline_h = 550
    b.title("Gambar 4.12: Sequence Diagram Admin Kelola Data User")
    
    b.seq_lifeline("l_admin", "Admin", 100)
    b.seq_lifeline("l_view", "Halaman User", 300)
    b.seq_lifeline("l_ctrl", "Sistem", 500)
    b.seq_lifeline("l_model", "Database", 700)
    
    b.seq_activation_bar("act_view", "l_view", 180, 450)
    b.seq_activation_bar("act_ctrl", "l_ctrl", 220, 410)
    b.seq_activation_bar("act_model", "l_model", 330, 370)
    
    b.seq_edge("m1", "l_admin", "l_view", "1: Input Data User Baru", 180)
    b.seq_edge("m2", "l_view", "l_ctrl", "2: Kirim Data User", 220)
    b.seq_self_edge("m3", "l_ctrl", "3: Validasi & Enkripsi Password", 260, 290)
    b.seq_edge("m4", "l_ctrl", "l_model", "4: Simpan Data User", 330)
    b.seq_edge("m5", "l_model", "l_ctrl", "5: Data Berhasil Disimpan", 370, True)
    b.seq_edge("m6", "l_ctrl", "l_view", "6: Kirim Konfirmasi Sukses", 410, True)
    b.seq_edge("m7", "l_view", "l_admin", "7: Tampilkan Pesan Sukses", 450, True)
    
    b.save("Gambar 4.12 - Sequence Diagram Admin Kelola Data User.drawio")

# Gambar 4.13: Sequence Diagram Admin Plotting Dosen Pembimbing
def build_sequence_plotting_dospem():
    b = DrawioBuilder("Sequence Diagram Plotting Dospem", 900, 700)
    b.lifeline_h = 550
    b.title("Gambar 4.13: Sequence Diagram Admin Plotting Dosen Pembimbing")
    
    b.seq_lifeline("l_admin", "Admin", 100)
    b.seq_lifeline("l_view", "Halaman Plotting", 300)
    b.seq_lifeline("l_ctrl", "Sistem", 500)
    b.seq_lifeline("l_model", "Database", 700)
    
    b.seq_activation_bar("act_view", "l_view", 180, 450)
    b.seq_activation_bar("act_ctrl", "l_ctrl", 220, 410)
    b.seq_activation_bar("act_model", "l_model", 330, 370)
    
    b.seq_edge("m1", "l_admin", "l_view", "1: Memilih Mahasiswa & Dosen Pembimbing", 180)
    b.seq_edge("m2", "l_view", "l_ctrl", "2: Kirim Data Plotting", 220)
    b.seq_self_edge("m3", "l_ctrl", "3: Validasi Kesamaan Dosen", 260, 290)
    b.seq_edge("m4", "l_ctrl", "l_model", "4: Simpan Data Plotting", 330)
    b.seq_edge("m5", "l_model", "l_ctrl", "5: Data Plotting Berhasil Disimpan", 370, True)
    b.seq_edge("m6", "l_ctrl", "l_view", "6: Kirim Konfirmasi Sukses", 410, True)
    b.seq_edge("m7", "l_view", "l_admin", "7: Tampilkan Pesan Sukses", 450, True)
    
    b.save("Gambar 4.13 - Sequence Diagram Admin Plotting Dosen Pembimbing.drawio")

# Gambar 4.14: Sequence Diagram Admin Kelola Jadwal Sidang
def build_sequence_kelola_jadwal():
    b = DrawioBuilder("Sequence Diagram Kelola Jadwal", 900, 700)
    b.lifeline_h = 550
    b.title("Gambar 4.14: Sequence Diagram Admin Kelola Jadwal Sidang")
    
    b.seq_lifeline("l_admin", "Admin", 100)
    b.seq_lifeline("l_view", "Halaman Jadwal", 300)
    b.seq_lifeline("l_ctrl", "Sistem", 500)
    b.seq_lifeline("l_model", "Database", 700)
    
    b.seq_activation_bar("act_view", "l_view", 180, 450)
    b.seq_activation_bar("act_ctrl", "l_ctrl", 220, 410)
    b.seq_activation_bar("act_model", "l_model", 330, 370)
    
    b.seq_edge("m1", "l_admin", "l_view", "1: Input Data Jadwal Baru", 180)
    b.seq_edge("m2", "l_view", "l_ctrl", "2: Kirim Data Jadwal", 220)
    b.seq_self_edge("m3", "l_ctrl", "3: Validasi Konflik Ruang & Waktu", 260, 290)
    b.seq_edge("m4", "l_ctrl", "l_model", "4: Simpan Data Jadwal", 330)
    b.seq_edge("m5", "l_model", "l_ctrl", "5: Data Jadwal Berhasil Disimpan", 370, True)
    b.seq_edge("m6", "l_ctrl", "l_view", "6: Kirim Konfirmasi Sukses", 410, True)
    b.seq_edge("m7", "l_view", "l_admin", "7: Tampilkan Pesan Sukses", 450, True)
    
    b.save("Gambar 4.14 - Sequence Diagram Admin Kelola Jadwal Sidang.drawio")

# Gambar 4.15: Sequence Diagram Mahasiswa Upload Bimbingan
def build_sequence_upload():
    b = DrawioBuilder("Sequence Diagram Upload Bimbingan", 900, 700)
    b.lifeline_h = 550
    b.title("Gambar 4.15: Sequence Diagram Mahasiswa Upload Bimbingan / Revisi")
    
    b.seq_lifeline("l_mhs", "Mahasiswa", 100)
    b.seq_lifeline("l_view", "Halaman Bimbingan", 300)
    b.seq_lifeline("l_ctrl", "Sistem", 500)
    b.seq_lifeline("l_model", "Database", 700)
    
    b.seq_activation_bar("act_view", "l_view", 180, 450)
    b.seq_activation_bar("act_ctrl", "l_ctrl", 220, 410)
    b.seq_activation_bar("act_model", "l_model", 330, 370)
    
    b.seq_edge("m1", "l_mhs", "l_view", "1: Upload Dokumen PDF Bimbingan", 180)
    b.seq_edge("m2", "l_view", "l_ctrl", "2: Kirim File PDF & Detail", 220)
    b.seq_self_edge("m3", "l_ctrl", "3: Validasi Format & Cek Antrean", 260, 290)
    b.seq_edge("m4", "l_ctrl", "l_model", "4: Simpan Berkas Bimbingan", 330)
    b.seq_edge("m5", "l_model", "l_ctrl", "5: Berkas Berhasil Disimpan", 370, True)
    b.seq_edge("m6", "l_ctrl", "l_view", "6: Kirim Konfirmasi Sukses", 410, True)
    b.seq_edge("m7", "l_view", "l_mhs", "7: Tampilkan Pesan Sukses", 450, True)
    
    b.save("Gambar 4.15 - Sequence Diagram Mahasiswa Upload Bimbingan.drawio")

# Gambar 4.16: Sequence Diagram Dosen Review Bimbingan
def build_sequence_review():
    b = DrawioBuilder("Sequence Diagram Dosen Review", 900, 700)
    b.lifeline_h = 550
    b.title("Gambar 4.16: Sequence Diagram Dosen Review Bimbingan / Revisi")
    
    b.seq_lifeline("l_dosen", "Dosen", 100)
    b.seq_lifeline("l_view", "Halaman Review", 300)
    b.seq_lifeline("l_ctrl", "Sistem", 500)
    b.seq_lifeline("l_model", "Database", 700)
    
    b.seq_activation_bar("act_view", "l_view", 180, 450)
    b.seq_activation_bar("act_ctrl", "l_ctrl", 220, 410)
    b.seq_activation_bar("act_model", "l_model", 330, 370)
    
    b.seq_edge("m1", "l_dosen", "l_view", "1: Input Catatan Review & Status", 180)
    b.seq_edge("m2", "l_view", "l_ctrl", "2: Kirim Data Review", 220)
    b.seq_self_edge("m3", "l_ctrl", "3: Validasi Syarat Minimal Bimbingan", 260, 290)
    b.seq_edge("m4", "l_ctrl", "l_model", "4: Simpan Umpan Balik & Status", 330)
    b.seq_edge("m5", "l_model", "l_ctrl", "5: Hasil Review Berhasil Disimpan", 370, True)
    b.seq_edge("m6", "l_ctrl", "l_view", "6: Kirim Konfirmasi Sukses", 410, True)
    b.seq_edge("m7", "l_view", "l_dosen", "7: Tampilkan Pesan Sukses", 450, True)
    
    b.save("Gambar 4.16 - Sequence Diagram Dosen Review Bimbingan.drawio")

# Gambar 4.17: Sequence Diagram Diskusi Reply Komentar
def build_sequence_diskusi_reply():
    b = DrawioBuilder("Sequence Diagram Diskusi Reply", 900, 700)
    b.lifeline_h = 550
    b.title("Gambar 4.17: Sequence Diagram Diskusi / Reply Komentar Bimbingan")
    
    b.seq_lifeline("l_user", "Pengguna", 100)
    b.seq_lifeline("l_view", "Halaman Detail Bimbingan", 300)
    b.seq_lifeline("l_ctrl", "Sistem", 500)
    b.seq_lifeline("l_model", "Database", 700)
    
    b.seq_activation_bar("act_view", "l_view", 180, 450)
    b.seq_activation_bar("act_ctrl", "l_ctrl", 220, 410)
    b.seq_activation_bar("act_model", "l_model", 330, 370)
    
    b.seq_edge("m1", "l_user", "l_view", "1: Input Komentar Balasan Baru", 180)
    b.seq_edge("m2", "l_view", "l_ctrl", "2: Kirim Komentar Balasan", 220)
    b.seq_self_edge("m3", "l_ctrl", "3: Validasi Akses Pengguna", 260, 290)
    b.seq_edge("m4", "l_ctrl", "l_model", "4: Simpan Komentar Balasan", 330)
    b.seq_edge("m5", "l_model", "l_ctrl", "5: Komentar Berhasil Disimpan", 370, True)
    b.seq_edge("m6", "l_ctrl", "l_view", "6: Kirim Konfirmasi Sukses", 410, True)
    b.seq_edge("m7", "l_view", "l_user", "7: Tampilkan Balasan di Halaman", 450, True)
    
    b.save("Gambar 4.17 - Sequence Diagram Diskusi Reply Komentar.drawio")

# Gambar 4.18: Sequence Diagram Lihat Jadwal Sidang
def build_sequence_lihat_jadwal():
    b = DrawioBuilder("Sequence Diagram Lihat Jadwal", 900, 700)
    b.lifeline_h = 550
    b.title("Gambar 4.18: Sequence Diagram Lihat Jadwal Sidang")
    
    b.seq_lifeline("l_user", "Pengguna", 100)
    b.seq_lifeline("l_view", "Halaman Jadwal", 300)
    b.seq_lifeline("l_ctrl", "Sistem", 500)
    b.seq_lifeline("l_model", "Database", 700)
    
    b.seq_activation_bar("act_view", "l_view", 180, 450)
    b.seq_activation_bar("act_ctrl", "l_ctrl", 220, 410)
    b.seq_activation_bar("act_model", "l_model", 330, 370)
    
    b.seq_edge("m1", "l_user", "l_view", "1: Memilih Menu Jadwal Sidang", 180)
    b.seq_edge("m2", "l_view", "l_ctrl", "2: Minta Data Jadwal Sidang", 220)
    b.seq_self_edge("m3", "l_ctrl", "3: Verifikasi Sesi Aktif", 260, 290)
    b.seq_edge("m4", "l_ctrl", "l_model", "4: Ambil Data Jadwal", 330)
    b.seq_edge("m5", "l_model", "l_ctrl", "5: Mengembalikan Data Jadwal", 370, True)
    b.seq_edge("m6", "l_ctrl", "l_view", "6: Kirim Data Jadwal Sidang", 410, True)
    b.seq_edge("m7", "l_view", "l_user", "7: Tampilkan Daftar Jadwal Sidang", 450, True)
    
    b.save("Gambar 4.18 - Sequence Diagram Lihat Jadwal Sidang.drawio")

# ==========================================
# 5. FLOWCHARTS
# ==========================================
def build_flowchart_mahasiswa():
    b = DrawioBuilder("Flowchart Mahasiswa", 850, 1400)
    b.title("Flowchart Alur Kerja Utama Aktor Mahasiswa")
    b.vertex("start", "MULAI", S_START, 340, 60, 170, 45)
    b.vertex("login", "Memasukkan Nama Pengguna dan Kata Sandi", S_PROC, 300, 130, 250, 60)
    b.vertex("check_login", "Login Valid?", S_DEC, 335, 210, 180, 90)
    b.vertex("err_login", "Menampilkan Pesan Autentikasi Gagal", S_PROC, 560, 225, 200, 60)
    b.vertex("dashboard", "Mengakses Dashboard Mahasiswa & Memantau Progres", S_PROC, 300, 320, 250, 60)
    b.vertex("menu_bim", "Membuka Menu Bimbingan & Memilih Dosen Pembimbing", S_PROC, 285, 400, 280, 65)
    b.vertex("dospem_tab", "Menampilkan Riwayat Bimbingan Sesuai Dosen Pembimbing", S_PROC, 285, 490, 280, 65)
    b.vertex("check_pending", "Ada Bimbingan Berstatus Menunggu Review?", S_DEC, 315, 580, 220, 105)
    b.vertex("form_disabled", "Menampilkan Status Menunggu Review / Riwayat Saja", S_PROC, 560, 600, 220, 65)
    b.vertex("check_revisi", "Apakah Mahasiswa dalam Fase Revisi Ujian?", S_DEC, 335, 710, 180, 90)
    b.vertex("path_revisi", "Memilih Dosen Penguji &\nMengunggah Dokumen Revisi (PDF)", S_PROC, 100, 820, 220, 60)
    b.vertex("path_normal", "Memilih Dosen Pembimbing &\nMengunggah Dokumen Bimbingan (PDF)", S_PROC, 530, 820, 220, 60)
    b.vertex("save_bim", "Menyimpan Dokumen Bimbingan & Membuat Versi Otomatis", S_PROC, 285, 920, 280, 65)
    b.vertex("email_notif", "Mengirimkan Notifikasi Email ke Dosen Terkait", S_PROC, 285, 1010, 280, 60)
    b.vertex("success_upload", "Menampilkan Notifikasi Sukses Unggah Dokumen", S_PROC, 285, 1100, 280, 65)
    b.vertex("view_jadwal", "Mengakses Menu Jadwal Sidang (Melihat Detail Jadwal)", S_PROC, 300, 1190, 250, 60)
    b.vertex("end", "SELESAI", S_START, 340, 1280, 170, 45)
    
    b.edge("e1", "start", "login", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e2", "login", "check_login", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e3", "check_login", "err_login", "Tidak", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e4", "err_login", "login", exit_port=(0.5, 0), entry_port=(1, 0.5))
    b.edge("e5", "check_login", "dashboard", "Ya", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e6", "dashboard", "menu_bim", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e7", "menu_bim", "dospem_tab", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e8", "dospem_tab", "check_pending", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e9", "check_pending", "form_disabled", "Ya", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e10", "form_disabled", "view_jadwal", exit_port=(0.5, 1), entry_port=(1, 0.5))
    b.edge("e11", "check_pending", "check_revisi", "Tidak", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e12", "check_revisi", "path_revisi", "Ya", exit_port=(0, 0.5), entry_port=(0.5, 0))
    b.edge("e13", "check_revisi", "path_normal", "Tidak", exit_port=(1, 0.5), entry_port=(0.5, 0))
    b.edge("e14", "path_revisi", "save_bim", exit_port=(0.5, 1), entry_port=(0, 0.5))
    b.edge("e15", "path_normal", "save_bim", exit_port=(0.5, 1), entry_port=(1, 0.5))
    b.edge("e16", "save_bim", "email_notif", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e17", "email_notif", "success_upload", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e18", "success_upload", "view_jadwal", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e19", "view_jadwal", "end", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.save("Flowchart Alur Kerja Mahasiswa.drawio")

def build_flowchart_dosen():
    b = DrawioBuilder("Flowchart Dosen", 850, 1700)
    b.title("Flowchart Alur Kerja Utama Aktor Dosen")
    b.vertex("start", "MULAI", S_START, 340, 60, 170, 45)
    b.vertex("login", "Memasukkan Nama Pengguna dan Kata Sandi", S_PROC, 300, 130, 250, 60)
    b.vertex("check_login", "Login Valid?", S_DEC, 335, 210, 180, 90)
    b.vertex("err_login", "Menampilkan Pesan Autentikasi Gagal", S_PROC, 560, 225, 200, 60)
    b.vertex("dashboard", "Mengakses Dashboard Dosen & Memantau Ringkasan Bimbingan", S_PROC, 285, 320, 280, 65)
    b.vertex("list_mhs", "Membuka Daftar Mahasiswa Bimbingan", S_PROC, 285, 410, 280, 60)
    b.vertex("select_mhs", "Memilih Mahasiswa dan Membuka Detail Riwayat Bimbingan", S_PROC, 285, 500, 280, 65)
    b.vertex("check_status", "Data Bimbingan Ditemukan?", S_DEC, 315, 595, 220, 105)
    b.vertex("data_err", "Menampilkan Pesan Bimbingan Tidak Ditemukan", S_PROC, 560, 615, 220, 65)
    b.vertex("read_only", "Membuka Berkas PDF Bimbingan (Mode Lihat Saja)", S_PROC, 285, 735, 280, 65)
    b.vertex("check_wait", "Status Dokumen Menunggu Review?", S_DEC, 315, 830, 220, 105)
    b.vertex("reviewed", "Menampilkan Catatan Evaluasi Lama / Riwayat", S_PROC, 560, 850, 220, 65)
    b.vertex("fill_feedback", "Memasukkan Catatan Evaluasi, Memilih Status & Unggah PDF Opsional", S_PROC, 285, 965, 280, 70)
    b.vertex("check_valid", "Catatan Evaluasi & Status Valid?", S_DEC, 335, 1065, 180, 95)
    b.vertex("valid_err", "Menampilkan Pesan Kesalahan Validasi", S_PROC, 560, 1080, 220, 60)
    b.vertex("check_sempro", "Status yang Dipilih = Persetujuan Sempro?", S_DEC, 315, 1180, 220, 105)
    b.vertex("min_err", "Menampilkan Pesan Kesalahan Syarat Minimal Bimbingan Belum Terpenuhi", S_PROC, 560, 1200, 230, 70)
    b.vertex("save", "Menyimpan Hasil Review & Memperbarui Progres (jika Lanjut Bab)", S_PROC, 285, 1315, 280, 70)
    b.vertex("email_notif", "Mengirimkan Notifikasi Email Umpan Balik ke Mahasiswa", S_PROC, 285, 1420, 280, 60)
    b.vertex("end", "SELESAI", S_START, 340, 1510, 170, 45)
    
    b.edge("e1", "start", "login", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e2", "login", "check_login", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e3", "check_login", "err_login", "Tidak", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e4", "err_login", "login", exit_port=(0.5, 0), entry_port=(1, 0.5))
    b.edge("e5", "check_login", "dashboard", "Ya", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e6", "dashboard", "list_mhs", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e7", "list_mhs", "select_mhs", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e8", "select_mhs", "check_status", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e9", "check_status", "data_err", "Tidak", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e10", "data_err", "end", exit_port=(0.5, 1), entry_port=(1, 0.5))
    b.edge("e11", "check_status", "read_only", "Ya", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e12", "read_only", "check_wait", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e13", "check_wait", "reviewed", "Tidak", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e14", "reviewed", "end", exit_port=(0.5, 1), entry_port=(1, 0.5))
    b.edge("e15", "check_wait", "fill_feedback", "Ya", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e16", "fill_feedback", "check_valid", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e17", "check_valid", "valid_err", "Tidak", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e18", "valid_err", "fill_feedback", exit_port=(0.5, 0), entry_port=(1, 0.5))
    b.edge("e19", "check_valid", "check_sempro", "Ya", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e20", "check_sempro", "min_err", "Ya", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e21", "min_err", "fill_feedback", exit_port=(0.5, 0), entry_port=(1, 0.5))
    b.edge("e22", "check_sempro", "save", "Tidak", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e23", "save", "email_notif", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e24", "email_notif", "end", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.save("Flowchart Alur Kerja Dosen.drawio")

def build_flowchart_admin():
    b = DrawioBuilder("Flowchart Admin", 850, 1400)
    b.title("Flowchart Alur Kerja Utama Aktor Admin")
    b.vertex("start", "MULAI", S_START, 340, 60, 170, 45)
    b.vertex("login", "Memasukkan Nama Pengguna dan Kata Sandi", S_PROC, 300, 130, 250, 60)
    b.vertex("check_login", "Login Valid?", S_DEC, 335, 210, 180, 90)
    b.vertex("err_login", "Menampilkan Pesan Autentikasi Gagal", S_PROC, 560, 225, 200, 60)
    b.vertex("dashboard", "Mengakses Dashboard Admin & Memantau Ringkasan Data SIMTA", S_PROC, 285, 320, 280, 65)
    b.vertex("choose_module", "Memilih Menu Modul Pengelolaan?", S_DEC, 335, 400, 180, 90)
    
    b.vertex("path_users", "Mengakses Modul Manajemen Pengguna", S_PROC, 100, 500, 220, 60)
    b.vertex("select_action_user", "Memilih Aksi Pengelolaan Pengguna?", S_DEC, 120, 580, 180, 90)
    b.vertex("add_edit_user", "Menambah / Memperbarui Akun Pengguna", S_PROC, 10, 690, 180, 60)
    b.vertex("disable_user", "Menonaktifkan Akun Pengguna (Soft Delete)", S_PROC, 210, 690, 180, 60)
    b.vertex("assign_dospem", "Menentukan Dosen Pembimbing 1 & Dosen Pembimbing 2", S_PROC, 100, 770, 200, 60)
    b.vertex("check_dup_dospem", "Dosen Pembimbing 1 Sama dengan Dospem 2?", S_DEC, 110, 850, 180, 90)
    b.vertex("err_dup_dospem", "Menampilkan Pesan Kesalahan Duplikasi Dosen", S_PROC, 10, 960, 180, 60)
    b.vertex("save_user_data", "Menyimpan Data Pengguna & Melakukan Enkripsi Kata Sandi", S_PROC, 100, 1060, 200, 60)
    
    b.vertex("path_jadwal", "Mengakses Modul Kelola Jadwal Sidang", S_PROC, 530, 500, 220, 60)
    b.vertex("select_action_jadwal", "Memilih Aksi Pengelolaan Jadwal?", S_DEC, 550, 580, 180, 90)
    b.vertex("create_jadwal", "Memasukkan Jadwal Sidang Baru", S_PROC, 440, 690, 180, 60)
    b.vertex("edit_cancel_jadwal", "Memperbarui / Membatalkan Jadwal Sidang", S_PROC, 640, 690, 180, 60)
    b.vertex("check_conflict", "Ruangan Bentrok atau Penguji Merangkap Dospem?", S_DEC, 440, 770, 180, 100)
    b.vertex("err_conflict", "Menampilkan Pesan Kesalahan Validasi Bentrok/Peran", S_PROC, 640, 790, 180, 60)
    b.vertex("save_jadwal", "Menyimpan Jadwal Sidang ke Basis Data", S_PROC, 430, 890, 200, 70)
    b.vertex("sync_penguji", "Sinkronisasi Data Dosen Penguji ke Record Mahasiswa", S_PROC, 430, 980, 200, 60)
    b.vertex("send_email_jadwal", "Mengirimkan Notifikasi Email Jadwal ke Mahasiswa & Penguji", S_PROC, 430, 1060, 200, 60)
    
    b.vertex("end", "SELESAI", S_START, 340, 1170, 170, 45)
    
    b.edge("e1", "start", "login", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e2", "login", "check_login", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e3", "check_login", "err_login", "Tidak", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e4", "err_login", "login", exit_port=(0.5, 0), entry_port=(1, 0.5))
    b.edge("e5", "check_login", "dashboard", "Ya", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e6", "dashboard", "choose_module", exit_port=(0.5, 1), entry_port=(0.5, 0))
    
    # Path Users
    b.edge("e7", "choose_module", "path_users", "Manajemen User", exit_port=(0, 0.5), entry_port=(0.5, 0))
    b.edge("e8", "path_users", "select_action_user", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e9", "select_action_user", "add_edit_user", "Tambah/Edit", exit_port=(0, 0.5), entry_port=(0.5, 0))
    b.edge("e10", "select_action_user", "disable_user", "Nonaktifkan", exit_port=(1, 0.5), entry_port=(0.5, 0))
    b.edge("e11", "select_action_user", "assign_dospem", "Assign Dospem", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e12", "add_edit_user", "save_user_data", exit_port=(0.5, 1), entry_port=(0, 0.5))
    b.edge("e13", "disable_user", "save_user_data", exit_port=(0.5, 1), entry_port=(1, 0.5))
    b.edge("e14", "assign_dospem", "check_dup_dospem", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e15", "check_dup_dospem", "err_dup_dospem", "Ya", exit_port=(0, 0.5), entry_port=(0.5, 0))
    b.edge("e16", "err_dup_dospem", "assign_dospem", exit_port=(0.5, 0), entry_port=(0, 0.5))
    b.edge("e17", "check_dup_dospem", "save_user_data", "Tidak", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e18", "save_user_data", "end", exit_port=(0.5, 1), entry_port=(0, 0.5))
    
    # Path Jadwal
    b.edge("e19", "choose_module", "path_jadwal", "Kelola Jadwal", exit_port=(1, 0.5), entry_port=(0.5, 0))
    b.edge("e20", "path_jadwal", "select_action_jadwal", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e21", "select_action_jadwal", "create_jadwal", "Buat Baru", exit_port=(0, 0.5), entry_port=(0.5, 0))
    b.edge("e22", "select_action_jadwal", "edit_cancel_jadwal", "Edit/Cancel", exit_port=(1, 0.5), entry_port=(0.5, 0))
    b.edge("e23", "create_jadwal", "check_conflict", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e24", "check_conflict", "err_conflict", "Ya", exit_port=(1, 0.5), entry_port=(0, 0.5))
    b.edge("e25", "err_conflict", "create_jadwal", exit_port=(0.5, 0), entry_port=(1, 0.5))
    b.edge("e26", "check_conflict", "save_jadwal", "Tidak", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e27", "edit_cancel_jadwal", "save_jadwal", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e28", "save_jadwal", "sync_penguji", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e29", "sync_penguji", "send_email_jadwal", exit_port=(0.5, 1), entry_port=(0.5, 0))
    b.edge("e30", "send_email_jadwal", "end", exit_port=(0.5, 1), entry_port=(1, 0.5))
    b.save("Flowchart Alur Kerja Admin.drawio")

# ==========================================
# MAIN EXECUTION
# ==========================================
if __name__ == '__main__':
    # 1. UseCase & Class Diagram
    build_usecase()
    build_class_diagram()
    
    # 2. 8 Activity Diagrams
    build_activity_login()
    build_activity_kelola_user()
    build_activity_plotting_dospem()
    build_activity_kelola_jadwal()
    build_activity_pengajuan()
    build_activity_dosen_review()
    build_activity_diskusi_reply()
    build_activity_lihat_jadwal()
    
    # 3. 8 Sequence Diagrams
    build_sequence_login()
    build_sequence_kelola_user()
    build_sequence_plotting_dospem()
    build_sequence_kelola_jadwal()
    build_sequence_upload()
    build_sequence_review()
    build_sequence_diskusi_reply()
    build_sequence_lihat_jadwal()
    
    # 4. 3 Flowcharts
    build_flowchart_mahasiswa()
    build_flowchart_dosen()
    build_flowchart_admin()
    
    print("All 19 Drawio files with 'Gambar 4.x - [Nama Diagram]' structure generated successfully!")
