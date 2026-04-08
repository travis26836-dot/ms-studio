/**
 * Invitation Templates (continued) + Certificate Templates
 * Completes the 105+ template expansion
 */

function T(text, opts) {
  return {
    type: "textbox", version: "6.6.1", originX: "left", originY: "top",
    left: opts.left || 0, top: opts.top || 0, width: opts.width || 300, height: opts.height || 50,
    fill: opts.fill || "#000000", stroke: null, strokeWidth: 0,
    fontSize: opts.fontSize || 32, fontWeight: opts.fontWeight || "normal",
    fontFamily: opts.fontFamily || "Inter", fontStyle: opts.fontStyle || "normal",
    textAlign: opts.textAlign || "left", text, underline: opts.underline || false,
    linethrough: false, charSpacing: opts.charSpacing || 0, lineHeight: opts.lineHeight || 1.2,
    opacity: opts.opacity || 1, angle: 0, scaleX: 1, scaleY: 1,
  };
}

function R(opts) {
  return {
    type: "rect", version: "6.6.1", originX: "left", originY: "top",
    left: opts.left || 0, top: opts.top || 0, width: opts.width || 100, height: opts.height || 100,
    fill: opts.fill || "#6366f1", stroke: opts.stroke || null, strokeWidth: opts.strokeWidth || 0,
    rx: opts.rx || 0, ry: opts.ry || 0, opacity: opts.opacity || 1, angle: opts.angle || 0,
    scaleX: 1, scaleY: 1,
  };
}

function C(opts) {
  return {
    type: "circle", version: "6.6.1", originX: "left", originY: "top",
    left: opts.left || 0, top: opts.top || 0, radius: opts.radius || 50,
    fill: opts.fill || "#6366f1", stroke: opts.stroke || null, strokeWidth: opts.strokeWidth || 0,
    opacity: opts.opacity || 1, angle: 0, scaleX: 1, scaleY: 1,
  };
}

