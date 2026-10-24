export interface ModerationResult {
  isViolation: boolean;
  type?: 'phone' | 'email' | 'upi' | 'social' | 'link';
  evidence?: string;
}

export function moderateMessage(text: string): ModerationResult {
  // 1. Phone numbers (including spaces, dashes, and Indian patterns)
  const phoneRegex = /(\+91\s?)?[6-9]\d{9}|(\d{5}\s?\d{5})/;
  if (phoneRegex.test(text)) {
    return { isViolation: true, type: 'phone', evidence: text.match(phoneRegex)?.[0] };
  }

  // 2. Emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (emailRegex.test(text)) {
    return { isViolation: true, type: 'email', evidence: text.match(emailRegex)?.[0] };
  }

  // 3. UPI IDs (name@bank)
  const upiRegex = /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,20}/;
  // Since email and UPI look similar, we only flag UPI if it doesn't look like a common email TLD
  const matchUpi = text.match(upiRegex);
  if (matchUpi) {
    const id = matchUpi[0];
    const commonTlds = ['.com', '.in', '.net', '.org', '.edu', '.gov'];
    if (!commonTlds.some(tld => id.toLowerCase().endsWith(tld))) {
      return { isViolation: true, type: 'upi', evidence: id };
    }
  }

  // 4. Social handles and External links
  const socialRegex = /(@\w+|instagram\.com|whatsapp\.com|t\.me|facebook\.com|twitter\.com)/i;
  if (socialRegex.test(text)) {
    return { isViolation: true, type: 'social', evidence: text.match(socialRegex)?.[0] };
  }

  // 5. Generic URLs
  const urlRegex = /https?:\/\/\\S+/i;
  if (urlRegex.test(text)) {
    return { isViolation: true, type: 'link', evidence: text.match(urlRegex)?.[0] };
  }

  return { isViolation: false };
}
