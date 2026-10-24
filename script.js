// ===== Data produk: ubah di sini untuk mengganti isi toko =====
const PRODUCTS = [
  { id: 1, nama: "Ponsel Nova 12", kat: "Ponsel", harga: 3499000, spek: "6,7 inci, 256 GB", info: "Layar AMOLED 120 Hz, baterai 5.000 mAh.", warna: "cobalt", bentuk: "tall" },
  { id: 2, nama: "Jam Pintar Orbit", kat: "Wearable", harga: 899000, spek: "1,4 inci, GPS", info: "Pantau detak jantung dan tidur, tahan air 5 ATM.", warna: "mint", bentuk: "round" },
  { id: 3, nama: "Earbuds Pulse", kat: "Audio", harga: 649000, spek: "Bluetooth 5.3, ANC", info: "Peredam bising aktif, baterai 30 jam dengan case.", warna: "amber", bentuk: "round" },
  { id: 4, nama: "Speaker Boomer", kat: "Audio", harga: 459000, spek: "20 W, tahan cipratan", info: "Suara jernih, baterai tahan 12 jam.", warna: "rose", bentuk: "round" },
  { id: 5, nama: "Power Bank Volt", kat: "Aksesori", harga: 329000, spek: "20.000 mAh, 65 W", info: "Pengisian cepat, cukup untuk mengisi laptop.", warna: "silver", bentuk: "wide" },
  { id: 6, nama: "Keyboard Mekanik Klik", kat: "Aksesori", harga: 749000, spek: "Tenkeyless, hot-swap", info: "Bisa Bluetooth atau kabel, switch mudah diganti.", warna: "slate", bentuk: "wide" },
  { id: 7, nama: "Tablet Lite 11", kat: "Ponsel", harga: 2899000, spek: "11 inci, 128 GB", info: "Layar luas untuk belajar, menggambar, dan hiburan.", warna: "mint", bentuk: "wide" },
  { id: 8, nama: "Charger GaN 65W", kat: "Aksesori", harga: 219000, spek: "3 port, USB-C", info: "Ringkas, bisa mengisi ponsel dan laptop sekaligus.", warna: "amber", bentuk: "wide" },
];
const WA_NOMOR = "6281200000000"; // ganti dengan nomor WhatsApp tokomu (format 62...)
const GRATIS_ONGKIR = 500000;
const ONGKIR = 20000;

const $ = (s) => document.querySelector(s);
const rupiah = (n) => "Rp " + n.toLocaleString("id-ID");
const cari = (id) => PRODUCTS.find((p) => p.id == id);

// ===== Keranjang (disimpan di browser) =====
function loadCart() {
  try { return JSON.parse(localStorage.getItem("pg-keranjang")) || {}; } catch { return {}; }
}
let cart = loadCart();
function saveCart() {
  try { localStorage.setItem("pg-keranjang", JSON.stringify(cart)); } catch { /* tetap jalan tanpa penyimpanan */ }
  const n = Object.values(cart).reduce((a, b) => a + b, 0);
  const el = $("#cart-count");
  if (el) el.textContent = n;
}

// ===== Header, footer, dan notifikasi =====
function renderChrome() {
  const page = document.body.dataset.page;
  const link = (href, key, teks) => `<a href="${href}"${page === key ? ' aria-current="page"' : ""}>${teks}</a>`;
  $("#site-header").innerHTML =
    `<a class="brand" href="index.html">Pojok Gadget</a>` +
    `<nav aria-label="Menu utama">${link("index.html", "home", "Beranda")}${link("produk.html", "produk", "Produk")}</nav>` +
    `<a class="cart" href="keranjang.html">Keranjang <span id="cart-count">0</span></a>`;
  $("#site-footer").innerHTML =
    `<div><strong>Pojok Gadget</strong><p>Jl. Contoh No. 12, Bekasi, Jawa Barat</p></div>` +
    `<div><p>WhatsApp: 0812-0000-0000</p><p>Email: halo@pojokgadget.example</p></div>` +
    `<p class="copy">© 2026 Pojok Gadget. Semua hak dilindungi.</p>`;
}

