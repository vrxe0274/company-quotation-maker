App.$ = (id) => document.getElementById(id);

App.clamp = (value, min, max) => Math.min(Math.max(value, min), max);

App.esc = (value = "") => {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[char]));
};

App.nl2br = (value = "") => App.esc(value).replace(/\n/g, "<br>");

App.todayISO = () => new Date().toISOString().slice(0, 10);

App.formatDateShort = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(`${dateString}T00:00:00`);
  return d.toLocaleDateString("en-GB").replaceAll("/", ".");
};

App.generateQuoteCode = () => {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const key   = `vrxe_quote_seq_${year}_${month}`;

  let seq = parseInt(localStorage.getItem(key) || "0", 10) + 1;
  localStorage.setItem(key, String(seq));

  return `QUO-${year}-${month}-${String(seq).padStart(4, "0")}`;
};

App.getValues = () => {
  const data = {};
  App.fields.forEach((id) => {
    data[id] = (App.$(id)?.value || "").trim();
  });
  return data;
};

App.numberToWords = (num) => {
  num = Math.round(Number(num) || 0);
  if (num === 0) return "Zero Pesos Only";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const chunk = (n) => {
    const words = [];
    if (n >= 100) { words.push(ones[Math.floor(n / 100)], "Hundred"); n %= 100; }
    if (n >= 20)  { words.push(tens[Math.floor(n / 10)]); n %= 10; }
    if (n > 0)    words.push(ones[n]);
    return words.join(" ");
  };

  const parts  = [];
  const scales = [[1_000_000_000, "Billion"], [1_000_000, "Million"], [1000, "Thousand"]];
  for (const [value, label] of scales) {
    if (num >= value) {
      parts.push(`${chunk(Math.floor(num / value))} ${label}`);
      num %= value;
    }
  }
  if (num > 0) parts.push(chunk(num));
  return `${parts.join(" ")} Pesos Only`;
};
