#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build script to compile Suy Tuong (Meditations) markdown content into book_data.js
This script runs in READ-ONLY mode on the source files and outputs only into the web_reader folder.
"""

import os
import re
import json
import math

WEB_DIR = os.path.dirname(os.path.abspath(__file__))
SOURCE_DIR = os.path.abspath(os.path.join(WEB_DIR, ".."))

CHAPTER_ORDER = [
    {
        "id": "readme",
        "file": "README.md",
        "title": "Hướng Dẫn & Thứ Tự Đọc",
        "shortTitle": "Hướng Dẫn Đọc",
        "group": "Khởi Đầu & Tổng Quan",
        "badge": "Mục Lục",
        "icon": "🧭"
    },
    {
        "id": "phan-1",
        "file": "00_PHAN-1_Xac-minh-sach.md",
        "title": "Phần I — Xác Minh & Đọc Hiểu Cuốn Sách",
        "shortTitle": "Phần I: Xác Minh Sách",
        "group": "Khởi Đầu & Tổng Quan",
        "badge": "Tổng Quan",
        "icon": "📜"
    },
    {
        "id": "phan-2",
        "file": "01_PHAN-2_Linh-hon-tu-tuong.md",
        "title": "Phần II — Khám Phá Linh Hồn & Tư Tưởng",
        "shortTitle": "Phần II: Linh Hồn Tư Tưởng",
        "group": "Khởi Đầu & Tổng Quan",
        "badge": "Cốt Lõi",
        "icon": "🔥"
    },
    {
        "id": "phan-3",
        "file": "02_PHAN-3_Ban-do-tri-thuc.md",
        "title": "Phần III — Bản Đồ Tinh Hoa Toàn Cuốn Sách",
        "shortTitle": "Phần III: Bản Đồ Tri Thức",
        "group": "Khởi Đầu & Tổng Quan",
        "badge": "Bản Đồ",
        "icon": "🗺️"
    },
    {
        "id": "book-intro",
        "file": os.path.join("PHAN-4_Giai-phau-tung-chuong", "00_Introduction.md"),
        "title": "Phần IV: Giới Thiệu Của Gregory Hays",
        "shortTitle": "Introduction (Hays)",
        "group": "Phần IV — Giải Phẫu 12 Cuốn Sách",
        "badge": "Bối Cảnh",
        "icon": "🏛️"
    },
    {
        "id": "book-1",
        "file": os.path.join("PHAN-4_Giai-phau-tung-chuong", "01_Book-1_On-nghi-bai-hoc.md"),
        "title": "Book 1 — Debts and Lessons (Ơn Nghĩa & Bài Học)",
        "shortTitle": "Book 1: Ơn Nghĩa",
        "group": "Phần IV — Giải Phẫu 12 Cuốn Sách",
        "badge": "Book 1",
        "bookNum": 1,
        "icon": "🌱"
    },
    {
        "id": "book-2",
        "file": os.path.join("PHAN-4_Giai-phau-tung-chuong", "02_Book-2_Tren-song-Gran.md"),
        "title": "Book 2 — Trên Sông Gran, Giữa Người Quadi",
        "shortTitle": "Book 2: Sông Gran",
        "group": "Phần IV — Giải Phẫu 12 Cuốn Sách",
        "badge": "Book 2",
        "bookNum": 2,
        "icon": "🌊"
    },
    {
        "id": "book-3",
        "file": os.path.join("PHAN-4_Giai-phau-tung-chuong", "03_Book-3_Tai-Carnuntum.md"),
        "title": "Book 3 — Tại Carnuntum",
        "shortTitle": "Book 3: Carnuntum",
        "group": "Phần IV — Giải Phẫu 12 Cuốn Sách",
        "badge": "Book 3",
        "bookNum": 3,
        "icon": "⛺"
    },
    {
        "id": "book-4",
        "file": os.path.join("PHAN-4_Giai-phau-tung-chuong", "04_Book-4.md"),
        "title": "Book 4 — Nơi Ẩn Náu Tâm Hồn & Dòng Chảy Vĩnh Hằng",
        "shortTitle": "Book 4: Nơi Ẩn Náu",
        "group": "Phần IV — Giải Phẫu 12 Cuốn Sách",
        "badge": "Book 4",
        "bookNum": 4,
        "icon": "🛡️"
    },
    {
        "id": "book-5",
        "file": os.path.join("PHAN-4_Giai-phau-tung-chuong", "05_Book-5.md"),
        "title": "Book 5 — Thức Dậy Buổi Sáng & Chướng Ngại Vật",
        "shortTitle": "Book 5: Chướng Ngại",
        "group": "Phần IV — Giải Phẫu 12 Cuốn Sách",
        "badge": "Book 5",
        "bookNum": 5,
        "icon": "☀️"
    },
    {
        "id": "book-6",
        "file": os.path.join("PHAN-4_Giai-phau-tung-chuong", "06_Book-6.md"),
        "title": "Book 6 — Phục Vụ Cộng Đồng & Giữ Vững Tâm Trí",
        "shortTitle": "Book 6: Phục Vụ",
        "group": "Phần IV — Giải Phẫu 12 Cuốn Sách",
        "badge": "Book 6",
        "bookNum": 6,
        "icon": "🤝"
    },
    {
        "id": "book-7",
        "file": os.path.join("PHAN-4_Giai-phau-tung-chuong", "07_Book-7.md"),
        "title": "Book 7 — Đối Diện Đau Đớn & Sự Tha Thứ",
        "shortTitle": "Book 7: Tha Thứ",
        "group": "Phần IV — Giải Phẫu 12 Cuốn Sách",
        "badge": "Book 7",
        "bookNum": 7,
        "icon": "⚖️"
    },
    {
        "id": "book-8",
        "file": os.path.join("PHAN-4_Giai-phau-tung-chuong", "08_Book-8.md"),
        "title": "Book 8 — Pháo Đài Bất Khả Xâm Phạm (8.47 & 8.48)",
        "shortTitle": "Book 8: Pháo Đài",
        "group": "Phần IV — Giải Phẫu 12 Cuốn Sách",
        "badge": "Book 8",
        "bookNum": 8,
        "icon": "🏰"
    },
    {
        "id": "book-9",
        "file": os.path.join("PHAN-4_Giai-phau-tung-chuong", "09_Book-9.md"),
        "title": "Book 9 — Công Lý, Chân Lý & Ba Kỷ Luật",
        "shortTitle": "Book 9: Ba Kỷ Luật",
        "group": "Phần IV — Giải Phẫu 12 Cuốn Sách",
        "badge": "Book 9",
        "bookNum": 9,
        "icon": "🌿"
    },
    {
        "id": "book-10",
        "file": os.path.join("PHAN-4_Giai-phau-tung-chuong", "10_Book-10.md"),
        "title": "Book 10 — Hãy Là Người Tốt Thay Vì Nói Về Nó",
        "shortTitle": "Book 10: Người Tốt",
        "group": "Phần IV — Giải Phẫu 12 Cuốn Sách",
        "badge": "Book 10",
        "bookNum": 10,
        "icon": "✨"
    },
    {
        "id": "book-11",
        "file": os.path.join("PHAN-4_Giai-phau-tung-chuong", "11_Book-11.md"),
        "title": "Book 11 — Chín Nàng Thơ Khoan Dung (11.18)",
        "shortTitle": "Book 11: 9 Khoan Dung",
        "group": "Phần IV — Giải Phẫu 12 Cuốn Sách",
        "badge": "Book 11",
        "bookNum": 11,
        "icon": "🕊️"
    },
    {
        "id": "book-12",
        "file": os.path.join("PHAN-4_Giai-phau-tung-chuong", "12_Book-12.md"),
        "title": "Book 12 — Ra Đi Với Ân Huệ Trọn Vẹn",
        "shortTitle": "Book 12: Lời Tạm Biệt",
        "group": "Phần IV — Giải Phẫu 12 Cuốn Sách",
        "badge": "Book 12",
        "bookNum": 12,
        "icon": "🌅"
    },
    {
        "id": "phan-5",
        "file": "03_PHAN-5_Tinh-hoa-Pareto.md",
        "title": "Phần V — 20% Tinh Hoa Pareto Stoic",
        "shortTitle": "Phần V: Tinh Hoa Pareto",
        "group": "Tinh Hoa & Nguyên Lý",
        "badge": "Pareto 80/20",
        "icon": "💎"
    },
    {
        "id": "phan-6",
        "file": "04_PHAN-6_Nguyen-ly-mo-hinh.md",
        "title": "Phần VI — 13 Nguyên Lý & Mô Hình Tư Duy",
        "shortTitle": "Phần VI: 13 Nguyên Lý",
        "group": "Tinh Hoa & Nguyên Lý",
        "badge": "Nguyên Lý",
        "icon": "⚙️"
    },
    {
        "id": "phan-7",
        "file": "05_PHAN-7_Phan-tich-phan-bien.md",
        "title": "Phần VII — Phân Tích Phản Biện & Giới Hạn",
        "shortTitle": "Phần VII: Phản Biện",
        "group": "Tinh Hoa & Nguyên Lý",
        "badge": "Phản Biện",
        "icon": "🔍"
    },
    {
        "id": "phan-8",
        "file": "06_PHAN-8_Nhung-dieu-dang-nho.md",
        "title": "Phần VIII — Điều Đáng Nhớ Nhất & 40 Flashcard",
        "shortTitle": "Phần VIII: 40 Flashcard",
        "group": "Thực Hành & Ôn Tập",
        "badge": "40 Thẻ",
        "icon": "🎴"
    },
    {
        "id": "phan-9",
        "file": "07_PHAN-9_Ke-hoach-thuc-hanh.md",
        "title": "Phần IX — Kế Hoạch Thực Hành 7 Ngày & 30 Ngày",
        "shortTitle": "Phần IX: Kế Hoạch",
        "group": "Thực Hành & Ôn Tập",
        "badge": "Hành Động",
        "icon": "📅"
    },
    {
        "id": "phan-10",
        "file": "08_PHAN-10_He-thong-ghi-nho.md",
        "title": "Phần X — Hệ Thống Học & Ghi Nhớ Sâu",
        "shortTitle": "Phần X: Ghi Nhớ Sâu",
        "group": "Thực Hành & Ôn Tập",
        "badge": "Mind Map",
        "icon": "🧠"
    },
    {
        "id": "phan-11",
        "file": "09_PHAN-11_Ket-tinh-toan-bo.md",
        "title": "Phần XI — Kết Tinh Toàn Bộ (Crystallization)",
        "shortTitle": "Phần XI: Kết Tinh",
        "group": "Thực Hành & Ôn Tập",
        "badge": "Test 5 Cấp",
        "icon": "🏆"
    },
    {
        "id": "phan-12",
        "file": "10_PHAN-12_Quy-tac-chat-luong.md",
        "title": "Phần XII — Quy Tắc Chất Lượng & Minh Bạch",
        "shortTitle": "Phần XII: Minh Bạch",
        "group": "Thực Hành & Ôn Tập",
        "badge": "Chuẩn Mực",
        "icon": "✅"
    }
]

def load_english_books():
    """Extract English text for Books 1-12 from suytuong_text.txt without altering file"""
    txt_path = os.path.join(SOURCE_DIR, "suytuong_text.txt")
    if not os.path.exists(txt_path):
        return {}
    
    with open(txt_path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read()

    book_spans = []
    for i in range(1, 13):
        pat = re.compile(rf'\n=== PAGE \d+ ===\s*\n\s*BOOK\s+{i}\b[^\n]*\n')
        m = pat.search(text)
        if m:
            book_spans.append((i, m.start()))

    english_books = {}
    for idx, (b_num, start_pos) in enumerate(book_spans):
        end_pos = book_spans[idx+1][1] if idx + 1 < len(book_spans) else text.find('=== PAGE 199 ===')
        raw_chunk = text[start_pos:end_pos].strip()
        # Clean up === PAGE XX === headers from raw chunk for pleasant reading
        cleaned = re.sub(r'=== PAGE \d+ ===\s*\n?', '', raw_chunk)
        # Restore PDF ligatures (fi, fl, ff, ffi, ffl) to fix broken font artifacts
        cleaned = fix_pdf_ligatures(cleaned)
        english_books[b_num] = cleaned.strip()

    return english_books

LIGATURE_MAP = {
    '\x00ame': 'flame', '\x00ared': 'flared', '\x00atter': 'flatter', '\x00attering': 'flattering',
    '\x00attery': 'flattery', '\x00awed': 'flawed', '\x00aws': 'flaws', '\x00ction': 'fiction',
    '\x00ed': 'fled', '\x00ee': 'flee', '\x00eeing': 'fleeing', '\x00eeting': 'fleeting',
    '\x00eetingly': 'fleetingly', '\x00eld': 'field', '\x00elding': 'fielding', '\x00elds': 'fields',
    '\x00esh': 'flesh', '\x00eshly': 'fleshly', '\x00exibility': 'flexibility', '\x00fteen': 'fifteen',
    '\x00fth': 'fifth', '\x00fties': 'fifties', '\x00fty': 'fifty', '\x00g': 'fig',
    '\x00ghter': 'fighter', '\x00ghters': 'fighters', '\x00ghting': 'fighting', '\x00gs': 'figs',
    '\x00gure': 'figure', '\x00gures': 'figures', '\x00ies': 'flies', '\x00ight': 'flight',
    '\x00ll': 'fill', '\x00lled': 'filled', '\x00lls': 'fills', '\x00lth': 'filth',
    '\x00nal': 'final', '\x00nally': 'finally', '\x00nanced': 'financed', '\x00nd': 'find',
    '\x00nding': 'finding', '\x00nds': 'finds', '\x00ne': 'fine', '\x00nger': 'finger',
    '\x00ngers': 'fingers', '\x00nish': 'finish', '\x00ock': 'flock', '\x00ocks': 'flocks',
    '\x00ood': 'flood', '\x00oor': 'floor', '\x00ourish': 'flourish', '\x00ourished': 'flourished',
    '\x00ow': 'flow', '\x00ower': 'flower', '\x00owing': 'flowing', '\x00ows': 'flows',
    '\x00re': 'fire', '\x00rewood': 'firewood', '\x00rm': 'firm', '\x00rst': 'first',
    '\x00sh': 'fish', '\x00shermen': 'fishermen', '\x00st': 'fist', '\x00t': 'fit',
    '\x00ts': 'fits', '\x00uent': 'fluent', '\x00uid': 'fluid', '\x00ung': 'flung',
    '\x00ux': 'flux', '\x00xed': 'fixed', 'A\x00ection': 'Affection', 'In\x00uences': 'Influences',
    'Indi\x00erence': 'Indifference', 'Na\x00si': 'Naffsi', 'Unidenti\x00ed': 'Unidentified',
    'Unmodi\x00ed': 'Unmodified', 'Unsel\x00sh': 'Unselfish', 'a\x00air': 'affair',
    'a\x00airs': 'affairs', 'a\x00ect': 'affect', 'a\x00ected': 'affected', 'a\x00ection': 'affection',
    'a\x00ectionate': 'affectionate', 'a\x00ectionately': 'affectionately', 'a\x00ects': 'affects',
    'arti\x00ce': 'artifice', 'arti\x00cial': 'artificial', 'bene\x00cence': 'beneficence',
    'bene\x00cial': 'beneficial', 'bene\x00t': 'benefit', 'bene\x00ts': 'benefits',
    'brie\x00y': 'briefly', 'bu\x00oon': 'buffoon', 'con\x00agration': 'conflagration',
    'con\x00agrations': 'conflagrations', 'con\x00dence': 'confidence', 'con\x00ict': 'conflict',
    'con\x00icts': 'conflicts', 'de\x00ance': 'defiance', 'de\x00ciencies': 'deficiencies',
    'de\x00ne': 'define', 'de\x00ned': 'defined', 'de\x00nes': 'defines', 'de\x00ning': 'defining',
    'de\x00nition': 'definition', 'di\x00cult': 'difficult', 'di\x00culty': 'difficulty',
    'di\x00er': 'differ', 'di\x00erence': 'difference', 'di\x00erences': 'differences',
    'di\x00erent': 'different', 'di\x00erentiate': 'differentiate', 'di\x00erently': 'differently',
    'di\x00ers': 'differs', 'di\x00used': 'diffused', 'di\x00usion': 'diffusion',
    'dissatis\x00ed': 'dissatisfied', 'e\x00ect': 'effect', 'e\x00ective': 'effective',
    'e\x00ects': 'effects', 'e\x00ort': 'effort', 'e\x00orts': 'efforts',
    'forti\x00cations': 'fortifications', 'ful\x00ll': 'fulfill', 'ful\x00lled': 'fulfilled',
    'ful\x00llment': 'fulfillment', 'ful\x00lls': 'fulfills', 'identi\x00cation': 'identification',
    'identi\x00ed': 'identified', 'in\x00icting': 'inflicting', 'in\x00nite': 'infinite',
    'in\x00nitum': 'infinitum', 'in\x00nity': 'infinity', 'in\x00uence': 'influence',
    'in\x00uenced': 'influenced', 'in\x00uences': 'influences', 'in\x00uential': 'influential',
    'in\x00ux': 'influx', 'indi\x00erence': 'indifference', 'indi\x00erent': 'indifferent',
    'indi\x00erently': 'indifferently', 'insigni\x00cant': 'insignificant',
    'insu\x00erable': 'insufferable', 'o\x00': 'off', 'o\x00ce': 'office',
    'o\x00ceholders': 'officeholders', 'o\x00cer': 'officer', 'o\x00cial': 'official',
    'o\x00ender': 'offender', 'o\x00ense': 'offense', 'o\x00enses': 'offenses',
    'o\x00er': 'offer', 'o\x00ered': 'offered', 'o\x00ering': 'offering', 'o\x00ers': 'offers',
    'o\x00hand': 'offhand', 'o\x00spring': 'offspring', 'pro\x00t': 'profit',
    'puri\x00ed': 'purified', 'quali\x00ed': 'qualified', 're\x00ect': 'reflect',
    're\x00ected': 'reflected', 're\x00ecting': 'reflecting', 're\x00ection': 'reflection',
    're\x00ects': 'reflects', 'sacri\x00ce': 'sacrifice', 'sacri\x00cial': 'sacrificial',
    'sacri\x00cing': 'sacrificing', 'satis\x00ed': 'satisfied', 'scienti\x00cally': 'scientifically',
    'sel\x00sh': 'selfish', 'sel\x00shness': 'selfishness', 'shell\x00sh': 'shellfish',
    'signi\x00cance': 'significance', 'signi\x00cant': 'significant', 'speci\x00c': 'specific',
    'speci\x00cally': 'specifically', 'su\x00cient': 'sufficient', 'su\x00er': 'suffer',
    'su\x00ered': 'suffered', 'su\x00ering': 'suffering', 'su\x00ers': 'suffers',
    'su\x00x': 'suffix', 'super\x00cial': 'superficial', 'terri\x00ed': 'terrified',
    'tra\x00c': 'traffic', 'una\x00ected': 'unaffected', 'unde\x00led': 'undefiled',
    'uni\x00es': 'unifies', 'unjusti\x00ed': 'unjustified', 'uno\x00cial': 'unofficial',
    'unpro\x00table': 'unprofitable', 'unsel\x00sh': 'unselfish', 'unsel\x00shly': 'unselfishly',
    'unsel\x00shness': 'unselfishness'
}

def fix_pdf_ligatures(text):
    for k, v in LIGATURE_MAP.items():
        text = text.replace(k, v)
        text = text.replace(k.capitalize(), v.capitalize())
    text = text.replace('\x00.', 'ff.').replace('\x00', '')
    return text

def parse_flashcards(text):
    cards = []
    current_group = "Khái niệm & Nền tảng"
    for line in text.splitlines():
        if line.startswith("### "):
            current_group = line.replace("### ", "").strip()
        m = re.match(r'^\s*-\s*\*\*Thẻ\s+(\d+):\*\*\s*\*H:\*\s*(.+?)(?:\s{2,})?$', line)
        if m:
            c_num = int(m.group(1))
            q = m.group(2).strip()
            cards.append({
                "num": c_num,
                "group": current_group,
                "question": q,
                "answer": ""
            })
        elif line.strip().startswith("*Đ:*") and cards:
            cards[-1]["answer"] = line.strip().replace("*Đ:*", "").strip()
    return cards

def extract_toc_headings(text):
    headings = []
    for line in text.splitlines():
        m = re.match(r'^(#{2,4})\s+(.+)$', line)
        if m:
            level = len(m.group(1))
            title = m.group(2).strip()
            # Clean markdown formatting from title
            clean_title = re.sub(r'[*_`]', '', title)
            # Create an anchor slug
            slug = re.sub(r'[^a-zA-Z0-9\u00C0-\u1EF9]+', '-', clean_title.lower()).strip('-')
            headings.append({
                "level": level,
                "title": clean_title,
                "slug": slug
            })
    return headings

def build():
    print(f"Reading from source directory: {SOURCE_DIR}")
    english_books = load_english_books()
    print(f"Extracted English text for {len(english_books)} books.")

    chapters = []
    all_flashcards = []

    for index, item in enumerate(CHAPTER_ORDER):
        file_path = os.path.join(SOURCE_DIR, item["file"])
        if not os.path.exists(file_path):
            print(f"Error: File not found: {file_path}")
            continue

        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        words = len(re.findall(r'\b\w+\b', content))
        est_minutes = max(1, math.ceil(words / 180))

        headings = extract_toc_headings(content)

        # Check for flashcards in phan-8
        if item["id"] == "phan-8":
            all_flashcards = parse_flashcards(content)

        ch_data = {
            "index": index + 1,
            "id": item["id"],
            "file": item["file"].replace("\\", "/"),
            "title": item["title"],
            "shortTitle": item["shortTitle"],
            "group": item["group"],
            "badge": item["badge"],
            "icon": item["icon"],
            "wordCount": words,
            "estMinutes": est_minutes,
            "headings": headings,
            "content": content
        }

        if "bookNum" in item and item["bookNum"] in english_books:
            ch_data["hasEnglish"] = True
            ch_data["englishContent"] = english_books[item["bookNum"]]

        chapters.append(ch_data)

    top_quotes = [
        {"quote": "External things are not the problem. It's your assessment of them. Which you can erase right now.", "source": "Book 8.47", "meaning": "Nền tảng của tự do nội tâm"},
        {"quote": "The impediment to action advances action. What stands in the way becomes the way.", "source": "Book 5.20", "meaning": "Chướng ngại là con đường"},
        {"quote": "The mind without passions is a fortress. No place is more secure.", "source": "Book 8.48", "meaning": "Tâm trí thanh tịnh là pháo đài"},
        {"quote": "Your soul takes on the color of your thoughts.", "source": "Book 5.16", "meaning": "Tư tưởng tạo nên màu sắc tâm hồn"},
        {"quote": "Objective judgment. Unselfish action. Willing acceptance. That's all you need.", "source": "Book 9.6", "meaning": "Hệ điều hành ba kỷ luật"},
        {"quote": "To stop talking about what the good man is like, and just be one.", "source": "Book 10.16", "meaning": "Hành động thay vì lý thuyết"},
        {"quote": "The best revenge is not to be like that.", "source": "Book 6.6", "meaning": "Cách trả thù cao thượng nhất"},
        {"quote": "Ask yourself at every moment: Is this necessary?", "source": "Book 4.24", "meaning": "Chiếc phễu lọc năng lượng sống"},
        {"quote": "You could leave life right now. Let that determine what you do and say and think.", "source": "Book 2.11", "meaning": "Memento Mori — nhớ về cái chết"},
        {"quote": "So make your exit with grace.", "source": "Book 12.36", "meaning": "Bước ra đi với sự tôn nghiêm và ân huệ trọn vẹn"}
    ]

    bundle = {
        "metadata": {
            "title": "Suy Tưởng (Meditations)",
            "author": "Marcus Aurelius",
            "translation": "Gregory Hays (2002)",
            "description": "Bản phân tích chuyên sâu 12 phần kết hợp văn bản gốc",
            "totalChapters": len(chapters),
            "totalFlashcards": len(all_flashcards),
            "generatedAt": "2026-10-18",
            "totalWords": sum(c["wordCount"] for c in chapters)
        },
        "quotes": top_quotes,
        "flashcards": all_flashcards,
        "chapters": chapters
    }

    out_file = os.path.join(WEB_DIR, "book_data.js")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write("// Auto-generated by build_data.py - DO NOT EDIT MANUALLY\n")
        f.write("window.BOOK_DATA = ")
        json.dump(bundle, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"Successfully generated {out_file} with {len(chapters)} chapters and {len(all_flashcards)} flashcards!")

if __name__ == "__main__":
    build()
