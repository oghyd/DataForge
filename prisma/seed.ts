import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.matchVideo.deleteMany();
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

  // Create admin user
  const passwordHash = await hash("password123", 12);
  const admin = await prisma.user.create({
    data: {
      email: "admin@dataforge.com",
      name: "Admin User",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  const coach = await prisma.user.create({
    data: {
      email: "coach@dataforge.com",
      name: "Mohammed Benali",
      passwordHash,
      role: "COACH",
    },
  });

  const scout = await prisma.user.create({
    data: {
      email: "scout@dataforge.com",
      name: "Fatima Zahra",
      passwordHash,
      role: "SCOUT",
    },
  });

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: "Academie Atlas Football",
      type: "ACADEMY",
      city: "Casablanca",
      region: "Casablanca-Settat",
      country: "MA",
      description: "Elite football academy developing young talent in Morocco",
      createdById: admin.id,
    },
  });

  // Link users to org
  await prisma.userOrganization.createMany({
    data: [
      { userId: admin.id, organizationId: org.id, role: "ADMIN" },
      { userId: coach.id, organizationId: org.id, role: "COACH" },
      { userId: scout.id, organizationId: org.id, role: "SCOUT" },
    ],
  });

  // Create club manager users (each linked to the same org but with CLUB_MANAGER role)
  const clubManagerAtlas = await prisma.user.create({
    data: {
      email: "atlas@dataforge.com",
      name: "Youssef Atlas Manager",
      passwordHash,
      role: "CLUB_MANAGER",
    },
  });

  const clubManagerEtoile = await prisma.user.create({
    data: {
      email: "etoile@dataforge.com",
      name: "Nabil Etoile Manager",
      passwordHash,
      role: "CLUB_MANAGER",
    },
  });

  const clubManagerUnion = await prisma.user.create({
    data: {
      email: "union@dataforge.com",
      name: "Karim Union Manager",
      passwordHash,
      role: "CLUB_MANAGER",
    },
  });

  await prisma.userOrganization.createMany({
    data: [
      { userId: clubManagerAtlas.id, organizationId: org.id, role: "MANAGER" },
      { userId: clubManagerEtoile.id, organizationId: org.id, role: "MANAGER" },
      { userId: clubManagerUnion.id, organizationId: org.id, role: "MANAGER" },
    ],
  });

  // Create season
  const season = await prisma.season.create({
    data: {
      organizationId: org.id,
      name: "2025-2026",
      startDate: new Date("2025-08-01"),
      endDate: new Date("2026-06-30"),
      isCurrent: true,
    },
  });

  // Create clubs
  const clubs = await Promise.all([
    prisma.club.create({ data: { organizationId: org.id, name: "Atlas FC", shortName: "ATL", city: "Casablanca", primaryColor: "#16a34a", createdById: admin.id } }),
    prisma.club.create({ data: { organizationId: org.id, name: "Etoile Sportive", shortName: "ETS", city: "Rabat", primaryColor: "#3b82f6", createdById: admin.id } }),
    prisma.club.create({ data: { organizationId: org.id, name: "Union Marrakech", shortName: "UNM", city: "Marrakech", primaryColor: "#ef4444", createdById: admin.id } }),
    prisma.club.create({ data: { organizationId: org.id, name: "Dynamique Fes", shortName: "DYF", city: "Fes", primaryColor: "#f59e0b", createdById: admin.id } }),
  ]);

  // Create venues
  const venues = await Promise.all([
    prisma.venue.create({ data: { organizationId: org.id, name: "Stade Atlas", city: "Casablanca", capacity: 5000, surface: "ARTIFICIAL_TURF", hasLighting: true } }),
    prisma.venue.create({ data: { organizationId: org.id, name: "Complexe Sportif Rabat", city: "Rabat", capacity: 3000, surface: "NATURAL_GRASS", hasLighting: true } }),
    prisma.venue.create({ data: { organizationId: org.id, name: "Terrain Municipal Marrakech", city: "Marrakech", capacity: 2000, surface: "NATURAL_GRASS", hasLighting: false } }),
  ]);

  // Create teams
  const teams = await Promise.all([
    prisma.team.create({ data: { clubId: clubs[0].id, name: "Seniors A", ageGroup: "SENIOR", gender: "MALE", level: "FIRST_TEAM", seasonId: season.id, formation: "4-3-3", createdById: admin.id } }),
    prisma.team.create({ data: { clubId: clubs[0].id, name: "U18", ageGroup: "U18", gender: "MALE", level: "YOUTH", seasonId: season.id, formation: "4-4-2", createdById: admin.id } }),
    prisma.team.create({ data: { clubId: clubs[1].id, name: "Seniors A", ageGroup: "SENIOR", gender: "MALE", level: "FIRST_TEAM", seasonId: season.id, formation: "4-2-3-1", createdById: admin.id } }),
    prisma.team.create({ data: { clubId: clubs[2].id, name: "Seniors A", ageGroup: "SENIOR", gender: "MALE", level: "FIRST_TEAM", seasonId: season.id, formation: "3-5-2", createdById: admin.id } }),
    prisma.team.create({ data: { clubId: clubs[3].id, name: "Seniors A", ageGroup: "SENIOR", gender: "MALE", level: "FIRST_TEAM", seasonId: season.id, formation: "4-4-2", createdById: admin.id } }),
  ]);

  // Create competition
  const competition = await prisma.competition.create({
    data: {
      organizationId: org.id,
      seasonId: season.id,
      name: "Ligue Regionale Casablanca-Settat",
      type: "LEAGUE",
      level: "REGIONAL",
      ageGroup: "SENIOR",
      gender: "MALE",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2026-05-31"),
    },
  });

  // Create players with diverse data (some complete, some partial — intentional for completeness scoring)
  const playerData = [
    // Atlas FC - Senior A (full profiles)
    { firstName: "Youssef", lastName: "El Amrani", dob: "2000-03-15", gender: "MALE", nationality: "Moroccan", pos: "GK", foot: "RIGHT", height: 188, weight: 82, city: "Casablanca", status: "ACTIVE", team: 0, jersey: 1 },
    { firstName: "Amine", lastName: "Benali", dob: "1998-07-22", gender: "MALE", nationality: "Moroccan", pos: "CB", foot: "RIGHT", height: 185, weight: 80, city: "Casablanca", status: "ACTIVE", team: 0, jersey: 4 },
    { firstName: "Karim", lastName: "Tazi", dob: "1999-11-08", gender: "MALE", nationality: "Moroccan", pos: "CB", foot: "LEFT", height: 183, weight: 78, city: "Rabat", status: "ACTIVE", team: 0, jersey: 5 },
    { firstName: "Omar", lastName: "Saidi", dob: "2001-01-30", gender: "MALE", nationality: "Moroccan", pos: "LB", foot: "LEFT", height: 176, weight: 72, city: "Casablanca", status: "ACTIVE", team: 0, jersey: 3 },
    { firstName: "Hassan", lastName: "Moukhliss", dob: "2000-05-14", gender: "MALE", nationality: "Moroccan", pos: "RB", foot: "RIGHT", height: 178, weight: 74, city: "Mohammedia", status: "ACTIVE", team: 0, jersey: 2 },
    { firstName: "Mehdi", lastName: "Bouazza", dob: "1999-09-03", gender: "MALE", nationality: "Moroccan", pos: "CDM", foot: "RIGHT", height: 180, weight: 76, city: "Casablanca", status: "ACTIVE", team: 0, jersey: 6 },
    { firstName: "Rachid", lastName: "El Fassi", dob: "2001-04-18", gender: "MALE", nationality: "Moroccan", pos: "CM", foot: "RIGHT", height: 175, weight: 70, city: "Kenitra", status: "ACTIVE", team: 0, jersey: 8 },
    { firstName: "Soufiane", lastName: "Amrabat", dob: "2000-08-10", gender: "MALE", nationality: "Moroccan", secondNat: "Dutch", pos: "CM", foot: "BOTH", height: 177, weight: 73, city: "Casablanca", status: "ACTIVE", team: 0, jersey: 10 },
    { firstName: "Zakaria", lastName: "Hadji", dob: "2002-02-25", gender: "MALE", nationality: "Moroccan", pos: "LW", foot: "RIGHT", height: 174, weight: 68, city: "Sale", status: "ACTIVE", team: 0, jersey: 7 },
    { firstName: "Ayoub", lastName: "El Kaabi", dob: "1998-06-17", gender: "MALE", nationality: "Moroccan", pos: "ST", foot: "RIGHT", height: 181, weight: 77, city: "Casablanca", status: "ACTIVE", team: 0, jersey: 9 },
    { firstName: "Walid", lastName: "Regragui", dob: "2001-12-05", gender: "MALE", nationality: "Moroccan", pos: "RW", foot: "LEFT", height: 172, weight: 66, city: "Casablanca", status: "ACTIVE", team: 0, jersey: 11 },
    // Partial profiles (intentional gaps for completeness demo)
    { firstName: "Ismail", lastName: "Chaoui", dob: null, gender: "MALE", nationality: "Moroccan", pos: "CM", foot: null, height: null, weight: null, city: null, status: "ACTIVE", team: 0, jersey: 14 },
    { firstName: "Adil", lastName: "Bensaid", dob: "2003-01-12", gender: "MALE", nationality: null, pos: null, foot: null, height: null, weight: null, city: null, status: "DRAFT", team: 0, jersey: null },
    // Etoile Sportive
    { firstName: "Hamza", lastName: "Kharroubi", dob: "1999-04-20", gender: "MALE", nationality: "Moroccan", pos: "GK", foot: "RIGHT", height: 190, weight: 85, city: "Rabat", status: "ACTIVE", team: 2, jersey: 1 },
    { firstName: "Nabil", lastName: "Diouri", dob: "2000-10-15", gender: "MALE", nationality: "Moroccan", pos: "CB", foot: "RIGHT", height: 184, weight: 79, city: "Rabat", status: "ACTIVE", team: 2, jersey: 4 },
    { firstName: "Driss", lastName: "Fettah", dob: "1998-08-28", gender: "MALE", nationality: "Moroccan", pos: "ST", foot: "LEFT", height: 179, weight: 75, city: "Rabat", status: "ACTIVE", team: 2, jersey: 9 },
    { firstName: "Reda", lastName: "Slim", dob: "2001-06-03", gender: "MALE", nationality: "Moroccan", pos: "CM", foot: "RIGHT", height: 176, weight: 71, city: "Temara", status: "ACTIVE", team: 2, jersey: 8 },
    { firstName: "Bilal", lastName: "Touimi", dob: "2002-03-22", gender: "MALE", nationality: "Moroccan", pos: "LW", foot: "RIGHT", height: 170, weight: 65, city: "Rabat", status: "INJURED", team: 2, jersey: 7 },
    // Union Marrakech
    { firstName: "Said", lastName: "Berkane", dob: "1997-12-01", gender: "MALE", nationality: "Moroccan", pos: "ST", foot: "RIGHT", height: 183, weight: 78, city: "Marrakech", status: "ACTIVE", team: 3, jersey: 9 },
    { firstName: "Yassine", lastName: "Kaddouri", dob: "2000-09-14", gender: "MALE", nationality: "Moroccan", pos: "CM", foot: "BOTH", height: 178, weight: 73, city: "Marrakech", status: "ACTIVE", team: 3, jersey: 10 },
    { firstName: "Tarik", lastName: "Oulad", dob: "2001-07-08", gender: "MALE", nationality: "Moroccan", pos: "RB", foot: "RIGHT", height: 175, weight: 70, city: "Marrakech", status: "ACTIVE", team: 3, jersey: 2 },
    // Atlas U18
    { firstName: "Adam", lastName: "Lahlou", dob: "2008-02-14", gender: "MALE", nationality: "Moroccan", pos: "CAM", foot: "LEFT", height: 168, weight: 58, city: "Casablanca", status: "ACTIVE", team: 1, jersey: 10, guardianName: "Khalid Lahlou", guardianPhone: "+212600112233", guardianRelation: "PARENT" },
    { firstName: "Rayan", lastName: "Boufous", dob: "2008-05-30", gender: "MALE", nationality: "Moroccan", pos: "ST", foot: "RIGHT", height: 172, weight: 62, city: "Casablanca", status: "ACTIVE", team: 1, jersey: 9, guardianName: "Samira Boufous", guardianPhone: "+212600445566", guardianRelation: "PARENT" },
    { firstName: "Imane", lastName: "El Moustakim", dob: "2008-11-03", gender: "FEMALE", nationality: "Moroccan", pos: "GK", foot: "RIGHT", height: 165, weight: 55, city: "Casablanca", status: "ACTIVE", team: 1, jersey: 1, guardianName: "Ahmed El Moustakim", guardianPhone: "+212600778899", guardianRelation: "PARENT" },
  ];

  const players: { id: string }[] = [];
  for (const p of playerData) {
    const player = await prisma.player.create({
      data: {
        organizationId: org.id,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: p.dob ? new Date(p.dob) : null,
        gender: p.gender,
        nationality: p.nationality ?? null,
        secondNationality: (p as Record<string, unknown>).secondNat as string ?? null,
        preferredFoot: p.foot,
        primaryPosition: p.pos,
        height: p.height,
        weight: p.weight,
        city: p.city,
        country: "MA",
        status: p.status,
        guardianName: (p as Record<string, unknown>).guardianName as string ?? null,
        guardianPhone: (p as Record<string, unknown>).guardianPhone as string ?? null,
        guardianRelation: (p as Record<string, unknown>).guardianRelation as string ?? null,
        createdById: admin.id,
        updatedById: admin.id,
        dataSource: "MANUAL",
        verificationStatus: p.status === "DRAFT" ? "UNVERIFIED" : "VERIFIED",
      },
    });
    players.push(player);

    // Assign to team
    if (p.team !== undefined) {
      await prisma.playerTeamAssignment.create({
        data: {
          playerId: player.id,
          teamId: teams[p.team].id,
          jerseyNumber: p.jersey,
          isActive: true,
          role: p.jersey === 10 ? "CAPTAIN" : "PLAYER",
        },
      });
    }
  }

  // Create matches with stats
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
        organizationId: org.id,
        seasonId: season.id,
        competitionId: competition.id,
        venueId: venues[0].id,
        homeTeamId: teams[m.home].id,
        awayTeamId: teams[m.away].id,
        homeClubId: clubs[m.home >= 2 ? m.home - 1 : m.home].id,
        awayClubId: clubs[m.away >= 2 ? m.away - 1 : m.away].id,
        matchDate: new Date(m.date),
        kickoffTime: "15:00",
        status: "COMPLETED",
        homeScore: m.hs,
        awayScore: m.as,
        homeHalfTimeScore: m.hht,
        awayHalfTimeScore: m.aht,
        weather: "CLEAR",
        pitchCondition: "GOOD",
        refereeName: "Khalid Bennani",
        attendance: Math.floor(Math.random() * 2000) + 500,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });

    // Team stats for first match
    if (m.date === "2025-10-05") {
      await prisma.teamMatchStats.createMany({
        data: [
          {
            matchId: match.id, teamId: teams[m.home].id, side: "HOME",
            possession: 58, totalPasses: 420, accuratePasses: 357, passAccuracy: 85,
            shots: 14, shotsOnTarget: 6, shotsOffTarget: 5, blockedShots: 3,
            saves: 4, corners: 7, offsides: 2, fouls: 12,
            yellowCards: 2, redCards: 0, tackles: 18, interceptions: 10,
            clearances: 15, duels: 52, duelsWon: 28, aerialDuels: 14, aerialDuelsWon: 8,
            dribbles: 12, dribblesSuccessful: 8, crosses: 16, ballRecoveries: 35, turnovers: 8,
          },
          {
            matchId: match.id, teamId: teams[m.away].id, side: "AWAY",
            possession: 42, totalPasses: 310, accuratePasses: 248, passAccuracy: 80,
            shots: 8, shotsOnTarget: 4, shotsOffTarget: 3, blockedShots: 1,
            saves: 4, corners: 4, offsides: 3, fouls: 14,
            yellowCards: 3, redCards: 0, tackles: 22, interceptions: 8,
            clearances: 22, duels: 52, duelsWon: 24, aerialDuels: 14, aerialDuelsWon: 6,
            dribbles: 8, dribblesSuccessful: 4, crosses: 10, ballRecoveries: 28, turnovers: 12,
          },
        ],
      });

      // Player match stats for Atlas FC players
      const atlasPlayers = players.slice(0, 11);
      for (let i = 0; i < atlasPlayers.length; i++) {
        const isStriker = i === 9;
        const isWinger = i === 8 || i === 10;
        await prisma.playerMatchStats.create({
          data: {
            matchId: match.id,
            playerId: atlasPlayers[i].id,
            teamId: teams[0].id,
            starter: true,
            minutesPlayed: 90,
            positionPlayed: playerData[i].pos!,
            jerseyNumber: playerData[i].jersey!,
            isCaptain: i === 7,
            goals: isStriker ? 1 : (isWinger && i === 8 ? 1 : 0),
            assists: i === 7 ? 1 : (i === 10 ? 1 : 0),
            shots: isStriker ? 4 : (isWinger ? 3 : (i >= 5 ? 2 : 0)),
            shotsOnTarget: isStriker ? 2 : (isWinger ? 1 : 0),
            passes: i === 0 ? 35 : (i <= 4 ? 45 : 55),
            accuratePasses: i === 0 ? 28 : (i <= 4 ? 38 : 48),
            tackles: i <= 4 ? 3 : (i <= 7 ? 2 : 1),
            interceptions: i <= 4 ? 2 : 1,
            duelsWon: 3,
            duelsLost: 2,
            rating: isStriker ? 7.5 : (isWinger ? 7.0 : (i === 7 ? 7.8 : 6.5)),
          },
        });
      }

      // Match events
      await prisma.matchEvent.createMany({
        data: [
          { matchId: match.id, playerId: atlasPlayers[8].id, type: "GOAL", minute: 23, half: "FIRST_HALF", teamSide: "HOME", description: "Low shot into bottom corner" },
          { matchId: match.id, playerId: atlasPlayers[7].id, type: "ASSIST", minute: 23, half: "FIRST_HALF", teamSide: "HOME" },
          { matchId: match.id, playerId: players[15].id, type: "GOAL", minute: 55, half: "SECOND_HALF", teamSide: "AWAY", description: "Header from corner kick" },
          { matchId: match.id, playerId: atlasPlayers[9].id, type: "GOAL", minute: 78, half: "SECOND_HALF", teamSide: "HOME", description: "Penalty kick scored" },
          { matchId: match.id, playerId: atlasPlayers[5].id, type: "YELLOW_CARD", minute: 34, half: "FIRST_HALF", teamSide: "HOME" },
          { matchId: match.id, playerId: players[14].id, type: "YELLOW_CARD", minute: 62, half: "SECOND_HALF", teamSide: "AWAY" },
        ],
      });
    }
  }

  // Training sessions
  const sessionDates = ["2025-10-07", "2025-10-09", "2025-10-14", "2025-10-16", "2025-10-21"];
  for (const date of sessionDates) {
    const session = await prisma.trainingSession.create({
      data: {
        teamId: teams[0].id,
        coachId: coach.id,
        date: new Date(date),
        startTime: "09:00",
        endTime: "11:00",
        type: "REGULAR",
        theme: ["Passing combinations", "Defensive shape", "Set pieces", "Fitness", "Tactical awareness"][Math.floor(Math.random() * 5)],
        location: "Stade Atlas - Training Ground",
        intensity: ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)],
      },
    });

    // Attendance for first 11 players
    for (let i = 0; i < 11; i++) {
      await prisma.trainingAttendance.create({
        data: {
          trainingSessionId: session.id,
          playerId: players[i].id,
          status: Math.random() > 0.1 ? "PRESENT" : "ABSENT",
          rating: Math.random() > 0.3 ? parseFloat((5 + Math.random() * 4).toFixed(1)) : null,
        },
      });
    }
  }

  // Scout report
  await prisma.scoutReport.create({
    data: {
      playerId: players[9].id, // El Kaabi (striker)
      scoutId: scout.id,
      overallRating: 7.5,
      potentialRating: 8.5,
      currentLevel: "SEMI_PRO",
      recommendedLevel: "PROFESSIONAL",
      strengths: "Excellent finishing, strong aerial presence, good movement off the ball",
      weaknesses: "Needs to improve first touch under pressure, limited left foot",
      summary: "A natural goal scorer with a strong instinct for positioning. Could step up to a higher level with the right development.",
      recommendation: "MONITOR",
      tags: "striker,clinical,aerial,prospect",
    },
  });

  // Injury record
  await prisma.injuryRecord.create({
    data: {
      playerId: players[17].id, // Bilal Touimi (injured)
      type: "MUSCLE",
      bodyPart: "HAMSTRING",
      severity: "MODERATE",
      description: "Right hamstring strain during training",
      injuryDate: new Date("2025-10-20"),
      status: "ACTIVE",
    },
  });

  console.log("Seed complete!");
  console.log(`Created: 1 org, ${clubs.length} clubs, ${teams.length} teams, ${players.length} players, ${matchesData.length} matches`);
  console.log("\nLogin credentials (all use password: password123):");
  console.log("  Admin:         admin@dataforge.com");
  console.log("  Coach:         coach@dataforge.com");
  console.log("  Scout:         scout@dataforge.com");
  console.log("  Atlas FC:      atlas@dataforge.com");
  console.log("  Etoile Sport.: etoile@dataforge.com");
  console.log("  Union Marrak.: union@dataforge.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
