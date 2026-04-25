const MEMBER_COLOR_TOKENS = [
  { bg: "bg-[#eef5ff]", text: "text-[#245bdb]", ring: "ring-[#c9dcff]", soft: "bg-[#dbe9ff]" },
  { bg: "bg-[#effaf5]", text: "text-[#13795b]", ring: "ring-[#b7ebd1]", soft: "bg-[#daf5e8]" },
  { bg: "bg-[#fff4ec]", text: "text-[#c26b1a]", ring: "ring-[#ffd8b5]", soft: "bg-[#ffe7d1]" },
  { bg: "bg-[#f4f2ff]", text: "text-[#5b4bb7]", ring: "ring-[#d8d1ff]", soft: "bg-[#e5e0ff]" },
  { bg: "bg-[#fff1f2]", text: "text-[#c73650]", ring: "ring-[#ffc8d3]", soft: "bg-[#ffe1e7]" },
  { bg: "bg-[#eef9fb]", text: "text-[#0f7c90]", ring: "ring-[#bfeaf1]", soft: "bg-[#d5f1f6]" },
  { bg: "bg-[#f7f5ee]", text: "text-[#7a6531]", ring: "ring-[#eadfbe]", soft: "bg-[#efe7cf]" },
  { bg: "bg-[#f2f7f1]", text: "text-[#4d7a42]", ring: "ring-[#cfe5c7]", soft: "bg-[#dcebd7]" },
  { bg: "bg-[#fff6e8]", text: "text-[#b85f00]", ring: "ring-[#ffdca8]", soft: "bg-[#ffe8bf]" },
  { bg: "bg-[#f6f0fb]", text: "text-[#7c3bb2]", ring: "ring-[#e2c9f7]", soft: "bg-[#ecdaf9]" },
  { bg: "bg-[#eef3f8]", text: "text-[#46607c]", ring: "ring-[#c8d7e8]", soft: "bg-[#dbe7f2]" },
  { bg: "bg-[#fff2ee]", text: "text-[#c4513e]", ring: "ring-[#ffcfc5]", soft: "bg-[#ffe0d8]" },
] as const;

function hashString(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function getMemberColorToken(seed: string) {
  const normalizedSeed = seed.trim().toLowerCase();
  const index = hashString(normalizedSeed || "member") % MEMBER_COLOR_TOKENS.length;
  return MEMBER_COLOR_TOKENS[index];
}
