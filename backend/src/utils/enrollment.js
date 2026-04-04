const prisma = require('./prisma')

const getMatchingSubjectFilter = (semester, department) => ({
  semester,
  OR: [
    { department: null },
    { department: '' },
    ...(department ? [{ department }] : [])
  ]
})

const enrollStudentInMatchingSubjects = async ({ studentId, semester, department }) => {
  const matchingSubjects = await prisma.subject.findMany({
    where: getMatchingSubjectFilter(semester, department),
    select: { id: true }
  })

  if (matchingSubjects.length === 0) {
    return { enrolledCount: 0, subjectIds: [] }
  }

  await prisma.subjectEnrollment.createMany({
    data: matchingSubjects.map((subject) => ({
      subjectId: subject.id,
      studentId
    })),
    skipDuplicates: true
  })

  return {
    enrolledCount: matchingSubjects.length,
    subjectIds: matchingSubjects.map((subject) => subject.id)
  }
}

const getMatchingStudentFilter = (semester, department) => ({
  semester,
  user: { isActive: true },
  ...(department ? { department } : {})
})

const enrollMatchingStudentsInSubject = async ({ subjectId, semester, department }) => {
  const matchingStudents = await prisma.student.findMany({
    where: getMatchingStudentFilter(semester, department),
    select: { id: true }
  })

  if (matchingStudents.length === 0) {
    return { enrolledCount: 0, studentIds: [] }
  }

  await prisma.subjectEnrollment.createMany({
    data: matchingStudents.map((student) => ({
      subjectId,
      studentId: student.id
    })),
    skipDuplicates: true
  })

  return {
    enrolledCount: matchingStudents.length,
    studentIds: matchingStudents.map((student) => student.id)
  }
}

const syncMatchingStudentsForSubject = async ({ subjectId, semester, department }) => {
  const matchingStudents = await prisma.student.findMany({
    where: getMatchingStudentFilter(semester, department),
    select: { id: true }
  })

  const matchingStudentIds = matchingStudents.map((student) => student.id)

  if (matchingStudentIds.length === 0) {
    return {
      enrolledCount: 0,
      studentIds: []
    }
  }

  await prisma.$transaction([
    prisma.subjectEnrollment.deleteMany({
      where: {
        subjectId,
        studentId: { notIn: matchingStudentIds }
      }
    }),
    prisma.subjectEnrollment.createMany({
      data: matchingStudentIds.map((studentId) => ({
        subjectId,
        studentId
      })),
      skipDuplicates: true
    })
  ])

  return {
    enrolledCount: matchingStudentIds.length,
    studentIds: matchingStudentIds
  }
}

module.exports = {
  enrollStudentInMatchingSubjects,
  enrollMatchingStudentsInSubject,
  syncMatchingStudentsForSubject
}
