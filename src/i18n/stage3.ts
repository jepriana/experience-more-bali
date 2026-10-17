/**
 * Strings for the partner business profile, AI support plan, memory gear (merch) and
 * QR memory pages. Kept in their own file to keep translations.ts manageable;
 * `Translations` picks up the shape from the English version.
 */

const profileEn = {
  tabProfile: 'Business profile',
  tabStudio: 'AI marketing studio',
  tabGear: 'Memory gear',
  title: 'Tell us about your business — just tap',
  subtitle: 'Every tap is saved right away. Skip anything; come back any time.',
  progress: '{n} of 5 sections answered',
  savedAuto: 'Saved',
  secA: 'Type of business',
  secADesc: 'What do you offer travelers? Then tap what fits best.',
  secAFacilities: 'Good to know',
  secB: 'Products & services',
  secBDesc: 'Tap what you sell, or add your own.',
  addProductPlaceholder: 'Add your own, e.g. "Sunset dinner for 2"',
  add: 'Add',
  secC: 'Discount for KOSSI travelers',
  secCDesc: 'Shown on the traveler’s trip and memory page. More discount, more visitors.',
  noDiscount: 'No discount',
  secD: 'How can AI help you?',
  secDDesc: 'Pick what you’d like help with. We’ll build your plan.',
  secE: 'Your digital channels',
  secEDesc: 'For each channel, tap how it’s going now.',
  otherPlaceholder: 'Which platform? e.g. Traveloka, Airbnb',
  colManaged: 'Well managed',
  colOnOff: 'On-off, not focused',
  colHelp: 'Need help',
  colManagedShort: 'Managed',
  colOnOffShort: 'On-off',
  colHelpShort: 'Help',
  clearRow: 'Clear',
  types: {
    Destination: 'Destination',
    Accommodation: 'Accommodation',
    Culinary: 'Culinary',
    Activity: 'Activity',
    LocalProducts: 'Local products',
    Transport: 'Transport'
  },
  aiSupport: {
    descriptions: 'Write my product descriptions',
    social: 'Plan my social media posts',
    translate: 'Translate for foreign guests',
    reviews: 'Reply to reviews',
    packages: 'Bundle packages with other partners',
    photos: 'Better photos & videos'
  },
  channels: {
    website: 'Website (informative)',
    landing: 'Landing page (transactions)',
    gmaps: 'Google Maps optimization',
    meta: 'Meta (Facebook, IG, Threads)',
    tiktok: 'TikTok Shop / Go',
    shopee: 'Shopee',
    other: 'Other (specify)'
  },
  planTitle: 'Your AI support plan',
  planDesc: 'Built from the channels where you tapped “Need help” and the AI help you picked.',
  planEmpty: 'Tap “Need help” on a channel or pick an AI help above, then build your plan.',
  btnPlan: 'Build my support plan',
  btnPlanAgain: 'Rebuild plan',
  planWriting: 'Writing your plan…',
  statusReading: 'Reading your answers…',
  statusPrioritising: 'Choosing the quickest wins…',
  statusSteps: 'Writing simple steps…',
  effort: { quick: 'Quick win · under 1 hour', medium: 'Half a day', project: 'Small project · KOSSI can help' },
  kossiHelp: 'How KOSSI helps',
  firstWeek: 'This week',
  aiChannel: 'AI help'
};

