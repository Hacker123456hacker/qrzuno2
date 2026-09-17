/* QRZuno — tools-data.js
   Central registry of every QR type: its fields, payload builder and validator.
   Adding a new QR type only requires adding an entry here. */

const QRZUNO_TOOLS = {
  url: {
    label: "Website / URL QR",
    category: "Websites & Links",
    icon: "🔗",
    desc: "Point straight to any website or web page.",
    fields: [
      { key: "url", label: "Website URL", type: "url", placeholder: "https://example.com", required: true }
    ],
    build: (d) => d.url.trim(),
    validate: (d) => {
      try { new URL(d.url.trim()); return null; }
      catch { return "Please enter a valid URL."; }
    }
  },
  text: {
    label: "Plain Text QR",
    category: "Websites & Links",
    icon: "📝",
    desc: "Encode any block of plain text.",
    fields: [
      { key: "text", label: "Text", type: "textarea", placeholder: "Type or paste your text…", required: true, counter: true, maxlength: 2000 }
    ],
    build: (d) => d.text,
    validate: (d) => (!d.text || !d.text.trim()) ? "Please enter some text." : null
  },
  wifi: {
    label: "Wi-Fi QR",
    category: "Communication",
    icon: "📶",
    desc: "Let guests join your Wi-Fi network with a single scan.",
    fields: [
      { key: "ssid", label: "Network name / SSID", type: "text", required: true },
      { key: "password", label: "Password", type: "text" },
      { key: "security", label: "Security", type: "select", options: ["WPA/WPA2", "WEP", "None"], default: "WPA/WPA2" },
      { key: "hidden", label: "Hidden network", type: "checkbox" }
    ],
    build: (d) => {
      const sec = d.security === "None" ? "nopass" : d.security === "WEP" ? "WEP" : "WPA";
      const esc = (s) => (s || "").replace(/([\\;,":])/g, "\\$1");
      return `WIFI:T:${sec};S:${esc(d.ssid)};${sec !== "nopass" ? "P:" + esc(d.password) + ";" : ""}${d.hidden ? "H:true;" : ""};`;
    },
    validate: (d) => (!d.ssid || !d.ssid.trim()) ? "Please enter the network name." : null
  },
  whatsapp: {
    label: "WhatsApp QR",
    category: "Communication",
    icon: "💬",
    desc: "Open a WhatsApp chat instantly, with an optional pre-filled message.",
    fields: [
      { key: "code", label: "Country code", type: "text", placeholder: "+91", required: true },
      { key: "phone", label: "Phone number", type: "tel", placeholder: "9876543210", required: true },
      { key: "message", label: "Message (optional)", type: "textarea" }
    ],
    build: (d) => {
      const num = (d.code + d.phone).replace(/[^\d]/g, "");
      const msg = d.message ? "?text=" + encodeURIComponent(d.message) : "";
      return `https://wa.me/${num}${msg}`;
    },
    validate: (d) => (!d.phone || !/^\d{6,14}$/.test(d.phone.replace(/[^\d]/g, ""))) ? "Please enter a valid phone number." : null
  },
  email: {
    label: "Email QR",
    category: "Communication",
    icon: "✉️",
    desc: "Open a pre-filled email draft the moment it's scanned.",
    fields: [
      { key: "to", label: "Email", type: "email", required: true },
      { key: "subject", label: "Subject", type: "text" },
      { key: "body", label: "Message", type: "textarea" }
    ],
    build: (d) => `mailto:${d.to.trim()}?subject=${encodeURIComponent(d.subject || "")}&body=${encodeURIComponent(d.body || "")}`,
    validate: (d) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.to || "")) ? "Please enter a valid email address." : null
  },
  phone: {
    label: "Phone Call QR",
    category: "Communication",
    icon: "📞",
    desc: "Dial a number the moment it's scanned.",
    fields: [
      { key: "phone", label: "Phone number", type: "tel", placeholder: "+91 9876543210", required: true }
    ],
    build: (d) => `tel:${d.phone.replace(/[^\d+]/g, "")}`,
    validate: (d) => (!d.phone || d.phone.replace(/[^\d]/g, "").length < 6) ? "Please enter a valid phone number." : null
  },
  sms: {
    label: "SMS QR",
    category: "Communication",
    icon: "💬",
    desc: "Pre-fill an SMS to a number with an optional message.",
    fields: [
      { key: "phone", label: "Phone number", type: "tel", required: true },
      { key: "message", label: "Message (optional)", type: "textarea" }
    ],
    build: (d) => `sms:${d.phone.replace(/[^\d+]/g, "")}${d.message ? "?body=" + encodeURIComponent(d.message) : ""}`,
    validate: (d) => (!d.phone || d.phone.replace(/[^\d]/g, "").length < 6) ? "Please enter a valid phone number." : null
  },
  vcard: {
    label: "vCard / Contact QR",
    category: "Business",
    icon: "🪪",
    desc: "Share your full contact card — name, phone, email and more.",
    fields: [
      { key: "first", label: "First name", type: "text", required: true },
      { key: "last", label: "Last name", type: "text" },
      { key: "org", label: "Company", type: "text" },
      { key: "title", label: "Job title", type: "text" },
      { key: "phone", label: "Phone", type: "tel" },
      { key: "email", label: "Email", type: "email" },
      { key: "website", label: "Website", type: "url" },
      { key: "address", label: "Address", type: "text" }
    ],
    build: (d) => [
      "BEGIN:VCARD", "VERSION:3.0",
      `N:${d.last || ""};${d.first || ""};;;`,
      `FN:${(d.first || "") + " " + (d.last || "")}`.trim(),
      d.org ? `ORG:${d.org}` : "",
      d.title ? `TITLE:${d.title}` : "",
      d.phone ? `TEL:${d.phone}` : "",
      d.email ? `EMAIL:${d.email}` : "",
      d.website ? `URL:${d.website}` : "",
      d.address ? `ADR:;;${d.address};;;;` : "",
      "END:VCARD"
    ].filter(Boolean).join("\n"),
    validate: (d) => (!d.first || !d.first.trim()) ? "Please enter a first name." : null
  },
  location: {
    label: "Location QR",
    category: "Location",
    icon: "📍",
    desc: "Drop a pin — scanning opens the spot on a map.",
    fields: [
      { key: "lat", label: "Latitude", type: "text", placeholder: "28.6139", required: true },
      { key: "lng", label: "Longitude", type: "text", placeholder: "77.2090", required: true },
      { key: "useMaps", label: "Use Google Maps link instead of geo:", type: "checkbox" }
    ],
    build: (d) => d.useMaps
      ? `https://maps.google.com/?q=${d.lat},${d.lng}`
      : `geo:${d.lat},${d.lng}`,
    validate: (d) => (isNaN(parseFloat(d.lat)) || isNaN(parseFloat(d.lng))) ? "Please enter valid coordinates." : null
  },
  upi: {
    label: "UPI Payment QR",
    category: "Payments",
    icon: "💸",
    desc: "Generate a UPI payment request payload for Indian bank apps.",
    note: "QRZuno does not process payments. QRZuno only generates the QR payload — money is handled entirely by the UPI apps that scan it.",
    fields: [
      { key: "vpa", label: "UPI ID (VPA)", type: "text", placeholder: "name@bank", required: true },
      { key: "name", label: "Payee name", type: "text", required: true },
      { key: "amount", label: "Amount (optional)", type: "text", placeholder: "100" },
      { key: "note", label: "Transaction note (optional)", type: "text" }
    ],
    build: (d) => {
      const p = new URLSearchParams();
      p.set("pa", d.vpa.trim()); p.set("pn", d.name.trim());
      if (d.amount) p.set("am", d.amount.trim());
      if (d.note) p.set("tn", d.note.trim());
      p.set("cu", "INR");
      return `upi://pay?${p.toString()}`;
    },
    validate: (d) => (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(d.vpa || "")) ? "Please enter a valid UPI ID." : null
  },
  instagram: {
    label: "Instagram QR", category: "Social Media", icon: "📷", desc: "Link straight to an Instagram profile.",
    fields: [{ key: "url", label: "Instagram profile URL", type: "url", placeholder: "https://instagram.com/username", required: true }],
    build: (d) => d.url.trim(), validate: (d) => { try { new URL(d.url); return null; } catch { return "Please enter a valid URL."; } }
  },
  facebook: {
    label: "Facebook QR", category: "Social Media", icon: "📘", desc: "Link straight to a Facebook page or profile.",
    fields: [{ key: "url", label: "Facebook page URL", type: "url", required: true }],
    build: (d) => d.url.trim(), validate: (d) => { try { new URL(d.url); return null; } catch { return "Please enter a valid URL."; } }
  },
  telegram: {
    label: "Telegram QR", category: "Social Media", icon: "📡", desc: "Open a Telegram chat or channel.",
    fields: [{ key: "url", label: "Telegram link", type: "url", placeholder: "https://t.me/username", required: true }],
    build: (d) => d.url.trim(), validate: (d) => { try { new URL(d.url); return null; } catch { return "Please enter a valid URL."; } }
  },
  linkedin: {
    label: "LinkedIn QR", category: "Social Media", icon: "💼", desc: "Link to a LinkedIn profile or company page.",
    fields: [{ key: "url", label: "LinkedIn URL", type: "url", required: true }],
    build: (d) => d.url.trim(), validate: (d) => { try { new URL(d.url); return null; } catch { return "Please enter a valid URL."; } }
  },
  twitter: {
    label: "X / Twitter QR", category: "Social Media", icon: "𝕏", desc: "Link straight to an X (Twitter) profile.",
    fields: [{ key: "url", label: "Profile URL", type: "url", required: true }],
    build: (d) => d.url.trim(), validate: (d) => { try { new URL(d.url); return null; } catch { return "Please enter a valid URL."; } }
  },
  youtube: {
    label: "YouTube QR", category: "Websites & Links", icon: "▶️", desc: "Link to a YouTube video or channel.",
    fields: [{ key: "url", label: "YouTube URL", type: "url", required: true }],
    build: (d) => d.url.trim(), validate: (d) => { try { new URL(d.url); return null; } catch { return "Please enter a valid URL."; } }
  },
  playstore: {
    label: "Google Play QR", category: "Apps", icon: "🤖", desc: "Send users straight to your app on Google Play.",
    fields: [{ key: "url", label: "Google Play URL", type: "url", required: true }],
    build: (d) => d.url.trim(), validate: (d) => { try { new URL(d.url); return null; } catch { return "Please enter a valid URL."; } }
  },
  appstore: {
    label: "App Store QR", category: "Apps", icon: "🍎", desc: "Send users straight to your app on the Apple App Store.",
    fields: [{ key: "url", label: "App Store URL", type: "url", required: true }],
    build: (d) => d.url.trim(), validate: (d) => { try { new URL(d.url); return null; } catch { return "Please enter a valid URL."; } }
  },
  applink: {
    label: "App Link QR", category: "Apps", icon: "📱", desc: "Link to any custom app URL or deep link.",
    fields: [{ key: "url", label: "App URL / deep link", type: "text", required: true }],
    build: (d) => d.url.trim(), validate: (d) => (!d.url || !d.url.trim()) ? "Please enter a link." : null
  },
  event: {
    label: "Event / Calendar QR", category: "Events", icon: "📅", desc: "Let people add your event to their calendar in one scan.",
    fields: [
      { key: "title", label: "Event title", type: "text", required: true },
      { key: "location", label: "Location", type: "text" },
      { key: "start", label: "Start date/time", type: "datetime-local", required: true },
      { key: "end", label: "End date/time", type: "datetime-local" },
      { key: "desc", label: "Description", type: "textarea" }
    ],
    build: (d) => {
      const fmt = (s) => s ? s.replace(/[-:]/g, "").replace(/\.\d+/, "") + "00" : "";
      return ["BEGIN:VEVENT", `SUMMARY:${d.title}`, d.location ? `LOCATION:${d.location}` : "",
        `DTSTART:${fmt(d.start)}`, d.end ? `DTEND:${fmt(d.end)}` : "",
        d.desc ? `DESCRIPTION:${d.desc}` : "", "END:VEVENT"].filter(Boolean).join("\n");
    },
    validate: (d) => (!d.title || !d.start) ? "Please enter an event title and start time." : null
  },
  pdf: {
    label: "PDF QR", category: "Files & Media", icon: "📄", desc: "Point to a PDF hosted online.",
    note: "QR codes store a link, not the file itself — host your PDF somewhere public first, then QR-code its URL.",
    fields: [{ key: "url", label: "Public PDF URL", type: "url", required: true }],
    build: (d) => d.url.trim(), validate: (d) => { try { new URL(d.url); return null; } catch { return "Please enter a valid URL."; } }
  },
  image: {
    label: "Image QR", category: "Files & Media", icon: "🖼️", desc: "Point to an image hosted online.",
    note: "QR codes store a link, not the file itself — host your image somewhere public first.",
    fields: [{ key: "url", label: "Public image URL", type: "url", required: true }],
    build: (d) => d.url.trim(), validate: (d) => { try { new URL(d.url); return null; } catch { return "Please enter a valid URL."; } }
  },
  video: {
    label: "Video QR", category: "Files & Media", icon: "🎬", desc: "Point to a video hosted online.",
    note: "QR codes store a link, not the file itself — host your video somewhere public first.",
    fields: [{ key: "url", label: "Public video URL", type: "url", required: true }],
    build: (d) => d.url.trim(), validate: (d) => { try { new URL(d.url); return null; } catch { return "Please enter a valid URL."; } }
  },
  audio: {
    label: "Audio QR", category: "Files & Media", icon: "🎵", desc: "Point to an audio file hosted online.",
    note: "QR codes store a link, not the file itself — host your audio somewhere public first.",
    fields: [{ key: "url", label: "Public audio URL", type: "url", required: true }],
    build: (d) => d.url.trim(), validate: (d) => { try { new URL(d.url); return null; } catch { return "Please enter a valid URL."; } }
  }
};

const QRZUNO_POPULAR = ["url", "wifi", "whatsapp", "upi", "vcard", "instagram", "youtube", "location"];
