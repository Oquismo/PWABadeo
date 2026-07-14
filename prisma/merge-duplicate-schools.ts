import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Program type suffixes that were historically appended to school names
const PROGRAM_SUFFIXES = ['VET', 'ADU', 'PCTO', 'Job Shadowing', 'Short'];

// Schools whose canonical name legitimately includes a program suffix (from SCHOOL_MAP in ics-parser.ts)
// These should NOT be merged/renamed
const LEGITIMATE_NAMED_SCHOOLS = new Set([
  'Marea ADU',
  'Mater ADU',
]);

function stripProgramSuffix(name: string): string | null {
  for (const suffix of PROGRAM_SUFFIXES) {
    const regex = new RegExp(`^(.*) ${escapeRegex(suffix)}$`, 'i');
    const match = name.match(regex);
    if (match) {
      const base = match[1].trim();
      if (base) return base;
    }
  }
  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function main() {
  console.log('🔍 Scanning for duplicate schools (same base, different program suffix)...\n');

  const allSchools = await prisma.school.findMany({
    include: {
      _count: { select: { users: true, events: true, questions: true, photos: true } },
    },
  });
  console.log(`Total schools in DB: ${allSchools.length}\n`);

  const stats = { merged: 0, renamed: 0, skipped: 0, errors: 0 };

  for (const school of allSchools) {
    // Skip schools with legitimate program-type names
    if (LEGITIMATE_NAMED_SCHOOLS.has(school.name)) {
      console.log(`  ⏭️  Skipping (legitimate name): ${school.name}`);
      stats.skipped++;
      continue;
    }

    const baseName = stripProgramSuffix(school.name);
    if (!baseName) continue; // No program suffix, not a candidate

    // Find existing base school
    let baseSchool = allSchools.find(
      (s) => s.name.toLowerCase() === baseName.toLowerCase() && s.id !== school.id
    );

    if (baseSchool) {
      // MERGE: reassign users and delete suffixed school
      console.log(`  🔀 Merging "${school.name}" (id=${school.id}) → "${baseSchool.name}" (id=${baseSchool.id})`);

      // Reassign users
      if (school._count.users > 0) {
        const result = await prisma.user.updateMany({
          where: { schoolId: school.id },
          data: { schoolId: baseSchool.id },
        });
        console.log(`     Users reassigned: ${result.count}`);
      }

      // Delete events (sync will recreate with correct schoolId)
      if (school._count.events > 0) {
        const result = await prisma.schoolEvent.deleteMany({
          where: { schoolId: school.id },
        });
        console.log(`     Events deleted (will be recreated by sync): ${result.count}`);
      }

      // Delete the suffixed school
      await prisma.school.delete({ where: { id: school.id } });
      console.log(`     ✅ School deleted`);
      stats.merged++;

    } else {
      // RENAME: no base school exists, just rename this one
      console.log(`  ✏️  Renaming "${school.name}" → "${baseName}"`);

      await prisma.school.update({
        where: { id: school.id },
        data: { name: baseName },
      });
      console.log(`     ✅ Renamed`);
      stats.renamed++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   Merged: ${stats.merged}`);
  console.log(`   Renamed: ${stats.renamed}`);
  console.log(`   Skipped (legitimate): ${stats.skipped}`);
  console.log(`   Errors: ${stats.errors}`);

  const finalCount = await prisma.school.count();
  console.log(`\n🏁 Final school count: ${finalCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