const profileId: typeof profileEn = {
  tabProfile: 'Profil usaha',
  tabStudio: 'Studio pemasaran AI',
  tabGear: 'Perlengkapan kenangan',
  title: 'Ceritakan usaha Anda — cukup ketuk',
  subtitle: 'Setiap ketukan langsung tersimpan. Lewati yang mana saja; kembali kapan saja.',
  progress: '{n} dari 5 bagian terisi',
  savedAuto: 'Tersimpan',
  secA: 'Jenis usaha',
  secADesc: 'Apa yang Anda tawarkan kepada wisatawan? Lalu ketuk yang paling cocok.',
  secAFacilities: 'Info tambahan',
  secB: 'Produk & layanan',
  secBDesc: 'Ketuk yang Anda jual, atau tambahkan sendiri.',
  addProductPlaceholder: 'Tambahkan sendiri, mis. "Makan malam sunset untuk 2"',
  add: 'Tambah',
  secC: 'Diskon untuk wisatawan KOSSI',
  secCDesc: 'Ditampilkan di rencana perjalanan dan halaman kenangan wisatawan. Diskon lebih besar, pengunjung lebih banyak.',
  noDiscount: 'Tanpa diskon',
  secD: 'Bagaimana AI bisa membantu?',
  secDDesc: 'Pilih bantuan yang Anda inginkan. Kami susun rencananya.',
  secE: 'Kanal digital Anda',
  secEDesc: 'Untuk setiap kanal, ketuk kondisinya saat ini.',
  otherPlaceholder: 'Platform apa? mis. Traveloka, Airbnb',
  colManaged: 'Dikelola dengan baik',
  colOnOff: 'Kadang-kadang, belum fokus',
  colHelp: 'Butuh bantuan',
  colManagedShort: 'Dikelola',
  colOnOffShort: 'Kadang',
  colHelpShort: 'Bantu',
  clearRow: 'Hapus',
  types: {
    Destination: 'Destinasi',
    Accommodation: 'Akomodasi',
    Culinary: 'Kuliner',
    Activity: 'Aktivitas',
    LocalProducts: 'Produk lokal',
    Transport: 'Transportasi'
  },
  aiSupport: {
    descriptions: 'Tulis deskripsi produk saya',
    social: 'Rencanakan postingan media sosial',
    translate: 'Terjemahkan untuk tamu asing',
    reviews: 'Balas ulasan',
    packages: 'Buat paket bersama mitra lain',
    photos: 'Foto & video yang lebih baik'
  },
  channels: {
    website: 'Website (informatif)',
    landing: 'Landing page (transaksi)',
    gmaps: 'Optimasi Google Maps',
    meta: 'Meta (Facebook, IG, Threads)',
    tiktok: 'TikTok Shop / Go',
    shopee: 'Shopee',
    other: 'Lainnya (sebutkan)'
  },
  planTitle: 'Rencana dukungan AI Anda',
  planDesc: 'Disusun dari kanal yang Anda tandai “Butuh bantuan” dan bantuan AI yang Anda pilih.',
  planEmpty: 'Ketuk “Butuh bantuan” pada sebuah kanal atau pilih bantuan AI di atas, lalu susun rencananya.',
  btnPlan: 'Susun rencana dukungan',
  btnPlanAgain: 'Susun ulang',
  planWriting: 'Menulis rencana Anda…',
  statusReading: 'Membaca jawaban Anda…',
  statusPrioritising: 'Memilih langkah tercepat…',
  statusSteps: 'Menulis langkah sederhana…',
  effort: { quick: 'Cepat · kurang dari 1 jam', medium: 'Setengah hari', project: 'Proyek kecil · KOSSI bisa bantu' },
  kossiHelp: 'Bantuan KOSSI',
  firstWeek: 'Minggu ini',
  aiChannel: 'Bantuan AI'
};

const merchEn = {
  stepGear: 'Memory gear',
  title: 'Wear your adventure',
  subtitle: 'Your sticker on a T-shirt, hat or drawstring bag — printed by our digital-printing partner in Bali.',
  partnerTitle: 'Gear for your team & counter',
  partnerSubtitle: 'Your Strategic Partner sticker on staff T-shirts, hats or bags, plus a QR card for your counter.',
  product: 'Product',
  products: { tshirt: 'T-shirt', hat: 'Hat', bag: 'Drawstring bag' },
  colour: 'Colour',
  colours: { white: 'White', black: 'Black', navy: 'Navy', olive: 'Olive', sand: 'Sand' },
  sizes: 'Sizes & quantity',
  oneSize: 'One size',
  qrPatch: 'Add a QR memory patch',
  qrPatchDesc: 'Scanning it opens your trip memory page — photos, days and places.',
  qrPatchPartnerDesc: 'Scanning it opens your KOSSI partner page.',
  total: '{n} item(s)',
  pickQty: 'Choose at least one item',
  downloadPrint: 'Download print file',
  orderWhatsApp: 'Order on WhatsApp',
  orderEmail: 'Order by email',
  priceNote: 'The print partner confirms price and pick-up/delivery with you.',
  demoPartnerNote: 'Demo: no print partner number is set, so WhatsApp lets you choose who to send to.',
  orderGreeting: 'Hello! I’d like to order KOSSI Adventure memory gear:',
  orderName: 'Name',
  orderContact: 'Contact',
  orderPrintFile: 'Print file & memory page',
  orderThanks: 'Thank you!',
  yes: 'yes',
  no: 'no',
  noTripYet: 'Plan your days first — the QR patch links to your trip.',
  counterCardTitle: 'QR card for your counter',
  counterCardDesc: 'Print it and place it at your counter: travelers scan to see your offer and add you to their trip.',
  downloadCard: 'Download counter card',
  scanToSee: 'Scan to see us on KOSSI Adventure',
  back: 'Back to my days'
};

