import type { SupportPlan } from '@/lib/schemas';
import type { AiSupportId, DigitalChannelId, PartnerBusinessProfile } from '@/data/partnerProfile';

/**
 * The instant (no-AI) support plan: one ready-written action per channel marked "Need help"
 * and per AI help picked. Used when Gemini is not configured or its answer is unusable,
 * so a partner always gets a useful plan.
 */

type Action = SupportPlan['actions'][number];
type Lang = 'en' | 'id';

const CHANNEL_ACTIONS: Record<DigitalChannelId, Record<Lang, Omit<Action, 'channel'>>> = {
  gmaps: {
    en: {
      title: 'Claim and polish your Google Maps profile',
      why: 'Most travelers find places on Maps; a complete profile brings walk-ins.',
      steps: ['Claim the business on Google Business Profile', 'Add 10 bright photos and opening hours', 'Ask 5 happy guests for a review'],
      effort: 'quick',
      kossiHelp: 'KOSSI writes your description and review replies in English and Bahasa.'
    },
    id: {
      title: 'Klaim dan rapikan profil Google Maps',
      why: 'Kebanyakan wisatawan mencari tempat di Maps; profil lengkap mendatangkan tamu.',
      steps: ['Klaim usaha di Google Business Profile', 'Tambahkan 10 foto cerah dan jam buka', 'Minta 5 tamu puas memberi ulasan'],
      effort: 'quick',
      kossiHelp: 'KOSSI menulis deskripsi dan balasan ulasan dalam bahasa Inggris dan Indonesia.'
    }
  },
  meta: {
    en: {
      title: 'Post three times a week on Instagram',
      why: 'Regular posts keep you visible to travelers planning their Bali trip.',
      steps: ['Pick 3 fixed days to post', 'Use the KOSSI studio to write captions', 'Reply to every comment within a day'],
      effort: 'quick',
      kossiHelp: 'The AI marketing studio drafts captions and hashtags in two languages.'
    },
    id: {
      title: 'Posting tiga kali seminggu di Instagram',
      why: 'Postingan rutin membuat Anda terlihat oleh wisatawan yang merencanakan ke Bali.',
      steps: ['Pilih 3 hari tetap untuk posting', 'Gunakan studio KOSSI untuk menulis caption', 'Balas setiap komentar dalam sehari'],
      effort: 'quick',
      kossiHelp: 'Studio pemasaran AI menyusun caption dan hashtag dalam dua bahasa.'
    }
  },
  tiktok: {
    en: {
      title: 'Share short behind-the-scenes videos',
      why: 'Short real videos reach many young travelers for free.',
      steps: ['Film 15 seconds of what guests experience', 'Add a short caption and location', 'Post twice a week'],
      effort: 'medium',
      kossiHelp: 'KOSSI suggests video ideas and captions from your products.'
    },
    id: {
      title: 'Bagikan video pendek di balik layar',
      why: 'Video pendek yang asli menjangkau banyak wisatawan muda secara gratis.',
      steps: ['Rekam 15 detik pengalaman tamu', 'Tambahkan caption singkat dan lokasi', 'Posting dua kali seminggu'],
      effort: 'medium',
      kossiHelp: 'KOSSI menyarankan ide video dan caption dari produk Anda.'
    }
  },
  website: {
    en: {
      title: 'Get a simple one-page website',
      why: 'A clear page with photos, prices and WhatsApp builds trust.',
      steps: ['Collect your best photos and prices', 'Use a free site builder template', 'Add your WhatsApp button and map'],
      effort: 'project',
      kossiHelp: 'KOSSI writes the page text and can connect you with a web partner.'
    },
    id: {
      title: 'Buat website satu halaman sederhana',
      why: 'Halaman jelas dengan foto, harga, dan WhatsApp membangun kepercayaan.',
      steps: ['Kumpulkan foto dan harga terbaik', 'Gunakan template pembuat situs gratis', 'Tambahkan tombol WhatsApp dan peta'],
      effort: 'project',
      kossiHelp: 'KOSSI menulis teks halaman dan bisa menghubungkan Anda dengan mitra web.'
    }
  },
  landing: {
    en: {
      title: 'Take bookings on one landing page',
      why: 'Guests can book and pay without waiting for a reply.',
      steps: ['List your top 3 packages with prices', 'Add a booking form or payment link', 'Share the link in your bio and WhatsApp'],
      effort: 'project',
      kossiHelp: 'KOSSI helps write the packages and connects partners who build booking pages.'
    },
    id: {
      title: 'Terima pemesanan lewat satu landing page',
      why: 'Tamu bisa memesan dan membayar tanpa menunggu balasan.',
      steps: ['Tampilkan 3 paket utama dengan harga', 'Tambahkan formulir pesan atau tautan bayar', 'Bagikan tautan di bio dan WhatsApp'],
      effort: 'project',
      kossiHelp: 'KOSSI membantu menulis paket dan menghubungkan mitra pembuat halaman pemesanan.'
    }
  },
  shopee: {
    en: {
      title: 'Open a Shopee store for your products',
      why: 'Travelers can buy your products again after they go home.',
      steps: ['List 5 products with clear photos', 'Write short descriptions with sizes', 'Offer a KOSSI traveler voucher'],
      effort: 'medium',
      kossiHelp: 'KOSSI writes product listings and links your store from travelers’ memory pages.'
    },
    id: {
      title: 'Buka toko Shopee untuk produk Anda',
      why: 'Wisatawan bisa membeli lagi produk Anda setelah pulang.',
      steps: ['Unggah 5 produk dengan foto jelas', 'Tulis deskripsi singkat dengan ukuran', 'Berikan voucher wisatawan KOSSI'],
      effort: 'medium',
      kossiHelp: 'KOSSI menulis daftar produk dan menautkan toko Anda dari halaman kenangan wisatawan.'
    }
  },
  other: {
    en: {
      title: 'Complete your listing on your other platform',
      why: 'A full, up-to-date listing gets ranked higher.',
      steps: ['Update photos, prices and availability', 'Copy your best description into the listing', 'Reply to all messages the same day'],
      effort: 'quick',
      kossiHelp: 'KOSSI rewrites your listing text in English and Bahasa.'
    },
    id: {
      title: 'Lengkapi listing di platform lain Anda',
      why: 'Listing yang lengkap dan terbaru mendapat peringkat lebih tinggi.',
      steps: ['Perbarui foto, harga, dan ketersediaan', 'Salin deskripsi terbaik ke listing', 'Balas semua pesan di hari yang sama'],
      effort: 'quick',
      kossiHelp: 'KOSSI menulis ulang teks listing Anda dalam bahasa Inggris dan Indonesia.'
    }
  }
};

