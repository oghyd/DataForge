import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");
const bcryptjs = require("bcryptjs");

const prisma = new PrismaClient();
const hash = bcryptjs.hash;

async function main() {
  console.log("Seeding database...");

  // Clean in correct order
  await prisma.matchEvent.deleteMany();
  await prisma.playerMatchStats.deleteMany();
  await prisma.teamMatchStats.deleteMany();
  await prisma.match.deleteMany();
  await prisma.trainingAttendance.deleteMany();
  await prisma.trainingSession.deleteMany();
  await prisma.playerTeamAssignment.deleteMany();
  await prisma.playerSeasonRegistration.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.injuryRecord.deleteMany();
  await prisma.scoutReport.deleteMany();
  await prisma.competitionEntry.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.season.deleteMany();
  await prisma.club.deleteMany();
  await prisma.userOrganization.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.dataQualityIssue.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash("password123", 12);

  const admin = await prisma.user.create({
    data: { email: "admin@dataforge.com", name: "Admin User", passwordHash, role: "SUPER_ADMIN" },
  });
  const coach = await prisma.user.create({
    data: { email: "coach@dataforge.com", name: "Mohammed Benali", passwordHash, role: "COACH" },
  });
  const scout = await prisma.user.create({
    data: { email: "scout@dataforge.com", name: "Fatima Zahra", passwordHash, role: "SCOUT" },
  });

  const org = await prisma.organization.create({
    data: {
      name: "Academie Atlas Football", type: "ACADEMY",
      city: "Casablanca", region: "Casablanca-Settat", country: "MA",
      description: "Elite football academy developing young talent in Morocco",
      createdById: admin.id,
    },
  });

  await prisma.userOrganization.createMany({
    data: [
      { userId: admin.id, organizationId: org.id, role: "ADMIN" },
      { userId: coach.id, organizationId: org.id, role: "COACH" },
      { userId: scout.id, organizationId: org.id, role: "SCOUT" },
    ],
  });

  const season = await prisma.season.create({
    data: {
      organizationId: org.id, name: "2025-2026",
      startDate: new Date("2025-08-01"), endDate: new Date("2026-06-30"), isCurrent: true,
    },
  });

  const clubs = await Promise.all([
    prisma.club.create({ data: { organizationId: org.id, name: "Atlas FC", shortName: "ATL", city: "Casablanca", primaryColor: "#16a34a", createdById: admin.id } }),
    prisma.club.create({ data: { organizationId: org.id, name: "Etoile Sportive", shortName: "ETS", city: "Rabat", primaryColor: "#3b82f6", createdById: admin.id } }),
    prisma.club.create({ data: { organizationId: org.id, name: "Union Marrakech", shortName: "UNM", city: "Marrakech", primaryColor: "#ef4444", createdById: admin.id } }),
    prisma.club.create({ data: { organizationId: org.id, name: "Dynamique Fes", shortName: "DYF", city: "Fes", primaryColor: "#f59e0b", createdById: admin.id } }),
  ]);

  const venues = await Promise.all([
    prisma.venue.create({ data: { organizationId: org.id, name: "Stade Atlas", city: "Casablanca", capacity: 5000, surface: "ARTIFICIAL_TURF", hasLighting: true } }),
    prisma.venue.create({ data: { organizationId: org.id, name: "Complexe Sportif Rabat", city: "Rabat", capacity: 3000, surface: "NATURAL_GRASS", hasLighting: true } }),
    prisma.venue.create({ data: { organizationId: org.id, name: "Terrain Municipal Marrakech", city: "Marrakech", capacity: 2000, surface: "NATURAL_GRASS" } }),
  ]);

  const teams = await Promise.all([
    prisma.team.create({ data: { clubId: clubs[0].id, name: "Seniors A", ageGroup: "SENIOR", gender: "MALE", level: "FIRST_TEAM", seasonId: season.id, formation: "4-3-3", createdById: admin.id } }),
    prisma.team.create({ data: { clubId: clubs[0].id, name: "U18", ageGroup: "U18", gender: "MALE", level: "YOUTH", seasonId: season.id, formation: "4-4-2", createdById: admin.id } }),
    prisma.team.create({ data: { clubId: clubs[1].id, name: "Seniors A", ageGroup: "SENIOR", gender: "MALE", level: "FIRST_TEAM", seasonId: season.id, formation: "4-2-3-1", createdById: admin.id } }),
    prisma.team.create({ data: { clubId: clubs[2].id, name: "Seniors A", ageGroup: "SENIOR", gender: "MALE", level: "FIRST_TEAM", seasonId: season.id, formation: "3-5-2", createdById: admin.id } }),
    prisma.team.create({ data: { clubId: clubs[3].id, name: "Seniors A", ageGroup: "SENIOR", gender: "MALE", level: "FIRST_TEAM", seasonId: season.id, formation: "4-4-2", createdById: admin.id } }),
  ]);

  const competition = await prisma.competition.create({
    data: {
      organizationId: org.id, seasonId: season.id,
      name: "Ligue Regionale Casablanca-Settat", type: "LEAGUE", level: "REGIONAL",
      ageGroup: "SENIOR", gender: "MALE",
      startDate: new Date("2025-09-01"), endDate: new Date("2026-05-31"),
    },
  });

  const playerData = [
    { firstName: "Youssef", lastName: "El Amrani", dob: "2000-03-15", pos: "GK", foot: "RIGHT", h: 188, w: 82, city: "Casablanca", team: 0, jersey: 1 },
    { firstName: "Amine", lastName: "Benali", dob: "1998-07-22", pos: "CB", foot: "RIGHT", h: 185, w: 80, city: "Casablanca", team: 0, jersey: 4 },
    { firstName: "Karim", lastName: "Tazi", dob: "1999-11-08", pos: "CB", foot: "LEFT", h: 183, w: 78, city: "Rabat", team: 0, jersey: 5 },
    { firstName: "Omar", lastName: "Saidi", dob: "2001-01-30", pos: "LB", foot: "LEFT", h: 176, w: 72, city: "Casablanca", team: 0, jersey: 3 },
    { firstName: "Hassan", lastName: "Moukhliss", dob: "2000-05-14", pos: "RB", foot: "RIGHT", h: 178, w: 74, city: "Mohammedia", team: 0, jersey: 2 },
    { firstName: "Mehdi", lastName: "Bouazza", dob: "1999-09-03", pos: "CDM", foot: "RIGHT", h: 180, w: 76, city: "Casablanca", team: 0, jersey: 6 },
    { firstName: "Rachid", lastName: "El Fassi", dob: "2001-04-18", pos: "CM", foot: "RIGHT", h: 175, w: 70, city: "Kenitra", team: 0, jersey: 8 },
    { firstName: "Soufiane", lastName: "Amrabat", dob: "2000-08-10", pos: "CM", foot: "BOTH", h: 177, w: 73, city: "Casablanca", team: 0, jersey: 10 },
    { firstName: "Zakaria", lastName: "Hadji", dob: "2002-02-25", pos: "LW", foot: "RIGHT", h: 174, w: 68, city: "Sale", team: 0, jersey: 7 },
    { firstName: "Ayoub", lastName: "El Kaabi", dob: "1998-06-17", pos: "ST", foot: "RIGHT", h: 181, w: 77, city: "Casablanca", team: 0, jersey: 9 },
    { firstName: "Walid", lastName: "Regragui", dob: "2001-12-05", pos: "RW", foot: "LEFT", h: 172, w: 66, city: "Casablanca", team: 0, jersey: 11 },
    { firstName: "Ismail", lastName: "Chaoui", dob: null, pos: "CM", foot: null, h: null, w: null, city: null, team: 0, jersey: 14 },
    { firstName: "Adil", lastName: "Bensaid", dob: "2003-01-12", pos: null, foot: null, h: null, w: null, city: null, team: 0, jersey: null, status: "DRAFT" },
    { firstName: "Hamza", lastName: "Kharroubi", dob: "1999-04-20", pos: "GK", foot: "RIGHT", h: 190, w: 85, city: "Rabat", team: 2, jersey: 1 },
    { firstName: "Nabil", lastName: "Diouri", dob: "2000-10-15", pos: "CB", foot: "RIGHT", h: 184, w: 79, city: "Rabat", team: 2, jersey: 4 },
    { firstName: "Driss", lastName: "Fettah", dob: "1998-08-28", pos: "ST", foot: "LEFT", h: 179, w: 75, city: "Rabat", team: 2, jersey: 9 },
    { firstName: "Reda", lastName: "Slim", dob: "2001-06-03", pos: "CM", foot: "RIGHT", h: 176, w: 71, city: "Temara", team: 2, jersey: 8 },
    { firstName: "Bilal", lastName: "Touimi", dob: "2002-03-22", pos: "LW", foot: "RIGHT", h: 170, w: 65, city: "Rabat", team: 2, jersey: 7, status: "INJURED" },
    { firstName: "Said", lastName: "Berkane", dob: "1997-12-01", pos: "ST", foot: "RIGHT", h: 183, w: 78, city: "Marrakech", team: 3, jersey: 9 },
    { firstName: "Yassine", lastName: "Kaddouri", dob: "2000-09-14", pos: "CM", foot: "BOTH", h: 178, w: 73, city: "Marrakech", team: 3, jersey: 10 },
    { firstName: "Tarik", lastName: "Oulad", dob: "2001-07-08", pos: "RB", foot: "RIGHT", h: 175, w: 70, city: "Marrakech", team: 3, jersey: 2 },
    { firstName: "Adam", lastName: "Lahlou", dob: "2008-02-14", pos: "CAM", foot: "LEFT", h: 168, w: 58, city: "Casablanca", team: 1, jersey: 10, guardianName: "Khalid Lahlou", guardianPhone: "+212600112233" },
    { firstName: "Rayan", lastName: "Boufous", dob: "2008-05-30", pos: "ST", foot: "RIGHT", h: 172, w: 62, city: "Casablanca", team: 1, jersey: 9, guardianName: "Samira Boufous", guardianPhone: "+212600445566" },
  ];

  const players = [];
  for (const p of playerData) {
    const player = await prisma.player.create({
      data: {
        organizationId: org.id, firstName: p.firstName, lastName: p.lastName,
        dateOfBirth: p.dob ? new Date(p.dob) : null, gender: "MALE", nationality: "Moroccan",
        preferredFoot: p.foot, primaryPosition: p.pos, height: p.h, weight: p.w,
        city: p.city, country: "MA", status: p.status || "ACTIVE",
        verificationStatus: p.status === "DRAFT" ? "UNVERIFIED" : "VERIFIED",
        guardianName: p.guardianName || null, guardianPhone: p.guardianPhone || null,
        createdById: admin.id, updatedById: admin.id, dataSource: "MANUAL",
      },
    });
    players.push(player);
    if (p.team !== undefined) {
      await prisma.playerTeamAssignment.create({
        data: { playerId: player.id, teamId: teams[p.team].id, jerseyNumber: p.jersey, isActive: true, role: p.jersey === 10 ? "CAPTAIN" : "PLAYER" },
      });
    }
  }

  const matchesData = [
    { home: 0, away: 2, date: "2025-10-05", hs: 2, as: 1, hht: 1, aht: 0 },
    { home: 0, away: 3, date: "2025-10-19", hs: 0, as: 0, hht: 0, aht: 0 },
    { home: 2, away: 0, date: "2025-11-02", hs: 1, as: 3, hht: 0, aht: 2 },
    { home: 3, away: 0, date: "2025-11-16", hs: 1, as: 2, hht: 1, aht: 1 },
    { home: 0, away: 4, date: "2025-11-30", hs: 4, as: 1, hht: 2, aht: 0 },
    { home: 2, away: 4, date: "2025-12-14", hs: 2, as: 2, hht: 1, aht: 1 },
  ];

  for (const m of matchesData) {
    const match = await prisma.match.create({
      data: {
        organizationId: org.id, seasonId: season.id, competitionId: competition.id, venueId: venues[0].id,
        homeTeamId: teams[m.home].id, awayTeamId: teams[m.away].id,
        matchDate: new Date(m.date), kickoffTime: "15:00", status: "COMPLETED",
        homeScore: m.hs, awayScore: m.as, homeHalfTimeScore: m.hht, awayHalfTimeScore: m.aht,
        weather: "CLEAR", pitchCondition: "GOOD", refereeName: "Khalid Bennani",
        attendance: Math.floor(Math.random() * 2000) + 500,
        createdById: admin.id, updatedById: admin.id,
      },
    });

    if (m.date === "2025-10-05") {
      await prisma.teamMatchStats.createMany({
        data: [
          { matchId: match.id, teamId: teams[m.home].id, side: "HOME", possession: 58, totalPasses: 420, accuratePasses: 357, passAccuracy: 85, shots: 14, shotsOnTarget: 6, shotsOffTarget: 5, blockedShots: 3, saves: 4, corners: 7, offsides: 2, fouls: 12, yellowCards: 2, redCards: 0, tackles: 18, interceptions: 10, clearances: 15, duels: 52, duelsWon: 28, aerialDuels: 14, aerialDuelsWon: 8, dribbles: 12, dribblesSuccessful: 8, crosses: 16, ballRecoveries: 35, turnovers: 8 },
          { matchId: match.id, teamId: teams[m.away].id, side: "AWAY", possession: 42, totalPasses: 310, accuratePasses: 248, passAccuracy: 80, shots: 8, shotsOnTarget: 4, shotsOffTarget: 3, blockedShots: 1, saves: 4, corners: 4, offsides: 3, fouls: 14, yellowCards: 3, redCards: 0, tackles: 22, interceptions: 8, clearances: 22, duels: 52, duelsWon: 24, aerialDuels: 14, aerialDuelsWon: 6, dribbles: 8, dribblesSuccessful: 4, crosses: 10, ballRecoveries: 28, turnovers: 12 },
        ],
      });
      for (let i = 0; i < 11; i++) {
        const isStriker = i === 9, isWinger = i === 8 || i === 10;
        await prisma.playerMatchStats.create({
          data: { matchId: match.id, playerId: players[i].id, teamId: teams[0].id, starter: true, minutesPlayed: 90, positionPlayed: playerData[i].pos, jerseyNumber: playerData[i].jersey, isCaptain: i === 7, goals: isStriker ? 1 : (i === 8 ? 1 : 0), assists: i === 7 ? 1 : (i === 10 ? 1 : 0), shots: isStriker ? 4 : (isWinger ? 3 : (i >= 5 ? 2 : 0)), shotsOnTarget: isStriker ? 2 : (isWinger ? 1 : 0), passes: i === 0 ? 35 : (i <= 4 ? 45 : 55), accuratePasses: i === 0 ? 28 : (i <= 4 ? 38 : 48), tackles: i <= 4 ? 3 : (i <= 7 ? 2 : 1), interceptions: i <= 4 ? 2 : 1, duelsWon: 3, duelsLost: 2, rating: isStriker ? 7.5 : (isWinger ? 7.0 : (i === 7 ? 7.8 : 6.5)) },
        });
      }
      await prisma.matchEvent.createMany({
        data: [
          { matchId: match.id, playerId: players[8].id, type: "GOAL", minute: 23, half: "FIRST_HALF", teamSide: "HOME", description: "Low shot into bottom corner" },
          { matchId: match.id, playerId: players[7].id, type: "ASSIST", minute: 23, half: "FIRST_HALF", teamSide: "HOME" },
          { matchId: match.id, playerId: players[15].id, type: "GOAL", minute: 55, half: "SECOND_HALF", teamSide: "AWAY", description: "Header from corner" },
          { matchId: match.id, playerId: players[9].id, type: "GOAL", minute: 78, half: "SECOND_HALF", teamSide: "HOME", description: "Penalty scored" },
          { matchId: match.id, playerId: players[5].id, type: "YELLOW_CARD", minute: 34, half: "FIRST_HALF", teamSide: "HOME" },
          { matchId: match.id, playerId: players[14].id, type: "YELLOW_CARD", minute: 62, half: "SECOND_HALF", teamSide: "AWAY" },
        ],
      });
    }
  }

  const dates = ["2025-10-07", "2025-10-09", "2025-10-14", "2025-10-16", "2025-10-21"];
  const themes = ["Passing combinations", "Defensive shape", "Set pieces", "Fitness", "Tactical awareness"];
  for (let i = 0; i < dates.length; i++) {
    const session = await prisma.trainingSession.create({
      data: { teamId: teams[0].id, coachId: coach.id, date: new Date(dates[i]), startTime: "09:00", endTime: "11:00", type: "REGULAR", theme: themes[i], location: "Stade Atlas - Training Ground", intensity: ["LOW", "MEDIUM", "HIGH"][i % 3] },
    });
    for (let j = 0; j < 11; j++) {
      await prisma.trainingAttendance.create({
        data: { trainingSessionId: session.id, playerId: players[j].id, status: Math.random() > 0.1 ? "PRESENT" : "ABSENT", rating: Math.random() > 0.3 ? parseFloat((5 + Math.random() * 4).toFixed(1)) : null },
      });
    }
  }

  await prisma.scoutReport.create({
    data: { playerId: players[9].id, scoutId: scout.id, overallRating: 7.5, potentialRating: 8.5, currentLevel: "SEMI_PRO", recommendedLevel: "PROFESSIONAL", strengths: "Excellent finishing, strong aerial presence", weaknesses: "Limited left foot, first touch under pressure", summary: "Natural goal scorer with strong positioning.", recommendation: "MONITOR", tags: "striker,clinical,aerial" },
  });

  await prisma.injuryRecord.create({
    data: { playerId: players[17].id, type: "MUSCLE", bodyPart: "HAMSTRING", severity: "MODERATE", description: "Right hamstring strain during training", injuryDate: new Date("2025-10-20"), status: "ACTIVE" },
  });

  console.log("Seed complete!");
  console.log(`Created: 1 org, ${clubs.length} clubs, ${teams.length} teams, ${players.length} players, ${matchesData.length} matches`);
  console.log("Login: admin@dataforge.com / password123");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