let toastTimer;
function toast(pesan) {
  let t = $("#toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.setAttribute("role", "status");
    document.body.append(t);
  }
  t.textContent = pesan;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

const kartu = (p) => `
  <article class="product">
    <div class="shot" style="--c: var(--${p.warna})"><div class="dev ${p.bentuk}" aria-hidden="true"></div><span>${p.spek}</span></div>
    <h3>${p.nama}</h3>
    <p class="notes">${p.info}</p>
    <div class="buy">
      <strong class="price">${rupiah(p.harga)}</strong>
      <button class="add" type="button" data-id="${p.id}">Tambah ke keranjang</button>
    </div>
  </article>`;

document.addEventListener("click", (e) => {
  const b = e.target.closest(".add");
  if (!b) return;
  cart[b.dataset.id] = (cart[b.dataset.id] || 0) + 1;
  saveCart();
  toast(`${cari(b.dataset.id).nama} masuk keranjang`);
});

// ===== Halaman beranda =====
function initHome() {
  $("#featured").innerHTML = PRODUCTS.slice(0, 3).map(kartu).join("");
}

// ===== Halaman produk: cari, filter kategori, urutkan =====
function initProduk() {
  const kategori = ["Semua", ...new Set(PRODUCTS.map((p) => p.kat))];
  const state = { kat: "Semua", q: "", urut: "populer" };
  $("#chips").innerHTML = kategori
    .map((k) => `<button type="button" class="chip" data-kat="${k}" aria-pressed="${k === "Semua"}">${k}</button>`)
    .join("");

  function tampil() {
    const list = PRODUCTS.filter((p) => (state.kat === "Semua" || p.kat === state.kat) && p.nama.toLowerCase().includes(state.q));
    if (state.urut === "murah") list.sort((a, b) => a.harga - b.harga);
    if (state.urut === "mahal") list.sort((a, b) => b.harga - a.harga);
    $("#grid").innerHTML = list.map(kartu).join("") || `<p class="empty">Produk tidak ditemukan. Coba kata kunci atau kategori lain.</p>`;
    $("#hasil").textContent = `${list.length} produk`;
  }

  $("#chips").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    state.kat = b.dataset.kat;
    document.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === b));
    tampil();
  });
  $("#cari").addEventListener("input", (e) => { state.q = e.target.value.trim().toLowerCase(); tampil(); });
  $("#urut").addEventListener("change", (e) => { state.urut = e.target.value; tampil(); });
  tampil();
}

// ===== Halaman keranjang: ubah jumlah, hapus, pesan lewat WhatsApp =====
function initKeranjang() {
  const baris = () => Object.entries(cart).map(([id, q]) => ({ p: cari(id), q })).filter((r) => r.p && r.q > 0);

  function tampil() {
    const rows = baris();
    const sub = rows.reduce((a, r) => a + r.p.harga * r.q, 0);
    const ongkir = !sub || sub >= GRATIS_ONGKIR ? 0 : ONGKIR;
    $("#items").innerHTML = rows.length
      ? rows.map(({ p, q }) => `
        <li class="row">
          <div class="mini" style="--c: var(--${p.warna})"></div>
          <div class="row-info"><strong>${p.nama}</strong><span>${rupiah(p.harga)}</span></div>
          <div class="qty">
            <button type="button" data-act="kurang" data-id="${p.id}" aria-label="Kurangi ${p.nama}">−</button>
            <output>${q}</output>
            <button type="button" data-act="tambah" data-id="${p.id}" aria-label="Tambah ${p.nama}">+</button>
          </div>
          <strong class="sub">${rupiah(p.harga * q)}</strong>
          <button type="button" class="hapus" data-act="hapus" data-id="${p.id}">Hapus</button>
        </li>`).join("")
      : `<li class="empty">Keranjangmu masih kosong. <a href="produk.html">Lihat produk</a></li>`;
    $("#ringkasan").innerHTML =
      `<dt>Subtotal</dt><dd>${rupiah(sub)}</dd>` +
      `<dt>Ongkir</dt><dd>${ongkir ? rupiah(ongkir) : "Gratis"}</dd>` +
      `<dt class="tot">Total</dt><dd class="tot">${rupiah(sub + ongkir)}</dd>`;
    $("#pesan").disabled = !rows.length;
  }

  $("#items").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const id = b.dataset.id;
    if (b.dataset.act === "tambah") cart[id] = (cart[id] || 0) + 1;
    if (b.dataset.act === "kurang") cart[id] = Math.max(0, (cart[id] || 0) - 1);
    if (b.dataset.act === "hapus" || cart[id] === 0) delete cart[id];
    saveCart();
    tampil();
  });

  $("#form").addEventListener("submit", (e) => {
    e.preventDefault();
    const rows = baris();
    if (!rows.length) return;
    const f = new FormData(e.target);
    const sub = rows.reduce((a, r) => a + r.p.harga * r.q, 0);
    const ongkir = sub >= GRATIS_ONGKIR ? 0 : ONGKIR;
    const teks =
      `Halo Pojok Gadget, saya ingin memesan:\n` +
      rows.map((r) => `- ${r.p.nama} x${r.q} = ${rupiah(r.p.harga * r.q)}`).join("\n") +
      `\nOngkir: ${ongkir ? rupiah(ongkir) : "Gratis"}\nTotal: ${rupiah(sub + ongkir)}\n\n` +
      `Nama: ${f.get("nama")}\nAlamat: ${f.get("alamat")}`;
    window.open(`https://wa.me/${WA_NOMOR}?text=${encodeURIComponent(teks)}`, "_blank", "noopener");
  });

  tampil();
}

renderChrome();
saveCart();
({ home: initHome, produk: initProduk, keranjang: initKeranjang })[document.body.dataset.page]?.();