const AI_ACTIONS: Record<AiSupportId, Record<Lang, Omit<Action, 'channel'>>> = {
  descriptions: {
    en: {
      title: 'Let AI write your product descriptions',
      why: 'Clear, inviting descriptions turn browsers into guests.',
      steps: ['Open the AI marketing studio', 'Tap your products and generate', 'Copy the text to all your channels'],
      effort: 'quick',
      kossiHelp: 'The studio writes descriptions grounded in your real offer.'
    },
    id: {
      title: 'Biarkan AI menulis deskripsi produk',
      why: 'Deskripsi jelas dan menarik mengubah pengunjung menjadi tamu.',
      steps: ['Buka studio pemasaran AI', 'Ketuk produk Anda lalu buat', 'Salin teks ke semua kanal Anda'],
      effort: 'quick',
      kossiHelp: 'Studio menulis deskripsi berdasarkan penawaran nyata Anda.'
    }
  },
  social: {
    en: {
      title: 'Plan a month of posts in one sitting',
      why: 'A plan removes the daily “what do I post?” stress.',
      steps: ['Generate 12 post ideas in the studio', 'Take matching photos this week', 'Schedule them in Meta Business Suite'],
      effort: 'medium',
      kossiHelp: 'The studio writes post captions and hashtags for each idea.'
    },
    id: {
      title: 'Rencanakan postingan sebulan sekaligus',
      why: 'Rencana menghilangkan stres “posting apa hari ini?”.',
      steps: ['Buat 12 ide postingan di studio', 'Ambil foto yang sesuai minggu ini', 'Jadwalkan di Meta Business Suite'],
      effort: 'medium',
      kossiHelp: 'Studio menulis caption dan hashtag untuk setiap ide.'
    }
  },
  translate: {
    en: {
      title: 'Offer everything in English and Bahasa',
      why: 'Foreign guests book more when they understand the offer.',
      steps: ['Pick your menu or price list', 'Translate it with the KOSSI studio', 'Print both languages at your counter'],
      effort: 'quick',
      kossiHelp: 'KOSSI translates naturally, keeping local names.'
    },
    id: {
      title: 'Sajikan semuanya dalam bahasa Inggris dan Indonesia',
      why: 'Tamu asing lebih banyak memesan bila memahami penawaran.',
      steps: ['Pilih menu atau daftar harga', 'Terjemahkan dengan studio KOSSI', 'Cetak dua bahasa di konter Anda'],
      effort: 'quick',
      kossiHelp: 'KOSSI menerjemahkan secara alami dengan tetap memakai nama lokal.'
    }
  },
  reviews: {
    en: {
      title: 'Reply to every review within two days',
      why: 'Replies show care and lift your rating over time.',
      steps: ['Check Google and other reviews twice a week', 'Draft replies with AI', 'Thank by name and invite them back'],
      effort: 'quick',
      kossiHelp: 'KOSSI drafts polite replies in the reviewer’s language.'
    },
    id: {
      title: 'Balas setiap ulasan dalam dua hari',
      why: 'Balasan menunjukkan kepedulian dan menaikkan rating.',
      steps: ['Cek ulasan Google dan lainnya dua kali seminggu', 'Susun balasan dengan AI', 'Ucapkan terima kasih dan undang kembali'],
      effort: 'quick',
      kossiHelp: 'KOSSI menyusun balasan sopan dalam bahasa pengulas.'
    }
  },
  packages: {
    en: {
      title: 'Create a bundle with a nearby partner',
      why: 'Bundles raise the spend per guest for both of you.',
      steps: ['Pick a KOSSI partner close to you', 'Agree a combined price and discount', 'List the bundle on both pages'],
      effort: 'medium',
      kossiHelp: 'KOSSI suggests partners travelers already combine with you.'
    },
    id: {
      title: 'Buat paket dengan mitra terdekat',
      why: 'Paket menaikkan belanja per tamu untuk kedua usaha.',
      steps: ['Pilih mitra KOSSI di dekat Anda', 'Sepakati harga gabungan dan diskon', 'Tampilkan paket di kedua halaman'],
      effort: 'medium',
      kossiHelp: 'KOSSI menyarankan mitra yang sering digabung wisatawan dengan Anda.'
    }
  },
  photos: {
    en: {
      title: 'Refresh your photos with a phone',
      why: 'Bright, real photos are the first thing travelers judge.',
      steps: ['Shoot in morning light, landscape and close-up', 'Show people enjoying, not empty rooms', 'Replace old photos everywhere'],
      effort: 'medium',
      kossiHelp: 'KOSSI travelers can share authentic photos you may reuse with credit.'
    },
    id: {
      title: 'Perbarui foto dengan ponsel',
      why: 'Foto cerah dan asli adalah hal pertama yang dinilai wisatawan.',
      steps: ['Foto di cahaya pagi, lebar dan dekat', 'Tampilkan orang yang menikmati, bukan ruang kosong', 'Ganti foto lama di semua tempat'],
      effort: 'medium',
      kossiHelp: 'Wisatawan KOSSI dapat berbagi foto asli yang bisa Anda pakai dengan kredit.'
    }
  }
};

