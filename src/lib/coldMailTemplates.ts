export const COLD_MAIL_TEMPLATES = [
  {
    id: "intro",
    name: "Quick Intro",
    subject: "Intro — quick hello",
    body:
      "Hi {name},\n\nI hope you're doing well. I'm a software engineer interested in opportunities at {company}. I'd love to connect to learn more about your team and any openings.\n\nBest,\n{yourName}",
  },
  {
    id: "referral",
    name: "Referral Ask",
    subject: "Request for referral at {company}",
    body:
      "Hi {name},\n\nI noticed you're at {company} and I was wondering if you might be willing to refer me for relevant roles. I have experience with X, Y and Z and would appreciate any guidance.\n\nThanks so much,\n{yourName}",
  },
  {
    id: "followup",
    name: "Follow-up",
    subject: "Following up on my previous message",
    body:
      "Hi {name},\n\nJust following up on my message about potential opportunities at {company}. Let me know if you have a moment to chat.\n\nRegards,\n{yourName}",
  },
];

export default COLD_MAIL_TEMPLATES;