const merchId: typeof merchEn = {
  stepGear: 'Perlengkapan',
  title: 'Kenakan petualangan Anda',
  subtitle: 'Stiker Anda di kaos, topi, atau tas serut — dicetak oleh mitra digital printing kami di Bali.',
  partnerTitle: 'Perlengkapan untuk tim & konter',
  partnerSubtitle: 'Stiker Strategic Partner Anda di kaos staf, topi, atau tas, plus kartu QR untuk konter Anda.',
  product: 'Produk',
  products: { tshirt: 'Kaos', hat: 'Topi', bag: 'Tas serut' },
  colour: 'Warna',
  colours: { white: 'Putih', black: 'Hitam', navy: 'Biru dongker', olive: 'Hijau zaitun', sand: 'Krem' },
  sizes: 'Ukuran & jumlah',
  oneSize: 'Satu ukuran',
  qrPatch: 'Tambahkan patch QR kenangan',
  qrPatchDesc: 'Saat dipindai, membuka halaman kenangan perjalanan Anda — foto, hari, dan tempat.',
  qrPatchPartnerDesc: 'Saat dipindai, membuka halaman mitra KOSSI Anda.',
  total: '{n} barang',
  pickQty: 'Pilih minimal satu barang',
  downloadPrint: 'Unduh file cetak',
  orderWhatsApp: 'Pesan lewat WhatsApp',
  orderEmail: 'Pesan lewat email',
  priceNote: 'Mitra cetak akan mengonfirmasi harga dan pengambilan/pengiriman dengan Anda.',
  demoPartnerNote: 'Demo: nomor mitra cetak belum diatur, jadi WhatsApp akan meminta Anda memilih penerima.',
  orderGreeting: 'Halo! Saya ingin memesan perlengkapan kenangan KOSSI Adventure:',
  orderName: 'Nama',
  orderContact: 'Kontak',
  orderPrintFile: 'File cetak & halaman kenangan',
  orderThanks: 'Terima kasih!',
  yes: 'ya',
  no: 'tidak',
  noTripYet: 'Atur hari Anda dulu — patch QR terhubung ke perjalanan Anda.',
  counterCardTitle: 'Kartu QR untuk konter',
  counterCardDesc: 'Cetak dan letakkan di konter: wisatawan memindai untuk melihat penawaran Anda dan menambahkan Anda ke perjalanan mereka.',
  downloadCard: 'Unduh kartu konter',
  scanToSee: 'Pindai untuk melihat kami di KOSSI Adventure',
  back: 'Kembali ke hari saya'
};

const memoryPageEn = {
  travelerTag: 'Trip memory',
  partnerTag: 'KOSSI Adventure Strategic Partner',
  day: 'Day {n}',
  places: '{n} place(s)',
  discount: '{n}% off for KOSSI travelers',
  offers: 'What we offer',
  scanThis: 'Scan or share this memory',
  copyLink: 'Copy link',
  copied: 'Copied!',
  downloadPrint: 'Download print file',
  ctaTraveler: 'Plan your own Bali adventure',
  ctaPartner: 'Add this partner to my trip',
  invalidTitle: 'This memory link is not valid',
  invalidDesc: 'The QR code may be damaged or the link was cut off. Ask the owner to share it again.',
  goHome: 'Go to KOSSI Adventure',
  photosSoon: 'Photos & videos from this trip will appear here.'
};

const memoryPageId: typeof memoryPageEn = {
  travelerTag: 'Kenangan perjalanan',
  partnerTag: 'Strategic Partner KOSSI Adventure',
  day: 'Hari {n}',
  places: '{n} tempat',
  discount: 'Diskon {n}% untuk wisatawan KOSSI',
  offers: 'Yang kami tawarkan',
  scanThis: 'Pindai atau bagikan kenangan ini',
  copyLink: 'Salin tautan',
  copied: 'Tersalin!',
  downloadPrint: 'Unduh file cetak',
  ctaTraveler: 'Rencanakan petualangan Bali Anda sendiri',
  ctaPartner: 'Tambahkan mitra ini ke perjalanan saya',
  invalidTitle: 'Tautan kenangan ini tidak valid',
  invalidDesc: 'Kode QR mungkin rusak atau tautannya terpotong. Minta pemiliknya membagikan ulang.',
  goHome: 'Ke KOSSI Adventure',
  photosSoon: 'Foto & video dari perjalanan ini akan muncul di sini.'
};

export type ProfileStrings = typeof profileEn;
export type MerchStrings = typeof merchEn;
export type MemoryPageStrings = typeof memoryPageEn;

export const stage3Strings = {
  en: { profile: profileEn, merch: merchEn, memoryPage: memoryPageEn },
  id: { profile: profileId, merch: merchId, memoryPage: memoryPageId }
};

/** "{n} of 5" → "3 of 5" */
export function fill(template: string, n: number | string): string {
  return template.replace('{n}', String(n));
}