/** Channels marked "Need help", in the sheet's order. */
export function helpChannels(profile: PartnerBusinessProfile): DigitalChannelId[] {
  const order: DigitalChannelId[] = ['gmaps', 'meta', 'tiktok', 'shopee', 'website', 'landing', 'other'];
  return order.filter((c) => profile.digital[c] === 'help');
}

export function instantSupportPlan(profile: PartnerBusinessProfile, businessName: string, language: Lang): SupportPlan {
  const actions: Action[] = [
    ...helpChannels(profile).map((c) => ({ channel: c, ...CHANNEL_ACTIONS[c][language] })),
    ...profile.aiSupport.map((a) => ({ channel: 'ai' as const, ...AI_ACTIONS[a][language] }))
  ];
  // nothing asked for: start with the basics every Bali business benefits from
  if (actions.length === 0) actions.push({ channel: 'gmaps', ...CHANNEL_ACTIONS.gmaps[language] });
  // quick wins first
  const rank = { quick: 0, medium: 1, project: 2 } as const;
  const sorted = actions.sort((a, b) => rank[a.effort] - rank[b.effort]).slice(0, 6);

  return {
    headline:
      language === 'id'
        ? `${businessName}, ini langkah kecil yang mendatangkan lebih banyak wisatawan.`
        : `${businessName}, here are small steps that bring more travelers.`,
    actions: sorted,
    firstWeek: sorted.slice(0, 3).map((a) => a.steps[0])
  };
}