export const moreInvitations = [
  // 9. Holiday Party
  {
    name: "Holiday Party Invitation", description: "Festive holiday party invitation with green and gold",
    category: "invitation", subcategory: "holiday",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "holiday", "christmas", "festive", "party"],
    canvasData: { version: "6.6.1", background: "#14532d", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#14532d" }),
      C({ left: 100, top: 100, radius: 100, fill: "#fbbf24", opacity: 0.15 }),
      C({ left: 1700, top: 200, radius: 80, fill: "#fbbf24", opacity: 0.1 }),
      T("✨", { left: 900, top: 200, width: 300, fontSize: 80, textAlign: "center" }),
      T("HOLIDAY", { left: 200, top: 380, width: 1700, fontSize: 80, fontWeight: "bold", fill: "#fbbf24", textAlign: "center", fontFamily: "Playfair Display" }),
      T("CELEBRATION", { left: 200, top: 490, width: 1700, fontSize: 48, fill: "#86efac", textAlign: "center", fontFamily: "Montserrat", charSpacing: 200 }),
      R({ left: 900, top: 590, width: 300, height: 2, fill: "#fbbf24" }),
      T("Join us for an evening of\njoy, laughter, and holiday cheer", { left: 200, top: 650, width: 1700, fontSize: 24, fill: "#bbf7d0", textAlign: "center", fontFamily: "Inter", lineHeight: 1.5 }),
      T("Friday, December 18, 2026\n7:00 PM\nThe Winter Lodge\n100 Pine Street", { left: 200, top: 800, width: 1700, fontSize: 26, fill: "#ffffff", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
      T("Cocktail Attire  ·  Ugly Sweaters Welcome!", { left: 200, top: 1020, width: 1700, fontSize: 20, fill: "#fbbf24", textAlign: "center", fontFamily: "Inter", fontStyle: "italic" }),
      T("RSVP by Dec 10", { left: 200, top: 1100, width: 1700, fontSize: 18, fill: "#86efac", textAlign: "center", fontFamily: "Inter" }),
    ]},
  },
  // 10. Housewarming
  {
    name: "Housewarming Party", description: "Warm and welcoming housewarming invitation",
    category: "invitation", subcategory: "housewarming",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "housewarming", "home", "party", "warm"],
    canvasData: { version: "6.6.1", background: "#fef7ed", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#fef7ed" }),
      T("🏡", { left: 900, top: 250, width: 300, fontSize: 80, textAlign: "center" }),
      T("HOME SWEET HOME", { left: 200, top: 430, width: 1700, fontSize: 20, fill: "#c2410c", textAlign: "center", fontFamily: "Inter", charSpacing: 400 }),
      T("Housewarming\nParty", { left: 200, top: 500, width: 1700, fontSize: 64, fontWeight: "bold", fill: "#7c2d12", textAlign: "center", fontFamily: "Playfair Display", lineHeight: 1.2 }),
      R({ left: 900, top: 700, width: 300, height: 2, fill: "#c2410c" }),
      T("The Johnsons have a new home\nand would love to show it off!", { left: 200, top: 760, width: 1700, fontSize: 24, fill: "#9a3412", textAlign: "center", fontFamily: "Inter", lineHeight: 1.5 }),
      T("Saturday, April 5, 2026\n3:00 PM - 7:00 PM\n456 New Home Avenue\nAnytown, USA", { left: 200, top: 900, width: 1700, fontSize: 26, fill: "#7c2d12", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
      T("No gifts necessary — your presence is our present!", { left: 200, top: 1120, width: 1700, fontSize: 20, fill: "#c2410c", textAlign: "center", fontFamily: "Inter", fontStyle: "italic" }),
    ]},
  },
  // 11. Engagement Party
  {
    name: "Engagement Party", description: "Romantic engagement party invitation",
    category: "invitation", subcategory: "engagement",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "engagement", "romantic", "love", "party"],
    canvasData: { version: "6.6.1", background: "#fdf2f8", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#fdf2f8" }),
      C({ left: 800, top: 150, radius: 200, fill: "#ec4899", opacity: 0.08 }),
      T("💍", { left: 900, top: 250, width: 300, fontSize: 80, textAlign: "center" }),
      T("SHE SAID YES!", { left: 200, top: 430, width: 1700, fontSize: 20, fill: "#ec4899", textAlign: "center", fontFamily: "Inter", charSpacing: 400 }),
      T("Sarah & James", { left: 200, top: 500, width: 1700, fontSize: 72, fill: "#831843", textAlign: "center", fontFamily: "Playfair Display", fontStyle: "italic" }),
      T("are engaged!", { left: 200, top: 610, width: 1700, fontSize: 32, fill: "#be185d", textAlign: "center", fontFamily: "Inter", fontStyle: "italic" }),
      R({ left: 900, top: 700, width: 300, height: 2, fill: "#ec4899" }),
      T("Please join us for an\nEngagement Celebration", { left: 200, top: 760, width: 1700, fontSize: 26, fill: "#831843", textAlign: "center", fontFamily: "Inter", lineHeight: 1.5 }),
      T("Saturday, March 22, 2026\n6:00 PM\nRooftop Terrace\nDowntown Hotel", { left: 200, top: 880, width: 1700, fontSize: 26, fill: "#9d174d", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
      T("RSVP by March 10", { left: 200, top: 1100, width: 1700, fontSize: 18, fill: "#ec4899", textAlign: "center", fontFamily: "Inter" }),
    ]},
  },
  // 12. Retirement Party
  {
    name: "Retirement Celebration", description: "Elegant retirement party invitation",
    category: "invitation", subcategory: "retirement",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "retirement", "celebration", "career", "elegant"],
    canvasData: { version: "6.6.1", background: "#1e293b", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#1e293b" }),
      T("CHEERS TO", { left: 200, top: 400, width: 1700, fontSize: 24, fill: "#94a3b8", textAlign: "center", fontFamily: "Inter", charSpacing: 300 }),
      T("30 YEARS", { left: 200, top: 470, width: 1700, fontSize: 100, fontWeight: "bold", fill: "#fbbf24", textAlign: "center", fontFamily: "Montserrat" }),
      T("of Excellence", { left: 200, top: 610, width: 1700, fontSize: 36, fill: "#94a3b8", textAlign: "center", fontFamily: "Playfair Display", fontStyle: "italic" }),
      R({ left: 900, top: 710, width: 300, height: 2, fill: "#fbbf24" }),
      T("Please join us in honoring", { left: 200, top: 770, width: 1700, fontSize: 22, fill: "#94a3b8", textAlign: "center", fontFamily: "Inter" }),
      T("ROBERT MITCHELL", { left: 200, top: 830, width: 1700, fontSize: 42, fontWeight: "bold", fill: "#ffffff", textAlign: "center", fontFamily: "Montserrat" }),
      T("on his retirement from\nGlobal Industries", { left: 200, top: 910, width: 1700, fontSize: 24, fill: "#94a3b8", textAlign: "center", fontFamily: "Inter", lineHeight: 1.5 }),
      T("Friday, April 18, 2026\n6:30 PM\nThe Country Club", { left: 200, top: 1040, width: 1700, fontSize: 26, fill: "#e2e8f0", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
    ]},
  },
  // 13. Dinner Party
  {
    name: "Dinner Party Invitation", description: "Sophisticated dinner party invitation",
    category: "invitation", subcategory: "dinner",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "dinner", "party", "sophisticated", "evening"],
    canvasData: { version: "6.6.1", background: "#0c0a09", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#0c0a09" }),
      R({ left: 80, top: 80, width: 1940, height: 2640, fill: "transparent", stroke: "#a16207", strokeWidth: 1 }),
      T("YOU'RE INVITED TO", { left: 200, top: 400, width: 1700, fontSize: 18, fill: "#a16207", textAlign: "center", fontFamily: "Inter", charSpacing: 400 }),
      T("An Intimate\nDinner Party", { left: 200, top: 470, width: 1700, fontSize: 64, fill: "#fef3c7", textAlign: "center", fontFamily: "Playfair Display", fontStyle: "italic", lineHeight: 1.2 }),
      R({ left: 900, top: 680, width: 300, height: 2, fill: "#a16207" }),
      T("Hosted by Michael & Elena", { left: 200, top: 740, width: 1700, fontSize: 24, fill: "#d97706", textAlign: "center", fontFamily: "Inter" }),
      T("Saturday, February 14, 2026\nSeven O'Clock\n22 Vineyard Lane", { left: 200, top: 830, width: 1700, fontSize: 26, fill: "#fef3c7", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
      T("Four courses  ·  Wine pairing  ·  Cocktail attire", { left: 200, top: 1020, width: 1700, fontSize: 20, fill: "#a16207", textAlign: "center", fontFamily: "Inter" }),
    ]},
  },
  // 14. Pool Party
  {
    name: "Summer Pool Party", description: "Fun summer pool party invitation",
    category: "invitation", subcategory: "party",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "pool", "summer", "party", "fun"],
    canvasData: { version: "6.6.1", background: "#0ea5e9", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#0ea5e9" }),
      C({ left: 1500, top: -100, radius: 300, fill: "#fbbf24", opacity: 0.3 }),
      T("🏊‍♂️", { left: 900, top: 200, width: 300, fontSize: 80, textAlign: "center" }),
      T("POOL", { left: 200, top: 380, width: 1700, fontSize: 120, fontWeight: "bold", fill: "#ffffff", textAlign: "center", fontFamily: "Montserrat" }),
      T("PARTY!", { left: 200, top: 520, width: 1700, fontSize: 80, fontWeight: "bold", fill: "#fbbf24", textAlign: "center", fontFamily: "Montserrat" }),
      T("Splash into summer with us!", { left: 200, top: 660, width: 1700, fontSize: 26, fill: "#e0f2fe", textAlign: "center", fontFamily: "Inter" }),
      T("Saturday, July 4, 2026\n1:00 PM - 6:00 PM\n789 Poolside Drive", { left: 200, top: 780, width: 1700, fontSize: 28, fill: "#ffffff", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
      T("Bring: Swimsuit · Towel · Sunscreen", { left: 200, top: 980, width: 1700, fontSize: 22, fill: "#bae6fd", textAlign: "center", fontFamily: "Inter" }),
      T("BBQ · Drinks · Music · Games", { left: 200, top: 1040, width: 1700, fontSize: 22, fill: "#fbbf24", textAlign: "center", fontFamily: "Inter" }),
    ]},
  },
  // 15. Bridal Shower
  {
    name: "Bridal Shower Invitation", description: "Elegant bridal shower invitation",
    category: "invitation", subcategory: "bridal-shower",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "bridal-shower", "bride", "elegant", "floral"],
    canvasData: { version: "6.6.1", background: "#faf5ff", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#faf5ff" }),
      C({ left: -50, top: -50, radius: 250, fill: "#c084fc", opacity: 0.1 }),
      C({ left: 1700, top: 2300, radius: 200, fill: "#f9a8d4", opacity: 0.1 }),
      T("BRIDAL SHOWER", { left: 200, top: 400, width: 1700, fontSize: 20, fill: "#7c3aed", textAlign: "center", fontFamily: "Inter", charSpacing: 400 }),
      T("Celebrating", { left: 200, top: 470, width: 1700, fontSize: 32, fill: "#6b21a8", textAlign: "center", fontFamily: "Playfair Display", fontStyle: "italic" }),
      T("Sarah", { left: 200, top: 530, width: 1700, fontSize: 80, fontWeight: "bold", fill: "#581c87", textAlign: "center", fontFamily: "Playfair Display" }),
      R({ left: 900, top: 660, width: 300, height: 2, fill: "#a855f7" }),
      T("Please join us for brunch, bubbly,\nand bridal bliss!", { left: 200, top: 720, width: 1700, fontSize: 24, fill: "#7c3aed", textAlign: "center", fontFamily: "Inter", lineHeight: 1.5 }),
      T("Sunday, May 3, 2026\n11:00 AM\nThe Garden Room\n55 Blossom Lane", { left: 200, top: 850, width: 1700, fontSize: 26, fill: "#581c87", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
      T("Hosted by the Bridesmaids", { left: 200, top: 1070, width: 1700, fontSize: 20, fill: "#a855f7", textAlign: "center", fontFamily: "Inter", fontStyle: "italic" }),
    ]},
  },
  // 16. Halloween Party
  {
    name: "Halloween Party", description: "Spooky Halloween party invitation",
    category: "invitation", subcategory: "holiday",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "halloween", "spooky", "party", "costume"],
    canvasData: { version: "6.6.1", background: "#0a0a0a", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#0a0a0a" }),
      C({ left: 800, top: 100, radius: 200, fill: "#f97316", opacity: 0.1 }),
      T("🎃", { left: 900, top: 200, width: 300, fontSize: 100, textAlign: "center" }),
      T("HALLOWEEN", { left: 200, top: 400, width: 1700, fontSize: 80, fontWeight: "bold", fill: "#f97316", textAlign: "center", fontFamily: "Montserrat" }),
      T("COSTUME PARTY", { left: 200, top: 520, width: 1700, fontSize: 36, fill: "#fbbf24", textAlign: "center", fontFamily: "Inter", charSpacing: 200 }),
      T("If you dare...", { left: 200, top: 620, width: 1700, fontSize: 28, fill: "#9ca3af", textAlign: "center", fontFamily: "Playfair Display", fontStyle: "italic" }),
      R({ left: 900, top: 710, width: 300, height: 2, fill: "#f97316" }),
      T("Friday, October 31, 2026\n8:00 PM - Midnight\nThe Haunted Mansion\n666 Spooky Lane", { left: 200, top: 770, width: 1700, fontSize: 26, fill: "#e5e7eb", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
      T("Best Costume Wins a Prize! 🏆", { left: 200, top: 1000, width: 1700, fontSize: 24, fill: "#f97316", textAlign: "center", fontFamily: "Inter" }),
    ]},
  },
  // 17. Fundraiser Gala
  {
    name: "Charity Fundraiser Gala", description: "Elegant charity fundraiser gala invitation",
    category: "invitation", subcategory: "corporate",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "charity", "fundraiser", "gala", "elegant"],
    canvasData: { version: "6.6.1", background: "#1e1b4b", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#1e1b4b" }),
      R({ left: 80, top: 80, width: 1940, height: 2640, fill: "transparent", stroke: "#c084fc", strokeWidth: 1 }),
      T("THE HOPE FOUNDATION", { left: 200, top: 350, width: 1700, fontSize: 20, fill: "#a78bfa", textAlign: "center", fontFamily: "Inter", charSpacing: 400 }),
      T("Annual Charity\nGala", { left: 200, top: 430, width: 1700, fontSize: 72, fontWeight: "bold", fill: "#ffffff", textAlign: "center", fontFamily: "Playfair Display", lineHeight: 1.2 }),
      T("An Evening of Giving", { left: 200, top: 640, width: 1700, fontSize: 28, fill: "#c084fc", textAlign: "center", fontFamily: "Inter", fontStyle: "italic" }),
      R({ left: 900, top: 730, width: 300, height: 2, fill: "#a78bfa" }),
      T("Silent Auction  ·  Live Music  ·  Dinner", { left: 200, top: 790, width: 1700, fontSize: 22, fill: "#a5b4fc", textAlign: "center", fontFamily: "Inter" }),
      T("Saturday, November 7, 2026\n6:30 PM\nThe Grand Ballroom\nFormal Attire", { left: 200, top: 870, width: 1700, fontSize: 26, fill: "#e0e7ff", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
      R({ left: 700, top: 1100, width: 700, height: 60, fill: "#7c3aed", rx: 30, ry: 30 }),
      T("PURCHASE TICKETS", { left: 700, top: 1115, width: 700, fontSize: 18, fontWeight: "bold", fill: "#ffffff", textAlign: "center", fontFamily: "Inter" }),
    ]},
  },
  // 18. New Year's Eve
  {
    name: "New Year's Eve Party", description: "Glamorous New Year's Eve party invitation",
    category: "invitation", subcategory: "holiday",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "new-year", "eve", "party", "glamorous"],
    canvasData: { version: "6.6.1", background: "#0a0a0a", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#0a0a0a" }),
      C({ left: 300, top: 200, radius: 100, fill: "#fbbf24", opacity: 0.1 }),
      C({ left: 1500, top: 400, radius: 80, fill: "#fbbf24", opacity: 0.08 }),
      T("🥂", { left: 900, top: 200, width: 300, fontSize: 80, textAlign: "center" }),
      T("NEW YEAR'S", { left: 200, top: 380, width: 1700, fontSize: 72, fontWeight: "bold", fill: "#fbbf24", textAlign: "center", fontFamily: "Montserrat" }),
      T("EVE", { left: 200, top: 480, width: 1700, fontSize: 120, fontWeight: "bold", fill: "#ffffff", textAlign: "center", fontFamily: "Montserrat" }),
      T("2027", { left: 200, top: 630, width: 1700, fontSize: 48, fontWeight: "300", fill: "#fbbf24", textAlign: "center", fontFamily: "Inter" }),
      R({ left: 900, top: 730, width: 300, height: 2, fill: "#fbbf24" }),
      T("Ring in the New Year with us!", { left: 200, top: 790, width: 1700, fontSize: 26, fill: "#d4d4d4", textAlign: "center", fontFamily: "Inter" }),
      T("December 31, 2026\n9:00 PM - 2:00 AM\nSkyline Rooftop Bar\nBlack Tie", { left: 200, top: 870, width: 1700, fontSize: 26, fill: "#e5e7eb", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
    ]},
  },
  // 19. Quinceañera
  {
    name: "Quinceañera Invitation", description: "Beautiful quinceañera celebration invitation",
    category: "invitation", subcategory: "birthday",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "quinceanera", "15", "celebration", "elegant"],
    canvasData: { version: "6.6.1", background: "#fdf2f8", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#fdf2f8" }),
      R({ left: 80, top: 80, width: 1940, height: 2640, fill: "transparent", stroke: "#ec4899", strokeWidth: 2 }),
      R({ left: 100, top: 100, width: 1900, height: 2600, fill: "transparent", stroke: "#ec4899", strokeWidth: 1 }),
      T("XV", { left: 200, top: 350, width: 1700, fontSize: 120, fontWeight: "bold", fill: "#ec4899", textAlign: "center", fontFamily: "Playfair Display" }),
      T("MIS QUINCE AÑOS", { left: 200, top: 510, width: 1700, fontSize: 24, fill: "#be185d", textAlign: "center", fontFamily: "Inter", charSpacing: 300 }),
      T("Isabella Sofia", { left: 200, top: 580, width: 1700, fontSize: 64, fill: "#831843", textAlign: "center", fontFamily: "Playfair Display", fontStyle: "italic" }),
      R({ left: 900, top: 700, width: 300, height: 2, fill: "#ec4899" }),
      T("Saturday, August 15, 2026\nFive O'Clock in the Evening\nCasa de Fiestas\n100 Celebration Blvd", { left: 200, top: 760, width: 1700, fontSize: 26, fill: "#831843", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
      T("Mass at 4:00 PM  ·  St. Mary's Church", { left: 200, top: 980, width: 1700, fontSize: 20, fill: "#ec4899", textAlign: "center", fontFamily: "Inter" }),
    ]},
  },
  // 20. Book Club
  {
    name: "Book Club Meeting", description: "Cozy book club meeting invitation",
    category: "invitation", subcategory: "social",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "book-club", "reading", "social", "cozy"],
    canvasData: { version: "6.6.1", background: "#fef7ed", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#fef7ed" }),
      T("📚", { left: 900, top: 250, width: 300, fontSize: 80, textAlign: "center" }),
      T("BOOK CLUB", { left: 200, top: 430, width: 1700, fontSize: 64, fontWeight: "bold", fill: "#78350f", textAlign: "center", fontFamily: "Playfair Display" }),
      T("Monthly Meeting", { left: 200, top: 530, width: 1700, fontSize: 28, fill: "#92400e", textAlign: "center", fontFamily: "Inter" }),
      R({ left: 900, top: 610, width: 300, height: 2, fill: "#d97706" }),
      T("This Month's Read:", { left: 200, top: 670, width: 1700, fontSize: 22, fill: "#92400e", textAlign: "center", fontFamily: "Inter" }),
      T("\"The Great Gatsby\"", { left: 200, top: 720, width: 1700, fontSize: 36, fill: "#78350f", textAlign: "center", fontFamily: "Playfair Display", fontStyle: "italic" }),
      T("by F. Scott Fitzgerald", { left: 200, top: 790, width: 1700, fontSize: 22, fill: "#92400e", textAlign: "center", fontFamily: "Inter" }),
      T("Thursday, March 12, 2026\n7:00 PM\nSarah's Living Room\n123 Cozy Lane", { left: 200, top: 880, width: 1700, fontSize: 26, fill: "#78350f", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
      T("Wine & Snacks Provided 🍷", { left: 200, top: 1100, width: 1700, fontSize: 22, fill: "#d97706", textAlign: "center", fontFamily: "Inter" }),
    ]},
  },
  // 21-28: More invitation styles
  {
    name: "Garden Tea Party", description: "Charming garden tea party invitation",
    category: "invitation", subcategory: "party",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "tea-party", "garden", "charming", "afternoon"],
    canvasData: { version: "6.6.1", background: "#f0fdf4", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#f0fdf4" }),
      C({ left: -50, top: -50, radius: 200, fill: "#86efac", opacity: 0.2 }),
      C({ left: 1700, top: 2300, radius: 180, fill: "#fde68a", opacity: 0.2 }),
      T("🫖", { left: 900, top: 250, width: 300, fontSize: 80, textAlign: "center" }),
      T("AFTERNOON", { left: 200, top: 430, width: 1700, fontSize: 20, fill: "#166534", textAlign: "center", fontFamily: "Inter", charSpacing: 400 }),
      T("Tea Party", { left: 200, top: 490, width: 1700, fontSize: 72, fill: "#166534", textAlign: "center", fontFamily: "Playfair Display", fontStyle: "italic" }),
      T("in the Garden", { left: 200, top: 600, width: 1700, fontSize: 32, fill: "#22c55e", textAlign: "center", fontFamily: "Inter" }),
      R({ left: 900, top: 690, width: 300, height: 2, fill: "#22c55e" }),
      T("Sunday, April 19, 2026\n2:00 PM\nThe Rose Garden\n88 Bloom Street", { left: 200, top: 750, width: 1700, fontSize: 26, fill: "#166534", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
      T("Hats & Florals Encouraged!", { left: 200, top: 980, width: 1700, fontSize: 22, fill: "#22c55e", textAlign: "center", fontFamily: "Inter", fontStyle: "italic" }),
    ]},
  },
  {
    name: "Game Night Invitation", description: "Fun game night invitation",
    category: "invitation", subcategory: "social",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "game-night", "fun", "social", "board-games"],
    canvasData: { version: "6.6.1", background: "#1e1b4b", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#1e1b4b" }),
      T("🎲🎮🃏", { left: 200, top: 250, width: 1700, fontSize: 80, textAlign: "center" }),
      T("GAME", { left: 200, top: 430, width: 1700, fontSize: 100, fontWeight: "bold", fill: "#a78bfa", textAlign: "center", fontFamily: "Montserrat" }),
      T("NIGHT", { left: 200, top: 560, width: 1700, fontSize: 100, fontWeight: "bold", fill: "#fbbf24", textAlign: "center", fontFamily: "Montserrat" }),
      T("Board games, card games, video games — you name it!", { left: 200, top: 720, width: 1700, fontSize: 24, fill: "#c4b5fd", textAlign: "center", fontFamily: "Inter" }),
      T("Friday, March 20, 2026\n7:00 PM\nMike's Place\nBYO Snacks!", { left: 200, top: 830, width: 1700, fontSize: 28, fill: "#e0e7ff", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
    ]},
  },
  {
    name: "Wine Tasting Evening", description: "Sophisticated wine tasting invitation",
    category: "invitation", subcategory: "social",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "wine", "tasting", "sophisticated", "evening"],
    canvasData: { version: "6.6.1", background: "#1a0a1e", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#1a0a1e" }),
      T("🍷", { left: 900, top: 250, width: 300, fontSize: 80, textAlign: "center" }),
      T("WINE TASTING", { left: 200, top: 430, width: 1700, fontSize: 64, fontWeight: "bold", fill: "#c084fc", textAlign: "center", fontFamily: "Playfair Display" }),
      T("EVENING", { left: 200, top: 530, width: 1700, fontSize: 36, fill: "#a855f7", textAlign: "center", fontFamily: "Inter", charSpacing: 300 }),
      R({ left: 900, top: 620, width: 300, height: 2, fill: "#c084fc" }),
      T("A curated journey through\nthe vineyards of Tuscany", { left: 200, top: 680, width: 1700, fontSize: 26, fill: "#d8b4fe", textAlign: "center", fontFamily: "Inter", lineHeight: 1.5 }),
      T("Saturday, October 10, 2026\n7:00 PM\nVino & Co.\n42 Cellar Road", { left: 200, top: 830, width: 1700, fontSize: 26, fill: "#e9d5ff", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
      T("$45 per person  ·  Limited to 20 guests", { left: 200, top: 1050, width: 1700, fontSize: 20, fill: "#a855f7", textAlign: "center", fontFamily: "Inter" }),
    ]},
  },
  {
    name: "Surprise Birthday Party", description: "Exciting surprise birthday party invitation",
    category: "invitation", subcategory: "birthday",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "birthday", "surprise", "party", "exciting"],
    canvasData: { version: "6.6.1", background: "#fef2f2", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#fef2f2" }),
      T("🤫", { left: 900, top: 200, width: 300, fontSize: 100, textAlign: "center" }),
      T("SHHH!", { left: 200, top: 380, width: 1700, fontSize: 80, fontWeight: "bold", fill: "#dc2626", textAlign: "center", fontFamily: "Montserrat" }),
      T("IT'S A SURPRISE", { left: 200, top: 500, width: 1700, fontSize: 28, fill: "#ef4444", textAlign: "center", fontFamily: "Inter", charSpacing: 300 }),
      T("Birthday Party for", { left: 200, top: 600, width: 1700, fontSize: 26, fill: "#991b1b", textAlign: "center", fontFamily: "Inter" }),
      T("JESSICA!", { left: 200, top: 660, width: 1700, fontSize: 64, fontWeight: "bold", fill: "#dc2626", textAlign: "center", fontFamily: "Montserrat" }),
      R({ left: 900, top: 780, width: 300, height: 3, fill: "#ef4444" }),
      T("Saturday, May 16, 2026\nArrive by 6:30 PM (she arrives at 7!)\n555 Secret Lane", { left: 200, top: 840, width: 1700, fontSize: 26, fill: "#991b1b", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
      T("DON'T TELL JESSICA! 🤐", { left: 200, top: 1050, width: 1700, fontSize: 24, fontWeight: "bold", fill: "#dc2626", textAlign: "center", fontFamily: "Inter" }),
    ]},
  },
  {
    name: "Rehearsal Dinner", description: "Elegant rehearsal dinner invitation",
    category: "invitation", subcategory: "wedding",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "rehearsal", "dinner", "wedding", "elegant"],
    canvasData: { version: "6.6.1", background: "#fffbeb", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#fffbeb" }),
      R({ left: 80, top: 80, width: 1940, height: 2640, fill: "transparent", stroke: "#b45309", strokeWidth: 1 }),
      T("THE NIGHT BEFORE", { left: 200, top: 400, width: 1700, fontSize: 20, fill: "#b45309", textAlign: "center", fontFamily: "Inter", charSpacing: 400 }),
      T("Rehearsal\nDinner", { left: 200, top: 470, width: 1700, fontSize: 72, fill: "#78350f", textAlign: "center", fontFamily: "Playfair Display", fontStyle: "italic", lineHeight: 1.2 }),
      R({ left: 900, top: 690, width: 300, height: 2, fill: "#b45309" }),
      T("Please join us as we celebrate\nSarah & James", { left: 200, top: 750, width: 1700, fontSize: 26, fill: "#92400e", textAlign: "center", fontFamily: "Inter", lineHeight: 1.5 }),
      T("Friday, June 20, 2026\n7:00 PM\nTuscany Restaurant\n200 Main Street", { left: 200, top: 880, width: 1700, fontSize: 26, fill: "#78350f", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
    ]},
  },
  {
    name: "Conference Invitation", description: "Professional tech conference invitation",
    category: "invitation", subcategory: "corporate",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "conference", "tech", "professional", "event"],
    canvasData: { version: "6.6.1", background: "#0f172a", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#0f172a" }),
      R({ left: 0, top: 0, width: 2100, height: 600, fill: "#6366f1" }),
      T("TECH SUMMIT", { left: 200, top: 150, width: 1700, fontSize: 72, fontWeight: "bold", fill: "#ffffff", textAlign: "center", fontFamily: "Montserrat" }),
      T("2026", { left: 200, top: 280, width: 1700, fontSize: 48, fontWeight: "300", fill: "#c7d2fe", textAlign: "center", fontFamily: "Inter" }),
      T("THE FUTURE OF AI & INNOVATION", { left: 200, top: 380, width: 1700, fontSize: 20, fill: "#e0e7ff", textAlign: "center", fontFamily: "Inter", charSpacing: 200 }),
      T("You're invited to the premier\ntechnology conference of the year", { left: 200, top: 700, width: 1700, fontSize: 26, fill: "#94a3b8", textAlign: "center", fontFamily: "Inter", lineHeight: 1.5 }),
      T("October 15-17, 2026\nMoscone Center\nSan Francisco, CA", { left: 200, top: 850, width: 1700, fontSize: 28, fill: "#e2e8f0", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
      T("50+ Speakers  ·  3 Days  ·  1000+ Attendees", { left: 200, top: 1020, width: 1700, fontSize: 22, fill: "#818cf8", textAlign: "center", fontFamily: "Inter" }),
      R({ left: 700, top: 1100, width: 700, height: 60, fill: "#6366f1", rx: 30, ry: 30 }),
      T("REGISTER NOW", { left: 700, top: 1115, width: 700, fontSize: 18, fontWeight: "bold", fill: "#ffffff", textAlign: "center", fontFamily: "Inter" }),
    ]},
  },
  {
    name: "Thanksgiving Dinner", description: "Warm Thanksgiving dinner invitation",
    category: "invitation", subcategory: "holiday",
    canvasWidth: 2100, canvasHeight: 2800, tags: ["invitation", "thanksgiving", "dinner", "holiday", "warm"],
    canvasData: { version: "6.6.1", background: "#fef7ed", objects: [
      R({ left: 0, top: 0, width: 2100, height: 2800, fill: "#fef7ed" }),
      T("🦃", { left: 900, top: 200, width: 300, fontSize: 80, textAlign: "center" }),
      T("GRATEFUL", { left: 200, top: 380, width: 1700, fontSize: 72, fontWeight: "bold", fill: "#92400e", textAlign: "center", fontFamily: "Playfair Display" }),
      T("THANKFUL  ·  BLESSED", { left: 200, top: 490, width: 1700, fontSize: 24, fill: "#b45309", textAlign: "center", fontFamily: "Inter", charSpacing: 200 }),
      R({ left: 900, top: 570, width: 300, height: 2, fill: "#d97706" }),
      T("You're invited to\nThanksgiving Dinner", { left: 200, top: 630, width: 1700, fontSize: 32, fill: "#78350f", textAlign: "center", fontFamily: "Playfair Display", lineHeight: 1.4 }),
      T("at the Williams Home", { left: 200, top: 740, width: 1700, fontSize: 24, fill: "#92400e", textAlign: "center", fontFamily: "Inter" }),
      T("Thursday, November 26, 2026\n4:00 PM\n100 Harvest Lane", { left: 200, top: 830, width: 1700, fontSize: 26, fill: "#78350f", textAlign: "center", fontFamily: "Inter", lineHeight: 1.6 }),
      T("Please bring a side dish to share!", { left: 200, top: 1020, width: 1700, fontSize: 22, fill: "#d97706", textAlign: "center", fontFamily: "Inter", fontStyle: "italic" }),
    ]},
  },
];

export default moreInvitations;
