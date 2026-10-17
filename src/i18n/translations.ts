export type Language = 'en' | 'id';

export interface Translations {
  nav: {
    brandTitle: string;
    brandTagline: string;
    hackathonMvp: string;
    subTitle: string;
    tabTraveler: string;
    tabTravelerSub: string;
    tabPartner: string;
    tabPartnerSub: string;
    tabPhygital: string;
    tabPhygitalSub: string;
    partnersActive: string;
    customSuffix: string;
    geminiActive: string;
    sdkMockReady: string;
    langToggle: string;
  };
  traveler: {
    heroTag: string;
    heroTitle: string;
    heroDesc: string;
    groundedBadge: string;
    gamifiedBadge: string;
    whatsappBadge: string;
    configTitle: string;
    configSubtitle: string;
    labelProfile: string;
    profileOptions: {
      family2kids: string;
      multiGen: string;
      couple: string;
      solo: string;
    };
    labelDuration: string;
    durationOptions: {
      d3: string;
      d5: string;
      d7: string;
    };
    labelPace: string;
    paceOptions: {
      relaxed: string;
      balanced: string;
      active: string;
    };
    labelThemes: string;
    selectTagsHint: string;
    themeOptions: {
      subak: string;
      jamu: string;
      bamboo: string;
      coral: string;
      coffee: string;
      hearth: string;
      fireflies: string;
    };
    labelNotes: string;
    notesPlaceholder: string;
    btnAssemble: string;
    btnAssembling: string;
    whyFitsTitle: string;
    journeySequence: string;
    familyQuest: string;
    verifiedChannel: string;
    btnInquireWa: string;
    pledgeTitle: string;
    emptyTitle: string;
    emptyDesc: string;
    dirBadge: string;
    dirTitle: string;
    dirDesc: string;
    searchPlaceholder: string;
    filterAll: string;
    filterDest: string;
    filterAccom: string;
    filterCul: string;
    filterAct: string;
    verifiedFactsLabel: string;
    defaultMissionLabel: string;
    btnOpenInPartner: string;
    newlyPublished: string;
  };
  partner: {
    heroTag: string;
    heroTitle: string;
    heroDesc: string;
    groundingBadge: string;
    structuredOutputBadge: string;
    oneClickPublishBadge: string;
    formTitle: string;
    formDesc: string;
    sampleSalt: string;
    sampleStay: string;
    sampleCulinary: string;
    labelBusinessName: string;
    placeholderBusinessName: string;
    labelCategory: string;
    categoryDest: string;
    categoryAccom: string;
    categoryCul: string;
    categoryAct: string;
    labelPriceTier: string;
    priceTierAccessible: string;
    priceTierModerate: string;
    priceTierPremium: string;
    priceTierExclusive: string;
    labelLocation: string;
    placeholderLocation: string;
    labelWhatsapp: string;
    labelRawFacts: string;
    rawFactsDesc: string;
    placeholderFact: string;
    btnAddFact: string;
    btnRunAssistant: string;
    btnRunningAssistant: string;
    kitReady: string;
    kitSubtitle: string;
    btnPublish: string;
    publishedSuccessTitle: string;
    publishedSuccessDesc: string;
    btnViewInTraveler: string;
    section1Title: string;
    section1Desc: string;
    section2Title: string;
    section2Desc: string;
    section3Title: string;
    section3Desc: string;
    section4Title: string;
    section4Desc: string;
    groundedStatus: string;
    copyBtn: string;
    copiedBtn: string;
    copyProfileBtn: string;
    copyPostBtn: string;
    emptyTitle: string;
    emptyDesc: string;
    emptySubdesc: string;
  };
  phygital: {
    heroTag: string;
    heroTitle: string;
    heroDesc: string;
    liveQrBadge: string;
    simulatedMobileBadge: string;
    leftHeader: string;
    leftSub: string;
    tabTshirt: string;
    tabPatch: string;
    tshirtTitle: string;
    tshirtTag: string;
    tshirtQuest: string;
    tshirtSlogan: string;
    patchTitle: string;
    patchTag: string;
    patchSub: string;
    tapToScan: string;
    btnScanSim: string;
    btnScanning: string;
    scannedStatus: string;
    preTripTitle: string;
    preTripDesc: string;
    postTripTitle: string;
    postTripDesc: string;
    verifiedBadge: string;
    questsCompleted: string;
    btnShareCard: string;
    badgesTitle: string;
    tapToInspect: string;
    itineraryTitle: string;
    storiesTitle: string;
    returnTitle: string;
    returnDesc: string;
    modalShareTitle: string;
    modalShareDesc: string;
    shareCredentialTag: string;
    completedSubtitle: string;
    btnCopyLink: string;
    btnSaveImage: string;
    linkCopied: string;
    badgeModalVerified: string;
    badgeModalDate: string;
  };
  landing: {
    heroTag: string;
    heroTitle: string;
    heroSlogan: string;
    heroDesc: string;
    travelerDoorTitle: string;
    travelerDoorDesc: string;
    travelerDoorCta: string;
    partnerDoorTitle: string;
    partnerDoorDesc: string;
    partnerDoorCta: string;
    continueAs: string;
    memoryLink: string;
    sampleTravelerName: string;
    samplePartnerName: string;
  };
  signup: {
    travelerTitle: string;
    travelerSubtitle: string;
    labelName: string;
    placeholderName: string;
    labelContact: string;
    placeholderContact: string;
    labelHome: string;
    homeInternational: string;
    labelCity: string;
    labelCountry: string;
    placeholderCity: string;
    placeholderCountry: string;
    btnCreateTraveler: string;
    partnerTitle: string;
    partnerSubtitle: string;
    labelPic: string;
    placeholderPic: string;
    labelBusiness: string;
    placeholderBusiness: string;
    labelBaliRegion: string;
    chooseRegion: string;
    labelArea: string;
    areaNone: string;
    btnCreatePartner: string;
    privacyNote: string;
    previewLabel: string;
    errName: string;
    errContact: string;
    errHome: string;
    errPic: string;
    errBusiness: string;
    errRegion: string;
  };
  sticker: {
    readyTraveler: string;
    readyPartner: string;
    readyDesc: string;
    download: string;
    continueTraveler: string;
    continuePartner: string;
    view: string;
    switchAccount: string;
    welcome: string;
    poweredBy: string;
    strategicPartnerOf: string;
    close: string;
    memoryObjectLabel: string;
  };
  trip: {
    modeWizard: string;
    modeQuick: string;
    stepRegions: string;
    stepCategories: string;
    stepBasket: string;
    stepPlan: string;
    regionsTitle: string;
    regionsDesc: string;
    regionsHint: string;
    selectedCount: string;
    categoriesTitle: string;
    categoriesDesc: string;
    catNature: string;
    catNatureDesc: string;
    catActivities: string;
    catActivitiesDesc: string;
    catAccommodation: string;
    catAccommodationDesc: string;
    catCulinary: string;
    catCulinaryDesc: string;
    basketTitle: string;
    basketDesc: string;
    add: string;
    added: string;
    basketCount: string;
    nearbyTitle: string;
    nearbyDesc: string;
    kmAway: string;
    emptyBasket: string;
    sampleListing: string;
    next: string;
    back: string;
    toPlan: string;
    planTitle: string;
    planDesc: string;
    howManyDays: string;
    dayN: string;
    arrangeAi: string;
    arrangeAgain: string;
    arranging: string;
    statusGrouping: string;
    statusDriving: string;
    statusBalancing: string;
    statusDay: string;
    unplanned: string;
    gridActivity: string;
    freeDay: string;
    onTheRoad: string;
    oneArea: string;
    warnLong: string;
    warnRegions: string;
    warnBoat: string;
    mapTitle: string;
    mapAttribution: string;
    tipsTitle: string;
    startOver: string;
    planReady: string;
    chooseOne: string;
    regionWord: string;
    yourTrip: string;
  };
  stream: {
    liveAi: string;
    offlineDemo: string;
    thinkingTitle: string;
    reasoningTitle: string;
    statusReading: string;
    statusMatching: string;
    statusPacing: string;
    statusTitle: string;
    statusWhy: string;
    statusDay: string;
    statusBadge: string;
    statusPledge: string;
    partnerStepProfile: string;
    partnerStepSocial: string;
    partnerStepMission: string;
    partnerStepAudit: string;
    partnerStatusProfile: string;
    partnerStatusSocial: string;
    partnerStatusMission: string;
    partnerStatusAudit: string;
    partnerStatusStarting: string;
    errorTitle: string;
    retry: string;
    dismiss: string;
    publishLocked: string;
    nameRequired: string;
    factRequired: string;
  };
  footer: {
    brandTitle: string;
    eventTag: string;
    tagline: string;
    groundedEngine: string;
    poweredBy: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      brandTitle: 'Experience More Bali 2027',
      brandTagline: '“Don’t Just Visit. Create More Memories.”',
      hackathonMvp: 'Hackathon MVP',
      subTitle: 'JAPAC AI Builder Cup • AI-Powered Local Tourism Ecosystem',
      tabTraveler: 'Traveler Platform',
      tabTravelerSub: 'AI Experience Finder',
      tabPartner: 'Partner Platform',
      tabPartnerSub: 'AI Profile & Marketing',
      tabPhygital: 'QR Memory Media',
      tabPhygitalSub: 'Phygital Demo',
      partnersActive: 'Partners Active',
      customSuffix: 'custom',
      geminiActive: 'Gemini Active',
      sdkMockReady: 'SDK Mock Ready',
      langToggle: 'Bahasa Indonesia'
    },
    traveler: {
      heroTag: '02 | Traveler Platform • Adventure Builder',
      heroTitle: 'Make the Journey Fun Before It Begins',
      heroDesc:
        'Instead of treating an itinerary as a boring list of bookings, Experience More Bali transforms travel into a collaborative, game-like family adventure. Grounded in verified local partners across Group A (Destination, Accommodation, Culinary).',
      groundedBadge: '100% Grounded in Curated Data',
      gamifiedBadge: 'Gamified Family Missions',
      whatsappBadge: 'Direct WhatsApp Inquiries',
      configTitle: 'AI Adventure Configurator',
      configSubtitle:
        'Set your family composition and pace. Gemini will assemble a grounded adventure.',
      labelProfile: 'Traveler Profile / Family Composition',
      profileOptions: {
        family2kids: 'Family with 2 children (ages 6 & 10)',
        multiGen: 'Multi-generational family (grandparents, parents, teens)',
        couple: 'Eco-conscious couple (mindful & slow travel)',
        solo: 'Solo cultural & culinary seeker'
      },
      labelDuration: 'Duration',
      durationOptions: {
        d3: '3 Days (Weekend Quest)',
        d5: '5 Days (Discovery Trail)',
        d7: '7 Days (Full Grand Tour)'
      },
      labelPace: 'Pace',
      paceOptions: {
        relaxed: 'Relaxed & Mindful',
        balanced: 'Balanced Family',
        active: 'Active Adventure'
      },
      labelThemes: 'Adventure Themes & Interests',
      selectTagsHint: 'Select tags',
      themeOptions: {
        subak: 'Subak Heritage & Canals',
        jamu: 'Traditional Herbal Jamu',
        bamboo: 'Bamboo Eco Lodges',
        coral: 'Coral Reef Conservation',
        coffee: 'Highland Coffee & Waterfalls',
        hearth: 'Wood-fired Ancestral Kitchens',
        fireflies: 'Sacred Forest Fireflies'
      },
      labelNotes: 'Special Wishes or Requests (Optional)',
      notesPlaceholder:
        'e.g. Vegetarian-friendly meals, love hands-on gardening, prefer shaded nature walks...',
      btnAssemble: 'Assemble AI Adventure Game',
      btnAssembling: 'Assembling Grounded Adventure...',
      whyFitsTitle: 'Why This Fits Your Family:',
      journeySequence: 'Mission-Based Journey Sequence',
      familyQuest: 'Family Quest:',
      verifiedChannel: 'Verified Inquiry Channel:',
      btnInquireWa: 'Inquire via WhatsApp',
      pledgeTitle: 'Tri Hita Karana Tourism Pledge',
      emptyTitle: 'Assemble Your Personalized Adventure Game',
      emptyDesc:
        'Select your family preferences on the left and click Assemble AI Adventure Game. Gemini will analyze the verified local Bali partners to build a custom journey with quests and direct WhatsApp connection.',
      dirBadge: 'Group A Core Experience Providers',
      dirTitle: 'Curated Local Partners Master Directory',
      dirDesc:
        'Strictly verified Destination, Accommodation, and Culinary partners. No fake listings.',
      searchPlaceholder: 'Search partner, village, tag...',
      filterAll: 'All',
      filterDest: 'Destination',
      filterAccom: 'Accommodation',
      filterCul: 'Culinary',
      filterAct: 'Activities',
      verifiedFactsLabel: 'Verified Local Facts (Grounded Data):',
      defaultMissionLabel: 'Default Mission',
      btnOpenInPartner: 'Open in AI Partner Marketing Assistant',
      newlyPublished: 'Newly Published'
    },
    partner: {
      heroTag: '03 | Partner Platform • AI Partner Profile & Marketing Assistant',
      heroTitle: 'Grounded AI Profile & Marketing Assistant',
      heroDesc:
        'Enter verified business facts to generate professional storytelling profiles, social media campaign copy, and gamified family missions—powered by Gemini 3.8 Flash with Structured Outputs. Strictly grounded, zero fabricated claims.',
      groundingBadge: 'Strict Anti-Hallucination Grounding',
      structuredOutputBadge: 'Gemini Structured Output',
      oneClickPublishBadge: "One-Click 'Publish to Ecosystem'",
      formTitle: 'Partner Verification Form',
      formDesc: 'Input your authentic local business details & verified facts.',
      sampleSalt: 'Salt Sample',
      sampleStay: 'Stay Sample',
      sampleCulinary: 'Culinary Sample',
      labelBusinessName: '1. Business Name *',
      placeholderBusinessName: 'e.g. Tejakula Artisanal Sea Salt & Black Sand Atelier',
      labelCategory: '2. Category (Group A) *',
      categoryDest: 'Destination (Attraction/Nature)',
      categoryAccom: 'Accommodation (Eco-Stays/Lodges)',
      categoryCul: 'Culinary (Warungs/Heritage Kitchens)',
      categoryAct: 'Activity (Tours/Tubing/Surf/Cycling)',
      labelPriceTier: '3. Price Tier',
      priceTierAccessible: '$ (Accessible / Budget-Friendly)',
      priceTierModerate: '$$ (Moderate / Community Standard)',
      priceTierPremium: '$$$ (Premium Handcrafted)',
      priceTierExclusive: '$$$$ (Exclusive Boutique)',
      labelLocation: '4. Location (Village / Regency) *',
      placeholderLocation: 'e.g. Tejakula Coastal Village, North Bali',
      labelWhatsapp: '5. WhatsApp Inquiry Number',
      labelRawFacts: '6. Raw Verified Facts (Inputs for Grounding)',
      rawFactsDesc:
        'Only state truthful, verifiable details (cooperative structure, materials, traditions). Gemini will ground all marketing copy strictly in these points.',
      placeholderFact: 'e.g. 100% solar-evaporated in hollowed coconut tree trunks...',
      btnAddFact: 'Add Fact',
      btnRunAssistant: 'Run AI Partner Assistant (Grounded Output)',
      btnRunningAssistant: 'Writing your grounded marketing kit...',
      kitReady: 'Marketing Kit Ready',
      kitSubtitle: 'Zero fabricated claims • Audited against verified facts',
      btnPublish: 'Publish to Ecosystem',
      publishedSuccessTitle: 'is now live in the Experience More Bali 2027 Ecosystem!',
      publishedSuccessDesc:
        'Saved to active state and localStorage. Travelers can immediately discover it, search for it, and include it in AI Adventure Itineraries!',
      btnViewInTraveler: 'View in Traveler Platform (View 1)',
      section1Title: 'Polished Experience Profile Description',
      section1Desc: 'Compelling narrative for the traveler platform, strictly grounded in facts',
      section2Title: 'Social Media Promotional Copy',
      section2Desc: 'Instagram / WhatsApp broadcast ready with hooks and hashtags',
      section3Title: 'Gamified Family Mission for Visitors',
      section3Desc: 'Interactive on-site challenge that connects visitors to your local heritage',
      section4Title: 'Grounding Verification Checklist',
      section4Desc: 'Explicit verification mapping each supplied fact to the generated output',
      groundedStatus: '100% Grounded',
      copyBtn: 'Copy',
      copiedBtn: 'Copied',
      copyProfileBtn: 'Copy Profile',
      copyPostBtn: 'Copy Post',
      emptyTitle: 'AI Marketing Assistant Ready',
      emptyDesc:
        'Complete the verification form on the left (or click one of the quick samples: Salt, Stay, or Culinary) and click Run AI Partner Assistant.',
      emptySubdesc:
        'Gemini 3.8 Flash will generate grounded profile descriptions, promotional copy, missions, and a full grounding audit checklist ready to publish!'
    },
    phygital: {
      heroTag: '04 | QR-Linked Memory Media • Phygital Split-Screen Demo',
      heroTitle: 'Physical Keepsake meets Digital Memory',
      heroDesc:
        'Experience how physical items (such as the Adventure T-shirt and Bamboo Passport Patch) connect through a dynamic QR code to the traveler’s live Digital Memory Page—linking pre-trip anticipation, on-trip quest check-ins, and lifelong verified credentials.',
      liveQrBadge: 'Live Clickable QR Scanner on Left',
      simulatedMobileBadge: 'Simulated Mobile Memory View on Right',
      leftHeader: 'Physical Memory Object Mockup',
      leftSub: 'Click the live QR code or button to simulate a smartphone scan.',
      tabTshirt: '👕 Adventure T-Shirt',
      tabPatch: '🏷️ Passport Patch',
      tshirtTitle: 'Official Campaign Keepsake',
      tshirtTag: 'EXPERIENCE MORE BALI',
      tshirtQuest: '2027 QUEST',
      tshirtSlogan: '“Don’t Just Visit. Create More Memories.”',
      patchTitle: 'Official Adventure Passport',
      patchTag: 'BALI EXPLORER 2027',
      patchSub: 'Physical + Digital Living Credential',
      tapToScan: 'TAP TO SCAN QR',
      btnScanSim: 'Simulate Smartphone Camera Scan (or Click QR)',
      btnScanning: 'Scanning QR Patch...',
      scannedStatus: 'Scanned EMB-2027-DHRMWN! Verified Family Passport',
      preTripTitle: 'Pre-Trip Anticipation',
      preTripDesc:
        'Children receive the physical T-shirt before flying to preview challenges & partner facts.',
      postTripTitle: 'Post-Trip Portal',
      postTripDesc:
        'Wearing the T-shirt at home opens permanent memories, photo scrapbooks, and return perks.',
      verifiedBadge: 'VERIFIED',
      questsCompleted: 'Quests Completed:',
      btnShareCard: 'Share Memory Card',
      badgesTitle: 'Unlocked Mission Badges (3)',
      tapToInspect: 'Tap to inspect',
      itineraryTitle: 'Completed Adventure Itinerary',
      storiesTitle: 'Saved Partner Memories & Stories',
      returnTitle: 'Keep Wearing Your 2027 Keepsake!',
      returnDesc:
        'Your QR code remains permanently connected. Scan whenever you are planning your next return to Bali for community harvest invites.',
      modalShareTitle: 'Share Digital Memory Card',
      modalShareDesc:
        'A shareable achievement certificate formatted for Instagram Stories or WhatsApp.',
      shareCredentialTag: 'Experience More Bali 2027 • Official Credential',
      completedSubtitle: 'Completed 3-Day Central & East Bali Living Heritage Quest',
      btnCopyLink: 'Copy Public Story Link',
      btnSaveImage: 'Save Image',
      linkCopied: 'Link Copied!',
      badgeModalVerified: 'Verified Achievement Badge',
      badgeModalDate: 'Date Earned:'
    },
    landing: {
      heroTag: 'KOSSI Adventure · Indonesian Tourism Initiative',
      heroTitle: 'Experience More Bali 2027',
      heroSlogan: 'Don\'t just visit. Create more memories.',
      heroDesc: 'One ecosystem, two doors: travelers plan a Bali adventure in a few taps, and local partners grow with AI.',
      travelerDoorTitle: 'I\'m traveling to Bali',
      travelerDoorDesc: 'Pick the regions and experiences you like — we arrange the days. You get your own family sticker.',
      travelerDoorCta: 'Start my adventure',
      partnerDoorTitle: 'I\'m a local partner',
      partnerDoorDesc: 'Destination, stay, culinary or activity in Bali? Join to reach the right travelers, get AI support and your partner sticker.',
      partnerDoorCta: 'Join as a partner',
      continueAs: 'Continue as {name}',
      memoryLink: 'See memory objects: QR T-shirts & patches',
      sampleTravelerName: 'The Explorer Family',
      samplePartnerName: 'Desa Wisata Penarungan'
    },
    signup: {
      travelerTitle: 'Welcome! Who is traveling?',
      travelerSubtitle: 'Three quick answers and your family sticker is ready.',
      labelName: 'Name, family or group',
      placeholderName: 'e.g. The Roy Family',
      labelContact: 'Email or phone (WhatsApp)',
      placeholderContact: 'you@email.com or +62…',
      labelHome: 'Where are you from?',
      homeInternational: 'Outside Indonesia',
      labelCity: 'City (optional)',
      labelCountry: 'Country',
      placeholderCity: 'e.g. Surabaya',
      placeholderCountry: 'e.g. Australia',
      btnCreateTraveler: 'Create my sticker',
      partnerTitle: 'Join KOSSI Adventure as a partner',
      partnerSubtitle: 'Four quick answers and your partner sticker is ready.',
      labelPic: 'Your name (person in charge)',
      placeholderPic: 'e.g. Made Wirawan',
      labelBusiness: 'Business name',
      placeholderBusiness: 'e.g. Desa Wisata Penarungan',
      labelBaliRegion: 'Where in Bali?',
      chooseRegion: 'Choose your region…',
      labelArea: 'Area (optional)',
      areaNone: 'Whole region',
      btnCreatePartner: 'Create partner sticker',
      privacyNote: 'We use your choices only to personalise your experience and improve local tourism. For now this is saved on this device.',
      previewLabel: 'Live preview',
      errName: 'Please enter your name, family or group.',
      errContact: 'Please enter an email or phone number.',
      errHome: 'Please choose where you are from.',
      errPic: 'Please enter your name.',
      errBusiness: 'Please enter your business name.',
      errRegion: 'Please choose your region in Bali.'
    },
    sticker: {
      readyTraveler: 'Your family sticker is ready!',
      readyPartner: 'Your partner sticker is ready!',
      readyDesc: 'This is your memory object. After you plan your trip, you can print it on T-shirts, hats and bags.',
      download: 'Download sticker',
      continueTraveler: 'Continue to plan my trip',
      continuePartner: 'Continue to partner studio',
      view: 'View sticker',
      switchAccount: 'Switch account',
      welcome: 'Welcome',
      poweredBy: 'Powered by',
      strategicPartnerOf: 'Strategic Partner of',
      close: 'Close',
      memoryObjectLabel: 'Your memory sticker'
    },
    trip: {
      modeWizard: 'Build my trip',
      modeQuick: 'Quick AI plan',
      stepRegions: 'Regions',
      stepCategories: 'Experiences',
      stepBasket: 'Basket',
      stepPlan: 'Plan days',
      regionsTitle: 'Which parts of Bali do you want to visit?',
      regionsDesc: 'Tap the map or the cards — pick as many as you like.',
      regionsHint: 'Not sure? Ubud (Gianyar) and the south (Badung) are easy first picks.',
      selectedCount: '{n} selected',
      categoriesTitle: 'What would you like to experience?',
      categoriesDesc: 'Tap everything that sounds fun.',
      catNature: 'Natural experiences',
      catNatureDesc: 'Beaches, mountains, waterfalls, sunrise & sunset',
      catActivities: 'Activities',
      catActivitiesDesc: 'River tubing, snorkeling, surfing, cycling…',
      catAccommodation: 'Places to stay',
      catAccommodationDesc: 'Homestays, eco-lodges, villas',
      catCulinary: 'Culinary',
      catCulinaryDesc: 'Local kitchens, warungs, cooking classes',
      basketTitle: 'Your adventure basket',
      basketDesc: 'We already picked these for you. Remove anything you don’t want, or add more.',
      add: 'Add',
      added: 'Added',
      basketCount: '{n} in your basket',
      nearbyTitle: 'Close by, just across the border',
      nearbyDesc: 'Not in your regions, but only a short ride away.',
      kmAway: '{km} km away',
      emptyBasket: 'Nothing matches yet — go back and try another region or experience.',
      sampleListing: 'Sample listing',
      next: 'Next',
      back: 'Back',
      toPlan: 'Plan my days',
      planTitle: 'Plan your days',
      planDesc: 'Tap a circle to put an experience on a day — or let AI arrange it all for you.',
      howManyDays: 'How many days?',
      dayN: 'Day {n}',
      arrangeAi: 'Arrange my days with AI',
      arrangeAgain: 'Arrange again with AI',
      arranging: 'Arranging your days…',
      statusGrouping: 'Grouping places that are close together…',
      statusDriving: 'Checking driving times…',
      statusBalancing: 'Balancing each day…',
      statusDay: 'Planning day {n}…',
      unplanned: 'Not on a day yet',
      gridActivity: 'Experience',
      freeDay: 'Free day — rest or explore',
      onTheRoad: '~{time} on the road',
      oneArea: 'All close together',
      warnLong: 'Long travel day — consider moving a stop to another day.',
      warnRegions: 'Crosses {n} regions — expect more time on the road.',
      warnBoat: 'Includes a boat crossing — plan extra time.',
      mapTitle: 'Your trip on the map',
      mapAttribution: 'Region outlines: geoBoundaries (CC BY 4.0). Driving times are estimates.',
      tipsTitle: 'Good to know',
      startOver: 'Start over',
      planReady: 'Your plan is ready',
      chooseOne: 'Choose at least one to continue.',
      regionWord: 'Region',
      yourTrip: 'Your trip'
    },
    stream: {
      liveAi: 'Live AI',
      offlineDemo: 'Offline demo',
      thinkingTitle: 'AI is thinking',
      reasoningTitle: 'How the AI reasoned',
      statusReading: 'Reading verified partner data…',
      statusMatching: 'Matching partners to your interests…',
      statusPacing: 'Balancing pace and travel time…',
      statusTitle: 'Naming your adventure…',
      statusWhy: 'Explaining why it fits your family…',
      statusDay: 'Planning day {n}…',
      statusBadge: 'Choosing your passport badge…',
      statusPledge: 'Writing your sustainability pledge…',
      partnerStepProfile: 'Profile',
      partnerStepSocial: 'Social',
      partnerStepMission: 'Mission',
      partnerStepAudit: 'Fact audit',
      partnerStatusProfile: 'Writing your profile story…',
      partnerStatusSocial: 'Drafting your social post…',
      partnerStatusMission: 'Designing a family mission…',
      partnerStatusAudit: 'Auditing every fact you supplied…',
      partnerStatusStarting: 'Reading your verified facts…',
      errorTitle: 'Generation stopped',
      retry: 'Try again',
      dismiss: 'Dismiss',
      publishLocked: 'Publishing unlocks when the kit is complete',
      nameRequired: 'Please enter a business name.',
      factRequired: 'Please provide at least one verified fact about your business.'
    },
    footer: {
      brandTitle: 'Experience More Bali 2027',
      eventTag: 'JAPAC AI Builder Cup 2026',
      tagline: '“Don’t Just Visit. Create More Memories.”',
      groundedEngine: 'Grounded AI Engine',
      poweredBy: 'Powered by Google Gen AI SDK'
    }
  },
  id: {
    nav: {
      brandTitle: 'Experience More Bali 2027',
      brandTagline: '“Jangan Hanya Berkunjung. Ciptakan Lebih Banyak Kenangan.”',
      hackathonMvp: 'MVP Hackathon',
      subTitle: 'JAPAC AI Builder Cup • Ekosistem Pariwisata Lokal Berbasis AI',
      tabTraveler: 'Platform Wisatawan',
      tabTravelerSub: 'Pencari Pengalaman AI',
      tabPartner: 'Platform Mitra',
      tabPartnerSub: 'Profil & Pemasaran AI',
      tabPhygital: 'Media Kenangan QR',
      tabPhygitalSub: 'Demo Fisik-Digital',
      partnersActive: 'Mitra Aktif',
      customSuffix: 'kustom',
      geminiActive: 'Gemini Aktif',
      sdkMockReady: 'SDK Mock Siap',
      langToggle: 'English'
    },
    traveler: {
      heroTag: '02 | Platform Wisatawan • Pembangun Petualangan',
      heroTitle: 'Jadikan Perjalanan Menyenangkan Sebelum Dimulai',
      heroDesc:
        'Alih-alih menganggap rencana perjalanan sebagai daftar reservasi yang membosankan, Experience More Bali mengubah perjalanan menjadi petualangan keluarga berbasis misi kolaboratif. Berlandaskan mitra lokal terverifikasi di Grup A (Destinasi, Akomodasi, Kuliner).',
      groundedBadge: '100% Terverifikasi Data Kurasi',
      gamifiedBadge: 'Misi Petualangan Keluarga',
      whatsappBadge: 'Inkuiri Langsung WhatsApp',
      configTitle: 'Konfigurator Petualangan AI',
      configSubtitle:
        'Atur profil keluarga dan ritme perjalanan Anda. Gemini akan menyusun petualangan terverifikasi.',
      labelProfile: 'Profil Wisatawan / Komposisi Keluarga',
      profileOptions: {
        family2kids: 'Keluarga dengan 2 anak (usia 6 & 10 tahun)',
        multiGen: 'Keluarga multi-generasi (kakek-nenek, orang tua, remaja)',
        couple: 'Pasangan sadar lingkungan (wisata lambat & bermakna)',
        solo: 'Penjelajah solo budaya & kuliner'
      },
      labelDuration: 'Durasi',
      durationOptions: {
        d3: '3 Hari (Petualangan Akhir Pekan)',
        d5: '5 Hari (Jejak Penemuan)',
        d7: '7 Hari (Tur Akbar Lengkap)'
      },
      labelPace: 'Ritme Perjalanan',
      paceOptions: {
        relaxed: 'Santai & Penuh Makna',
        balanced: 'Keluarga Seimbang',
        active: 'Petualangan Aktif'
      },
      labelThemes: 'Tema & Minat Petualangan',
      selectTagsHint: 'Pilih tagar',
      themeOptions: {
        subak: 'Warisan Subak & Saluran Air',
        jamu: 'Jamu Tradisional & Herbal',
        bamboo: 'Pondok Bambu Ekologis',
        coral: 'Konservasi Terumbu Karang',
        coffee: 'Kopi Dataran Tinggi & Air Terjun',
        hearth: 'Dapur Kayu Bakar Leluhur',
        fireflies: 'Kunang-kunang Hutan Sakral'
      },
      labelNotes: 'Keinginan atau Permintaan Khusus (Opsional)',
      notesPlaceholder:
        'contoh: Menu ramah vegetarian, suka berkebun bersama anak, jalan santai teduh...',
      btnAssemble: 'Susun Petualangan Game AI',
      btnAssembling: 'Menyusun Petualangan Terverifikasi...',
      whyFitsTitle: 'Mengapa Ini Cocok untuk Keluarga Anda:',
      journeySequence: 'Rangkaian Perjalanan Berbasis Misi',
      familyQuest: 'Misi Keluarga:',
      verifiedChannel: 'Kanal Inkuiri Terverifikasi:',
      btnInquireWa: 'Inkuiri via WhatsApp',
      pledgeTitle: 'Janji Pariwisata Tri Hita Karana',
      emptyTitle: 'Susun Petualangan Game Personal Anda',
      emptyDesc:
        'Pilih preferensi keluarga Anda di sebelah kiri dan klik Susun Petualangan Game AI. Gemini akan menganalisis mitra lokal Bali terverifikasi untuk menyusun perjalanan khusus beserta misi dan koneksi WhatsApp langsung.',
      dirBadge: 'Penyedia Pengalaman Inti Grup A',
      dirTitle: 'Direktori Utama Mitra Lokal Terkurasi',
      dirDesc:
        'Mitra Destinasi, Akomodasi, dan Kuliner yang diverifikasi secara ketat. Bebas data palsu.',
      searchPlaceholder: 'Cari mitra, desa, tagar...',
      filterAll: 'Semua',
      filterDest: 'Destinasi',
      filterAccom: 'Akomodasi',
      filterCul: 'Kuliner',
      filterAct: 'Aktivitas',
      verifiedFactsLabel: 'Fakta Lokal Terverifikasi (Data Kurasi):',
      defaultMissionLabel: 'Misi Utama',
      btnOpenInPartner: 'Buka di Asisten Pemasaran AI Mitra',
      newlyPublished: 'Baru Dipublikasikan'
    },
    partner: {
      heroTag: '03 | Platform Mitra • Profil & Asisten Pemasaran AI',
      heroTitle: 'Asisten Profil & Pemasaran AI Terverifikasi',
      heroDesc:
        'Masukkan fakta bisnis terverifikasi untuk menghasilkan profil naratif profesional, salinan kampanye media sosial, dan misi keluarga—didukung oleh Gemini 3.8 Flash dengan Output Terstruktur. Strictly grounded, bebas klaim palsu.',
      groundingBadge: 'Bebas Halusinasi & Terverifikasi',
      structuredOutputBadge: 'Output Terstruktur Gemini',
      oneClickPublishBadge: "Satu Klik 'Publikasikan ke Ekosistem'",
      formTitle: 'Formulir Verifikasi Mitra',
      formDesc: 'Masukkan detail bisnis lokal autentik & fakta terverifikasi Anda.',
      sampleSalt: 'Contoh Garam',
      sampleStay: 'Contoh Pondok',
      sampleCulinary: 'Contoh Kuliner',
      labelBusinessName: '1. Nama Bisnis *',
      placeholderBusinessName: 'contoh: Atelier Garam Laut Tradisional & Pasir Hitam Tejakula',
      labelCategory: '2. Kategori (Grup A) *',
      categoryDest: 'Destinasi (Atraksi/Alam)',
      categoryAccom: 'Akomodasi (Pondok Eko/Lodge)',
      categoryCul: 'Kuliner (Warung/Dapur Leluhur)',
      categoryAct: 'Aktivitas (Tur/Tubing/Selancar/Bersepeda)',
      labelPriceTier: '3. Kisaran Harga',
      priceTierAccessible: '$ (Terjangkau / Ramah Anggaran)',
      priceTierModerate: '$$ (Menengah / Standar Komunitas)',
      priceTierPremium: '$$$ (Premium Kerajinan Tangan)',
      priceTierExclusive: '$$$$ (Boutique Eksklusif)',
      labelLocation: '4. Lokasi (Desa / Kabupaten) *',
      placeholderLocation: 'contoh: Desa Pesisir Tejakula, Buleleng, Bali Utara',
      labelWhatsapp: '5. Nomor Inkuiri WhatsApp',
      labelRawFacts: '6. Fakta Terverifikasi Mentah (Bahan Verifikasi)',
      rawFactsDesc:
        'Hanya cantumkan fakta nyata yang dapat diverifikasi (koperasi, bahan lokal, tradisi). Gemini akan mendasarkan semua salinan pemasaran strictly pada poin-poin ini.',
      placeholderFact: 'contoh: 100% kristalisasi matahari di palung batang kelapa...',
      btnAddFact: 'Tambah Fakta',
      btnRunAssistant: 'Jalankan Asisten AI Mitra (Output Terverifikasi)',
      btnRunningAssistant: 'Menulis materi pemasaran terverifikasi...',
      kitReady: 'Materi Pemasaran Siap',
      kitSubtitle: 'Bebas klaim palsu • Diaudit berdasarkan fakta terverifikasi',
      btnPublish: 'Publikasikan ke Ekosistem',
      publishedSuccessTitle: 'kini resmi aktif di Ekosistem Experience More Bali 2027!',
      publishedSuccessDesc:
        'Tersimpan ke state aktif dan localStorage. Wisatawan dapat langsung menemukannya, mencarinya, dan memasukkannya ke Rencana Petualangan AI!',
      btnViewInTraveler: 'Lihat di Platform Wisatawan (Tampilan 1)',
      section1Title: 'Deskripsi Profil Pengalaman Terpoles',
      section1Desc: 'Narasi memikat untuk platform wisatawan, strictly berdasarkan fakta',
      section2Title: 'Salinan Promosi Media Sosial',
      section2Desc: 'Siap siar di Instagram / WhatsApp dengan hook dan tagar',
      section3Title: 'Misi Keluarga Berbasis Game untuk Pengunjung',
      section3Desc: 'Tantangan interaktif langsung di lokasi yang menghubungkan pengunjung dengan kearifan lokal',
      section4Title: 'Daftar Periksa Verifikasi Fakta',
      section4Desc: 'Verifikasi eksplisit memetakan setiap fakta mentah ke materi hasil olahan',
      groundedStatus: '100% Terverifikasi',
      copyBtn: 'Salin',
      copiedBtn: 'Tersalin',
      copyProfileBtn: 'Salin Profil',
      copyPostBtn: 'Salin Unggahan',
      emptyTitle: 'Asisten Pemasaran AI Siap',
      emptyDesc:
        'Lengkapi formulir verifikasi di sebelah kiri (atau klik salah satu sampel cepat: Garam, Pondok, atau Kuliner) lalu klik Jalankan Asisten AI Mitra.',
      emptySubdesc:
        'Gemini 3.8 Flash akan menghasilkan deskripsi profil terverifikasi, salinan promosi, misi, dan daftar periksa audit fakta yang siap dipublikasikan!'
    },
    phygital: {
      heroTag: '04 | Media Kenangan QR • Demo Layar-Pisah Fisik-Digital',
      heroTitle: 'Cendera Mata Fisik bertemu Kenangan Digital',
      heroDesc:
        'Rasakan bagaimana cendera mata fisik (seperti Kaos Petualangan dan Tambalan Paspor Bambu) terhubung lewat kode QR dinamis ke Halaman Kenangan Digital wisatawan—menghubungkan antisipasi sebelum berangkat, misi di lokasi, dan lencana terverifikasi selamanya.',
      liveQrBadge: 'Pemindai QR Aktif di Kiri',
      simulatedMobileBadge: 'Simulasi Layar Ponsel di Kanan',
      leftHeader: 'Mockup Benda Kenangan Fisik',
      leftSub: 'Klik kode QR aktif atau tombol untuk menyimulasikan pemindaian kamera ponsel.',
      tabTshirt: '👕 Kaos Petualangan',
      tabPatch: '🏷️ Tambalan Paspor',
      tshirtTitle: 'Cendera Mata Kampanye Resmi',
      tshirtTag: 'EXPERIENCE MORE BALI',
      tshirtQuest: 'PETUALANGAN 2027',
      tshirtSlogan: '“Jangan Hanya Berkunjung. Ciptakan Lebih Banyak Kenangan.”',
      patchTitle: 'Paspor Petualangan Resmi',
      patchTag: 'PENJELAJAH BALI 2027',
      patchSub: 'Kredensial Hidup Fisik + Digital',
      tapToScan: 'KETUK UNTUK PINDAI QR',
      btnScanSim: 'Simulasikan Pemindaian Ponsel (atau Klik QR)',
      btnScanning: 'Memindai Tambalan QR...',
      scannedStatus: 'Terpindai EMB-2027-DHRMWN! Paspor Keluarga Terverifikasi',
      preTripTitle: 'Antisipasi Sebelum Berangkat',
      preTripDesc:
        'Anak-anak menerima kaos fisik sebelum terbang untuk melihat pratinjau tantangan & fakta mitra.',
      postTripTitle: 'Portal Setelah Perjalanan',
      postTripDesc:
        'Mengenakan kaos di rumah membuka kembali kenangan abadi, album foto, dan manfaat kunjungan kembali.',
      verifiedBadge: 'TERVERIFIKASI',
      questsCompleted: 'Misi Selesai:',
      btnShareCard: 'Bagikan Kartu Kenangan',
      badgesTitle: 'Lencana Misi yang Terbuka (3)',
      tapToInspect: 'Ketuk untuk memeriksa',
      itineraryTitle: 'Rencana Petualangan yang Telah Selesai',
      storiesTitle: 'Kenangan & Cerita Mitra Tersimpan',
      returnTitle: 'Tetap Kenakan Cendera Mata 2027 Anda!',
      returnDesc:
        'Kode QR Anda tetap terhubung selamanya. Pindai kapan saja saat Anda merencanakan kunjungan kembali ke Bali untuk undangan panen desa.',
      modalShareTitle: 'Bagikan Kartu Kenangan Digital',
      modalShareDesc:
        'Sertifikat pencapaian yang diformat khusus untuk Instagram Stories atau WhatsApp.',
      shareCredentialTag: 'Experience More Bali 2027 • Kredensial Resmi',
      completedSubtitle: 'Menyelesaikan Petualangan 3 Hari Warisan Hidup Bali Tengah & Timur',
      btnCopyLink: 'Salin Tautan Cerita Publik',
      btnSaveImage: 'Simpan Gambar',
      linkCopied: 'Tautan Tersalin!',
      badgeModalVerified: 'Lencana Pencapaian Terverifikasi',
      badgeModalDate: 'Tanggal Diperoleh:'
    },
    landing: {
      heroTag: 'KOSSI Adventure · Indonesian Tourism Initiative',
      heroTitle: 'Experience More Bali 2027',
      heroSlogan: 'Jangan hanya berkunjung. Ciptakan lebih banyak kenangan.',
      heroDesc: 'Satu ekosistem, dua pintu: wisatawan merencanakan petualangan di Bali dengan beberapa ketukan, dan mitra lokal tumbuh bersama AI.',
      travelerDoorTitle: 'Saya akan berlibur ke Bali',
      travelerDoorDesc: 'Pilih wilayah dan pengalaman yang Anda suka — kami yang mengatur harinya. Anda juga mendapat stiker keluarga sendiri.',
      travelerDoorCta: 'Mulai petualangan saya',
      partnerDoorTitle: 'Saya mitra lokal',
      partnerDoorDesc: 'Destinasi, penginapan, kuliner, atau aktivitas di Bali? Bergabunglah untuk menjangkau wisatawan yang tepat, dapatkan dukungan AI dan stiker mitra Anda.',
      partnerDoorCta: 'Bergabung sebagai mitra',
      continueAs: 'Lanjut sebagai {name}',
      memoryLink: 'Lihat objek kenangan: kaos & patch QR',
      sampleTravelerName: 'Keluarga Penjelajah',
      samplePartnerName: 'Desa Wisata Penarungan'
    },
    signup: {
      travelerTitle: 'Selamat datang! Siapa yang berlibur?',
      travelerSubtitle: 'Tiga jawaban singkat dan stiker keluarga Anda siap.',
      labelName: 'Nama, keluarga, atau grup',
      placeholderName: 'mis. Keluarga Wijaya',
      labelContact: 'Email atau telepon (WhatsApp)',
      placeholderContact: 'anda@email.com atau +62…',
      labelHome: 'Anda berasal dari mana?',
      homeInternational: 'Luar Indonesia',
      labelCity: 'Kota (opsional)',
      labelCountry: 'Negara',
      placeholderCity: 'mis. Surabaya',
      placeholderCountry: 'mis. Australia',
      btnCreateTraveler: 'Buat stiker saya',
      partnerTitle: 'Bergabung dengan KOSSI Adventure sebagai mitra',
      partnerSubtitle: 'Empat jawaban singkat dan stiker mitra Anda siap.',
      labelPic: 'Nama Anda (penanggung jawab)',
      placeholderPic: 'mis. Made Wirawan',
      labelBusiness: 'Nama usaha',
      placeholderBusiness: 'mis. Desa Wisata Penarungan',
      labelBaliRegion: 'Di mana di Bali?',
      chooseRegion: 'Pilih wilayah Anda…',
      labelArea: 'Area (opsional)',
      areaNone: 'Seluruh wilayah',
      btnCreatePartner: 'Buat stiker mitra',
      privacyNote: 'Kami menggunakan pilihan Anda hanya untuk menyesuaikan pengalaman dan meningkatkan pariwisata lokal. Untuk saat ini disimpan di perangkat ini.',
      previewLabel: 'Pratinjau langsung',
      errName: 'Silakan masukkan nama, keluarga, atau grup Anda.',
      errContact: 'Silakan masukkan email atau nomor telepon.',
      errHome: 'Silakan pilih asal Anda.',
      errPic: 'Silakan masukkan nama Anda.',
      errBusiness: 'Silakan masukkan nama usaha Anda.',
      errRegion: 'Silakan pilih wilayah Anda di Bali.'
    },
    sticker: {
      readyTraveler: 'Stiker keluarga Anda siap!',
      readyPartner: 'Stiker mitra Anda siap!',
      readyDesc: 'Ini objek kenangan Anda. Setelah merencanakan perjalanan, Anda bisa mencetaknya di kaos, topi, dan tas.',
      download: 'Unduh stiker',
      continueTraveler: 'Lanjut merencanakan perjalanan',
      continuePartner: 'Lanjut ke studio mitra',
      view: 'Lihat stiker',
      switchAccount: 'Ganti akun',
      welcome: 'Selamat datang',
      poweredBy: 'Didukung oleh',
      strategicPartnerOf: 'Mitra Strategis',
      close: 'Tutup',
      memoryObjectLabel: 'Stiker kenangan Anda'
    },
    trip: {
      modeWizard: 'Susun perjalanan saya',
      modeQuick: 'Rencana AI cepat',
      stepRegions: 'Wilayah',
      stepCategories: 'Pengalaman',
      stepBasket: 'Keranjang',
      stepPlan: 'Atur hari',
      regionsTitle: 'Bagian Bali mana yang ingin Anda kunjungi?',
      regionsDesc: 'Ketuk peta atau kartu — pilih sebanyak yang Anda mau.',
      regionsHint: 'Belum yakin? Ubud (Gianyar) dan selatan (Badung) pilihan awal yang mudah.',
      selectedCount: '{n} dipilih',
      categoriesTitle: 'Pengalaman apa yang ingin Anda rasakan?',
      categoriesDesc: 'Ketuk semua yang terdengar seru.',
      catNature: 'Pengalaman alam',
      catNatureDesc: 'Pantai, gunung, air terjun, matahari terbit & terbenam',
      catActivities: 'Aktivitas',
      catActivitiesDesc: 'Tubing sungai, snorkeling, selancar, bersepeda…',
      catAccommodation: 'Tempat menginap',
      catAccommodationDesc: 'Homestay, eco-lodge, vila',
      catCulinary: 'Kuliner',
      catCulinaryDesc: 'Dapur lokal, warung, kelas memasak',
      basketTitle: 'Keranjang petualangan Anda',
      basketDesc: 'Kami sudah memilihkan ini. Hapus yang tidak Anda inginkan, atau tambahkan lagi.',
      add: 'Tambah',
      added: 'Ditambahkan',
      basketCount: '{n} di keranjang Anda',
      nearbyTitle: 'Dekat, tepat di seberang perbatasan',
      nearbyDesc: 'Bukan di wilayah pilihan Anda, tapi hanya sebentar perjalanan.',
      kmAway: '{km} km',
      emptyBasket: 'Belum ada yang cocok — kembali dan coba wilayah atau pengalaman lain.',
      sampleListing: 'Contoh listing',
      next: 'Lanjut',
      back: 'Kembali',
      toPlan: 'Atur hari saya',
      planTitle: 'Atur hari Anda',
      planDesc: 'Ketuk lingkaran untuk menaruh pengalaman di suatu hari — atau biarkan AI mengatur semuanya.',
      howManyDays: 'Berapa hari?',
      dayN: 'Hari {n}',
      arrangeAi: 'Atur hari saya dengan AI',
      arrangeAgain: 'Atur ulang dengan AI',
      arranging: 'Mengatur hari Anda…',
      statusGrouping: 'Mengelompokkan tempat yang berdekatan…',
      statusDriving: 'Memeriksa waktu tempuh…',
      statusBalancing: 'Menyeimbangkan setiap hari…',
      statusDay: 'Merencanakan hari ke-{n}…',
      unplanned: 'Belum ada di hari mana pun',
      gridActivity: 'Pengalaman',
      freeDay: 'Hari bebas — istirahat atau jelajah',
      onTheRoad: '~{time} di perjalanan',
      oneArea: 'Semua berdekatan',
      warnLong: 'Hari perjalanan panjang — pertimbangkan memindahkan satu tempat ke hari lain.',
      warnRegions: 'Melintasi {n} wilayah — perjalanan akan lebih lama.',
      warnBoat: 'Termasuk penyeberangan perahu — sediakan waktu ekstra.',
      mapTitle: 'Perjalanan Anda di peta',
      mapAttribution: 'Batas wilayah: geoBoundaries (CC BY 4.0). Waktu tempuh adalah perkiraan.',
      tipsTitle: 'Perlu diketahui',
      startOver: 'Mulai ulang',
      planReady: 'Rencana Anda siap',
      chooseOne: 'Pilih setidaknya satu untuk melanjutkan.',
      regionWord: 'Wilayah',
      yourTrip: 'Perjalanan Anda'
    },
    stream: {
      liveAi: 'AI Langsung',
      offlineDemo: 'Demo offline',
      thinkingTitle: 'AI sedang berpikir',
      reasoningTitle: 'Cara AI bernalar',
      statusReading: 'Membaca data mitra terverifikasi…',
      statusMatching: 'Mencocokkan mitra dengan minat Anda…',
      statusPacing: 'Menyeimbangkan ritme dan waktu perjalanan…',
      statusTitle: 'Memberi nama petualangan Anda…',
      statusWhy: 'Menjelaskan kecocokan untuk keluarga Anda…',
      statusDay: 'Merencanakan hari ke-{n}…',
      statusBadge: 'Memilih lencana paspor Anda…',
      statusPledge: 'Menulis janji keberlanjutan…',
      partnerStepProfile: 'Profil',
      partnerStepSocial: 'Sosial',
      partnerStepMission: 'Misi',
      partnerStepAudit: 'Audit fakta',
      partnerStatusProfile: 'Menulis kisah profil Anda…',
      partnerStatusSocial: 'Menyusun postingan media sosial…',
      partnerStatusMission: 'Merancang misi keluarga…',
      partnerStatusAudit: 'Mengaudit setiap fakta yang Anda berikan…',
      partnerStatusStarting: 'Membaca fakta terverifikasi Anda…',
      errorTitle: 'Pembuatan terhenti',
      retry: 'Coba lagi',
      dismiss: 'Tutup',
      publishLocked: 'Publikasi terbuka setelah materi selesai',
      nameRequired: 'Silakan masukkan nama bisnis.',
      factRequired: 'Harap sertakan setidaknya satu fakta terverifikasi tentang bisnis Anda.'
    },
    footer: {
      brandTitle: 'Experience More Bali 2027',
      eventTag: 'JAPAC AI Builder Cup 2026',
      tagline: '“Jangan Hanya Berkunjung. Ciptakan Lebih Banyak Kenangan.”',
      groundedEngine: 'Mesin AI Terverifikasi',
      poweredBy: 'Didukung oleh Google Gen AI SDK'
    }
  }
};
