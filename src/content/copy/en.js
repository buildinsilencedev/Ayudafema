// English copy. Shape must mirror `es.js` exactly — the copy-coverage test
// enforces parity.

export const en = {
  partnerName: 'Ayuda Legal PR',
  builtBy: 'Built by La Mano',
  free: 'Free · Nonprofit',
  demo: 'Prototype — demo data',
  back: 'Back',
  disclaimer: 'Independent tool. Not affiliated with FEMA or the federal government.',
  skipToContent: 'Skip to content',
  languageSwitch: 'Switch to Spanish',

  consent: {
    title: 'Save your progress on this device',
    body: 'We can remember where you left off — on this phone, not online. You can clear it anytime.',
    accept: 'That\u2019s fine',
    decline: 'Don\u2019t save',
  },

  errorBoundary: {
    title: 'Something went wrong.',
    body: 'Your progress is saved. You can try again.',
    retry: 'Try again',
  },

  evidence: {
    whyLabel: 'Why?',
    progressLabel: 'evidence items complete',
    items: {
      photo: {
        title: 'A photo of your house',
        desc: 'Exterior and any damage. Phone photos work.',
        why: 'Shows the house exists and you have access to it. FEMA accepts timestamped photos.',
      },
      bill: {
        title: 'A bill with your name and address',
        desc: 'Electric, water, internet, or any recent account.',
        why: "Proves you live there. Doesn't need to be a deed — a bill with your name is enough.",
      },
      'mayor-letter': {
        title: 'Letter from the mayor or community board',
        desc: "If you don't have a bill, a letter from the municipio works.",
        why: 'FEMA accepts official letters from the municipio confirming you live there. We give you the template to request it.',
      },
      'neighbor-affidavit': {
        title: "Neighbor's sworn statement",
        desc: 'A neighbor signs saying you live there. We provide the template.',
        why: "Since 2021, FEMA accepts sworn statements when there's no deed. This is your safety net.",
      },
    },
  },

  landing: {
    eyebrow: 'FEMA appeals',
    headline: 'Did FEMA\ndeny your aid?',
    sub: 'We can help you appeal. Free. In 15 minutes, with one photo of your letter.',
    cta: 'Get started',
    note: 'We read your letter, prepare the appeal, and tell you exactly what to send to FEMA.',
    phoneLabel: 'Rather talk to someone?',
    phone: '1-800-981-5342',
  },

  upload: {
    step: 'Step 1 of 5',
    headline: 'Upload your\ndenial letter',
    sub: 'A photo from your phone is fine. PDF works too.',
    dropTitle: 'Take a photo or upload a file',
    dropSub: 'We read letters in English or Spanish automatically',
    camera: 'Take photo',
    upload: 'Upload file',
    reassure: 'Your documents are private. No one else sees them.',
    demo: 'Use demo letter',
    fileInputLabel: 'Select denial letter',
  },

  processing: {
    headline: 'Reading your letter\u2026',
    sub: 'This takes about 20 seconds.',
    tasks: [
      'Finding the case number',
      'Identifying denial reason',
      'Calculating appeal deadline',
      'Checking what evidence you need',
    ],
  },

  diagnosis: {
    step: 'Step 2 of 5',
    headline: "Here's what\nwe found",
    caseLabel: 'Your case',
    disasterLabel: 'The disaster',
    reasonLabel: 'Reason for denial',
    deadlineLabel: 'Appeal deadline',
    daysLeft: 'days left',
    deadlineDate: 'due',
    overdue: 'Deadline passed',
    reasonPlain: "FEMA says you didn't prove you own the house.",
    reasonContext:
      "This is the most common denial in Puerto Rico. 35% of homes don't have formal title. It's appealable, and FEMA accepts other ways to prove ownership — you don't need a deed.",
    appealableBadge: 'Appealable',
    cta: 'Prepare my appeal',
  },

  evidenceScreen: {
    step: 'Step 3 of 5',
    headline: 'We need\nthese things',
    sub: "For your denial type, this evidence is what convinces FEMA. We'll walk you through each one.",
    optional: 'Optional — but helps',
    addButton: 'Upload',
    done: 'Done',
    template: 'See template',
    cta: 'I have everything',
    skipLater: 'I can upload later',
  },

  draft: {
    step: 'Step 4 of 5',
    headline: 'Your appeal\nis ready',
    sub: 'Reviewed by an Ayuda Legal PR attorney. Ready to send to FEMA.',
    reviewBadge: 'Attorney-reviewed',
    draftBadge: 'Draft',
    previewLabel: 'Letter preview',
    letterAriaLabel: 'Appeal letter draft',
    switchTo: 'Ver en español',
    cta: 'Send to FEMA',
    disclaimer:
      'Appeals are sent in English because FEMA processes English faster. We keep the Spanish version for you.',
  },

  submit: {
    step: 'Step 5 of 5',
    headline: 'Send the appeal\nto FEMA',
    sub: 'Three ways. Pick what works for you.',
    methods: [
      {
        title: 'Online',
        badge: 'Fastest',
        steps: [
          'Go to disasterassistance.gov',
          'Log in to your account',
          'Go to "Correspondence"',
          'Upload the file we give you',
          'Tap "Submit"',
        ],
        cta: 'Download file',
      },
      {
        title: 'By mail',
        badge: 'Paper option',
        steps: [
          'Print the letter and evidence',
          'Put it in an envelope with the label we provide',
          'Mail it before the deadline',
        ],
        cta: 'Download envelope & label',
      },
      {
        title: 'By fax',
        badge: 'Traditional',
        steps: [
          'Use the fax at the nearest Recovery Center',
          'The fax number is in the file we give you',
        ],
        cta: 'See fax numbers',
      },
    ],
    confirm: "I've sent it",
    help: 'Need help? Call us: 1-800-981-5342',
  },

  tracking: {
    step: 'Done',
    headline: 'Sent',
    sub: 'FEMA has 90 days to respond. We text you when there are updates.',
    submittedLabel: 'Submitted',
    expectedLabel: 'Response expected',
    caseLabel: 'Your case number',
    smsLabel: 'SMS reminders',
    nextSteps: "What's next?",
    stepsList: [
      'FEMA reviews the appeal (30–90 days)',
      'If approved, they send the funds',
      "If they need more info, we'll let you know",
      'If denied again, we can prepare a second appeal',
    ],
    another: 'Help someone else',
  },
}
